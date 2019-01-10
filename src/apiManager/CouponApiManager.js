/**
 *@author xbu
 *@date 2018/10/17
 *@flow
 *@desc  所有优惠券接口
 *
 */

import DLFetch from '@ecool/react-native-dlfetch';

// 领券中心卡券列表
export function fetchCouponCenterList(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-mycoupons-findCenterCoupons', ...params});
}
// 我的优惠券统计
export function fetchMyCouponListCount(params: Object = {}) {
    return DLFetch.post('/spb/api.do',{apiKey: 'ec-spcoupb-mycoupons-getCountCoupons', ...params});
}

// 我的优惠券
export function fetchMyCouponList(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-mycoupons-findCoupons', ...params});
}

// 领取优惠券
export function fetchCoupon(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-mycoupons-revice', ...params});
}

// 查看优惠券详情
export function fetchLookCouponDetails(params: Object) {
    return DLFetch.post('/spg/api.do', {apiKey: 'ec-spcoupg-scCardCouponsMerge-getCouponById', ...params});
}

// 商家可领取优惠券列表
export function fetchSellerCouponList(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-cardCoupons-list', ...params});
}

// 获取卖家可用优惠券
export function fetchShopCoupons(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-spMineCoupons-checkMineSellerCouponsAvailable', ...params});
}

// 分享优惠券
export function fetchShareCoupon(params: Object) {
    return DLFetch.post('/spb/api.do',{apiKey: 'ec-spcoupb-coupons-shareCoupon', ...params});
}

// 获取平台可用优惠券
export function fetchPlatCoupons(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-spMineCoupons-checkMinePlatCouponsAvailable', ...params});
}

//获取卖家可领用优惠券
export function fetchSellerCanGetCoupons(params: Object) {
    return DLFetch.post('/spg/api.do', {apiKey: 'ec-spcoupg-scCardCouponsMerge-getShopValidCouponNum', ...params});
}

// 查询门店优惠券
export function fetchSorerCoupons(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-spCardCouponsComb-findRecvableCoupons', ...params});
}

// 获取优惠券类型
export function fetchGetCouponType(params: Object = {}) {
    return DLFetch.post('/spg/api.do', {apiKey: 'ec-cardCoupons-dcodes', ...params});
}

//查询当前买家在卖家的可用优惠券数量
export function fetchShopAvailableCouponsCount(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-mycoupons-getCouponsCountByShop', ...params});
}

//卖家可领取优惠券列表
export function fetchShopCanGetCouponsList(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-spCardCouponsComb-findRecvableCoupons', ...params});
}

//获取订单可用券数量
function fetchOrderAvailableCouponsList(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-spCardCouponsComb-findRecvableCoupons', ...params});
}

//获取订单可用券数量
function checkOrderAvailableCouponsCount(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spcoupb-spMineCoupons-checkMineCouponsAvailableStats', ...params});
}


export default {
    fetchCouponCenterList,
    fetchMyCouponListCount,
    fetchMyCouponList,
    fetchCoupon,
    fetchLookCouponDetails,
    fetchSellerCouponList,
    fetchShareCoupon,
    fetchShopCoupons,
    fetchPlatCoupons,
    fetchSellerCanGetCoupons,
    fetchSorerCoupons,
    fetchGetCouponType,
    fetchShopAvailableCouponsCount,
    fetchShopCanGetCouponsList,
    fetchOrderAvailableCouponsList,
    checkOrderAvailableCouponsCount
};