/**
 *@author xbu
 *@date 2018/08/27
 *@flow
 *@desc
 *
 */

import DLFetch from '@ecool/react-native-dlfetch';

/**
 * 获取退款字典
 * @param params
 * @return {Promise}
 */
const fetchConfigListDict = (params: Object) => {
    return DLFetch.post(
        '/spg/api.do',
        {apiKey: 'ec-config-list-dict', ...params}
    );
};

/**
 * 1.3.4开始 只有筛选市场数据使用该接口
 * 商品筛选条件字典
 * @param params 默认为 1，2，3   1-城市；2-风格；3-市场
 * @returns {Promise}
 */
const fetchFilterConditionProvider = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spCatConfig-findCatConfig',
        ...params // 1-城市；2-风格；3-市场
    });
};

/**
 * 获取单个系统参数
 * @param params
 * @return {Promise}
 */
const fetchSysParams = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-param-getParamVal',
        ...params
    });
};

/**
 * 批量获取指定参数
 */
const fetchSysParamsBatch = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-config-param-findProductParams',
        ...params
    });
};

// 获取字典-好店担保
const fetchGoodShopGuaranteeLabels = (params: Object = {typeId: '2017'})=>{
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-list-dict',
        jsonParam: {
            flag: 1,
            ...params
        }
    });
};

// 获取字典-服务保障
const fetchServiceGuaranteeLabels = (params: Object = {typeId: '2018'})=>{
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-list-dict',
        jsonParam: {
            flag: 1,
            ...params
        }
    });
};

// 获取字典
const fetchSearchFeedbackLabels = (params: Object = {typeId: '2021'})=>{
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-list-dict',
        jsonParam: {
            flag: 1,
            ...params
        }
    });
};

// 查询筛选配置数据 1.3.4开始筛选条件统一在此接口返回
const fetchFilterConfigDataProvider = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spFilterConfig-getFilterConfigData',
        jsonParam: {
            ...params
        }
    });
};

// 获取退款金额
const fetchReturnGoodsPrice = (params: Object) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-sppur-purBill-findBillBackViewFull',
        ...params
    });
};

export default {
    fetchConfigListDict,
    fetchFilterConditionProvider,
    fetchSysParams,
    fetchSysParamsBatch,
    fetchGoodShopGuaranteeLabels,
    fetchServiceGuaranteeLabels,
    fetchSearchFeedbackLabels,
    fetchFilterConfigDataProvider,
    fetchReturnGoodsPrice
};