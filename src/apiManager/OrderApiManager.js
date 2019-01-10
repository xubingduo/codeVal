/**
 *@author xbu
 *@date 2018/08/21
 *@desc   所有订单有关的Api
 *@flow
 *
 */

import DLFetch from '@ecool/react-native-dlfetch';

// 订单列表Api
const fetchOrderList = (params: Object) => {
    return DLFetch.post('spb/api.do', {apiKey: 'ec-sppur-purBill-findBills', ...params});
};

// 订单详情
const fetchOrderDetails = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-findBillFull', ...params});
};

// 买家确认收货
const fetchConfirmReceiptGoods = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-confirmReceipt', ...params});
};

// 取消（关闭）订单
const fetchCancelOrder = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-cancelBill', ...params});
};

// 点赞
const fetchThumbsUp = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spugr-spShop-likeShop', ...params});
};

// 提醒发货
const fetchRemindingShipments = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-remindBillDeliver', ...params});
};

// 用户各类型订单数量
const fetchBillsCount = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-findBillsCount', ...params});
};

// 店铺评价
const fetchEvaluateUpdate = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-evalBill', ...params});
};

// 查看订单评价
const fetchLookEvaluate = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-up-upEvaluate-getUpEval', ...params});
};

// 物流接口
const logistics = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-spLogisTrack-getTrackInfo', ...params});
};

// 退货退款物流
const returnlogistics = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-billReturn-getBillReturnBills', ...params});
};

// 退货退物流商
const TransStore = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spconfb-logis-provider-list', ...params});
};

// 保存
const sureBtnTrans = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-billReturn-saveDeliver', ...params});
};

// 撤销
const buyManRevokeBill = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-billReturn-cancelReturn', ...params});
};

// 退款退货
const fetchCreateBillApiManager = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-billReturn-createFull', ...params});
};

const fetchDelayGetGoods = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-extendedReturn', ...params});
};

// 退货单订单详情
const fetchReturnOrderDetails = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-purBill-findBillBackViewFull', ...params});
};

// 48小时退货
const fetchOverTime = (params: Object) => {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-sppur-billReturn-getReturnDirect', ...params});
};

// 获取上次订单数据
const getReplenishForBuyer = (detailUrl: String) => {
    return DLFetch.postFullUrl(detailUrl);
};

export default {
    fetchOrderList,
    fetchOrderDetails,
    fetchConfirmReceiptGoods,
    fetchCancelOrder,
    fetchThumbsUp,
    fetchRemindingShipments,
    fetchBillsCount,
    fetchEvaluateUpdate,
    logistics,
    returnlogistics,
    TransStore,
    sureBtnTrans,
    buyManRevokeBill,
    fetchCreateBillApiManager,
    fetchDelayGetGoods,
    fetchReturnOrderDetails,
    fetchOverTime,
    fetchLookEvaluate,
    getReplenishForBuyer
};

