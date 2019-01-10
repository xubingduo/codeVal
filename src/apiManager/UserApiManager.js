/**
 * author: wwj
 * Date: 2018/8/15
 * Time: 下午5:10
 * des:
 * @flow
 */
import DLFetch from '@ecool/react-native-dlfetch';

/**
 * 获取用户信息
 * @param params
 * @returns {Promise}
 */
const fetchUserInfoProvider = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-spUserManage-getUser',
        ...params
    });
};

/**
 * 修改用户信息
 * @param params
 * @returns {Promise}
 */
const updateUserInfoProvider = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-spUserManage-updateUser',
        ...params
    });
};

/**
 * 修改用户手机号
 * @param params
 * @returns {Promise}
 */
const changeMobileProvider = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-spUserManage-changeMobile',
        ...params
    });
};

/**
 * 关于我们
 * @param params
 * @returns {Promise}
 */
const fetchAboutUsProvider = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-spParam-getEcoolInfo',
        ...params
    });
};

/**
 * 卖家勋章列表(勋章介绍)
 * @param params
 * @returns {Promise}
 */
const fetchMedalListProvider = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spMedal-findMedal',
        ...params
    });
};

/**
 * 卖家门店勋章列表
 * @param params
 * @returns {Promise}
 */
const fetchShopMedalList = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-spShop-getMedal',
        ...params
    });
};

/**
 * 我的 统计数据
 * @param params
 * @returns {Promise}
 */
const fetchMyStatisticsProvider = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-sppur-spPurStat-getMineStatDTO',
        ...params
    });
};

/**
 * 获取用户的收货地址
 * @returns {Promise}
 */
const fetchAddrListProvider = () => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserManage-getUserRecInfoList',
        type: 1
    });
};

/**
 * 批量删除用户地址
 * @param params
 * @returns {Promise}
 */
const batchDeleteAddr = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserManage-deleteUserRecInfoInBatch',
        ...params
    });
};

/**
 * 设置默认地址
 * @param params
 * @returns {Promise}
 */
const setDefaultRecAddr = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserManage-setDefaultUserRecInfo',
        ...params
    });
};

/**
 * 获取服务端分配的IM群组id
 *
 * @param {*} params
 */
const fetchSellerIMTeamId = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spcsb-nimCustSvcComb-startConv',
        ...params
    });
};

/**
 * 获取IM登录信息
 * @param params
 * @returns {Promise}
 */
const fetchIMLoginInfo = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-cust-spNimAccount-getNimLoginInfo',
        ...params
    });
};

/**
 * 重新开始IM聊天
 * @param cid
 * @param tid
 * @param params
 * @returns {Promise}
 */
const reStartIMConv = (cid: string, tid: string, params: Object = {}) => {
    return DLFetch.postWithOutUrlParams(`/spb/api.do?_cid=${cid}&_tid=${tid}`, {
        apiKey: 'ec-spcsb-nimCustSvcComb-reStartConv',
        ...params
    });
};

const fetchFavorGoods = (params: Object) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-dresSearch-searchMyFavorDres',
        ...params
    });
};

/**
 * 保存用户倾向
 * @param {*} params
 */
const saveUserTendency = (params: Object) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-up-userTendency-saveFull',
        ...params
    });
};

export default {
    fetchUserInfoProvider,
    updateUserInfoProvider,
    changeMobileProvider,
    fetchAboutUsProvider,
    fetchMedalListProvider,
    fetchMyStatisticsProvider,
    fetchAddrListProvider,
    batchDeleteAddr,
    setDefaultRecAddr,
    fetchSellerIMTeamId,
    fetchShopMedalList,
    fetchIMLoginInfo,
    reStartIMConv,
    fetchFavorGoods,
    saveUserTendency
};
