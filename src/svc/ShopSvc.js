/**
 *@author xbu
 *@date 2018/08/28
 *@flow
 *@desc   关注取消关注
 *
 */

import ShopApiManager from 'apiManager/ShopApiManager';
import IndexApiManager from 'apiManager/IndexApiManager';
import {DeviceEventEmitter} from 'react-native';
import {action} from 'mobx';
import UserActionSvc from 'svc/UserActionSvc';
import NavigationSvc from 'svc/NavigationSvc';
import Alert from 'component/Alert';
import {parseUrl} from 'utl/ParseUrl';
import {Toast} from '@ecool/react-native-ui';

const SHOPSVC_SHOP_FOLLOW_STATUS_CHANGE_EVENT =
    'SHOPSVC_SHOP_FOLLOW_STATUS_CHANGE_EVENT';

//关注
async function fetchFollow(id: string, names: string) {
    try {
        let data = await ShopApiManager.focusShop({
            jsonParam: {
                shopId: id,
                shopName: names
            }
        });
        return Promise.resolve(data);
    } catch (e) {
        return Promise.reject(e);
    }
}

//取消关注
async function fetchUnFollow(id: string) {
    try {
        let data = await ShopApiManager.unFocusShop({
            jsonParam: {
                shopId: id
            }
        });
        return Promise.resolve(data);
    } catch (e) {
        return Promise.reject(e);
    }
}

//传入对象{ shopId: String, shopName: String , flag: number} 店铺id 店铺名称 状态 和回调
function follow(
    obj: Object,
    callbackSuccess: Function,
    callbackCancel: Function
) {
    if (obj.flag === 0) {
        fetchFollow(obj.shopId, obj.shopName).then(data => {
            console.log('传入对象==>', data);
            if (data.code === 0) {
                callbackSuccess(obj.shopId);
            }
        });
    } else {
        fetchUnFollow(obj.shopId).then(data => {
            console.log('传入对象22==>', data);
            if (data.code === 0) {
                callbackCancel(obj.shopId);
            }
        });
    }
}

/**
 * 店铺关注状态变化事件
 * @param shopId    店铺id
 * @param flag      店铺关注状态  0 未关注， 1 已关注
 */
const sendFollowStatusChangeEvent = (shopId: number, flag: number) => {
    DeviceEventEmitter.emit(SHOPSVC_SHOP_FOLLOW_STATUS_CHANGE_EVENT, {
        shopId,
        flag
    });
};

/**
 * 联系咨询卖家
 * @param mobile            买家手机号
 * @param sellerId          卖家id
 * @param sellerUnitId      卖家unitId
 * @param userName          买家userName
 * @param callback
 */
const consultToSeller = (
    mobile: string,
    sellerId: number,
    sellerUnitId: number,
    nickName: string,
    callback: Function
) => {
    UserActionSvc.track('OTHER_SERVICE');
    if (!mobile) {
        callback(false, '买家用户手机号不能为空');
        return;
    }
    ShopApiManager.consultToSellerProvider({
        jsonParam: {
            mobile: mobile,
            sellerId: sellerId,
            sellerUnitId: sellerUnitId,
            buyerName: nickName ? nickName : ''
        }
    }).then(
        action(({data}) => {
            callback(true, '');
        }),
        error => {
            callback(false, error.message);
        }
    );
};

/**
 * 检查slh店铺是否开通好店
 */
const processScanCode = async (data: Object, callback: Function) => {

    let parseUrlResult = parseUrl(data);
    let shopId = '';
    if (parseUrlResult.hasOwnProperty('spTenantId')) {
        shopId = parseUrlResult.spTenantId;
    }

    setTimeout(async () => {
        if (shopId !== '') {
            //已开通好店
            NavigationSvc.navigate('ShopIndexScreen', {
                tenantId: shopId
            });
        } else if (parseUrlResult.hasOwnProperty('shopid')) {
            //小票信息显示未开通好店
            requestShopData(parseUrlResult);
        } else {
            Toast.show('请扫描最新的商陆花二维码', 3);
        }
    }, 1000);
    callback(true);
};


const requestShopData = async (shopInfo: Object) => {
    try {
        Toast.loading();
        let {data} = await IndexApiManager.checkSLHShopIsOpen({
            jsonParam: {
                epid: shopInfo.epid,
                shopId: shopInfo.shopid,
                clientid: shopInfo.clientid,
                sn: shopInfo.sn
            }
        });
        Toast.dismiss();
        if (data.isOpen === 0) {
            //未开通
            NavigationSvc.navigate('InviteOpenShopScreen', {
                slhShopInfo: Object.assign(data,shopInfo)
            });
        } else {
            //已经开通好店，跳转到店铺首页
            NavigationSvc.navigate('ShopIndexScreen', {
                tenantId: data.spTenantId
            });
        }
    } catch (error) {
        Toast.dismiss();
        Alert.alert(error.message);
    }
};

export default {
    SHOPSVC_SHOP_FOLLOW_STATUS_CHANGE_EVENT,
    fetchUnFollow,
    fetchFollow,
    follow,
    sendFollowStatusChangeEvent,
    consultToSeller,
    processScanCode,
    requestShopData
};
