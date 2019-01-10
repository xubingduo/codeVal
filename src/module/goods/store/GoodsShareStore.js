/**
 *@author xbu
 *@date 2018/12/04
 *@desc 商品分享
 *@flow
 */


import {action} from 'mobx';
import ShopApiManager from 'apiManager/ShopApiManager';


export default class GoodsShareStore {

    // 上传分享参数
    @action
    postConfigParams = async ( obj: Object) => {
        try {
            let data = await ShopApiManager.fetchPostConfigParams(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 获取分享参数
    @action
    fetchConfigParams = async (obj: Object) => {
        try {
            let data = await ShopApiManager.fetchConfigParams(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };
}