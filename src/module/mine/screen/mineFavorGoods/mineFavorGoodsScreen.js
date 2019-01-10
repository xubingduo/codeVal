/**
 * @author [lyq]
 * @email
 * @create date 2018-08-28 07:25:39
 * @modify date 2018-08-28 07:25:39
 * @desc [首页今日爆款页面]
 */

import React, {Component} from 'react';
import {View, SafeAreaView, StyleSheet, DeviceEventEmitter, Platform, NativeModules} from 'react-native';
import {observer} from 'mobx-react';
import {DLFlatList, RefreshState} from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import GoodsItem from 'module/goods/widget/GoodsItem';
import GoodsListStore from '../../../goods/store/GoodsListStore';
import NavigationHeader from 'component/NavigationHeader';
import EmptyView from 'component/EmptyView';
import Alert from 'component/Alert';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import * as _ from 'lodash';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';

@observer
export default class mineFavorGoodsScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    navigationTitleItem={'我的收藏'}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.store = new GoodsListStore();
        this.state = {
            refreshState: RefreshState.Idle,
            pageNo: 1,
            shopMsg: {}
        };
    }

    // toggleFavorClick(code, goodsId, goods) {
    //     if (code) {
    //         let spuFavorNum = goods.spuFavorNum;
    //         let spuFavorFlag = goods.spuFavorFlag || 0;
    //         // 未收藏=》收藏
    //         if (spuFavorFlag === 0) {
    //             spuFavorNum++;
    //             this.store.toggleFavorClick(goodsId, spuFavorNum, 1);
    //         }
    //         // 收藏=》取消收藏
    //         if (spuFavorFlag === 1) {
    //             // spuFavorNum--;
    //             this.store.toggleFavorClick(goodsId, spuFavorNum, 0);
    //         }
    //     }
    // }
    //
    // watchCallBack(code, goodsId, viewNum) {
    //     if (code) {
    //         this.store.watchCallBack(goodsId, viewNum);
    //     }
    // }
    //
    // toggleStarClick(code, goodsId, value) {
    //     if (code) {
    //         this.store.toggleStarClick(goodsId, value);
    //     }
    // }
    //
    // buyClick(good) {
    //     this.setState({
    //         shopMsg: good
    //     }, () => {
    //         this.goodsBuy.goodsBuyShow(good.detailUrl);
    //     });
    // }

    beforeMount() {
        this.deEmitter = DeviceEventEmitter.addListener(GOODS_ITEM_CHANGE,
            ({key, data}) => {
                // console.log(key.toLowerCase(), data);
                switch (key) {
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let {tenantId, favorFlag} = data;
                    this.store.toggleFocusOnClick(tenantId, favorFlag);
                    break;
                }
                case CHANGE_GOODS_WATCH_NUMBER: {
                    let {goodsId, viewNum} = data;
                    this.store.watchCallBack(goodsId, viewNum);
                    break;
                }
                case CHANGE_GOODS_STAR_NUMBER_STATE: {
                    let {goodsId, praiseFlag, praiseNum} = data;
                    this.store.toggleStarClick(goodsId, praiseFlag, praiseNum);
                    break;
                }
                case CHANGE_GOODS_FAVOR_NUMBER_STATE: {
                    let {goodsId, spuFavorFlag, spuFavorNum} = data;
                    this.store.toggleFavorClick(goodsId, spuFavorFlag, spuFavorNum);
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );

        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('我的收藏');
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('我的收藏');
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <DLFlatList
                    data={this.store.favorGoodsDataList}
                    renderItem={this.renderCell}
                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    refreshState={this.state.refreshState}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={<EmptyView emptyViewType={'NODATA'} />}
                />
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

    /**
     * 渲染列表cell
     */
    renderCell = ({item}) => {
        return (
            <GoodsItem
                key={item.id}
                isShowDelete={false}
                goods={item}
                // toggleFocusOnClick={(code, msg) => {
                //     this.toggleFocusOnClick(code, msg, item.favorFlag);
                // }}
                // toggleFavorClick={(code, goodsId) => {
                //     this.toggleFavorClick(code, goodsId, item);
                // }}
                // watchCallBack={(code, goodsId) => {
                //     this.watchCallBack(code, goodsId, (item.viewNum || 0) + 1);
                // }}
                // toggleStarClick={(code, msg) => {
                //     this.toggleStarClick(code, msg, (item.praiseNum || 0) + 1);
                // }}
                // deleteClick={(code, msg) => {
                //     this.deleteClick(code, msg);
                // }}
                buyClick={this.buyClick}
            />
        );
    };

    componentDidMount() {
        this.beforeMount();
        this.throttleLoadData();
    }

    throttleLoadData = _.throttle(() => {
        this.onHeaderRefresh();
    }, 500);

    // 获取推荐的数据
    getDataList(type) {
        let params = {
            pageNo: this.state.pageNo,
            jsonParam: {
                queryType: '5'
            }
        };
        this.store.getFavorGoodsDataList(params, type).then((dataList) => {
            if (dataList.length > 0) {
                this.setState({
                    refreshState: RefreshState.Idle
                });
            } else if (dataList.length === 0) {
                this.setState({
                    refreshState: RefreshState.NoMoreData
                });
            }
        }, err => {
            this.setState({
                refreshState: RefreshState.Failure
            });
            Alert.alert(err.message);
        });
    }

    onHeaderRefresh = () => {
        this.setState({
            pageNo: 1,
            refreshState: RefreshState.HeaderRefreshing
        }, () => {
            this.getDataList('fresh');
        });
    };

    onFooterRefres = () => {
        let pageNo = this.state.pageNo;
        pageNo++;
        this.setState({
            pageNo: pageNo,
            refreshState: RefreshState.FooterRefreshing
        }, () => {
            this.getDataList('more');
        });
    };

    // toggleFocusOnClick(code, shopId, favorFlag) {
    //     if (code) {
    //         this.store.toggleFocusOnClick(shopId, favorFlag);
    //     }
    // }

    // toggleFavorClick(code, goodsId, goods) {
    //     if (code) {
    //         let spuFavorNum = goods.spuFavorNum;
    //         let spuFavorFlag = goods.spuFavorFlag || 0;
    //         // 未收藏=》收藏
    //         if (spuFavorFlag === 0) {
    //             spuFavorNum++;
    //             this.store.toggleFavorClick(goodsId, spuFavorNum, 1);
    //         }
    //         // 收藏=》取消收藏
    //         if (spuFavorFlag === 1) {
    //             // spuFavorNum--;
    //             this.store.toggleFavorClick(goodsId, spuFavorNum, 0);
    //         }
    //     }
    // }
    //
    // watchCallBack(code, goodsId, viewNum) {
    //     if (code) {
    //         this.store.watchCallBack(goodsId, viewNum);
    //     }
    // }
    //
    // toggleStarClick(code, goodsId, value) {
    //     if (code) {
    //         this.store.toggleStarClick(goodsId, value);
    //     }
    // }
    //
    buyClick = (good) => {
        this.setState({
            shopMsg: good
        }, () => {
            this.goodsBuy.goodsBuyShow(good.detailUrl);
        });
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8'
    }
});
