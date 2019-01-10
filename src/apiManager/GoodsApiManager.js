/*
* @Author: wengdongyang
* @Date:   2018-08-15 11:22:26
 * @Last Modified by: Miao Yunliang
 * @Last Modified time: 2018-11-12 10:36:09
* @Des 上新相关接口
* @flow
*/
import DLFetch from '@ecool/react-native-dlfetch';

export function fetchGoodsDetail(detailUrl: string) {
    return DLFetch.postFullUrl(detailUrl);
}

// 点赞商品接口
export function fetchGoodsStar(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spup-upBuyerPraise-saveBuyerPraise', ...params});
}

// 商品收藏接口
export function fetchGoodsAddFavor(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-up-favorSpu-addFavorSpu', ...params});
}

// 商品取消收藏接口
export function fetchGoodscCancelFavor(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-up-favorSpu-cancelFavorSpu', ...params});
}

// 批量取消收藏
export function fetchGoodscCancelFavors(params: Object) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-up-favorSpu-cancelFavorSpus', ...params});
}

/**
 * 全局商品搜索
 * @param params
 */
export function fetchAllGoodsProvider(params: Object = {}) {
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spchb-dresSearch-searchDres', ...params});
}

/**
 * 商品门店聚合搜索
 * @param params
 */
export function searchDresAndShopProvider(params: Object = {}){
    return DLFetch.post('/spb/api.do', {apiKey: 'ec-spchb-dresShopSearch-searchDresAndShop', ...params});
}
/**
 * 获取字典 商品风格
 * @param params
 */
export function getGoodsStyleDict(params: Object = {typeId: '2016'}) {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-list-dict',
        jsonParam: {
            flag: 1,
            ...params
        }
    });
}

/**
 * 查询搜索关联词列表
 * @param params
 * @return {Promise}
 */
export function searchAssoWord(params: {searchToken: string, tenantId?: string, isNewToday?: number}) {
    return DLFetch.post(
        '/spb/api.do',
        {
            apiKey: 'ec-spchb-dresShopSearch-searchAssoWord',
            pageSize: 10,
            jsonParam: {
                ...params
            }
        }   
    );
}

/**
 * 我的分享
 */
export function fetchSharedGoods(params: Object) {
    return DLFetch.post(
        '/spb/api.do',
        {
            apiKey: 'ec-up-shareSpu-findByParams',
            ...params
        }
    );
}

/**
 * 分享反馈
 */
export function fetchSharedFeedBack(params: Object) {
    return DLFetch.post(
        '/spb/api.do',
        {
            apiKey: 'ec-spup-upBuyerFeedback-createFull',
            jsonParam: {
                ...params
            }
        }
    );
}