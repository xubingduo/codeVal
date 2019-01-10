// @flow
import DLFetch from '@ecool/react-native-dlfetch';
import {NewShopResponse} from 'module/index/model/ShopDetailModel';

/**
 * 检查设备更新
 *
 * @param {*} params
 */
function checkUpdate(params: Object = {}) {
    return DLFetch.post('/spg/checkUpgrade.do', { ...params });
}

/**
 * 获取我的好店列表
 * @param {*} params
 * @flow
 */
const fetchGoodShopList = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-shopSearch-goodShopsForBuyer',
        ...params
    });
};

const fetchBannerList = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spBanner-findBannerByKind',
        ...params
    });
};

const fetchTodayHotList = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-dresSearch-searchDres',
        ...params
    });
};

const fetchTodayNewShopList = (params: Object = {}): Promise<NewShopResponse> => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-shopSearch-findTodayNewShops',
        ...params
    });
};

/**
 * 获取首页统计数据
 * @param {*} params
 */
const fetcHomePageStatisticsData = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-shopSearch-findHomePageStatistics',
        ...params
    });
};

/**
 * 获取店铺认证信息
 * @param {*} params
 */
const fetchShopAuthInfo = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spBuyerShop-getBuyerShopInfo',
        ...params
    });
};

/**
 * 认证店铺
 * @param {*} params
 */
const authShop = (params: Object = {}) => {
    return DLFetch.postWithUrlParams(
        '/spg/api.do',
        {
            apiKey: 'ec-spadmin-spBuyerShop-submitAuditRecord',
            ...params
        },
        { _master: 1 }
    );
};

/**
 * 修改店铺信息
 * @param {*} params
 */
const updateShopInfo = (params: Object = {}) => {
    return DLFetch.postWithUrlParams(
        '/spg/api.do',
        {
            apiKey: 'ec-spadmin-spBuyerShop-updateBuyerShopAuditMessage',
            ...params
        },
        { _master: 1 }
    );
};

/**
 * 获取邀请slh店主的相关参数
 * @param {*} params
 */
const checkSLHShopIsOpen = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-spInvite-getInviteParam',
        ...params
    });
};

/**
 * 获取五个推荐城市
 * @param {*} params
 */

const fetchRecommendCity = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-shopSearch-getRecommendCity',
        ...params
    });
};
export default {
    checkUpdate,
    fetchGoodShopList,
    fetchBannerList,
    fetchTodayHotList,
    fetchTodayNewShopList,
    fetcHomePageStatisticsData,
    authShop,
    updateShopInfo,
    fetchShopAuthInfo,
    checkSLHShopIsOpen,
    fetchRecommendCity
};
