/**
 *@author xbu
 *@date 2018/07/30
 *@desc  订单详情
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    DeviceEventEmitter,
    Clipboard,
} from 'react-native';
import I18n from '/gsresource/string/i18n';
import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';
import NavigationHeader from '../../../component/NavigationHeader';
import Image from '../../../component/Image';
import {Toast} from '@ecool/react-native-ui';
import OrderDetailsStore from '../store/OrderDetailsStore';
import ReturnGoodsMsg from '../store/ReturnGoodsMsgStore';
import LogisticsStore from '../store/LogisticsStore';
import util from '../../../utl/NumberUtl';
import CancelOrderComponent from '../widget/OrderCancelComponent';
import OrderCommonUtl from '../servers/OrderCommonUtl';
import OrderFooter from '../widget/OrderFooter';
import OrderBtn from '../widget/OrderBtn';
import {observer, inject} from 'mobx-react';
import DocSvc from '../../../svc/DocSvc';
import ShopSvc from 'svc/ShopSvc';
import UserActionSvc from '../../../svc/UserActionSvc';
import NP from 'number-precision';
import ShowChatScreen from 'svc/CustomerServiceSvc';
import {SYS_CONFIG_PARAMS} from '../../../store/ConfigStore';
import {DLIMManagerLib} from '@ecool/react-native-dlimlib';
import IMService from '../../../svc/IMService';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import rootStore from 'store/RootStore';
import {genGoodsDetailUrl} from 'svc/GoodsSvc';
import ListViewTextArrowCell from 'component/ListViewTextArrowCell';
import ConfirmAlert from 'component/ConfirmAlert';
import Alert from 'component/Alert';

@inject('userStore', 'configStore')
@observer
export default class OrderDetailsScreen extends Component {
    constructor(props) {
        super(props);
        this.store = new OrderDetailsStore();
        this.returnStore = new ReturnGoodsMsg();
        this.logsStore = new LogisticsStore();
        this.state = {
            id: null,
            isReturnFlag: 1,
            isConsulted: false
        };
    }

    static navigationOptions = ({navigation}) => {
        let {params} = navigation.state;
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={
                        params.returnFlag === 1
                            ? I18n.t('orderDetails')
                            : '售后订单详情'
                    }
                    themeStyle={'default'}
                    statusBarStyle={'dark-content'}
                />
            )
        };
    };

    //订单page头部
    orderPageTitle = bill => {
        return (
            <View style={{marginTop: 10, marginBottom: 10}}>
                <View style={styles.orderDHeader}>
                    <Text style={styles.orderDHeaderLeft}>
                        {I18n.t('orderStatus')}
                    </Text>
                    <Text style={styles.orderDHeaderRight}>
                        {bill.frontFlagName}
                    </Text>
                </View>
                {this.store.billList && this.store.billList.length <= 1 && (
                    <View style={styles.orderDHeader}>
                        <Text style={styles.orderDHeaderLeft}>
                            {I18n.t('orderNumber')}
                        </Text>
                        <Text style={styles.orderDHeaderLeft}>{bill.billNo}</Text>
                    </View>
                )}
                {this.state.isReturnFlag === 1 ? null : (
                    <View style={styles.orderDHeader}>
                        <Text style={styles.orderDHeaderLeft}>
                            {'退款单号'}
                        </Text>
                        <Text style={styles.orderDHeaderLeft}>
                            {bill.backNo}
                        </Text>
                    </View>
                )}
            </View>
        );
    };

    //物流
    orderTransportElement = () => {
        let {bill} = this.store.orderDetails;
        if (
            bill.frontFlag === 1 ||
            bill.frontFlag === 2 ||
            bill.frontFlag === 5
        ) {
            return null;
        }
        let data = this.logsStore.logisticsArrayData;
        if (!data.length) {
            return null;
        }
        return (
            <TouchableOpacity
                style={[
                    styles.addressLogsBox,
                    {
                        borderBottomWidth: 1,
                        borderBottomColor: colors.borderE,
                        marginTop: 0
                    }
                ]}
                onPress={this.logBar}
            >
                <View
                    style={[
                        styles.addressLogs,
                        {justifyContent: 'center', alignItems: 'center'}
                    ]}
                >
                    <Image
                        source={require('gsresource/img/orderFlow.png')}
                        style={{marginBottom: 10}}
                    />
                    <View
                        style={{
                            paddingLeft: 20,
                            flex: 1,
                            marginTop: 10,
                            marginBottom: 10
                        }}
                    >
                        <Text style={[styles.addressLogsTop]} numberOfLines={4}>
                            {data[0].acceptStation}
                        </Text>
                        <Text style={styles.addressLogsBto}>
                            {data[0].acceptTime}
                        </Text>
                    </View>
                </View>
                <Image source={require('gsresource/img/channalRight.png')} />
            </TouchableOpacity>
        );
    };

    //地址
    orderAddress = bill => {
        return (
            <View
                style={{
                    backgroundColor: colors.white,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexDirection: 'row',
                    paddingLeft: 15,
                }}
            >
                <Image source={require('gsresource/img/orderAddr.png')} />
                <View style={{paddingLeft: 15, flex: 1}}>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 10
                        }}
                    >
                        <Text style={styles.addressLogsName} numberOfLines={1}>
                            {bill.receiveName}
                        </Text>
                        <Text style={styles.addressLogsTel}>
                            {bill.receivePhone}
                        </Text>
                    </View>
                    <Text style={styles.addressLogsWidth} numberOfLines={2}>
                        {bill.receiveAddress}
                    </Text>
                </View>
            </View>
        );
    };

    // 门店头部
    orderHeader = trader => {
        return (
            <TouchableOpacity
                style={styles.orderTitle}
                onPress={() => {
                    this.props.navigation.navigate('ShopIndexScreen', {
                        tenantId: trader.tenantId,
                        tenantName: trader.tenantName
                    });
                }}
            >
                <Image
                    source={require('gsresource/img/orderHome.png')}
                    style={{marginRight: 10}}
                />
                <Text style={styles.orderTitleFonts} numberOfLines={1}>
                    {trader.tenantName}
                </Text>
                <Image
                    source={require('gsresource/img/arrowRight.png')}
                    style={{marginLeft: 10}}
                />
            </TouchableOpacity>
        );
    };

    //订单列表头部
    orderList = order => {
        let bill = order.bill;
        let arrayData = [];
        let checkId =[];
        if(order){
            order.skus.forEach((el)=>{
                let obj = {
                    spuId:'',
                    spuDocId:'',
                    spuTitle: '',
                    data:[],
                };
                let objIndex = checkId.indexOf(el.spuId);
                if( objIndex === -1){
                    checkId.push(el.spuId);
                    obj['spuId'] = el.spuId;
                    obj['spuDocId'] = el.spuDocId;
                    obj['spuTitle'] = el.spuTitle;
                    obj.data.push(el);
                    arrayData.push(obj);
                } else{
                    arrayData[objIndex].data.push(el);
                }
            });
        }
        let data = arrayData;
        let element = data.map((el, index) => {
            let img = this.getImg(el.spuDocId);
            return (
                <View key={index}>
                    <TouchableOpacity
                        style={[styles.orderGoodsBox,{paddingLeft: 15}]}
                        onPress={() => this.goToGoodsDetailsPage(el.spuId,order.trader)}
                    >
                        <Image
                            style={{width: 70, height: 70}}
                            source={{uri: DocSvc.docURLS(img)}}
                            defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                        />
                        <View style={styles.orderGoods}>
                            <Text
                                style={styles.orderGoodsTitle}
                                numberOfLines={1}
                            >
                                {el.spuTitle}
                            </Text>
                            {bill.buyerRem ? (
                                <Text
                                    style={{
                                        fontSize: fonts.font12,
                                        color: colors.greyFont
                                    }}
                                    numberOfLines={2}
                                >
                                    留言：
                                    {bill.buyerRem}
                                </Text>
                            ) : null}
                            {/*  暂时不做 */}
                            <View
                                style={{
                                    flexDirection: 'row',
                                    justifyContent: 'flex-end',
                                }}
                            >
                                {/*<View style={styles.orderTag}>*/}
                                {/*<Text style={styles.orderTagFont}>正品保证</Text>*/}
                                {/*</View>*/}
                                {/*<View style={styles.orderTag}>*/}
                                {/*<Text style={styles.orderTagFont}>7天包换</Text>*/}
                                {/*</View>*/}
                                <Text style={styles.orderStatus}>
                                    {bill.backFlagName}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                    {this.orderListTable(el.data)}
                    {bill.payFlag > 0 && (
                        <TouchableOpacity
                            style={styles.addGoodTouch}
                            onPress={()=>{
                                this.fastAddGood(el);
                            }}
                        >
                            <Text style={{fontSize: 14, color: colors.activeBtn}}>一键补货</Text>
                        </TouchableOpacity>
                    )}
                </View>
            );
        });

        return element;
    };

    //  订单表格
    orderListTable = data => {
        let element = data.map((el, index) => {
            return (
                <View
                    style={[
                        styles.orderTBody,
                        index % 2 !== 0 ? {backgroundColor: colors.bg} : '',
                    ]}
                    key={index}
                >
                    <Text style={styles.orderTBodyTxt}>{el.spec2Name}</Text>
                    <Text style={styles.orderTBodyTxt}>{el.spec1Name}</Text>
                    <Text style={styles.orderTBodyTxt}>
                        {I18n.t('moneySymbol')}
                        {el.originalPrice}/{I18n.t('numUnit')}
                    </Text>
                    <Text style={styles.orderTBodyTxt}>
                        {el.skuNum}{I18n.t('numUnit')}
                    </Text>
                    <Text style={styles.orderTBodyTxt}>
                        {I18n.t('moneySymbol')}
                        {util.toFixed(el.originalPrice * el.skuNum, 2)}
                    </Text>
                </View>
            );
        });
        return (
            <View style={[styles.orderTable,{paddingLeft: 15,marginTop: 1}]}>
                <View style={styles.orderTableHeader}>
                    <Text style={styles.orderTableHeaderTxt}>
                        {I18n.t('color')}
                    </Text>
                    <Text style={styles.orderTableHeaderTxt}>
                        {I18n.t('size')}
                    </Text>
                    <Text style={styles.orderTableHeaderTxt}>
                        {I18n.t('SinglePrice')}
                    </Text>
                    <Text style={styles.orderTableHeaderTxt}>
                        {I18n.t('num')}
                    </Text>
                    <Text style={styles.orderTableHeaderTxt}>
                        {I18n.t('price')}
                    </Text>
                </View>
                {element}
            </View>
        );
    };

    // 赠送商品模块
    giftModal = data => {
        if (data.length <= 0) {
            return null;
        }
        return (
            <View
                style={{
                    backgroundColor: colors.white,
                    paddingLeft: 15,
                    marginTop: 10
                }}
            >
                <View style={styles.orderTitle}>
                    <Image
                        source={require('gsresource/img/giftIcon.png')}
                        style={{marginRight: 10}}
                    />
                    <Text style={styles.orderTitleFonts} numberOfLines={1}>
                        赠送商品
                    </Text>
                </View>
                {data.map((val, index) => {
                    return (
                        <View style={styles.orderGoodsBox} key={index}>
                            <Image
                                style={{width: 70, height: 70}}
                                source={{uri: DocSvc.docURLM(data.spuDocId)}}
                                defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                            />
                            <View style={styles.orderGoods}>
                                <Text
                                    style={styles.orderGoodsTitle}
                                    numberOfLines={1}
                                >
                                    {val.caption}
                                </Text>
                            </View>
                        </View>
                    );
                })}
            </View>
        );
    };

    //  商品合计模块
    orderPageMoney = detailBillOrders => {
        let money = 0;
        let transformPrice = 0;
        let totalMoney = 0;
        let requestBackMoney = 0;
        let favorMoney = 0;
        let shopCoupsMoney = 0;
        this.store.billList.slice().forEach((model)=>{
            money = NP.plus(money,model.bill.money);
            totalMoney = NP.plus(totalMoney,(model.bill.totalMoney ? model.bill.totalMoney : 0));
            requestBackMoney = NP.plus(requestBackMoney,(model.bill.requestBackMoney ? model.bill.requestBackMoney : 0));
            favorMoney = NP.plus(favorMoney,model.bill.favorMoney);
            shopCoupsMoney = NP.plus(shopCoupsMoney,model.bill.shopCoupsMoney);
            transformPrice = NP.plus(transformPrice,(model.combBill ? model.combBill.combineFee : model.bill.shipFeeMoney));
        });
        money = NP.round(money,2);
        transformPrice = NP.round(transformPrice,2);
        totalMoney = NP.round(totalMoney,2);
        requestBackMoney = NP.round(requestBackMoney,2);
        favorMoney = NP.round(favorMoney,2);
        shopCoupsMoney = NP.round(shopCoupsMoney,2);

        return (
            <View>
                <View
                    style={{
                        backgroundColor: colors.white,
                        paddingLeft: 15
                    }}
                >
                    <View style={styles.orderTotal}>
                        <Text style={styles.orderTotalText}>
                            {this.state.isReturnFlag === 1
                                ? I18n.t('goodAllPrice')
                                : '退货商品合计'}
                        </Text>
                        <Text style={styles.orderTotalText}>
                            {I18n.t('moneySymbol')}
                            {money}
                        </Text>
                    </View>
                    <View style={styles.orderTotal}>
                        <Text style={styles.orderTotalText}>
                            {I18n.t('transformPrice')}
                        </Text>
                        <Text style={styles.orderTotalText}>
                            {I18n.t('moneySymbol')}
                            {transformPrice}
                        </Text>
                    </View>
                    <View style={styles.totalMoney}>
                        <Text style={styles.orderTotalText}>
                            {this.state.isReturnFlag === 1
                                ? I18n.t('shouldPayTotalPrice')
                                : '退货金额'}
                            ：
                        </Text>
                        <Text
                            style={[
                                styles.orderTotalText,
                                {color: colors.activeFont}
                            ]}
                        >
                            {I18n.t('moneySymbol')}
                            {this.state.isReturnFlag === 1
                                ? totalMoney
                                : requestBackMoney}
                        </Text>
                    </View>
                    {this.state.isReturnFlag === 1 && favorMoney > 0 ? (
                        <Text style={styles.normalText}>
                            优惠：－¥
                            {favorMoney}
                        </Text>
                    ) : null}
                    {shopCoupsMoney ? (
                        <Text style={styles.normalText}>
                            优惠合计：－¥
                            {shopCoupsMoney}
                        </Text>
                    ) : null}

                    {/*<Text style={styles.normalText}>抹零：－¥50</Text>*/}
                    {/*{bill.packageFeeMoney ? (<Text style={styles.normalText}>拉包费：+¥{bill.packageFeeMoney}</Text>) : null}*/}
                </View>
            </View>
        );
    };

    //时间
    showTimeList = () => {
        let {bill} = this.store.orderDetails;
        let el = null;
        let time1 = bill.payTime ? (
            <Text style={styles.timer}>
                {I18n.t('paymentOfTime')}：{bill.payTime}
            </Text>
        ) : null;
        let time2 = bill.deliverTime ? (
            <Text style={styles.timer}>
                {I18n.t('deliveryTime')}：{bill.deliverTime}
            </Text>
        ) : null;
        let time3 = bill.confirmTime ? (
            <Text style={styles.timer}>
                {I18n.t('TransactionTime')}：{bill.confirmTime}
            </Text>
        ) : null;

        if (bill.payTime || bill.deliverTime || bill.confirmTime) {
            return (
                <View
                    style={{
                        marginTop: 10,
                        backgroundColor: colors.white,
                        paddingBottom: 15,
                        paddingLeft: 15,
                        paddingTop: 5
                    }}
                >
                    {time1}
                    {time2}
                    {time3}
                </View>
            );
        }
        return el;
    };

    //退款退货时间
    returnTimeShow = () => {
        let {bill} = this.store.orderDetails;
        return (
            <View
                style={{
                    marginTop: 10,
                    backgroundColor: colors.white,
                    paddingBottom: 15,
                    paddingLeft: 15,
                    paddingTop: 5
                }}
            >
                {bill.backRequestTime ? (
                    <Text style={styles.timer}>
                        申请时间：
                        {bill.backRequestTime}
                    </Text>
                ) : null}
                {bill.backDealTime ? (
                    <Text style={styles.timer}>
                        受理时间：
                        {bill.backDealTime}
                    </Text>
                ) : null}
                {bill.backReceiveTime ? (
                    <Text style={styles.timer}>
                        收货时间：
                        {bill.backReceiveTime}
                    </Text>
                ) : null}
                {bill.backFinishTime ? (
                    <Text style={styles.timer}>
                        退款时间：
                        {bill.backFinishTime}
                    </Text>
                ) : null}
            </View>
        );
    };

    //平台申述&联系买家
    IsReturnNo = bill => {
        let el = null;
        if (bill === 12) {
            el = (
                <OrderBtn
                    name={'平台申诉'}
                    btnColor={colors.activeFont}
                    onClickBtn={this.onClickPlat}
                />
            );
        }
        return (
            <View style={{flexDirection: 'row'}}>
                {el}
                <OrderBtn
                    name={'联系卖家'}
                    btnColor={colors.activeFont}
                    onClickBtn={this.linkStore}
                />
            </View>
        );
    };

    /**
     * 一键补货
     */
    fastAddGood = (element) => {
        let orderDetails = this.store.orderDetails;
        if(!orderDetails || !element || !orderDetails.bill){
            dlconsole.log('error fastAddGood:' + orderDetails);
            return;
        }

        let spuId = element.spuId;
        let tenantId = this.store.orderDetails.trader.tenantId;
        let billNo = this.store.orderDetails.bill.billNo;
        let detailUrl = this.store.orderDetails.trader.detailUrl + '&apiKey=ec-spdresb-dresSpu-getFullForBuyer&' + 'spuId=' + spuId + '&buyerId=' + tenantId;
        let sessionId = rootStore.userStore && rootStore.userStore.user ? rootStore.userStore.user.sessionId : '';
        let orderDetailUrl = this.store.orderDetails.trader.detailUrl + '&apiKey=ec-spdresb-dresSpu-replenishForBuyer&' + 'spuId=' + spuId + '&billNo=' + billNo + '&sessionId=' + sessionId;
        this.goodsBuy.goodsBuyAgain(detailUrl, orderDetailUrl);
    };

    /**
     * 店铺货品cell
     * @param item 单据信息OrderDetailListType
     * @param key
     */
    renderShopGoodCell = (item,key)=>{
        return (
            <View
                key={key}
                style={{
                    backgroundColor: colors.white,
                    borderBottomWidth:1,
                    borderBottomColor:colors.borderE,
                    marginBottom:10,
                }}
            >
                {item.orderMode > 0 && (
                    <View style={{height:45,paddingLeft:15,flexDirection:'row',alignItems:'center'}}>
                        <View style={{width:3,height:14,backgroundColor:colors.activeBtn,marginRight:8}} />
                        <Text style={styles.orderTitleText}>{item.orderMode === 2 ? '一件代发订单' : '合包订单'}</Text>
                    </View>
                )}
                {item.shopOrders.map((shopOrder,index)=>{
                    return (
                        <View key={index}>
                            <View style={{paddingLeft: 15,borderTopWidth:1,borderTopColor:colors.borderE}}>
                                {this.orderHeader(shopOrder.trader)}
                            </View>
                            {/* 订单 */}
                            {this.orderList(shopOrder)}
                        </View>
                    );
                })}
            </View>
        );
    }

    /**
     * 修改订单-退还购物车
     */
    onEditOrderClick = async ()=>{
        let listItems = this.store.billList.slice();
        let ids = listItems.map((item)=>{
            return item.bill.id;
        }).join(',');
        Toast.loading();
        try {
            await OrderCommonUtl.cancelOrderMsg(ids,'',13,true);
            Toast.dismiss();
            DeviceEventEmitter.emit('CANCEL_ORDER',{ id : ids});
            rootStore.shoppingCartStore.requestShoppingCart(()=>{
                Toast.show('已为您将该订单货品放回到购物车,请查看',2);
                this.props.navigation.goBack();
                // 选择购物车sku
                let skuIds = [];
                for(let i = 0;i < listItems.length;i++){
                    let model = listItems[i];
                    let modelSkuIds = model.skus.map((sub)=>{
                        return sub.skuId;
                    });
                    skuIds.push(...modelSkuIds);
                }
                skuIds.forEach((id)=>{
                    rootStore.shoppingCartStore.checkSKU(true,id,false);
                });
            });
        } catch (error){
            Toast.dismiss();
            Alert.alert(error.message);
        }
    }

    render() {
        let {bill, trader} = this.store.orderDetails;
        if (!bill) {
            return null;
        }
        let detailBillOrders = this.store.detailBillOrders.slice();
        let billList = this.store.billList.slice();
        let coupons = [];
        billList.forEach((item)=>{
            coupons.push(...item.coupons);
        });

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    {this.orderPageTitle(bill)}

                    {this.state.isReturnFlag === 1
                        ? this.orderTransportElement()
                        : null}

                    {this.orderAddress(bill)}

                    <View style={{height:10}} />
                    {detailBillOrders.map((item,index)=>{
                        return this.renderShopGoodCell(item,index);
                    })}

                    {/*赠品*/}
                    {this.giftModal(coupons)}

                    {/*商品合计*/}
                    {this.orderPageMoney(detailBillOrders)}

                    {/*时间*/}
                    {this.state.isReturnFlag === 1
                        ? this.showTimeList()
                        : this.returnTimeShow()}
                </ScrollView>
                <View
                    style={[
                        styles.orderFooter,
                        {paddingRight: this.state.isReturnFlag === 1 ? 0 : 10}
                    ]}
                >
                    {this.state.isReturnFlag === 1 ? (
                        <OrderFooter
                            backTime={bill.confirmTime}
                            backFlag={bill.backFlag}
                            btnFlag={bill.flag}
                            btnStatus={bill.frontFlag}
                            onClickBtnLeft={() => this.onClickBtnLeft(bill)}
                            onClickBtnCenter={() => this.onClickBtnCenter(bill)}
                            onClickBtnRight={() =>
                                this.onClickBtnRight(bill, trader)
                            }
                            onClickPlat={this.onClickPlat}
                            onClickDelayGetGoods={this.delayGetGoods}
                            onEditOrderClick={()=>{
                                ConfirmAlert.alert('修改订单','即将为您把订单货品放回至购物车,是否继续?',()=>{
                                    this.onEditOrderClick();
                                });
                            }}
                        />
                    ) : (
                        this.IsReturnNo(bill.backFlag)
                    )}
                </View>

                {/*取消订单*/}
                <CancelOrderComponent
                    ref={ref => {
                        this.cancelOrderRef = ref;
                    }}
                    confirmOrder={this.cancelOrder}
                    data={this.returnStore.returnMsgList}
                />
                <GoodsBuy
                    onRef={ref => {
                        this.goodsBuy = ref;
                    }}
                    shopMsg={{
                        traderName:trader.tenantName,
                        tenantId:trader.tenantId,
                        unitId:trader.unitId,
                        clusterCode:trader.clusterCode,
                    }}
                />
            </SafeAreaView>
        );
    }

    getImg = data => {
        let spuDocId = data;
        if (spuDocId) {
            let arrayImg = spuDocId.split(',');
            return arrayImg[0];
        }
        return spuDocId;
    };

    componentDidMount() {
        let {params} = this.props.navigation.state;

        this.setState({
            isReturnFlag: params.returnFlag,
            id: params.id
        });

        this.loadData(params.id);

        //监控 申请售后的变化
        this.deEmitter4 = DeviceEventEmitter.addListener(
            'APPLay_ORDER_DETAILS',
            () => {
                this.updataData(true);
            }
        );

        //支付完成刷新
        this.deEmitter6 = DeviceEventEmitter.addListener(
            'REFRESH_ORDER_DETIALS_DATA',
            () => {
                this.updataData(true);
            }
        );
    }

    componentWillUnmount() {
        this.deEmitter4.remove();
        this.deEmitter6.remove();
    }

    // 当前页面刷新
    componentWillReceiveProps(nextProps) {
        let {params} = nextProps.navigation.state;
        if(params.id !== this.state.id || params.returnFlag !== this.state.isReturnFlag) {
            this.setState({id: params.id, isReturnFlag: params.returnFlag}, () => {
                this.loadData(params.id);
            });
            if(this.goodsBuy && this.goodsBuy.goodsBuyModal){
                this.goodsBuy.goodsBuyModal.close();
            }
        }
    }

    //流水
    getLogsData() {
        if (this.state.isReturnFlag === 1) {
            let {bill} = this.store.orderDetails;
            if (bill.frontFlag === 4 || bill.frontFlag === 3) {
                this.loadlogsData(bill);
            }
        }
    }

    // 退货
    getReturnData() {
        let {bill} = this.store.orderDetails;
        if (bill.frontFlag === 1) {
            this.LoadReturnGoodMsg();
        }
    }

    // 更新
    updataData(isCanSee) {
        let {params} = this.props.navigation.state;
        this.loadData(params.id, isCanSee);
    }

    async loadlogsData(bill) {
        let id = bill.waybillNo;
        let codeId = bill.logisCompid;
        this.logsStore
            .requestData(id, codeId)
            .then(() => {
            })
            .catch(e => {
                Alert.alert(e.message);
            });
    }

    async LoadReturnGoodMsg() {
        try {
            this.returnStore.configListDictApiManager();
        } catch (e) {
            Alert.alert(e.message);
        }
    }

    // 请求数据
    async loadData(order_id, isCanSee) {
        if (!isCanSee) {
            Toast.loading();
        }
        try {
            await this.store.requestData(order_id);
        } catch (e) {
            Toast.dismiss();
            Alert.alert(e.message);
        }
        this.getReturnData();
        this.getLogsData();
        Toast.dismiss();
    }

    // 取消订单
    cancelOrder = (option, data) => {
        let billList = this.store.billList.slice();
        if(billList.length > 1){
            // 多个包裹合并情况 处理单据id
            option = '';
            billList.forEach((item)=>{
                option += (item.bill.id + ',');
            });
            option = option.substr(0,option.length - 1);
        }
        if (data) {
            OrderCommonUtl.cancelOrderMsg(option, data.name, data.codeValue)
                .then(() => {
                    Toast.show('您的订单已经取消', 2);
                    this.cancelOrderRef.cancle();
                    // this.updataData(true);
                    DeviceEventEmitter.emit('CANCEL_ORDER', {id: option});
                    this.props.navigation.goBack();
                })
                .catch(e => {
                    Alert.alert(e.message, '', [{text: '确定', onPress: () => this.cancelOrderRef.cancle()}]);
                });
        } else {
            Toast.show('请选择取消原因', 2);
        }
    };

    // 按钮操作
    onClickBtnLeft = bill => {
        OrderCommonUtl.onClickBtnLeft(bill, this);
    };

    // 申请售后
    onClickBtnCenter = bill => {
        let order_id = bill.id;
        let status = bill.frontFlag;
        let backFlag = bill.backFlag;

        if (backFlag === 0 || backFlag === 2 || backFlag === 12 || backFlag === 3) {
            OrderCommonUtl.onClickBtnCenter(order_id, status, 'details', this.props.navigation);
        } else {
            this.props.navigation.navigate('ReturnGoodsLogsScreen', {orderId: order_id});
        }
    };

    onClickBtnRight(bill, trader,orderResponse) {
        if (bill.frontFlag === 3) {
            Alert.alert(
                '提示',
                '是否确认收货',
                [
                    {
                        text: '取消',
                        onPress: () => {
                        }
                    },
                    {
                        text: '确定',
                        onPress: () => {
                            OrderCommonUtl.sureGetGoods(bill.id)
                                .then(data => {
                                    try {
                                        if (data[0].isSuccess === 1) {
                                            Toast.show('操作成功', 2);
                                            this.updataData(true);
                                            DeviceEventEmitter.emit(
                                                'CONFIRM_ORDER',
                                                {id: bill.id}
                                            );
                                        } else if (data[0].isSuccess === -1) {
                                            Toast.show(data[0].failedMsg, 2);
                                        } else {
                                            Toast.show(data[0].failedMsg, 2);
                                        }
                                    } catch (e) {
                                        Alert.alert(e.message);
                                    }
                                })
                                .catch(e => {
                                    Alert.alert(e.message);
                                });
                        }
                    }
                ],
                {cancelable: false}
            );
        } else {
            OrderCommonUtl.onClickBtnRight(bill, trader, 'orderDetails',this.store.orderDetails);
        }
    }

    //查看物流
    logBar = () => {
        let {bill} = this.store.orderDetails;
        this.props.navigation.navigate('OrderTransportScreen', {
            id: bill.logisData
        });
    };

    // 联系卖家
    linkStore = () => {
        // 获取系统参数配置 是否显示IM
        if (this.props.configStore.isShowIm()) {
            let {trader} = this.store.orderDetails;
            this.gotoIMScreen(trader.unitId);
        } else {
            if (this.state.isConsulted) {
                Toast.show('你的消息已发送，请稍后再操作', 2);
                return;
            }

            UserActionSvc.track('ORDER_SERVICE');
            let {trader} = this.store.orderDetails;
            this.consultToSeller(
                this.props.userStore.accountInfo
                    ? this.props.userStore.accountInfo.mobile
                    : '',
                trader.tenantId,
                trader.unitId,
                this.props.userStore.accountInfo
                    ? this.props.userStore.accountInfo.nickName
                    : ''
            );
        }
    };
    consultToSeller = (mobile, sellerId, sellerUnitId, nickName) => {
        Toast.loading();
        ShopSvc.consultToSeller(
            mobile,
            sellerId,
            sellerUnitId,
            nickName,
            (ret, ext) => {
                let msg = '消息已发送，等待卖家联系您';
                if (ret) {
                    this.setState({isConsulted: true});
                }
                if (ext) {
                    msg = ext;
                }
                Toast.dismiss();
                Alert.alert(msg);
            }
        );
    };

    gotoIMScreen = async (unitId) => {
        try {
            let data = await IMService.fetchSellerIMTeamId(this.props.userStore.user.userId, unitId);
            IMService.showIMScreen(data.tid); //'data.imTid'
        } catch (error) {
            // ...
            Alert.alert(error.message);
        }
    };

    // 平台申述
    onClickPlat = () => {
        let {bill} = this.store.orderDetails;
        let orderId = JSON.stringify(bill.id);
        let returnOrderId = bill.billNo;
        ShowChatScreen.showChatScreen({
            orderId: orderId,
            returnOrderId: returnOrderId
        });
    };

    // 延长收货
    delayGetGoods = () => {
        let {bill} = this.store.orderDetails;
        let id = bill.id;
        OrderCommonUtl.delayGetGoods(id);
    };

    // 去商品详情页面
    goToGoodsDetailsPage = (data,trader) => {
        let cid = trader.clusterCode;
        let tid = trader.tenantId;
        let detailUrl = genGoodsDetailUrl(cid,tid,data);
        this.props.navigation.navigate('GoodDetailScreen', {url: detailUrl});
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    orderDHeader: {
        height: 45,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 15,
        paddingLeft: 15,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE
    },

    orderDHeaderLeft: {
        fontSize: fonts.font14,
        color: colors.normalFont
    },

    orderDHeaderRight: {
        fontSize: fonts.font14,
        color: colors.activeFont
    },

    // orderDAddress: {
    //     flexDirection: 'row',
    //     marginTop: 10,
    //     justifyContent:'space-between',
    //     alignItems:'center',
    //     paddingRight:15,
    //     paddingLeft:15,
    //     height: 90,
    //     backgroundColor: colors.white,
    // },
    //
    // orderAddressName: {
    //     fontSize: fonts.font18,
    //     color: colors.normalFont,
    // },
    //
    // orderAddressFont: {
    //     fontSize: fonts.font14,
    //     color: colors.normalFont,
    //     paddingLeft: 15,
    // },
    //
    // orderAddress: {
    //     fontSize: fonts.font12,
    //     color: colors.normalFont,
    //     paddingTop: 5,
    //     width: 158,
    // },

    orderTitle: {
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
    },

    orderTitleFonts: {
        fontSize: fonts.font12,
        color: colors.normalFont,
        maxWidth: 200
    },

    //
    orderGoodsBox: {
        flexDirection: 'row',
        paddingTop: 10,
        paddingBottom: 15,
        borderTopWidth: 1,
        borderTopColor: colors.borderE
    },

    orderGoods: {
        flex: 1,
        paddingRight: 15,
        paddingLeft: 10,
        height: 70,
        justifyContent: 'space-between'
    },

    orderGoodsTitle: {
        fontSize: fonts.font12,
        color: colors.normalFont
    },

    // orderTag: {
    //     borderWidth: 1,
    //     borderColor: colors.activeFont,
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     marginRight: 10,
    //     borderRadius: 2,
    // },
    //
    // orderTagFont: {
    //     fontSize: fonts.font10,
    //     color: colors.activeFont,
    //     paddingLeft: 3,
    //     paddingRight: 3,
    // },

    //订单表格
    orderTable: {
        paddingRight: 15,
        paddingBottom: 10
    },

    orderTableHeader: {
        height: 20,
        backgroundColor: colors.bg,
        flexDirection: 'row',
        alignItems: 'center'
    },

    orderTableHeaderTxt: {
        color: colors.greyFont,
        fontSize: fonts.font10,
        flex: 1,
        textAlign: 'center'
    },

    orderTBody: {
        height: 30,
        flexDirection: 'row',
        alignItems: 'center'
    },

    orderTBodyTxt: {
        color: colors.normalFont,
        fontSize: fonts.font10,
        flex: 1,
        textAlign: 'center'
    },

    orderTotal: {
        flexDirection: 'row',
        height: 45,
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
        paddingRight: 15
    },

    orderTotalText: {
        fontSize: fonts.font14,
        color: colors.normalFont
    },

    totalMoney: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        height: 45,
        paddingRight: 14
    },

    timer: {
        fontSize: fonts.font14,
        color: colors.normalFont,
        paddingTop: 5
    },

    addGoodTouch: {
        height: 38,
        backgroundColor: 'white',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.borderE,
        borderBottomColor:'transparent',
    },

    orderFooter: {
        height: 46,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'flex-end',
        borderTopWidth: 1,
        borderTopColor: colors.borderE
    },

    addressLogsBox: {
        backgroundColor: colors.white,
        minHeight: 64,
        justifyContent: 'space-between',
        alignItems: 'center',
        flexDirection: 'row',
        paddingLeft: 15,
        paddingRight: 15,
        marginTop: 10
    },

    addressLogs: {
        flexDirection: 'row',
        flex: 1
    },

    addressLogsTop: {
        color: colors.greenFont,
        fontSize: fonts.font12,
        paddingBottom: 10
    },

    addressLogsBto: {
        color: colors.greyFont,
        fontSize: fonts.font10
    },

    addressLogsName: {
        fontSize: fonts.font18,
        color: colors.normalFont,
        flex: 1
    },

    addressLogsTel: {
        fontSize: fonts.font14,
        color: colors.greyFont,
        paddingRight: 15
    },

    addressLogsWidth: {
        fontSize: fonts.font12,
        color: colors.normalFont,
        paddingTop: 6,
        marginBottom: 10,
        marginRight: 10
    },

    orderStatus: {
        fontSize: fonts.font14,
        color: colors.orderColor
    },

    normalText: {
        fontSize: fonts.font11,
        color: colors.transformFont,
        textAlign: 'right',
        marginRight: 15,
        marginBottom: 10
    },
    orderTitleText:{
        fontSize:14,
        color:colors.activeBtn,
        fontWeight:'bold'
    },
    // orderBillNoCopyContainer:{
    //     borderColor:colors.activeBtn,
    //     borderWidth:1,
    //     borderRadius:2
    // },
    // orderBillNoCopyText:{
    //     fontSize:9,
    //     color:colors.activeBtn,
    //     padding:1,
    //     paddingLeft:3,
    //     paddingRight:3
    // },
    // orderBillNoText:{
    //     fontSize:14,
    //     color:colors.normalFont,
    //     marginLeft:7,
    //     marginRight:2
    // },
});
