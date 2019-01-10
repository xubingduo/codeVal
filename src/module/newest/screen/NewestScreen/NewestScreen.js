/*
 * @Author: wengdongyang
 * @Date:   2018-08-01 13:41:26
 * @Last Modified by: Miao Yunliang
 * @Last Modified time: 2018-11-14 10:05:43
 */

/*
 * @调用跳转传参
 * this.props.navigation.navigate('NewestScreen', {queryType: ''});
 * @queryType  default:2 0 普通搜索，1 关注上新，2 推荐上新，3 爆款
 */
import React, {Component, PureComponent} from 'react';
import {observer, inject} from 'mobx-react';
import {runInAction, autorunAsync, reaction} from 'mobx';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Platform,
    NativeModules,
    ScrollView,
    Dimensions,
    DeviceEventEmitter,
    Text,
    InteractionManager
} from 'react-native';
import {DLFlatList, Toast, TabsView} from '@ecool/react-native-ui';
import Alert from 'component/Alert';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh/index';
import colors from '../../../../gsresource/ui/colors';
import NewestStore from '../../store/NewestStore';
import configStore from 'store/ConfigStore';
import UserActionSvc from 'svc/UserActionSvc';
import ShopSvc from 'svc/ShopSvc';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import CustomerServiceSvc from 'svc/CustomerServiceSvc';
import ConfirmAlert from 'component/ConfirmAlert';
import NewestHeader from '../../widget/NewestHeader';
import GoodsItem from 'module/goods/widget/GoodsItem';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import * as _ from 'lodash';

import NoRecommendMsg from '../../widget/NoRecommendMsg';
import NoFocusOnShopMsg from '../../widget/NoFocusOnShopMsg';
import fonts from 'gsresource/ui/fonts';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import NewestApiManager from '../../apiManager/NewestApiManager';
import {VIEWABILITY_CONFIG} from '../../../index/screen/IndexScreen';
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;


@inject('commonStore')
@observer
export default class NewestScreen extends Component {
    constructor(props) {
        super(props);
        this.newestStore = new NewestStore(); // 引入store
        this.state = {
            queryType: '2', // 0 普通搜索，1 关注上新，2 推荐上新，3 爆款。默认为0
            focusOnVisiable: false, // 是否打开modal1
            focusOnHasChanged: false, // focusOn的数据是否改变
            recommendedPageNo: 1, // 推荐-页码
            recommendedFreshState: RefreshState.Idle, // 推荐-刷新
            focusOnPageNo: 1, // 关注-页码
            focusOnFreshState: RefreshState.Idle, // 刷新是否完成-关注
            // goods购买专用
            goodsBuyVisiable: false, // 是否打开modal2
            shopMsg: {}
        };
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>

                {/*头部*/}
                <NewestHeader
                    store={this.newestStore}
                    queryType={this.state.queryType}
                    focusOnVisiable={this.state.focusOnVisiable}
                    // focusOnHasChanged={this.state.focusOnHasChanged}
                    toggleFocusOnHasChanged={this.toggleFocusOnHasChanged}
                    closeFocusOnVisiable={this.closeFocusOnVisiable}
                    resetFocusOnTypeList={this.resetFocusOnTypeList}
                    customerServiceClick={this.customerServiceClick}
                    recommendedClick={this.recommendedClick}
                    focusOnClick={this.focusOnClick}
                    scanClick={this.scanClick}
                    searchClick={this.searchClick}
                />
                {/*列表*/}
                <ScrollView
                    ref={ref => {
                        this.scrollview = ref;
                    }}
                    pagingEnabled={true}
                    scrollEnabled={false}
                    horizontal={true}
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                >

                    {this.renderFocusOnDataList()}
                    {this.renderRecommendDataList()}
                </ScrollView>
                {/*购买弹出窗口*/}
                <GoodsBuy
                    onRef={ref => {
                        this.goodsBuy = ref;
                    }}
                    shopMsg={this.state.shopMsg}
                />
            </SafeAreaView>
        );
    }

    renderRecommendDataList() {
        return (
            <View>
                <TabsView
                    ref={ins => {
                        if (ins) {
                            this.tabsView = ins;
                        }
                    }}
                    containerStyle={{
                        width: WIDTH,
                        alignItems: 'center',
                        height: 35,
                        backgroundColor: '#fff'
                    }}
                    underlineStyle={{
                        width: 40,
                        backgroundColor: colors.activeFont,
                    }}
                    underlineWidth={40}
                    tabItemTextTyle={{
                        fontSize: fonts.font14,
                    }}
                    activeTextStyle={{fontWeight: '600'}}
                    activeTextColor={colors.activeFont}
                    defaultTextColor={colors.normalFont}
                    activeItemIndex={this.newestStore.currentCityIndex}
                    items={this.newestStore.cityTabItems}
                    goToPage={this.onCityTabClick}
                />
                <DLFlatList
                    listRef={ref => {if (ref) this.recommendList = ref;}}
                    style={{width: WIDTH}}
                    keyExtractor={(item, index) => {
                        //商品id可能重复  不能使用id
                        return index.toString();
                    }}
                    renderItem={this.renderMainCell}
                    refreshState={this.state.recommendedFreshState}
                    data={this.newestStore.recommendDataList}
                    onHeaderRefresh={this.fetchRecommendCity}
                    onFooterRefresh={this.onFooterRefreshRecommendedDataList}
                    ListEmptyComponent={<NoRecommendMsg />}
                    initialNumToRender={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                />
            </View>
        );
    }

    onCityTabClick = index => {
        runInAction(() => {
            this.newestStore.currentCityIndex = index;
        });
    };

    renderFocusOnDataList() {
        return (
            <DLFlatList
                style={{width: WIDTH}}
                keyExtractor={(item, index) => {
                    //商品id可能重复  不能使用id
                    return index.toString();
                }}
                renderItem={this.renderMainCell}
                refreshState={this.state.focusOnFreshState}
                data={this.newestStore.focusOnDataList}
                onHeaderRefresh={this.onHeaderRefreshFocusOnDataList}
                onFooterRefresh={this.onFooterRefreshFocusOnDataList}
                ListEmptyComponent={<NoFocusOnShopMsg />}
                initialNumToRender={5}
                removeClippedSubviews={Platform.OS === 'android'}
                viewabilityConfig={VIEWABILITY_CONFIG}
            />
        );
    }

    renderMainCell = ({item, index}) => {
        return (
            <GoodsItem
                key={() => {
                    //商品id可能重复  不能使用id
                    return index.toString();
                }}
                goods={item}
                // 如果有其它modal打开，不允许触发事件
                // isOtherModalOpen={
                //     this.state.focusOnVisiable || this.state.goodsBuyVisiable
                // }
                buyClick={this.buyClick}
                isShowDeletePopup = {this.state.queryType === '2'}
            />
        );
    };

    beforeMount() {
        let params = this.props.navigation.state.params;
        if (typeof params === 'object' && params.hasOwnProperty('queryType')) {
            this.setState(
                {
                    queryType: params.queryType
                },
                () => {
                    let queryType = this.state.queryType;
                }
            );
        }
        /*
         * data中所有的值，均为成功后应该设置的值
         * */
        this.deEmitter = DeviceEventEmitter.addListener(
            GOODS_ITEM_CHANGE,
            ({key, data}) => {
                switch (key) {
                case GOODS_ITEM_DELETE: {
                    let {goodsId} = data;
                    let queryType = this.state.queryType;
                    this.newestStore.deleteClick(goodsId, queryType);
                    break;
                }
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let {tenantId, favorFlag} = data;
                    this.newestStore.toggleFocusOnClick(
                        tenantId,
                        favorFlag
                    );
                    break;
                }
                case CHANGE_GOODS_WATCH_NUMBER: {
                    let {goodsId, viewNum} = data;
                    this.newestStore.watchCallBack(goodsId, viewNum);
                    break;
                }
                case CHANGE_GOODS_STAR_NUMBER_STATE: {
                    let {goodsId, praiseFlag, praiseNum} = data;
                    this.newestStore.toggleStarClick(
                        goodsId,
                        praiseFlag,
                        praiseNum
                    );
                    break;
                }
                case CHANGE_GOODS_FAVOR_NUMBER_STATE: {
                    let {goodsId, spuFavorFlag, spuFavorNum} = data;
                    this.newestStore.toggleFavorClick(
                        goodsId,
                        spuFavorFlag,
                        spuFavorNum
                    );
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );
    }

    componentDidMount() {
        this.beforeMount();
        let queryType = this.state.queryType;
        if (queryType === '2') {
            if (Platform.OS === 'ios') {
                this.scrollview.scrollTo({x: WIDTH, animated: true});
            } else {
                setTimeout(() => {
                    this.scrollview.scrollTo({x: WIDTH, animated: true});
                });
            }
        }
        this._tabReaction = reaction(() => this.newestStore.currentCityIndex, index => {
            let cityId = Number(this.newestStore.cityTabItems[index].key);
            if (cityId !== 0) {
                this.newestStore.observableCurrentFocusOnType.keyWords.cityId = [cityId];
                this.newestStore.observableCurrentFocusOnType.notInKeyWords = {};
            } else {
                this.newestStore.observableCurrentFocusOnType.keyWords = {};
                this.newestStore.observableCurrentFocusOnType.notInKeyWords.cityId = this.newestStore.tabItemIds;
            }
            this.onHeaderRefreshRecommendedDataList();
        }, {delay: 300});

        // this._categaryReaction = reaction(() => configStore.businessCategary, () => {
        //     this.fetchRecommendCity();
        // });

        this.throttleLoadData();
    }

    componentWillUnmount() {
        this.deEmitter && this.deEmitter.remove();
        this.resetGoodsBuyVisiable && clearTimeout(this.resetGoodsBuyVisiable);
        this._tabReaction && this._tabReaction();
        // this._categaryReaction && this._categaryReaction();
    }

    autoFallback = true;

    throttleLoadData = _.throttle(() => {
        let queryType = this.state.queryType;
        this.newestStore.getFocusOnTypeList();
        if (queryType === '1') {
            this.onHeaderRefreshFocusOnDataList();
        } else {
            this.fetchRecommendCity();
        }
    }, 500);
 
    // 获取城市占位
    fetchRecommendCity = () => {
        this.newestStore.fetchRecommendCity()
            .then(() => {
                // 只有全国的情况
                if (this.newestStore.cityTabItems.length === 1) {
                    if (this.newestStore.currentCityIndex === 0) {
                        this.onHeaderRefreshRecommendedDataList();
                    } else {
                        this.tabsView.gotoIndex(0);
                    }
                } else {
                    if (this.newestStore.currentCityIndex > this.newestStore.cityTabItems.length - 1) {
                        this.tabsView.gotoIndex(this.newestStore.cityTabItems.length - 1);
                    } else {
                        const tabItem = this.newestStore.cityTabItems[this.newestStore.currentCityIndex];
                        runInAction(() => {
                            this.newestStore.observableCurrentFocusOnType.keyWords.cityId = [Number(tabItem.key)];
                        });
                        this.onHeaderRefreshRecommendedDataList();
                    }
                }
            })
            .catch(() => {
                this.onHeaderRefreshRecommendedDataList();
            });
    };

    // 点击客服
    customerServiceClick = () => {
        if (!this.state.focusOnVisiable && !this.state.goodsBuyVisiable) {
            UserActionSvc.track('NEWEST_CUSTOMER_SERVICE');
            CustomerServiceSvc.showChatScreen();
        }
    };

    // 点击推荐
    // 0 普通搜索，1 关注上新，2 推荐上新，3 爆款。默认为0
    recommendedClick = () => {
        let focusOnTypeList = this.newestStore.focusOnTypeList;
        let queryType = this.state.queryType;
        if (queryType === '2') {
            this.props.commonStore.showModal();
            this.setState({
                focusOnVisiable: true,
                focusOnHasChanged: false
            }, () => {
                if (focusOnTypeList.length === 0) {
                    this.newestStore.getFocusOnTypeList();
                }
            });
        } else {
            this.setState({
                queryType: '2'
            }, () => {
                // 0 普通搜索，1 关注上新，2 推荐上新，3 爆款。默认为0
                this.scrollview.scrollTo({x: WIDTH, animated: true});
                if (this.newestStore.recommendDataList.length === 0) {
                    this.onHeaderRefreshRecommendedDataList();
                }
            });
        }
    };

    // 点击关注
    // 0 普通搜索，1 关注上新，2 推荐上新，3 爆款。默认为0
    focusOnClick = () => {
        if (!this.state.focusOnVisiable && !this.state.goodsBuyVisiable) {
            UserActionSvc.track('GOODS_SORT_RECOMMEND');
            let queryType = this.state.queryType;
            if (queryType !== '1') {
                this.setState({
                    queryType: '1'
                }, () => {
                    this.scrollview.scrollTo({x: 0, animated: true});
                    if (this.newestStore.focusOnDataList.length === 0) {
                        this.onHeaderRefreshFocusOnDataList();
                    }
                });
            }
        }
    };

    // 关注类型是否已经改变
    toggleFocusOnHasChanged = (value) => {
        this.setState({
            focusOnHasChanged: value
        });
    };

    // 关闭蒙版
    closeFocusOnVisiable = () => {
        this.props.commonStore.hideModal();
        this.setState({
            focusOnVisiable: false
        }, () => {
            if (this.state.focusOnHasChanged === true) {
                this.onHeaderRefreshRecommendedDataList();
            }
        });
    };

    // 蒙版点击重置按钮
    resetFocusOnTypeList = () => {
        this.newestStore.resetFocusOnTypeList();
    };

    // 点击扫码
    scanClick = () => {
        if (!this.state.focusOnVisiable && !this.state.goodsBuyVisiable) {
            UserActionSvc.track('NEWEST_SCAN');
            this.props.navigation.navigate('ScanScreen', {
                codeType: 'qrCode',
                didRecievedData: (data, callback) => {
                    ShopSvc.processScanCode(data, callback);
                },
                finishAfterResult: true
            });
        }
    };

    // 点击搜索按钮
    searchClick = () => {
        if (!this.state.focusOnVisiable && !this.state.goodsBuyVisiable) {
            UserActionSvc.track('NEWEST_SEARCH');
            this.props.navigation.navigate('SearchHistoryScreen');
        }
    };

    // 点击购买
    buyClick = (good) => {
        if (!this.state.focusOnVisiable && !this.state.goodsBuyVisiable) {
            this.props.commonStore.showModal();
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
                this.props.commonStore.hideModal();
                this.setState({
                    goodsBuyVisiable: false
                });
            });
        }
    };

    // 推荐数据刷新
    onHeaderRefreshRecommendedDataList = () => {
        this.setState({
            recommendedPageNo: 1,
            recommendedFreshState: RefreshState.HeaderRefreshing
        }, () => {
            this.getRecommendedDataList('fresh');
        });
    };

    // 推荐数据更多
    onFooterRefreshRecommendedDataList = () => {
        let recommendedPageNo = this.state.recommendedPageNo;
        recommendedPageNo++;
        this.setState({
            recommendedPageNo: recommendedPageNo,
            recommendedFreshState: RefreshState.FooterRefreshing
        }, () => {
            this.getRecommendedDataList('more');
        });
    };

    // 获取推荐的数据
    getRecommendedDataList(type) {
        let params = {
            pageNo: this.state.recommendedPageNo,
            jsonParam: {
                queryType: this.state.queryType,
                ...this.newestStore.currentFocusOnType,
                classAccodeLike: this.newestStore.classAccodeLike
            }
        };
        this.newestStore.getRecommendDataList(params, type).then(dataList => {
            if (dataList.length > 0) {
                this.setState({
                    recommendedFreshState: RefreshState.Idle
                });
                this.autoFallback = false;
                type === 'fresh' && Platform.OS === 'android' && InteractionManager.runAfterInteractions(() => {
                    this.recommendList.scrollToOffset({offset:0});
                });
            } else if (dataList.length === 0) {
                // 所有推荐城市都无数据，回到全国。
                if (this.newestStore.currentCityIndex === this.newestStore.cityTabItems.length - 1 && this.autoFallback) {
                    this.autoFallback = false;
                    // this.tabsView.gotoIndex(0);
                }
                this.setState({
                    recommendedFreshState: RefreshState.NoMoreData
                });
                // 无数据，请求下一个城市数据。
                if (type === 'fresh' && this.newestStore.currentCityIndex < this.newestStore.cityTabItems.length - 1 && this.autoFallback) {
                    this.tabsView.gotoIndex(this.newestStore.currentCityIndex + 1);
                }
            }
        }, err => {
            this.setState({
                recommendedFreshState: RefreshState.Failure
            });
            Alert.alert(err.message);
        });
    }

    // 关注-刷新
    onHeaderRefreshFocusOnDataList = () => {
        this.setState({
            focusOnPageNo: 1,
            focusOnFreshState: RefreshState.HeaderRefreshing
        }, () => {
            this.getFocusOnDataList('fresh');
        });
    };

    // 关注-更多
    onFooterRefreshFocusOnDataList = () => {
        let focusOnPageNo = this.state.focusOnPageNo;
        focusOnPageNo++;
        this.setState({
            focusOnPageNo: focusOnPageNo,
            focusOnFreshState: RefreshState.FooterRefreshing
        }, () => {
            this.getFocusOnDataList('more');
        });
    };

    // 关注-获取数据
    getFocusOnDataList(type) {
        // let params = {
        //     pageNo: this.state.focusOnPageNo,
        //     jsonParam: {
        //         queryType: this.state.queryType,
        //         ...this.newestStore.currentFocusOnType,
        //         classAccodeLike: this.newestStore.classAccodeLike
        //     }
        // };
        // 新版本-关注不再有下拉
        let params = {
            pageNo: this.state.focusOnPageNo,
            jsonParam: {
                queryType: this.state.queryType
            }
        };
        this.newestStore.getFocusOnDataList(params, type).then(
            dataList => {
                if (dataList.length > 0) {
                    this.setState({
                        focusOnFreshState: RefreshState.Idle
                    });
                } else if (dataList.length === 0) {
                    this.setState({
                        focusOnFreshState: RefreshState.NoMoreData
                    });
                }
                // 没有任何关注门店
                if(!this.newestStore.focusOnDataList || this.newestStore.focusOnDataList.length <= 0){
                    this.newestStore.getIsFirstToConcernPage().then((flag)=>{
                        // 不做处理
                    }).catch(()=>{
                        // 获取手机号匹配推荐关注列表
                        this.newestStore.getMobileMatchRecommandFocusList((list)=>{
                            // 设置标记
                            this.newestStore.saveIsFirstToConcernPage(true);
                            if(!list || list.length <= 0){
                                return;
                            }
                            ConfirmAlert.alert('提示信息','是否关注系统推荐的店铺?',()=>{
                                this.onConfirmFocusMobileMatch(list);
                            });
                        });
                    });
                } else {
                    // 设置标记
                    this.newestStore.saveIsFirstToConcernPage(true);
                }
            },
            err => {
                this.setState({
                    focusOnFreshState: RefreshState.Failure
                });
                Alert.alert(err.message);
            }
        );
    }


    /**
     * 确认一键关注
     * @param list [{shopId: number, shopName: string}]
     */
    onConfirmFocusMobileMatch = (list)=>{
        Toast.loading();
        NewestApiManager.focusMatchRecomandFocusList({
            jsonParam:list.map((row)=>{ return {shopId:row.shopId,shopName:row.shopName};}),
        }).then((result)=>{
            let rows = result.data && result.data.rows ? result.data.rows : [];
            let isOk = true;
            let desc = '';
            for(let i = 0;i < rows.length;i++){
                let row = rows[i];
                if(row.v1 < 0){
                    desc += ((isOk ? '' : '\n') + row.v2);
                    isOk = false;
                }
            }
            if(isOk){
                Toast.success('关注成功',2);
                this.onHeaderRefreshFocusOnDataList();
            } else {
                Toast.dismiss();
                Alert.alert('提示信息',desc);
            }
        }).catch((error)=>{
            Toast.dismiss();
            Alert.alert(error.message);
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        position: 'relative',
        backgroundColor: colors.bg
    }
});
