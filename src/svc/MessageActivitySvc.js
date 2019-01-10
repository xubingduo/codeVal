/**
 * @author [lyq]
 * @email
 * @create date 2018-11-30 14:12:56
 * @modify date 2018-11-30 14:12:56
 * @desc [平台消息内链跳转] 现在统一使用BannerActivitySvc中的跳转协议进行页面跳转！
 * @flow
 */
import NavigationSvc from 'svc/NavigationSvc';

const MessageLocalActivityType = {
    // 店铺详情
    '1': 'CouponDetails', //优惠券详情
    '2': '', //通知
    '3': '' //活动
};

export class BannerActivityItem {
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
 * @param activityType MessageLocalActivityType
 * @param params Object
 */
const actLocal = (activityType: string, params?: Object) => {
    if (!MessageLocalActivityType[activityType]) {
        global.dlconsole.log('error:未发现activityType:' + activityType);
        return;
    }
    NavigationSvc.navigate(MessageLocalActivityType[activityType], {
        ...params
    });
};

/**
 * 打开网页链接
 * @param url string
 * @param params Object
 */
const actRemote = (url: string, params?: Object) => {
    NavigationSvc.navigate('ActivityNotifyScreen', {
        ...params,
        url: url
    });
};

export default {
    actLocal,
    actRemote
};
