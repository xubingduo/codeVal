/**
 *@author xbu
 *@date 2018/08/28
 *@flow
 *@desc   关注取消关注
 */

import {DeviceEventEmitter} from 'react-native';
import DLFetch from '@ecool/react-native-dlfetch';

export const GOODS_ITEM_CHANGE = 'GOODS_ITEM_CHANGE';// goods相关事件
export const GOODS_ITEM_DELETE = 'GOODS_ITEM_DELETE';// 删除
export const TOGGLE_SHOP_FOCUS_ON_SHOP = 'TOGGLE_SHOP_FOCUS_ON_SHOP';// 关注
export const CHANGE_GOODS_WATCH_NUMBER = 'CHANGE_GOODS_WATCH_NUMBER';// 查看数
export const CHANGE_GOODS_STAR_NUMBER_STATE = 'CHANGE_GOODS_STAR_NUMBER_STATE';// 点赞数&&状态
export const CHANGE_GOODS_FAVOR_NUMBER_STATE = 'CHANGE_GOODS_FAVOR_NUMBER_STATE';// 收藏数&&状态
import rootStore from 'store/RootStore';

const sendGoodsItemChangeEvent = (key: string, msg: Object) => {
    DeviceEventEmitter.emit(GOODS_ITEM_CHANGE, {key: key, data: msg});
};

export const genGoodsDetailUrl = (cid: string, tid: string, spuId: string) => {
    let url = DLFetch.getBaseUrl() + '/spb/api.do?';
    if (cid && tid && spuId) {
        if (rootStore.userStore.user && rootStore.userStore.user.tenantId) {
            url = url + '_cid=' + cid + '&_tid=' + tid + '&apiKey=ec-spdresb-dresSpu-getFullForBuyer' +
                '&spuId=' + spuId + '&buyerId=' + rootStore.userStore.user.tenantId;
        }
    }

    return url;
};

export const GoodCategaryType = {
    men_cloth: '男装',
    women_cloth: '女装',
    child_cloth: '童装',
    child_shoe: '童鞋',
};

export default sendGoodsItemChangeEvent;

