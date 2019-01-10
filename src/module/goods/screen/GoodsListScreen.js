/**
 *@author xbu
 *@date 2018/10/30
 *@desc 目前用于货品收藏/货品推荐，之后需要以此重构项目中的货品列表Screen,
 *
 */


import React, {Component,PureComponent} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    Animated,
    TouchableWithoutFeedback
} from 'react-native';
import { observer, inject } from 'mobx-react';

import I18n from 'gsresource/string/i18n';
import fonts from 'gsresource/ui/fonts';
import colors from 'gsresource/ui/colors';
import ColorOnlyNavigationHeader from 'component/ColorOnlyNavigationHeader';
import SearchView from 'component/SearchView';
import DividerLineH from 'component/DividerLineH';
import StringUtl from 'utl/StringUtl';
import TextButton from 'component/TextButton';
import SortTextArrow from 'component/SortTextArrow';
import {DLFlatList,RefreshState,Toast} from '@ecool/react-native-ui';
import GoodsListStore from '../store/GoodsListStore';
import * as _ from 'lodash';
import Alert from '../../../component/Alert';
import SlideFilterComponent from '../../../component/SlideFilterComponent';
import ImageViewer from 'component/ImageViewer';
import DocSvc from 'svc/DocSvc';
import EmptyView from 'component/EmptyView';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import DateUtl from 'utl/DateUtl';
import PropTypes from 'prop-types';
import GoodListRecommandCell from '../widget/GoodList/GoodListRecommandCell';
import {GoodQueryType} from 'module/model/GoodConstants';
import NavigationSvc from 'svc/NavigationSvc';

const PAGE_SIZE = 20;
const OrderByType = {
    DEFAULT: '',
    READ: 'viewNum',
    LIKE: 'praiseNum',
    WHOLESALEPRICE: 'pubPrice',
    icon: 1
};
const WIDTH = Dimensions.get('window').width;

const GoodsCell = observer(({item, index, fadeAnimated, showEdit, toggleGood, delGoods, onGoodsClick}) => {
    const spuList = JSON.parse(item.docContent);
    const _SpuListWithImage = [];
    let count = 0;
    for (let i = 0; i < spuList.length; i++) {
        const item = spuList[i];
        if (item.typeId === 1) {
            _SpuListWithImage.push(item);
        } else {
            count++;
        }
    }
    const SpuListWithImage = _SpuListWithImage.slice(0, 9 - count);
    // const SpuListWithImage = spuList.filter(item => item.typeId === 1);
    const source = SpuListWithImage && SpuListWithImage.length > 0 ? DocSvc.docURLL(SpuListWithImage[0].docId) : '';
    const docIds = SpuListWithImage ? SpuListWithImage.map(item => item.docId) : '';
    const checkedImg = item.checked ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png');
    return(
        <Animated.View
            style={{
                width: (WIDTH + 40),
                position: 'relative',
                left: fadeAnimated
            }}
        >
            <View style={styles.ItemBox}>
                <TouchableOpacity style={[styles.iconBox,{width: showEdit ? 40 : 42}]} onPress={() => toggleGood(item.id)}>
                    <Image source={checkedImg} resizeMode={'contain'} />
                </TouchableOpacity>
                <View style={{justifyContent: 'center',alignItems: 'center',flexDirection:'row',paddingLeft: 10}}>
                    <View style={{width: 110,height: 110}}>
                        {/* <Image source={{uri: source}} style={{width: '100%', height: '100%'}} defaultSource={require('gsresource/img/dressDefaultPic90.png')}/> */}
                        <ImageViewer
                            source={{uri: source}}
                            defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                            style={{width: 110, height: 110, borderRadius: 2}}
                            docIDs={docIds}
                            index={0}
                        />
                    </View>
                    <TouchableWithoutFeedback onPress={() => onGoodsClick(item)}>
                        <View style={{width: (WIDTH-110),height: 110,paddingRight: 25,paddingLeft: 15,justifyContent:'space-between', paddingVertical: 3}}>
                            <View>
                                <Text numberOfLines={5} style={{fontSize: fonts.font14,color: colors.normalFont, marginRight: 12}}>{item.title}</Text>
                                <Text style={styles.dateText}>{DateUtl.formatDateFromString(item.favorDate, 'YYYY-MM-DD HH:mm')}</Text>
                            </View>
                            <View style={{flexDirection: 'row', justifyContent:'space-between'}}>
                                <Text style={{fontSize: fonts.font14,color: colors.activeFont}}>¥{item.pubPrice}</Text>
                                <TouchableOpacity style={{flexDirection: 'row',alignItems: 'center',justifyContent: 'center'}} onPress={() => delGoods([item.id])}>
                                    <Image source={require('gsresource/img/goodsCollectActive.png')} />
                                    <Text style={{fontSize: fonts.font12, color: item.spuFavorFlag ? colors.activeFont : colors.greyFont,paddingLeft: 5}}>{item.spuFavorNum}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableWithoutFeedback>
                </View>
            </View>
        </Animated.View>
    );
});

@observer
export default class GoodsListScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param queryType GoodQueryType
         * @param marketId string
         * @param title string
         * @param didRecievedData func
         * @param sourceFrom number 0默认 1凑合包推荐
         */
        navigation: PropTypes.object,
    }

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

    constructor(props){
        super(props);
        let queryType = this.props.navigation.getParam('queryType',GoodQueryType.collect);
        let marketId = this.props.navigation.getParam('marketId','');
        let sourceFrom = this.props.navigation.getParam('sourceFrom',0);

        this.orderByDesc = true;
        this.store = new GoodsListStore();
        this.store.marketId = marketId;
        this.store.setQueryType(queryType);
        this.store.setSourceFromType(sourceFrom);
        this.state = {
            searchIcon: true,
            showEdit: true,
            key: '',
            orderBy: OrderByType.DEFAULT,
            listFreshState: RefreshState.Idle,
            fadeAnimated: new Animated.Value(-40), //设置初始值
            fadeBottomAnimated: new Animated.Value(-80),
            hasFilterData: false,
            shopMsg: {},
            goodsBuyVisiable: false,
            slideVisiable: false
        };
    }

    componentDidMount() {
        this.throttleLoadData();
        this.store.queryFilterConfigData();
    }

    // 我的收藏头部
    renderHeader = () => {
        return (
            <View style={{height: 44, alignItems: 'center', justifyContent: 'center'}}>
                <View
                    style={{
                        flexDirection: 'row',
                        backgroundColor: colors.white,
                        height: 44,
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    <TouchableOpacity
                        style={{marginLeft: 6, padding: 10}}
                        // hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onPress={() => {this.props.navigation.goBack();}}
                    >
                        <Image source={require('gsresource/img/backBlack.png')} />
                    </TouchableOpacity>

                    <View style={{flexDirection: 'row', alignItems: 'center',flex: 1, justifyContent: 'center'}}>
                        <View style={{flex:1,}}>
                            {this.state.searchIcon ? this.showTitle() : this.showSearchBar()}
                        </View>
                        {this.state.searchIcon ? this.showIcon() : this.showText()}
                    </View>
                    {this.state.searchIcon ? this.showIconText() : null}
                </View>
            </View>
        );
    };

    // title
    showTitle = () => {
        let title = this.props.navigation.getParam('title','我的收藏');
        return (
            <Text
                style={{
                    fontSize: fonts.font18, color: '#3d4245',
                    backgroundColor: 'transparent', textAlign: 'center',
                    paddingLeft:this.store.queryType === GoodQueryType.normal ? 0 : 70,
                }}
            >{title}</Text>
        );
    };

    // 搜索
    showSearchBar = () => {
        return(
            <SearchView
                style={{
                    borderRadius: 4,
                    marginLeft: 13, marginRight: 4,
                    backgroundColor: colors.bg,
                    height: 28,
                }}
                autoFocus={true}
                tiStyle={{marginLeft: 10}}
                isNeedSearchIcon={false}
                hint={'请输入商品名称搜索'}
                onTextChange={(text) => {
                    const value = StringUtl.filterChineseSpace(text);
                    // setTimeout(()=>{
                    this.setState({key: value});
                    // });
                }}
                onSubmitEditing={() => {
                    this.onHeaderRefresh();
                }}
            />
        );
    };

    // 选择货品
    toggleGood = (id) => {
        this.store.checkGood(id);
    }

    // 切换选择全部
    toggleAllCheck = () => {
        this.store.toggleAllCheck();
    }
    
    // 删除
    delGoods = (ids) => {
        Toast.loading();
        this.store.delGoods(ids)
            .then(res => {
                if (res.code === 0) {
                    this.store.delGoodsLocal(ids);
                    Toast.show('成功取消收藏', 1);
                } else {
                    Toast.show(res.msg);
                }
            })
            .catch(e => {
                Toast.show(e.message);
            });
    }
    
    // 商品点击逻辑
    onGoodsClick = (good) => {
        // if (!this.state.goodsBuyVisiable && !this.state.slideVisiable) {
        //     this.setState(
        //         {
        //             shopMsg: good,
        //             goodsBuyVisiable: true
        //         },
        //         () => {
        //             this.goodsBuy.goodsBuyShow(good.detailUrl);
        //         }
        //     );
        //     this.resetGoodsBuyVisiable = setTimeout(() => {
        //         this.setState({
        //             goodsBuyVisiable: false
        //         });
        //     });
        // }

        this.props.navigation.navigate('GoodDetailScreen',{url: good.detailUrl});
    };


    // 搜索icon
    showIcon = () => {
        return(
            <TouchableOpacity
                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginRight: 15}}
                onPress={() => {
                    this.setState({searchIcon: !this.state.searchIcon});
                }}
            >
                <Image source={require('gsresource/img/searchBig.png')} />
            </TouchableOpacity>
        );
    };

    // 显示取消
    showText = () => {
        return(
            <TouchableOpacity
                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginRight: 15}}
                onPress={() => {
                    this.setState({searchIcon: true, key: ''}, () => {
                        this.onHeaderRefresh();
                    });
                }}
            >
                <Text style={{fontSize: fonts.font14,color: colors.greyFont}}>取消</Text>
            </TouchableOpacity>
        );
    };

    // 编辑按钮
    showIconText = () => {
        if(this.store.queryType === GoodQueryType.normal){
            return null;
        }
        return(
            <TouchableOpacity
                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginRight: 15}}
                onPress={this.clickEditBtn}
            >
                <Text style={{fontSize: fonts.font14, color: this.state.showEdit ? colors.normalFont : colors.activeBtn}}>{this.state.showEdit ? '编辑' : '完成'}</Text>
            </TouchableOpacity>
        );
    };

    // 筛选过滤
    renderSort = () => {
        return (
            <View
                style={{
                    flexDirection: 'row', justifyContent: 'space-around',
                    alignItems: 'center', backgroundColor: colors.white,
                    height: 40
                }}
            >
                <TextButton
                    textStyle={this.state.orderBy === OrderByType.DEFAULT ? styles.sortSelectedText : styles.sortNormalText}
                    text={'默认'}
                    onPress={() => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = true;
                            this.setState({
                                orderBy: OrderByType.DEFAULT,
                            }, () => {
                                this.onHeaderRefresh();
                            });
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.readSta = sta}
                    textStyle={this.state.orderBy === OrderByType.READ ? styles.sortSelectedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.READ ? 0 : this.readSta.state.sort}
                    text={'阅读量'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            this.setState({
                                orderBy: OrderByType.READ
                            }, () => {
                                this.onHeaderRefresh();
                            });
                        }
                    }}
                />

                {this.store.sourceFromType !== 1 && (
                    <SortTextArrow
                        ref={(sta) => this.likeSta = sta}
                        textStyle={this.state.orderBy === OrderByType.LIKE ? styles.sortSelectedText : styles.sortNormalText}
                        sort={this.state.orderBy !== OrderByType.LIKE ? 0 : this.likeSta.state.sort}
                        text={'点赞数'}
                        onSortChange={(sort) => {
                            if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                                || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                                this.orderByDesc = sort === -1;
                                this.setState({
                                    orderBy: OrderByType.LIKE
                                }, () => {
                                    this.onHeaderRefresh();
                                });
                            }
                        }}
                    />
                )}

                <SortTextArrow
                    ref={(sta) => this.priceSta = sta}
                    textStyle={this.state.orderBy === OrderByType.WHOLESALEPRICE ? styles.sortSelectedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.WHOLESALEPRICE ? 0 : this.priceSta.state.sort}
                    text={'批发价'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            this.setState({
                                orderBy: OrderByType.WHOLESALEPRICE
                            }, () => {
                                this.onHeaderRefresh();
                            });
                        }
                    }}
                />

                {!this.tenantId &&
                <TextButton
                    textStyle={{color: colors.normalFont, fontSize: 14}}
                    text={'筛选'}
                    //enable={this.state.hasFilterData}
                    onPress={() => {
                        // 请求完筛选数据时候 才可以打开侧滑筛选
                        // this.setState({slideVisiable: true}, () => {
                        //     !this.state.goodsBuyVisiable && this.state.hasFilterData && this.slideFilter.show();
                        // });
                        // this.slider.show();
                        if(!this.store.filterDataSource ){
                            Toast.show('暂无筛选数据',2);
                            this.store.queryFilterConfigData();
                            return;
                        }
                        if(this.slideFilter){
                            this.slideFilter.show();
                        }
                    }}
                />
                }
            </View>
        );
    };

    renderSlideFilter = () => {
        // if (this.state.hasFilterData && this.store.filterDataSource) {
        if (this.store.filterDataSource) {
            return (
                <SlideFilterComponent
                    ref={(slideFilter) => this.slideFilter = slideFilter}
                    dataSource={this.store.filterDataSource}
                    onValueChanged={(result) => {
                        // UserActionSvc.track('GOODS_SORT_FILTRATE');
                        this.onFilterResult(result);
                    }}
                    onDismiss={() => this.setState({slideVisiable: false})}
                    // defaultSelectedResult={this.getSlideDefaultResult()}
                />
            );
        }
    };

    showGoodBuy = (good)=>{
        if (!this.state.goodsBuyVisiable && !this.state.slideVisiable) {
            this.setState(
                {
                    shopMsg: good,
                    goodsBuyVisiable: true
                },
                () => {
                    this.goodsBuy.goodsBuyShow(good.detailUrl);
                }
            );
            this.resetGoodsBuyVisiable = setTimeout(() => {
                this.setState({
                    goodsBuyVisiable: false
                });
            });
        }

    }

    renderGoodsCell = ({item, index}) => {

        if(this.store.queryType === GoodQueryType.normal){
            return (
                <GoodListRecommandCell
                    item={item}
                    store={this.store}
                    onAddToOrderClick={()=>{
                        this.selectedItem = item;
                        this.showGoodBuy(item);
                    }}
                    onToDetailClick={()=>{
                        let params = this.props.navigation.state.params;
                        NavigationSvc.push('GoodDetailScreen', {
                            url:item.detailUrl,
                            sourceFrom:1,
                            confirmHandler:(data)=>{
                                params && params.didRecievedData && params.didRecievedData(data);
                            },
                        });
                    }}
                />
            );
        }
        return (
            <GoodsCell
                item={item}
                index={index}
                fadeAnimated={this.state.fadeAnimated}
                showEdit={this.state.showEdit}
                toggleGood={this.toggleGood}
                delGoods={this.delGoods}
                onGoodsClick={this.onGoodsClick}
            />
        );
    }

    _keyExtractor = item => item.id + '';

    renderGoodList = () => {
        return (
            <DLFlatList
                style={{flex: 1}}
                showsVerticalScrollIndicator={false}
                keyExtractor={this._keyExtractor}
                renderItem={this.renderGoodsCell}
                refreshState={this.state.listFreshState}
                data={this.store.favorGoodsDataList}
                onHeaderRefresh={this.onHeaderRefresh}
                onFooterRefresh={this.onFooterRefresh}
                ListEmptyComponent={<EmptyView emptyViewType={'NODATA'} />}
                numColumns={1}
                keyboardDismissMode={'on-drag'}
                extraData={this.store.observableFavorGoodsDataList}
            />
        );
    };

    renderFooter = () => {
        const img = this.store.isAllGoodsChecked ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png');
        return (
            <Animated.View
                style={{
                    // position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: this.state.fadeBottomAnimated
                    // marginBottom: this.state.fadeBottomAnimated
                }}
            >
                <View
                    style={{
                        height: 50,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: colors.white,
                        borderTopWidth: 1,
                        borderTopColor: colors.borderE,
                        paddingLeft: 10,
                        paddingRight: 15,
                    }}
                >
                    <TouchableOpacity style={{flexDirection: 'row',justifyContent: 'center', alignItems: 'center',}} onPress={this.toggleAllCheck}>
                        <Image source={img} />
                        <Text style={{fontSize: fonts.font12, color: colors.normalFont, marginLeft: 5}}>全选</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={this.delGoods}
                        style={{
                            width: 80,
                            height: 38,
                            justifyContent: 'center',
                            alignItems: 'center',
                            backgroundColor: colors.activeBtn,
                            borderRadius: 8,
                        }}
                    >
                        <Text style={{fontSize: fonts.font14, color: colors.white}}>删除</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    render() {
        let params = this.props.navigation.state.params;
        let sortHidden = this.store.queryType === GoodQueryType.collect;
        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeader()}
                <DividerLineH />
                {!sortHidden && (
                    <View>
                        {this.renderSort()}
                        <DividerLineH />
                    </View>
                )}
                {this.renderGoodList()}
                {!this.state.showEdit && this.renderFooter()}
                {!sortHidden && this.renderSlideFilter()}
                <GoodsBuy
                    onRef={ref => {
                        this.goodsBuy = ref;
                    }}
                    shopMsg={this.state.shopMsg}
                    sourceFrom={1}
                    confirmHandler={(data)=>{
                        params && params.didRecievedData && params.didRecievedData(data);
                    }}
                />
            </SafeAreaView>
        );
    }

    /**
     * 处理筛选条件
     * @param result
     */
    onFilterResult = (result) => {
        this.store.updateSelectedFilter(result);
        this.onHeaderRefresh();
    };

    // 点击编辑按钮
    clickEditBtn = () => {
        const { showEdit } = this.state;
        const left = showEdit ? 0 : -40;
        const bottom = showEdit ? 0 : -80;

        if (this.isAnimating) return;
        showEdit && this.setState(prev => ({showEdit: !prev.showEdit}));
        this.isAnimating = true;
        Animated.parallel([
            Animated.timing(this.state.fadeBottomAnimated, {toValue: bottom,duration: 300}),
            Animated.timing(this.state.fadeAnimated, {toValue: left,duration: 300})
        ]).start(() => {
            this.store.resetList();
            !showEdit && this.setState(prev => ({showEdit: !prev.showEdit}));
            this.isAnimating = false;
        });
    };

    // 请求数据
    throttleLoadData = _.throttle(() => {
        this.onHeaderRefresh();
    }, 500);


    loadData = (isTrue) => {
        console.log(isTrue);
    };


    // 加载更多
    onHeaderRefresh = () => {
        this.setState({
            pageNo: 1,
            listFreshState: RefreshState.HeaderRefreshing
        }, () => {
            this.getDataList('fresh');
        });
    };

    // 下拉刷新
    onFooterRefresh = () => {
        let pageNo = this.state.pageNo;
        pageNo++;
        this.setState({
            pageNo: pageNo,
            listFreshState: RefreshState.FooterRefreshing
        }, () => {
            this.getDataList('more');
        });
    };

    // 获取数据
    getDataList(type) {
        let params = {
            pageNo: this.state.pageNo,
            orderByDesc: this.orderByDesc,
            jsonParam: {
                queryType: this.store.queryType,
                searchToken: this.state.key,
            }
        };

        // 合并查询条件
        if(this.store.filterDataSource && this.store.seletedFilterCondition){
            params.jsonParam = Object.assign({},params.jsonParam,this.store.seletedFilterCondition);
        }
        
        // 添加marketId
        if(this.store.sourceFromType === 1){
            if(params.jsonParam.keyWords){
                params.jsonParam.keyWords.marketId = [this.store.marketId];
            } else {
                params.jsonParam.keyWords = {marketId:[this.store.marketId]};
            }
        }

        if (this.state.orderBy) {
            params.orderBy = this.state.orderBy;
        }
        this.store.getFavorGoodsDataList(params, type).then((dataList) => {
            if (dataList.length > 0) {
                this.setState({
                    listFreshState: RefreshState.Idle
                });
            } else if (dataList.length === 0) {
                this.setState({
                    listFreshState: RefreshState.NoMoreData
                });
            }
        }, err => {
            this.setState({
                listFreshState: RefreshState.Failure
            });
            Alert.alert(err.message);
        });
    }
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

    sortSelectedText: {
        color: colors.activeFont,
        fontSize: fonts.font14,
    },

    ItemBox: {
        height: 134,
        width: (WIDTH + 40),
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
        flexDirection: 'row',
    },

    iconBox: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: fonts.font10,
        color: colors.greyFont
    }
});