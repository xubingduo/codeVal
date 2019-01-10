/**
 * @author [lyq]
 * @email
 * @create date 2018-08-17 05:11:36
 * @modify date 2018-08-17 05:11:36
 * @desc [首页今日门店页面store]
 * @flow
 */

import { observable, action, runInAction, toJS } from 'mobx';
import IndexApiManager from 'apiManager/IndexApiManager';
import ShopSvc from 'svc/ShopSvc';
import rootStore from 'store/RootStore';
import ShopDetailModel from '../model/ShopDetailModel';

const PAGE_SIZE = 20;

export default class ShopListStore {
    @observable
    shops: Array<ShopDetailModel> = [];

    @observable
    noMore: boolean = false;

    @observable
    pageNo: number = 1;

    @action
    fetchShopsList = async () => {
        this.pageNo = 1;
        let params = {
            pageNo: this.pageNo,
            pageSize: PAGE_SIZE,
            jsonParam: {
                showSpus: 1,
                masterClassId: rootStore.configStore.localBusinessCategary
                    ? rootStore.configStore.localBusinessCategary.codeValue
                    : ''
            }
        };
        try {
            let { data } = await IndexApiManager.fetchTodayNewShopList(params);
            runInAction(() => {
                if (data && data.rows) {
                    this.shops = data.rows;
                    this.noMore = data.rows.length === 0;
                }
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };

    @action
    fetchMoreShopsList = async () => {
        this.pageNo += 1;
        let params = {
            pageNo: this.pageNo,
            pageSize: PAGE_SIZE,
            jsonParam: {
                showSpus: 1
            }
        };
        try {
            let { data } = await IndexApiManager.fetchTodayNewShopList(params);
            runInAction(() => {
                // let rows = data.rows;
                if (data && data.rows) {
                    this.shops.push(...data.rows);
                    this.noMore = data.rows.length === 0;
                }
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };

    @action
    focusShop = async (item: Object) => {
        try {
            await ShopSvc.fetchFollow(item.id, item.name);
        } catch (error) {
            return Promise.reject(error);
        }
    };

    @action
    unFocusShop = async (item: Object) => {
        try {
            await ShopSvc.fetchUnFollow(item.id);
        } catch (error) {
            return Promise.reject(error);
        }
    };

    @action
    updateShopFocusStatus(shopId: number, favorFlag: number) {
        let newList = [];
        this.shops.forEach(item => {
            if (item.id === shopId) {
                item.favorFlag = favorFlag;
                if (favorFlag === 1) {
                    item.concernNum++;
                } else {
                    item.concernNum--;
                }
            }
            newList.push(item);
        });
        this.shops = newList;
    }
}
