/**
 * Created by tt on 2018/8/14
 * @desc 下单相关的api管理
 * @flow
 */

import DLFetch from '@ecool/react-native-dlfetch';

/**
 * 获取默认收货地址
 * @param {*} params
 */
const requestDefaultRecAddressProvider = (params: Object = {}) => {
    return DLFetch.post('spb/api.do', {apiKey: 'ec-spmdm-spUserManage-getUserDefaultRecInfo', ...params});
};

/**
 * 下单
 * @param {*} params
 */
const orderingProvider = (params: Object = {}) => {
    return DLFetch.post('spb/api.do', {apiKey: 'ec-sppur-purBill-createFull', ...params});
};

/**
 * 获取运费
 * @returns {Promise}
 */
const requestFreightProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spdresb-freightManage-evalShipFee', ...params}
    );
};

/**
 * 获取支付数据
 * @returns {Promise}
 */
const createPayProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-sppur-payBill-createPay', ...params}
    );
};

/**
 * 批量查询卖家sku的实时信息
 * @returns {Promise}
 */
const getSkusInfoInBatch = (cid: number, tid: number, params: Object = {}) => {
    return DLFetch.postWithOutUrlParams(
        `/spb/api.do?_cid=${cid}&_tid=${tid}`,
        {apiKey: 'ec-spdresb-dresSpu-getSkusInfoInBatch', ...params}
    );
};

/**
 * 订单支付状态查询
 * @param params
 * @returns {Promise}
 */
const getBillPayStatus = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-sppur-purBill-getPayStatus', ...params}
    );
};

export default {
    requestDefaultRecAddressProvider,
    orderingProvider,
    requestFreightProvider,
    createPayProvider,
    getSkusInfoInBatch,
    getBillPayStatus,
};