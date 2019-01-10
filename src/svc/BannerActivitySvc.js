/**
 * @author sml2
 * @date 2018/11/02
 * @desc Banner活动
 * @flow
 */
import NavigationSvc from 'svc/NavigationSvc';
import {genGoodsDetailUrl} from './GoodsSvc';

const BannerLocalActivityType = {
    // 店铺详情
    '3':'ShopIndexScreen',
    '1':'SearchShopListScreen',
    '2':'SearchGoodsListScreen',
    '4':'GoodDetailScreen',
    '5':'CouponDetails',
    '6':'MyCoupon',
    '7':'MedalScreen',
    '8':'OrderDetailsScreen',
    '9':'OrderListScreen',
    '10':'HotStyleScreen',
};

export class BannerActivityItem{
    // 1外部链接 2本地页面
    linkType: number = 1;
    id: number = 0;
    itemId: string = '';
    itemUrl: string = '';
    jumpLink: string = '';
    // 从jumpLink中解析出得
    contentType: number = 0;
    url: string = '';
    param: Object = {};
}

/**
 * 打开app本地页面
 * @param activityType BannerActivityType的key
 * @param params Object
 */
const actLocal = (activityType: string,params?: Object)=>{
    if(!BannerLocalActivityType[activityType]){
        global.dlconsole.log('error:未发现activityType:' + activityType);
        return;
    }
    // 跳转到商品详情，需要自己拼接所需的url
    if (activityType === '4' && params
        && params.hasOwnProperty('goodId') && params.hasOwnProperty('cid')
        && params.hasOwnProperty('tid')) {
        let url = genGoodsDetailUrl(params.cid, params.tid, params.goodId);
        Object.assign(params, {url: url});
    }
    NavigationSvc.push(BannerLocalActivityType[activityType], {...params});
};

/**
 * 打开网页链接
 * @param url string
 * @param params Object
 */
const actRemote = (url: string,params?: Object)=>{
    NavigationSvc.push('ActivityNotifyScreen',{
        ...params,
        url:url,
    });
};

export default {
    actLocal,
    actRemote
};
