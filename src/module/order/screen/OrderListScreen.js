/**
 *@author xbu
 *@date 2018/07/27
 *@desc 我的订单
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    Platform,
    DeviceEventEmitter,
    NativeModules
} from 'react-native';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import fonts from 'gsresource/ui/fonts';
import {DLFlatList, RefreshState, Toast} from '@ecool/react-native-ui';
import {TabsView} from '@ecool/react-native-ui';
import OrderList from '../store/OrderListStore';
import ReturnGoodsMsg from '../store/ReturnGoodsMsgStore';
import OrderComponent from '../widget/OrderComponent';
import CancelOrderComponent from '../widget/OrderCancelComponent';
import Image from 'component/Image';
import OrderCommonUtl from '../servers/OrderCommonUtl';
import Alert from 'component/Alert';
import {observer} from 'mobx-react';
import {Screen} from 'gsresource/ui/ui';
import UserActionSvc from 'svc/UserActionSvc';
import NP from 'number-precision';
import ShowChatScreen from 'svc/CustomerServiceSvc';
import ColorOnlyNavigationHeader from 'component/ColorOnlyNavigationHeader';
import SearchView from 'component/SearchView';
import DividerLineH from 'component/DividerLineH';
import StringUtl from 'utl/StringUtl';
import OrderListCombBillCell from '../widget/OrderListCombBillCell';

const PAGE_SIZE = 20;
const WIDTH = Dimensions.get('window').width;
@observer
export default class OrderListScreen extends Component {
    constructor(props) {
        super(props);
        this.store = new OrderList();
        this.returnStore = new ReturnGoodsMsg();
        this.state = {
            tabIndex: 0,
            searchIcon: true,
            key: '',
            listFreshState0: RefreshState.Idle,
            listFreshState1: RefreshState.Idle,
            listFreshState2: RefreshState.Idle,
            listFreshState3: RefreshState.Idle,
            listFreshState4: RefreshState.Idle,
        };
        this.pageNo0 = 1;
        this.pageNo1 = 1;
        this.pageNo2 = 1;
        this.pageNo3 = 1;
        this.pageNo4 = 1;
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

    //头部
    renderHeade =()=> {
        return (
            <View style={{height: 44, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: colors.white,
                    height: 44,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
                >
                    <TouchableOpacity
                        style={{marginLeft: 16}}
                        hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}
                    >
                        <Image source={require('gsresource/img/arrowLeftGrey.png')} />
                    </TouchableOpacity>

                    {this.state.searchIcon ? this.showTitle() : this.showSearchBar()}
                    {this.showSearchIconView()}
                </View>
            </View>
        );
    };

    //标题
    showTitle =()=> {
        return (
            <Text
                style={{
                    fontSize: fonts.font18,
                    color: '#3d4245',
                    backgroundColor: 'transparent',
                    textAlign: 'center',
                }}
            >{I18n.t('myOrder')}</Text>
        );
    };

    //搜索
    showSearchBar =()=> {
        return(
            <SearchView
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
                hint={'请输入商品名称或订单号'}
                onTextChange={(text) => {
                    const value = StringUtl.filterChineseSpace(text);
                    setTimeout(()=>{
                        this.setState({
                            key: value
                        });
                    });
                }}
                onSubmitEditing={() => {
                    this.onHeadFresh();
                }}
            />
        );
    };

    //搜索按钮
    showSearchIconView =()=> {
        return this.state.searchIcon ? this.showIcon() : this.showText();
    };

    showIcon =()=> {
        return(
            <TouchableOpacity
                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginRight: 15}}
                onPress={() => {
                    // 显示搜索框
                    this.setState({
                        searchIcon: !this.state.searchIcon
                    });
                }}
            >
                <Image source={require('gsresource/img/searchBig.png')} />
            </TouchableOpacity>
        );
    };

    showText =()=> {
        return(
            <TouchableOpacity

                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginRight: 15}}
                onPress={() => {
                    this.setState({
                        searchIcon: !this.state.searchIcon
                    },()=>{
                        if(this.state.searchIcon){
                            this.setState({
                                key: ''
                            },()=>{
                                this.onHeadFresh();
                            });
                        }
                    });
                }}
            >
                <Text style={{fontSize: fonts.font14,color: colors.greyFont}}>取消</Text>
            </TouchableOpacity>
        );
    };


    // 中间item
    renderList = (data, loading) => {
        return (
            <DLFlatList
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderCell}
                mode={'FlatList'}
                refreshState={loading}
                data={data}
                ListEmptyComponent={this.listEmptyView}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
            />
        );
    };

    //  当数据为空展示列表
    listEmptyView = () => {
        return (
            <View style={{position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center', width: WIDTH}}>
                <Image source={require('gsresource/img/noOrder.png')} />
                <Text style={{color: colors.normalFont}}>暂无数据</Text>
            </View>
        );
    };

    backToShoppingCar = (item)=>{

    }

    // 具体数据列表
    renderCell = (info) => {
        let item = info.item;
        return (
            <OrderListCombBillCell
                store={this.store}
                item={item}
                goToUrl={this.goToDetailsPage}
                onClickBtnLeft={()=>this.onClickBtnLeft(item)}
                onClickBtnCenter={()=>this.onClickBtnCenter(item)}
                onClickBtnRight={()=>this.onClickBtnRight(item)}
                onClickPlat={()=>this.onClickPlat(item)}
                onClickDelayGetGoods={()=>this.delayGetGoods(item.bill.id)}
            />
        );
        // if(item.combBillList){
        //     return (
        //         <OrderListCombBillCell
        //             item={item}
        //             goToUrl={this.goToDetailsPage}
        //             onClickBtnLeft={()=>this.onClickBtnLeft(item)}
        //             onClickBtnCenter={()=>this.onClickBtnCenter(item)}
        //             onClickBtnRight={()=>this.onClickBtnRight(item)}
        //             onClickPlat={()=>this.onClickPlat(item)}
        //             onClickDelayGetGoods={()=>this.delayGetGoods(item.bill.id)}
        //         />
        //     );
        // } else {
        //     return (
        //         <OrderComponent
        //             listData={item}
        //             goToUrl={this.goToDetailsPage}
        //             onClickBtnLeft={()=>this.onClickBtnLeft(item)}
        //             onClickBtnCenter={()=>this.onClickBtnCenter(item)}
        //             onClickBtnRight={()=>this.onClickBtnRight(item)}
        //             onClickPlat={()=>this.onClickPlat(item)}
        //             onClickDelayGetGoods={()=>this.delayGetGoods(item.bill.id)}
        //         />
        //     );
        // }
    };


    render() {
        return (
            <SafeAreaView style={styles.container}>
                {
                    this.renderHeade()
                }
                <DividerLineH />

                {/*tab切换*/}
                <View style={{backgroundColor: colors.white}}>
                    <TabsView
                        containerStyle={{
                            width: WIDTH,
                            alignItems: 'center',
                            height: 40,
                        }}
                        tabItemStyle={{
                            paddingLeft: 0,
                            paddingRight: 0,
                            width: WIDTH / 5
                        }}
                        underlineStyle={{
                            width: 30,
                            backgroundColor: colors.activeFont,
                        }}
                        tabItemTextTyle={{
                            fontSize: fonts.font14,
                        }}
                        activeTextColor={colors.activeFont}
                        defaultTextColor={colors.normalFont}
                        activeItemIndex={this.state.tabIndex}
                        items={this.store.areaListShow}
                        goToPage={(index) => this.goToPage(index)}
                    />
                </View>

                {/*全部订单*/}
                <ScrollView
                    ref={(ref) => {
                        this.scrollview = ref;
                    }}
                    pagingEnabled={true}
                    scrollEnabled={false}
                    horizontal={true}
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => this.onAnimatinonEnd(e)}
                >
                    {this.renderList(this.store.orderListAll, this.state.listFreshState0)}
                    {this.renderList(this.store.orderListPayGoods, this.state.listFreshState1)}
                    {this.renderList(this.store.orderListPendingGoods, this.state.listFreshState2)}
                    {this.renderList(this.store.orderListReceivedGoods, this.state.listFreshState3)}
                    {this.renderList(this.store.orderListDoneGoods, this.state.listFreshState4)}
                </ScrollView>

                {/*取消订单*/}
                <CancelOrderComponent
                    ref={(ref) => {
                        this.cancelOrderRef = ref;
                    }}
                    confirmOrder={this.cancelOrder}
                    data={this.returnStore.returnMsgList}
                />

            </SafeAreaView>
        );
    }



    //方法区
    componentWillMount() {
        const {params} = this.props.navigation.state;
        this.setState({tabIndex: params.id});
    }

    componentDidMount() {
        //请求数据
        this.androidIosPlatformMethods();

        // 退货理由
        this.LoadReturnGoodMsg();

        //监控 评价状态变化
        this.deEmitter = DeviceEventEmitter.addListener('Evaluate_FLAG', (obj) => {
            this.store.changeFlagEva(obj.id);
        });

        //监控 取消订单变化
        this.deEmitter2 = DeviceEventEmitter.addListener('CANCEL_ORDER', (obj) => {
            this.store.deleteOrderListPayGoods(obj.id);
        });

        //监控 订单确认变化
        this.deEmitter3 = DeviceEventEmitter.addListener('CONFIRM_ORDER', (obj) => {
            this.store.deleteOrderListReceivedGoods(obj.id);
        });

        //监控 申请售后的变化
        this.deEmitter4 = DeviceEventEmitter.addListener('APPLay_ORDER', (obj) => {
            this.store.changeApplayData(obj.id,obj.type);
        });

        //退款流水
        this.deEmitter5 = DeviceEventEmitter.addListener('REVOKE_DATA', (obj) => {
            this.store.RevokeDataType(obj);
        });

        //支付完成刷新
        this.deEmitter6 = DeviceEventEmitter.addListener('REFRESH_ORDER_LIST_DATA',()=>{
            this.onHeadFresh();
        });

        // 生成订单
        this.deEmitter7 = DeviceEventEmitter.addListener('NEW_BILL', (obj) => {
            this.onHeadFresh();
        });

    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
        // 更新我的页面
        DeviceEventEmitter.emit('mineScreenrefresh');
        //移除控制 评价状态
        this.deEmitter.remove();
        this.deEmitter2.remove();
        this.deEmitter3.remove();
        this.deEmitter4.remove();
        this.deEmitter5.remove();
        this.deEmitter6.remove();
        this.deEmitter7.remove();

    }

    androidIosPlatformMethods() {
        if (Platform.OS === 'ios') {
            this.androidIosPlatform();
            const {params} = this.props.navigation.state;
            if (params.id === 0) {
                this.onHeadFresh();
            }
        } else {
            this.timeoutId = setTimeout(() => {
                this.androidIosPlatform();
                this.onHeadFresh();
            });
        }
    }

    // 适配安卓iOS交互
    androidIosPlatform() {
        const {params} = this.props.navigation.state;
        let index = params.id;
        this.scrollview.scrollTo({x: index * Screen.width, animated: true});
    }

    onLoadMore = () => {
        this.loadData(false);
    };

    onHeadFresh = () => {
        this.loadData(true);
    };

    async LoadReturnGoodMsg() {
        try {
            await this.returnStore.configListDictApiManager();
        } catch (e) {
            Alert.alert(e.message);
        }
    }

    // 加载更多
    async loadData(fresh) {
        //  当前是选择那个
        let type = this.state.tabIndex;
        let page = 1;
        if (fresh) {
            switch (type) {
            case 0:
                this.pageNo0 = 1;
                UserActionSvc.track('ORDER_LOOK_ALL');
                break;
            case 1:
                this.pageNo1 = 1;
                UserActionSvc.track('ORDER_LOOK_WILL_PAY');
                break;
            case 2:
                this.pageNo2 = 1;
                UserActionSvc.track('ORDER_LOOK_WILL_SEND');
                break;
            case 3:
                this.pageNo3 = 1;
                UserActionSvc.track('ORDER_LOOK_WILL_GET');
                break;
            case 4:
                this.pageNo4 = 1;
                UserActionSvc.track('ORDER_LOOK_DID_GET');
                break;
            }
            this.updateFreshState(RefreshState.HeaderRefreshing);
        } else {
            this.updateFreshState(RefreshState.FooterRefreshing);
        }

        switch (type) {
        case 0:
            page = this.pageNo0;
            break;
        case 1:
            page = this.pageNo1;
            break;
        case 2:
            page = this.pageNo2;
            break;
        case 3:
            page = this.pageNo3;
            break;
        case 4:
            page = this.pageNo4;
            break;
        }

        let obj = {
            pageSize: PAGE_SIZE,
            pageNo: page,
            statusType: type,
            searchToken: this.state.key
        };

        try {
            await this.store.getOrderListData(fresh, obj, (ret, extra) => {
                if (!ret) {
                    Alert.alert(extra);
                    this.updateFreshState(RefreshState.Idle);
                } else {
                    switch (type) {
                    case 0:
                        this.pageNo0 = this.pageNo0 + 1;
                        break;
                    case 1:
                        this.pageNo1 = this.pageNo1 + 1;
                        break;
                    case 2:
                        this.pageNo2 = this.pageNo2 + 1;
                        break;
                    case 3:
                        this.pageNo3 = this.pageNo3 + 1;
                        break;
                    case 4:
                        this.pageNo4 = this.pageNo4 + 1;
                        break;
                    }

                    if (extra === 0) {
                        this.updateFreshState(RefreshState.NoMoreData);
                    } else {
                        this.updateFreshState(RefreshState.Idle);
                    }
                }
            });

        } catch (e) {
            this.updateFreshState(RefreshState.Failure);
            Alert.alert(e.message);
        }
    }

    // 改状态
    updateFreshState = (state) => {
        let type = this.state.tabIndex;
        switch (type) {
        case 0:
            this.setState({
                listFreshState0: state,
            });
            break;
        case 1:
            this.setState({
                listFreshState1: state,
            });
            break;
        case 2:
            this.setState({
                listFreshState2: state,
            });
            break;
        case 3:
            this.setState({
                listFreshState3: state,
            });
            break;
        case 4:
            this.setState({
                listFreshState4: state,
            });
            break;
        }
    };

    // 切换 tab
    goToPage = (index) => {
        this.setState({tabIndex: index}, () => {
            if (Platform.OS !== 'ios') {
                this.onLoading(index);
            }
        });
        this.scrollview.scrollTo({x: index * Screen.width, animated: true});
    };

    onAnimatinonEnd(e) {
        let index = this.state.tabIndex;
        this.onLoading(index);
    }

    onLoading(index) {
        if (this.store.orderListAll.length <= 0 && index === 0) {
            this.loadData(true);
        }

        if (this.store.orderListPayGoods.length <= 0 && index === 1) {
            this.loadData(true);
        }

        if (this.store.orderListPendingGoods.length <= 0 && index === 2) {
            this.loadData(true);
        }

        if (this.store.orderListReceivedGoods.length <= 0 && index === 3) {
            this.loadData(true);
        }

        if (this.store.orderListDoneGoods.length <= 0 && index === 4) {
            this.loadData(true);
        }
    }

    // 点击去订单搜索页面
    goToSearchPage = () => {
        this.props.navigation.navigate('OrderSearchScreen');
    };

    // 点击进入订单详情页面
    goToDetailsPage = (data) => {
        this.props.navigation.navigate('OrderDetailsScreen', {id: data,returnFlag: 1});
    };

    // 取消订单
    cancelOrder = (option, data) => {
        if (data) {
            OrderCommonUtl.cancelOrderMsg(option, data.codeName, data.codeValue, this.onHeadFresh).then(() => {
                // this.store.deleteOrderListPayGoods(option);
                DeviceEventEmitter.emit('CANCEL_ORDER',{ id : option});
                Toast.show('您的订单已经取消',2);
                this.cancelOrderRef.cancle();
            }).catch(e=>{
                Alert.alert(e.message,'',[{text: '确定' ,onPress: () => this.cancelOrderRef.cancle()}]);
            });
        } else {
            Toast.show('请选择取消原因', 2);
        }
    };

    // 按钮操作
    onClickBtnLeft = (data) => {
        OrderCommonUtl.onClickBtnLeft(data.bill, this,data);
    };

    // 申请售后
    onClickBtnCenter =(data) => {
        let order_id = data.bill.id;
        let status = data.bill.frontFlag;
        let backFlag = data.bill.backFlag;

        if(backFlag === 0 || backFlag === 2 || backFlag === 12 || backFlag === 3){
            OrderCommonUtl.onClickBtnCenter(order_id, status,'list', this.props.navigation);
        } else {
            this.props.navigation.navigate('ReturnGoodsLogsScreen',{orderId: order_id});
        }
    };

    onClickBtnRight(data) {
        let obj = data.bill;
        let trader = data.trader;
        if (data.bill.frontFlag === 3) {
            Alert.alert('提示', '是否确认收货', [{text: '取消', onPress: () => {}},
                {text: '确定', onPress: () => {
                    OrderCommonUtl.sureGetGoods(obj.id).then((data) => {
                        try {
                            if (data[0].isSuccess === 1) {
                                Toast.show('操作成功', 2);
                                this.store.deleteOrderListReceivedGoods(obj.id);
                            } else if (data[0].isSuccess === -1) {
                                Toast.show(data[0].failedMsg, 2);
                            } else {
                                Toast.show(data[0].failedMsg, 2);
                            }
                        } catch (e) {
                            Alert.alert(e.message);
                        }

                    }).catch(e=>{
                        Alert.alert(e.message);
                    });
                }
                }
            ]
            );
        } else {
            OrderCommonUtl.onClickBtnRight(obj, trader,'orderList',data);
        }
    }

    // 平台申述
    onClickPlat =(data)=>{
        let orderId = JSON.stringify(data.bill.id);
        let returnOrderId = data.bill.billNo;
        ShowChatScreen.showChatScreen({orderId: orderId,returnOrderId: returnOrderId});
    };

    // 延长收货
    delayGetGoods =(id)=>{
        OrderCommonUtl.delayGetGoods(id);
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },
});