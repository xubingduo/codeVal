/**
 * Created by tt on 2018/8/14
 * @desc 店铺相关的api管理
 * @flow
 */

import DLFetch from '@ecool/react-native-dlfetch';
import { PAGE_SIZE } from 'config/Constant';
import rootStore from 'store/RootStore';
import {GoodClassResponse} from 'module/index/model/GoodClassModel';

// 请求配置的关注列表
export function fetchFocusOnTypeList(params: Object = { type: '2,4' }) {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spCatConfig-findCatConfig',
        showFlagBit: 2,
        ...params
    });
}

// 获取字典-主营类目列表
export function getConfigListDict(params: Object = { typeId: '2010' }) {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-list-dict',
        jsonParam: {
            flag: 1,
            ...params
        }
    });
}

// 更新买家店铺信息
export function updateShopMessage(params?: Object) {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spBuyerShop-updateBuyerShopMessage',
        ...params
    });
}

// 请求额外数据
export async function fetchBannerLabel() {
    const BannerLabel = {
        banner: {
            imgSrc:
                'https://cdn2.jianshu.io/assets/web/web-note-ad-1-c2e1746859dbf03abe49248893c9bea4.png'
        },
        screening: [
            {
                key: 1,
                title: '四季青'
            },
            {
                key: 2,
                title: '广州'
            },
            {
                key: 3,
                title: '英伦风'
            },
            {
                key: 4,
                title: '嘻哈'
            }
        ]
    };
    return new Promise((resolve: Function) => {
        resolve(BannerLabel);
    });
}

// 请求商品列表数据
export function fetchGoodsList(params: Object) {
    if (
        rootStore.configStore.localBusinessCategary &&
        rootStore.configStore.localBusinessCategary.codeValue
    ) {
        params.searchMasterClassId =
            rootStore.configStore.localBusinessCategary.codeValue;
    }

    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-dresSearch-searchDres',
        pageSize: PAGE_SIZE,
        ...params
    });
}

// 点击商品查看数自增
export function fetchWatchGoods(params: Object) {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spup-upBuyerView-saveBuyerView',
        ...params
    });
}

/**
 * 关注店铺
 * @param {*} params
 */
const focusShop = (params: Object = {}) => {
    return DLFetch.post('spb/api.do', {
        apiKey: 'ec-up-favorShop-addFavorShop',
        ...params
    });
};

/**
 * 取消关注店铺
 * @param {*} params
 */
const unFocusShop = (params: Object = {}) => {
    return DLFetch.post('spb/api.do', {
        apiKey: 'ec-up-favorShop-cancelFavorShop',
        ...params
    });
};

/**
 * 买家已关注店铺列表
 * @param params
 * @returns {Promise}
 */
const userFocusShopList = (params: Object = {}) => {
    return DLFetch.post('spb/api.do', {
        apiKey: 'ec-up-favorShop-listFavorShop',
        ...params
    });
};

const fetchShopIndexProvider = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-dresSearch-searchDres',
        ...params
    });
};

/**
 * @param params
 * @param cid
 * @param tid
 * @return {Promise}
 */
const fetchShopCategoryListProvider = (
    params: Object = {},
    cid: number | string,
    tid: number | string
): Promise<GoodClassResponse> => {
    // return DLFetch.post('/spb/api.do', {
    // apiKey: 'ec-spdresb-dresClassConfig-treeList',
    //     ...params
    // });
    return DLFetch.postWithOutUrlParams(`/spb/api.do?_cid=${cid}&_tid=${tid}`, {
        apiKey: 'ec-spdresb-dresClassConfig-treeList',
        ...params
    });
};

/**
 * 获取店铺详情
 * @param params
 * @returns {Promise}
 */
const fetchShopDetailProvider = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spugr-spShop-getShop',
        ...params
    });
};

/**
 * 买家发送咨询通知
 * @param params
 * @returns {Promise}
 */
const consultToSellerProvider = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spConsult-consultToSeller',
        ...params
    });
};

/**
 * 买家提醒卖家上架商品
 * @param params
 * @returns {Promise}
 */
const remindSellerProvider = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spdresb-dresSpu-remindSellerAddSpus',
        ...params
    });
};

/**
 * 搜索店铺
 * @param params
 * @returns {Promise}
 */
const shopSearchProvider = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spugr-spShop-findBySearchToken',
        ...params
    });
};

/**
 * 邀请商陆花卖家开通店铺应用内消息
 * @param {*} params
 */
const inviteShop = (url: string) => {
    return DLFetch.postFullUrl(url);
};

// 搜索方式邀请商陆花卖家开通店铺短信
const inviteShopOpen = (params: Object) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-slhShop-inviteSlhShop',
        id: params
    });
};

// 扫码方式邀请商陆花卖家开通店铺短信
const inviteShopScanOpen = (params: Object) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-slhShop-inviteSlhShop',
        ...params
    });
};

// 获取店铺的电话
const getShopPhone = (params: Object) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-spShopCustomInfo-getShopCustomInfoById',
        jsonParam: {
            ...params
        }
    });
};

// 绑定虚拟号码接口
const bindDummyPhone = (params: Object) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-privnum-bind',
        jsonParam: {
            ...params
        }
    });
};

// 解绑虚拟号码接口
const unBindDummyPhone = (params: Object) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-privnum-unbind',
        jsonParam: {
            ...params
        }
    });
};

// 获取买家城市及推荐城市
const fetchRecommendCity = () => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-shopSearch-getRecommendCity'
    });
};

const getRecentShopList = (params: { pageNo?: number, pageSize?: number }) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-sppur-purBill-getRecentShopList',
        ...params
    });
};

// 获取商品分享二维码数据
const fetchRqCode = (
    cid: string,
    tid: string,
    spuId: string,
    extProps: Object = { shareType: 1 },
    goodsObj: Object = {}
) => {
    let url = DLFetch.getBaseUrl() + '/spb/api.do?';
    if (cid && tid && spuId) {
        url =
            url +
            'page=goods' +
            '&_cid=' +
            cid +
            '&_tid=' +
            tid +
            '&apiKey=ec-spchb-dresShopShare-getShareQrCodeBase64ForMiniProgram' +
            '&spuId=' +
            spuId +
            '&extProps=' +
            JSON.stringify(extProps);
    }
    return DLFetch.postWithOutUrlParams(url, goodsObj);
};

// 获取门店分享
const fetchShareStore = (params: Object) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spchb-dresShopShare-getShopShareSMS',
        ...params
    });
};

// 上传参数配置 商品分享
const fetchPostConfigParams = (params: Object) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-config-param-saveOwnerVal',
        ...params
    });
};

// 批量获取配置中的参数
const fetchConfigParams = (params: Object) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-config-param-findProductParams',
        ...params
    });
};

/**
 * 获取买手评价列表
 * @param params.jsonParam.type 评价类型(1-店铺，2-商品)
 * @param params.jsonParam.bizId 评价对象id(type=1,店铺id;type=2,商品id)
 * @param params.jsonParam.auditFlag 审核状态
 * @param params.jsonParam.showFlag 显示状态 0 1
 */
const fetchBuyerCommentList = (params: Object) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spadmin-spPlatBuyerEvaluate-findBuyerEvaluateDetails',
        ...params
    });
};
// 获取门店分享二维码图片
const fetchShopShareQrCode = (params: Object, extProps: Object = {}) => {
    let url = DLFetch.getBaseUrl() + '/spb/api.do?';
    if (params && params.cid && params.tid) {
        url =
            url +
            '_cid=' +
            params.cid +
            '&_tid=' +
            params.tid +
            '&apiKey=ec-spchb-dresShopShare-getShareQrCodeBase64ForMiniProgram' +
            '&page=shop' +
            '&extProps=' +
            JSON.stringify(extProps);
    }
    return DLFetch.postWithOutUrlParams(url, {});
};

/**
 * 获取市场id
 * @param params
 */
const fetchShopMarketId = (params: Object)=>{
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-sppur-combine-getSearchInfoByComb',
        ...params
    });
};

export default {
    focusShop,
    unFocusShop,
    userFocusShopList,
    fetchShopIndexProvider,
    fetchShopCategoryListProvider,
    fetchShopDetailProvider,
    consultToSellerProvider,
    remindSellerProvider,
    shopSearchProvider,
    inviteShop,
    getShopPhone,
    bindDummyPhone,
    unBindDummyPhone,
    fetchRecommendCity,
    getRecentShopList,
    fetchRqCode,
    inviteShopOpen,
    inviteShopScanOpen,
    fetchShareStore,
    fetchPostConfigParams,
    fetchConfigParams,
    fetchBuyerCommentList,
    fetchShopShareQrCode,
    fetchShopMarketId
};
