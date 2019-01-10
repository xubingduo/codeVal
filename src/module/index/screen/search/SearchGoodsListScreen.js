/**
 * author: tuhui,wwj
 * Date: 2018/7/24
 * Time: 09:50
 * des: 商品搜索结果
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    View, Text,ScrollView,
    DeviceEventEmitter, Platform, NativeModules,Keyboard,
    KeyboardAvoidingView
} from 'react-native';
import SearchView from '../../../../component/SearchView';
import colors from '../../../../gsresource/ui/colors';
import Image from '../../../../component/Image';
import DividerLineH from '../../../../component/DividerLineH';
import TextButton from '../../../../component/TextButton';
import SortTextArrow from '../../../../component/SortTextArrow';
import {DLFlatList} from '@ecool/react-native-ui';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh';
import GoodsSearchStore, {testDataSource} from '../../store/GoodsSearchStore';
import {observer, inject,} from 'mobx-react';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import WithRecommendList from 'component/WithRecommendList';
import Alert from '../../../../component/Alert';
import * as _ from 'lodash';
import SlideFilterComponent from '../../../../component/SlideFilterComponent';
import ImageButton from '../../../../component/ImageButton';
import GoodsItem from '../../../goods/widget/GoodsItem';
import GoodsBuy from '../../../goods/widget/GoodsBuy';
import {Toast} from '@ecool/react-native-ui';
import ShoppingCartWrapScreen from '../../../shoppingCart/screen/ShoppingCartWrapScreen';
import fonts from '../../../../gsresource/ui/fonts';
import SearchGoodsEmptyView from '../../widget/SearchGoodsEmptyView';
import UserActionSvc from 'svc/UserActionSvc';
import StringUtl from '../../../../utl/StringUtl';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';

const PAGE_SIZE = 20;

const OrderByType = {
    DEFAULT: '',
    READ: 'viewNum',
    LIKE: 'praiseNum',
    WHOLESALEPRICE: 'pubPrice',
    FAVORNUM: 'favorNum', // 收藏
};

/**
 *                       key: string = 搜索关键字
 *                  tenantId: number = 租户（店铺）ID (搜索本店内的商品时传值)
 *           classAccodeLike: string = 商品分类accode 格式为 .1.1329.1345.    (搜索分类时传值)
 *           classAccodeName: string = 商品分类名称   (搜索分类时传值)
 *           isShowShopInfo: boolean = 是否只展示本店铺内商品  (为true时 显示商品详情头部的店铺信息和导航栏搜索icon, 默认为true)
 *                  cityCode: number = 城市id (传入后需要在筛选条件中将对应城市选中)
 *                  marketId: number = 市场id (传入后需要在筛选条件中将对应城市下的市场选中)
 *                   autoFocus: bool = 搜索框自动焦点 默认false
 */
@inject('searchHistoryStore', 'shoppingCartStore')
@observer
export default class SearchGoodsListScreen extends Component {

    static navigationOptions = () => {
        return {
            header: (
                <ColorOnlyNavigationHeader
                    backgroundColor={colors.white}
                    statusBarStyle={'dark-content'}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.store = new GoodsSearchStore();
        this.historyStore = this.props.searchHistoryStore;
        this.state = ({
            key: '',
            hasFilterData: false,
            listFreshState: RefreshState.Idle,
            orderBy: OrderByType.DEFAULT,
            // goods购买专用
            shopMsg: {},
            // 是否正在对某分类商品进行搜索
            isCategorySearch: false,
            isRecommendVisiable: false
        });
        this.pageNo = 1;
        this.orderByDesc = true;
    }

    componentWillMount() {
        this.setState({
            key: this.props.navigation.state.params.key ? this.props.navigation.state.params.key : '',
        });
        this.tenantId = this.props.navigation.state.params.tenantId;

        this.classAccodeLike = this.props.navigation.state.params.classAccodeLike;
        this.classAccodeName = this.props.navigation.state.params.classAccodeName;
        this.isShowShopInfo = this.props.navigation.getParam('isShowShopInfo', true);
        this.autoFocus = this.props.navigation.getParam('autoFocus', false);

        this.cityCode = this.props.navigation.getParam('cityCode', 0);
        this.marketId = this.props.navigation.getParam('marketId', 0);

        this.initDefaultCondition();

        this.deEmitter = DeviceEventEmitter.addListener(GOODS_ITEM_CHANGE,
            ({key, data}) => {
                // console.log(key.toLowerCase(), data);
                switch (key) {
                case GOODS_ITEM_DELETE: {
                    let {goodsId} = data;
                    this.store.removeGoodsItem(goodsId);
                    break;
                }
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let {tenantId, favorFlag} = data;
                    this.store.updateFocusStatusByGoodsId(tenantId, favorFlag);
                    break;
                }
                case CHANGE_GOODS_WATCH_NUMBER: {
                    let {goodsId, viewNum} = data;
                    this.store.updateViewNumByGoodsId(goodsId);
                    break;
                }
                case CHANGE_GOODS_STAR_NUMBER_STATE: {
                    let {goodsId, praiseFlag, praiseNum} = data;
                    this.store.updateStarNumByGoodsId(goodsId, praiseFlag, praiseNum);
                    break;
                }
                case CHANGE_GOODS_FAVOR_NUMBER_STATE: {
                    let {goodsId, spuFavorFlag, spuFavorNum} = data;
                    this.store.updateFavorNumByGoodsId(goodsId, spuFavorNum, spuFavorFlag);
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );

        if (Platform.OS === 'android'){
            let pageName = '商品筛选列表界面';
            if (this.classAccodeLike && this.classAccodeName) {
                pageName = '分类商品筛选列表界面';
            }
            NativeModules.DLStatisticsModule.onPageStart(pageName);
        }
    }

    initDefaultCondition = () => {
        // 将默认的城市code和市场id加入到请求筛选条件中
        let defaultCondition = {};
        if (this.cityCode !== 0) {
            Object.assign(defaultCondition, {'1': [this.cityCode]});
        }
        if (this.marketId !== 0) {
            Object.assign(defaultCondition, {'3': [this.marketId]});
        }
        this.store.updateSelectedFilter(defaultCondition);
    };

    componentDidMount() {
        // this.beforeMount();
        this.throttleLoadData();
        // 筛选对象 默认为2 对应商品搜索。 如果是分类，则为4
        let filterType = 2;
        if (this.classAccodeLike && this.classAccodeName) {
            filterType = 4;
        }
        // 加载筛选数据
        this.store.queryFilterConfigData((res, ext) => {
            if (res) {
                // 当只有市场筛选数据时也不进行筛选。因为市场需要和城市一起联动
                if(ext.length !== 1 || ext[0].typeValue !== 6){
                    // 加载完筛选数据后 筛选按钮才可点击
                    this.setState({hasFilterData: true});
                }
            }
        }, filterType);
    }

    componentWillUnmount() {
        this.deEmitter && this.deEmitter.remove();
        if (Platform.OS === 'android'){
            let pageName = '商品筛选列表界面';
            if (this.classAccodeLike && this.classAccodeName) {
                pageName = '分类商品筛选列表界面';
            }
            NativeModules.DLStatisticsModule.onPageEnd(pageName);
        }
        this.historyStore.clearSearchResult();
    }

    _onSearchTitleLayout = ({nativeEvent: {layout: {width, height}}}) => {
        this.setState({searchHeight: height});
    }

    onRecommendItemClick = (text) => {
        this.searchView.setState({text});
        this.setState({key: text}, () => {
            this.onSubmitEditing();
            Keyboard.dismiss();
            // this.textInput.blur();
            // this.store.clearRecommendList();
        });
    }

    onTextChange = text => {
        this.setState({key: text});
        this.historyStore.updateRecommendList({keyword:text, tenantId: this.tenantId ? this.tenantId.toString() : ''});
    }

    showRecommendList = () => {
        this.setState({isRecommendVisiable: true});
    }

    hideRecommendList = () => {
        this.setState({isRecommendVisiable: false});
    }

    _onFocus = () => {
        // this.historyStore.updateRecommendList(this.state.key);
        this.showRecommendList();
    }

    _onScrollBeginDrag = () => {
        this.hideRecommendList();
    }

    onSubmitEditing = () => {
        this.hideRecommendList();
        this.throttleLoadData();
        // 更新搜索记录界面
        DeviceEventEmitter.emit('search_history_text_change', this.state.key);
        if (this.state.key !== '') {
            this.historyStore.saveSearchHistoryMemory(this.state.key);
            this.historyStore.saveSearchHistoryTag();
        }
    }


    render() {
        return (
            <SafeAreaView flex={1}>
                <View style={styles.container}>
                    <WithRecommendList
                        isRecommendVisiable={this.historyStore.shouldListShow && this.state.isRecommendVisiable}
                        onRecommendItemClick={this.onRecommendItemClick}
                        recommendList={this.historyStore._recommendList}
                        text={this.state.key}
                    >
                        {this.renderHeader()}
                    </WithRecommendList>
                    {
                        this.renderSort()
                    }
                    <DividerLineH />
                    {
                        this.renderList()
                    }
                    {
                        this.renderSlideFilter()
                    }
                    {/*购买弹出窗口*/}
                    <GoodsBuy
                        onRef={(goodsBuy) => {
                            this.goodsBuy = goodsBuy;
                        }}
                        shopMsg={this.state.shopMsg}
                    />
                </View>
            </SafeAreaView>
        );
    }

    renderHeader = () => {
        // 返回分类titlebar
        if (this.classAccodeLike && this.classAccodeName) {
            return this.renderCategoryHeader();
        } else {
            return this.renderCommonHeader();
        }
    };

    /**
     * 普通通用的顶部Titlebar
     * @returns {*}
     */
    renderCommonHeader = () => {
        return (
            <View style={{zIndex: 20}}>
                <View
                    style={{backgroundColor: colors.white, flexDirection: 'row', height: 44, alignItems: 'center'}}
                    onLayout={this._onSearchTitleLayout}
                >
                    <TouchableOpacity
                        style={{marginLeft: 12}}
                        hitSlop={{left: 16, right: 16, top: 16, bottom: 16}}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}
                    >
                        <Image
                            source={require('gsresource/img/arrowLeftGrey.png')}
                        />
                    </TouchableOpacity>
                    <SearchView
                        ref={ins => this.searchView = ins}
                        onFocus={this._onFocus}
                        text={this.state.key}
                        style={{
                            borderRadius: 4,
                            flex: 1,
                            marginLeft: 13,
                            marginRight: 14,
                            backgroundColor: colors.bg,
                            height: 28
                        }}
                        autoFocus={this.autoFocus}
                        tiStyle={{marginLeft: 10}}
                        isNeedSearchIcon={false}
                        defaultText={this.state.key}
                        hint={'输入商品名称'}
                        onTextChange={this.onTextChange}
                        onSubmitEditing={this.onSubmitEditing}
                    />
                    <ImageButton
                        style={{marginRight: 6}}
                        source={require('gsresource/img/shoppingCartDisable.png')}
                        onClick={() => {
                            this.props.navigation.navigate('ShoppingCartWrapScreen');
                        }}
                    />
                    {
                        this.props.shoppingCartStore.getAllCountShow !== '0'
                        &&
                        <View style={{
                            top: 4,
                            paddingTop: 1,
                            paddingBottom: 1,
                            paddingLeft: 3,
                            paddingRight: 3,
                            borderRadius: 20,
                            position: 'absolute',
                            right: 6,
                            backgroundColor: colors.activeBtn
                        }}
                        >
                            <Text style={{
                                color: colors.white,
                                fontSize: fonts.font10
                            }}
                            >{this.props.shoppingCartStore.getAllCountShow}</Text>
                        </View>
                    }
                </View>
            </View>
        );
    };

    /**
     * 分类搜索筛选时的 Titlebar
     */
    renderCategoryHeader = () => {
        if (this.classAccodeLike && this.classAccodeName) {
            return (
                <View style={{zIndex: 20}}>
                    <View
                        style={{height: 44, alignItems: 'center', justifyContent: 'center'}}
                        onLayout={this._onSearchTitleLayout}
                    >
                        <View style={{
                            flexDirection: 'row',
                            backgroundColor: colors.white,
                            height: 44,
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                        >
                            <TouchableOpacity
                                style={{marginLeft: 16}}
                                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                                onPress={() => {
                                    this.props.navigation.goBack();
                                }}
                            >
                                <Image
                                    source={require('gsresource/img/arrowLeftGrey.png')}
                                />
                            </TouchableOpacity>

                            {this.classAccodeLike && this.state.isCategorySearch &&
                            <SearchView
                                ref={ins => this.searchView = ins}
                                onFocus={this._onFocus}
                                text={this.state.key}
                                style={{
                                    borderRadius: 4,
                                    flex: 1,
                                    marginLeft: 13,
                                    marginRight: 4,
                                    backgroundColor: colors.bg,
                                    height: 28
                                }}
                                autoFocus={true}
                                tiStyle={{marginLeft: 10}}
                                isNeedSearchIcon={false}
                                defaultText={this.state.key}
                                hint={'输入商品名称'}
                                onTextChange={this.onTextChange}
                                onSubmitEditing={this.onSubmitEditing}
                            />
                            }

                            <View>
                                <View style={{flexDirection: 'row', alignItems: 'center', marginRight: 18}}>
                                    {this.showSearchIconView()}
                                    <TouchableOpacity
                                        hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                                        style={{alignItems: 'center', marginLeft: 15}}
                                        onPress={() => this.props.navigation.navigate('ShoppingCartWrapScreen')}
                                    >
                                        <Image source={require('gsresource/img/shoppingCartDisable.png')} />
                                    </TouchableOpacity>

                                    {
                                        this.props.shoppingCartStore.getAllCountShow !== '0'
                                        &&
                                        <View style={{
                                            top: 0,
                                            paddingTop: 1,
                                            paddingBottom: 1,
                                            paddingLeft: 3,
                                            paddingRight: 3,
                                            borderRadius: 20,
                                            position: 'absolute',
                                            right: -4,
                                            backgroundColor: colors.activeBtn
                                        }}
                                        >
                                            <Text style={{
                                                color: colors.white,
                                                fontSize: fonts.font10
                                            }}
                                            >{this.props.shoppingCartStore.getAllCountShow}</Text>
                                        </View>
                                    }
                                </View>
                            </View>
                        </View>

                        {this.classAccodeLike && !this.state.isCategorySearch &&
                        <View style={{position: 'absolute', justifyContent: 'center', alignItems: 'center', height: 44}}>
                            <Text
                                style={styles.titleItemText}
                                numberOfLines={1}
                            >
                                {this.classAccodeName}
                            </Text>
                        </View>
                        }
                    </View>
                </View>
            );
        }
    };

    throttleLoadData = _.throttle(() => {
        this.loadData(true);
    }, 800);

    onGoodsBuyClick = (item) => {
        this.setState({ shopMsg: item }, () => {
            this.goodsBuy.goodsBuyShow(item.detailUrl);
        });
    }

    /**
     * 显示导航栏搜索icon
     * @returns {*}
     */
    showSearchIconView = () => {
        if (this.isShowShopInfo) {
            let searchImg = this.state.isCategorySearch ? require('gsresource/img/delete.png') : require('gsresource/img/searchBig.png');
            return (
                <TouchableOpacity
                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                    visiable={this.isShowShopInfo}
                    style={{flexDirection: 'row', alignItems: 'center', marginLeft: 8}}
                    onPress={() => {
                        // 显示搜索框
                        this.setState({
                            isCategorySearch: !this.state.isCategorySearch,
                            key: '',
                        }, () => {
                            if (!this.state.isCategorySearch) {
                                this.throttleLoadData();
                            }
                        });
                    }}
                >
                    <Image source={searchImg} />
                </TouchableOpacity>
            );
        } else {
            return (
                <View style={{marginLeft: 8}} />
            );
        }
    };

    renderSort = () => {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: colors.white,
                height: 40
            }}
            >
                <TextButton
                    textStyle={this.state.orderBy === OrderByType.DEFAULT ? styles.sortSeletedText : styles.sortNormalText}
                    text={'综合'}
                    onPress={() => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            UserActionSvc.track('GOODS_SORT_NORMAL');
                            this.orderByDesc = true;
                            this.setState({
                                orderBy: OrderByType.DEFAULT,
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.readSta = sta}
                    textStyle={this.state.orderBy === OrderByType.READ ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.READ ? 0 : this.readSta.state.sort}
                    text={'阅读量'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            UserActionSvc.track('GOODS_SORT_READER');
                            this.setState({
                                orderBy: OrderByType.READ
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.likeSta = sta}
                    textStyle={this.state.orderBy === OrderByType.LIKE ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.LIKE ? 0 : this.likeSta.state.sort}
                    text={'点赞数'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            UserActionSvc.track('GOODS_SORT_STAR');
                            this.setState({
                                orderBy: OrderByType.LIKE
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.favorSta = sta}
                    textStyle={this.state.orderBy === OrderByType.WHOLESALEPRICE ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.WHOLESALEPRICE ? 0 : this.favorSta.state.sort}
                    text={'价格'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            UserActionSvc.track('GOODS_SORT_STAR');
                            this.setState({
                                orderBy: OrderByType.WHOLESALEPRICE
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                {!this.tenantId && this.state.hasFilterData &&
                <TextButton
                    textStyle={{color: colors.normalFont, fontSize: 14}}
                    text={'筛选'}
                    //enable={this.state.hasFilterData}
                    onPress={() => {
                        // 请求完筛选数据时候 才可以打开侧滑筛选
                        this.openSlideFilter();
                    }}
                />
                }
            </View>
        );
    };

    renderList = () => {
        return (
            <DLFlatList
                listRef={(refList) => {this.listRef = refList;}}
                style={{flex: 1}}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderGoodsCell}
                refreshState={this.state.listFreshState}
                data={this.store.goodsSearchListShow}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
                ListEmptyComponent={this.renderEmpty}
                numColumns={1}
                keyboardDismissMode={'on-drag'}
                onScrollBeginDrag={this._onScrollBeginDrag}
            />
        );
    };

    renderGoodsCell = ({item}) => {
        if (item) {
            return (
                <GoodsItem
                    key={item.id}
                    goods={item}
                    isShowShopInfo={this.isShowShopInfo}
                    buyClick={this.onGoodsBuyClick}
                />
            );
        }
    };

    renderSlideFilter = () => {
        if (this.state.hasFilterData && this.store.filterDataSource) {
            return (
                <SlideFilterComponent
                    ref={(slideFilter) => this.slideFilter = slideFilter}
                    dataSource={this.store.filterDataSource}
                    onValueChanged={(result) => {
                        UserActionSvc.track('GOODS_SORT_FILTRATE');
                        this.onFilterResult(result);
                    }}
                    defaultSelectedResult={this.getSlideDefaultResult()}
                />
            );
        }
    };

    getSlideDefaultResult = () => {
        let defaultResult = {};
        if (this.cityCode !== 0) {
            Object.assign(defaultResult, {'1': this.cityCode});
        }
        if (this.marketId !== 0) {
            Object.assign(defaultResult, {'3': this.marketId});
        }
        return defaultResult;
    };

    /**
     * 无数据界面
     */
    renderEmpty = () => {
        return (
            <SearchGoodsEmptyView />
        );
    };

    /**
     * 打开筛选侧滑界面
     */
    openSlideFilter = () => {
        if (this.slideFilter) {
            this.slideFilter.show();
        }
    };

    onLoadMore = () => {
        this.loadData(false);
    };

    onHeadFresh = () => {
        this.loadData(true);
        // 没有请求到筛选条件时，再次获取该数据
        // 筛选对象 默认为2 对应商品搜索。 如果是分类，则为4
        let filterType = 2;
        if (this.classAccodeLike && this.classAccodeName) {
            filterType = 4;
        }
        if (!this.state.hasFilterData) {
            // 加载筛选数据
            this.store.queryFilterConfigData((res, ext) => {
                if (res) {
                    // 当只有市场筛选数据时也不进行筛选。因为市场需要和城市一起联动
                    if(ext.length !== 1 || ext[0].typeValue !== 6){
                        // 加载完筛选数据后 筛选按钮才可点击
                        this.setState({hasFilterData: true});
                    }
                }
            }, filterType);
        }
    };

    /**
     * 处理筛选条件
     * @param result
     */
    onFilterResult = (result) => {
        this.store.updateSelectedFilter(result);
        this.loadData(true);
    };

    loadData(fresh) {
        if (fresh) {
            this.pageNo = 1;
            this.updateFreshState(RefreshState.HeaderRefreshing);
        } else {
            this.updateFreshState(RefreshState.FooterRefreshing);
        }

        let jsonParam = {
            searchToken: this.state.key,
            queryType: 0,
        };
        // 是否需要添加 分类条件
        if (this.classAccodeLike) {
            Object.assign(jsonParam, {classAccodeLike: this.classAccodeLike});
        }
        if (this.tenantId) {
            Object.assign(jsonParam, {tenantId: this.tenantId});
        }

        let commonParam = {
            pageSize: PAGE_SIZE,
            pageNo: this.pageNo,
        };
        // 非默认 传入排序条件
        if (!StringUtl.isEmpty(this.state.orderBy)) {
            Object.assign(commonParam, {orderBy: this.state.orderBy, orderByDesc: this.orderByDesc,});
        }

        this.store.searchGoods(fresh, commonParam, jsonParam, (ret, extra) => {
            if (!ret) {
                Alert.alert(extra);
                this.updateFreshState(RefreshState.Idle);
            } else {
                if (extra === 0) {
                    this.updateFreshState(RefreshState.NoMoreData);
                } else {
                    this.updateFreshState(RefreshState.Idle);
                }
                this.pageNo = this.pageNo + 1;
                // 如果是刷新操作 安卓需手动scroll到顶部
                if (fresh && extra !== 0) {
                    this.scrollToTop();
                }
            }
        });
    }

    // 手动将listview回到顶部(仅安卓，iOS自动回到顶部)
    scrollToTop = () => {
        if (Platform.OS === 'android' && this.listRef) {
            this.listRef.scrollToOffset({animated: true, offset: 0});
        }
    };

    updateFreshState = (state) => {
        this.setState({
            listFreshState: state,
        });
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    sortNormalText: {
        color: colors.normalFont,
        fontSize: fonts.font14,
    },

    sortSeletedText: {
        color: colors.activeFont,
        fontSize: fonts.font14,
    },

    titleItemText: {
        fontSize: fonts.font18,
        color: '#3d4245',
        backgroundColor: 'transparent',
        textAlign: 'center',
        maxWidth: 200,
    }
});