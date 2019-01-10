/**
 * Created by tt on 2018/8/14
 * @desc 购物车api管理
 * @flow
 */

import DLFetch from '@ecool/react-native-dlfetch';

/**
 * 获取货品购物车
 * @param {*} params
 */
const queryShoppingCartProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spcart-shoppingCart-findCart', ...params}
    );
};

/**
 * 添加购物车
 * @param {*} params
 */
const addGoodsToShoppingCartProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spcart-shoppingCart-addCart', ...params}
    );
};

/**
 * 批量新增购物车
 * @returns {Promise}
 */
const addGoodsBatchToShoppingCartProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spcart-shoppingCart-addCartInBatch', ...params}
    );
};


/**
 * 删除购物车货品
 * @returns {Promise}
 */
const deleteGoodsShoppingCartProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spcart-shoppingCart-deleteCart', ...params}
    );
};

/**
 * 批量删除购物车货品
 * @returns {Promise}
 */
const deleteGoodsBatchToShoppingCartProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spcart-shoppingCart-deleteCartInBatch', ...params}
    );
};

/**
 * 更新购物车货品
 * @returns {Promise}
 */
const updateGoodsToShoppingCartProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spcart-shoppingCart-updateCart', ...params}
    );
};

/**
 * 是否支持合包   (运费合包请求)
 * @returns {Promise}
 */
const supportCombinativesProvider = (params: Object = {}) => {
    return DLFetch.post(
        '/spb/api.do',
        {apiKey: 'ec-spdresb-freightManage-defevalShipFee', ...params}
    );
};


export default {
    queryShoppingCartProvider,
    addGoodsToShoppingCartProvider,
    deleteGoodsShoppingCartProvider,
    addGoodsBatchToShoppingCartProvider,
    deleteGoodsBatchToShoppingCartProvider,
    updateGoodsToShoppingCartProvider,
    supportCombinativesProvider,
};