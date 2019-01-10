/**
 * author: wwj
 * Date: 2018/11/13
 * Time: 下午2:51
 * des: 搜索历史中需要使用到商品结果列表页面
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    View, Text,
    DeviceEventEmitter, Platform, NativeModules, Dimensions
} from 'react-native';
import colors from '../../../../gsresource/ui/colors';
import StringUtl from '../../../../utl/StringUtl';
import GoodsSearchStore from '../../store/GoodsSearchStore';
import { reaction } from 'mobx';
import {observer} from 'mobx-react/index';
import fonts from '../../../../gsresource/ui/fonts';
import Alert from '../../../../component/Alert';
import * as _ from 'lodash';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh/index';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import PropTypes from 'prop-types';
import DividerLineH from '../../../../component/DividerLineH';
import GoodsBuy from '../../../goods/widget/GoodsBuy';
import TextButton from '../../../../component/TextButton';
import SortTextArrow from '../../../../component/SortTextArrow';
import {DLFlatList} from '@ecool/react-native-ui';
import SearchGoodsEmptyView from '../SearchGoodsEmptyView';
import SlideFilterComponent from '../../../../component/SlideFilterComponent';
import GoodsItem from '../../../goods/widget/GoodsItem';
import SearchFeedBackView from '../search/SearchFeedBackView';
import {Toast} from '@ecool/react-native-ui';
import NavigationSvc from 'svc/NavigationSvc';

const OrderByType = {
    DEFAULT: '',
    READ: 'viewNum',
    LIKE: 'praiseNum',
    WHOLESALEPRICE: 'pubPrice',
    FAVORNUM: 'favorNum', // 收藏
};

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

@observer
export default class SearchGoodsListScreen extends Component {

    static propTypes = {
        key: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.store = new GoodsSearchStore();
        this.state = ({
            key: '',
            hasFilterData: false,
            listFreshState: RefreshState.Idle,
            orderBy: OrderByType.DEFAULT,
            // goods购买专用
            shopMsg: {},
            isFeedbackVisiable: false
        });
        this.pageNo = 1;
        this.orderByDesc = true;
        this.firstSearch = false;
        this.viewabilityConfig = {
            itemVisiblePercentThreshold: 350
        };
    }

    componentWillMount() {
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
    
    componentDidMount() {
        // 加载筛选数据
        this.store.queryFilterConfigData((res, ext) => {
            if (res) {
                // 当只有市场筛选数据时也不进行筛选。因为市场需要和城市一起联动
                if(ext.length !== 1 || ext[0].typeValue !== 6){
                    // 加载完筛选数据后 筛选按钮才可点击
                    this.setState({hasFilterData: true});
                }
            }
        }, 2);

        this._dataReaction = reaction(() => this.store.goodsSearchListShow, list => {
            if (!this.state.isFeedbackVisiable && list.length === 0) {
                this.showFeedback();
            }
        });
    }

    componentWillUnmount() {
        this.deEmitter && this.deEmitter.remove();
        this._dataReaction && this._dataReaction();
    }

    showFeedback = () => {
        if (this.firstSearch) {
            this.setState({isFeedbackVisiable: true});
        }
    }

    onEndReached = ({distanceFromEnd: number}) => {
        if (number < 30) {
            this.showFeedback();
        }
    }

    /**
     * 列表视图改变回调
     */

    onViewableItemsChanged = ({ viewableItems, changed }) => {
        if (!this.state.isFeedbackVisiable && this.firstSearch) {
            const len = viewableItems.length;
            if (len > 0 && viewableItems[len - 1].index >= 12) {
                this.showFeedback();
            }
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, width: WIDTH}}>
                <View style={styles.container}>
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
                    {this.state.isFeedbackVisiable && <SearchFeedBackView onPress={this.onFeedBackClick} />}
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

    onGoodsBuyClick = (item) => {
        this.setState({ shopMsg: item }, () => {
            this.goodsBuy.goodsBuyShow(item.detailUrl);
        });
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
                            this.setState({
                                orderBy: OrderByType.WHOLESALEPRICE
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />
                {
                    this.state.hasFilterData &&
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
                onEndReached={this.onEndReached}
                onEndReachedThreshold={0.05}
                onViewableItemsChanged={this.onViewableItemsChanged}
                viewabilityConfig={this.viewabilityConfig}
            />
        );
    };

    renderGoodsCell = ({item}) => {
        if (item) {
            return (
                <GoodsItem
                    key={item.id}
                    goods={item}
                    isShowShopInfo={true}
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
            <View style={{position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center', width: WIDTH, height: HEIGHT - 100}}>
                <SearchGoodsEmptyView />
            </View>
        );
    };

    /**
     * 反馈按钮
     */

    onFeedBackClick = () => {
        NavigationSvc.navigate('SearchFeedBackScreen', { keyWord: this.state.key});
    }

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
            }, 2);
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

    searchResult = (fresh, key) => {
        this.setState({key: key}, () => {
            this.loadData(fresh);
        });
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
            pageSize: 20,
            pageNo: this.pageNo,
        };
        // 非默认 传入排序条件
        if (!StringUtl.isEmpty(this.state.orderBy)) {
            Object.assign(commonParam, {orderBy: this.state.orderBy, orderByDesc: this.orderByDesc,});
        }

        this.store.searchGoods(fresh, commonParam, jsonParam, (ret, extra) => {
            Toast.dismiss();
            this.firstSearch = true;
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
            this.listRef.scrollToIndex({animated: true, index: 0});
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
        width: WIDTH,
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
});