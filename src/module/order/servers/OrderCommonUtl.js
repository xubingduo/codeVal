/**
 *@author xbu
 *@date 2018/08/14
 *@desc  订单类公用方法
 *@flow
 */

import Navigations from 'svc/NavigationSvc';
import RouteUtil from 'utl/RouteUtil';
import {Toast} from '@ecool/react-native-ui';
import OrderDetailsStore from '../store/OrderDetailsStore';
import CustomerServiceSvc from 'svc/CustomerServiceSvc';
let store = new OrderDetailsStore();
import Alert from '../../../component/Alert';
import UserActionSvc from 'svc/UserActionSvc';
import OrderListCombBillModel, {OrderListBillModel} from '../model/OrderListCombBillModel';


// 查看物流
function goToTransport(orderId: Object) {
    UserActionSvc.track('ORDER_MATERIAL_FLOW');
    Navigations.navigate('OrderTransportScreen',{id: orderId});
}

// 店铺评价
function goToStoreEvaluatePage(orderId: string,flag: number, trade,flagName) {
    UserActionSvc.track('ORDER_EVALUATE');
    let newObj = Object.assign({},{id:orderId,flag: flag,flagName: flagName},trade);
    Navigations.navigate('StoreEvaluateScreen',newObj);
}

// 申请售后
function goToGetHelp(orderId: number,status: number,names: string,router: Object,) {
    UserActionSvc.track('ORDER_AFTER_SALE');
    let obj = Object.assign({},{id:orderId,status:status,from: names},{...RouteUtil.put(router)});
    // router.push('OrderReturnGoodsScreen',obj);
    Navigations.navigate('OrderReturnGoodsScreen',obj);
}

// 取消订单
function cancelOrder(that: Object,orderId: string) {
    that.cancelOrderRef.show();
    that.cancelOrderRef.setOptions(orderId);
}

async function cancelOrderMsg (id: any, msg: string, msgId: string | number,isRetShopCart?: boolean = false) {
    UserActionSvc.track('ORDER_CANCEL');
    try {
        let data = await store.cancelOrder(id, msg, msgId,isRetShopCart);
        return Promise.resolve(data);
    } catch (e) {
        return Promise.reject(e);
    }
}

/**
 * 货品返回到购物车
 */
function backToShoppingCart() {
    
}

// 提醒发货
let timeData = [];
let dataId = [];
let backTime = 600000;
function reminderOrder(orderId: number) {
    UserActionSvc.track('ORDER_REMINDING_GOODS');
    let mill = new Date().getTime();
    let index = dataId.indexOf(orderId);

    if(index > -1){
        let el = timeData[index];
        if(el){
            if((el.time + backTime) <= mill){
                el.time = mill;
            } else{
                Toast.show('您已经提醒发货了，请稍后操作', 2);
                return;
            }
        }
    }

    store.remembeGoods(orderId).then(data => {
        if(index === -1){
            dataId.push(orderId);
            timeData.push({id: orderId,time: mill});
        }
        Alert.alert('提醒发货成功');
    }).catch(e=>{
        Alert.alert(e.message);
    });
}

//立即支付
function goToPay(orderId: string,money: string | number) {
    UserActionSvc.track('ORDER_PAY');
    let orderArray = orderId.split(',');
    Navigations.navigate('ChoicePayMethodScreen',{orderIds: orderArray,payMoney: money});
}



//确认收货
async function sureGetGoods (orderId: number) {
    UserActionSvc.track('ORDER_SURE_GOODS');
    try {
        let data = await store.confirmReceiptGoods(orderId);
        return Promise.resolve(data);
    }catch (e) {
        return Promise.reject(e);
    }
}

// 延长收货
let delayId = [];
function delayGetGoods(orderId: number) {
    let index = delayId.indexOf(orderId);
    if(index === -1){
        store.delayGetGoods(orderId).then(data=>{
            delayId.push(orderId);
            Alert.alert('您的收货时间已延长');
        }).catch(e=>{
            delayId.push(orderId);
            // Alert.alert(e.message);
            Toast.show('您的收货时间已延长', 2);
        });
    } else {
        Toast.show('您的收货时间已延长', 2);
    }
}


function onClickBtnLeft (orderObj: Object,that: Object,billInfo?: OrderListCombBillModel) {
    let orderStatus = orderObj.frontFlag;
    let orderId = orderObj.id;
    switch (orderStatus) {
    case 1:
    case 2:
    case 6:
        //取消订单
        {
            if(billInfo){
                let billList = getBillList(billInfo);
                // 多个包裹合并的情况
                if(billList.length > 1){
                    orderId = '';
                    billList.forEach((item)=>{
                        orderId += (item.bill.id + ',');
                    });
                    orderId = orderId.substr(0,orderId.length - 1);
                }
            }
            cancelOrder(that,orderId);
        }
        break;
    case 3:
    case 4:
        // 查看物流
        goToTransport(orderObj.logisData);
        break;
        //联系客服
    case 5:
        UserActionSvc.track('ORDER_SERVICE');
        CustomerServiceSvc.showChatScreen();
        break;
    }
}

// 获取帮助
function onClickBtnCenter (orderId: number,status: number,names: string,router: Object) {
    goToGetHelp(orderId,status,names,router);
}

function getBillList(billInfo: OrderListCombBillModel): Array<OrderListBillModel> {
    let {combBillList,...otherProps} = billInfo;
    if(!otherProps || !otherProps.bill){
        return [];
    }
    let list = [];
    list.push(JSON.parse(JSON.stringify(otherProps)));
    if(combBillList){
        list.push(...combBillList);
    }
    return list;
}

function onClickBtnRight (orderObj: Object,trader: Object,flagName: string,billInfo: OrderListCombBillModel) {
    let orderStatus = orderObj.frontFlag;
    let orderId = orderObj.id;
    switch (orderStatus) {
    case 1:
    case 6:
        //去支付
        {

            if(billInfo){
                // 处理合包未付款
                orderId = '';
                let billList = getBillList(billInfo);
                billList.forEach((item)=>{
                    orderId += (item.bill.id + ',');
                });
                orderId = orderId.substr(0,orderId.length - 1);
            }
            goToPay(orderId,billInfo.billTotalMoney);
        }
        break;
    case 2:
        // 提醒发货
        reminderOrder(orderId);
        break;
        // case 3:
        // 确认收货
        // sureGetGoods(orderId,func);
        // break;
    case 4:
        //评价
        goToStoreEvaluatePage(orderId,orderObj.flag,trader,flagName);
        break;
    }
}



export default {
    cancelOrder,
    cancelOrderMsg,
    sureGetGoods,
    onClickBtnLeft,
    onClickBtnCenter,
    onClickBtnRight,
    delayGetGoods,
    getBillList,
};