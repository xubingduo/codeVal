/**
 * author: wwj
 * Date: 2018/8/21
 * Time: 下午1:42
 * des:
 * @flow
 */

import {observable, action, computed} from 'mobx';
import ShopApiManager from '../../../apiManager/ShopApiManager';


export default class FocusShopStore {
    @observable shopList: Array<Object> = [];

    @computed
    get shopListShow(): Array<Object> {
        return this.shopList.slice();
    }

    /**
     * 获取已关注店铺列表
     * @param refresh
     * @param callback
     */
    queryFocusShopList(refresh: boolean, params: Object, callback: Function){
        ShopApiManager.userFocusShopList(params)
            .then(action(({data}) => {
                let {rows} = data;
                if (rows) {
                    if (refresh) {
                        this.shopList = this.addFavorFlag(rows);
                    } else {
                        let newRows = this.addFavorFlag(rows);
                        this.shopList.push(...newRows);
                    }
                    callback(true, rows.length);
                } else {
                    callback(true, 0);
                }
            }), (error) => {
                callback(false, error.message);
            });
    }

    /**
     * 添加 关注字段
     */
    addFavorFlag(originalList: Array<Object>) {
        originalList.forEach((item) => {
            Object.assign(item, {favorFlag: 1});
        });
        return originalList;
    }

    /**
     * 关注店铺
     * @param id
     * @param name
     * @param callback
     */
    focusShop(shopId: number, shopName: string, callback: Function) {
        ShopApiManager.focusShop({
            jsonParam:{
                shopId: shopId,
                shopName: shopName,
            }
        }).then(action(({data})=>{
            callback(true, shopId);
        })).catch((error) => {
            callback(false, error.message);
        });
    }

    /**
     * 取消关注店铺
     * @param shopId
     * @param callback
     */
    unFocusShop(shopId: number, callback: Function) {
        ShopApiManager.unFocusShop({
            jsonParam:{
                shopId: shopId,
            }
        }).then(action(({data})=>{
            callback(true, shopId);
        })).catch((error) => {
            callback(false, error.message);
        });
    }

    @action
    updateShopFocusStatus(shopId: number, favorFlag: number) {
        let newList = [];
        this.shopList.forEach((item) => {
            if (item.shopId === shopId) {
                item.favorFlag = favorFlag;
            }
            if(item.favorFlag === 1){
                newList.push(item);
            }
        });
        this.shopList = newList;
    }
}