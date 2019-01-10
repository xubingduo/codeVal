/**
 * @author [lyq]
 * @email
 * @create date 2018-08-17 03:18:57
 * @modify date 2018-08-17 03:18:57
 * @desc [首页今日爆款页面]
 * @flow
 */

import {observable, action, computed, runInAction, toJS} from 'mobx';
import IndexApiManager from 'apiManager/IndexApiManager';
import shop from 'gsresource/string/language/index/shop';
import ShopSvc from 'svc/ShopSvc';
import {
    toggleFavorCallBack,
    watchCallBack
} from '../../newest/util/NewestUtil';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';

const PAGE_SIZE = 20;

export default class HotStyleStore {
    @observable
    hotStyles: Array<Object> = [];

    @observable
    noMore: boolean = false;

    @observable
    pageNo: number = 1;

    @action
    fetchTodayHotList = async (text: string) => {
        this.pageNo = 1;
        let params = {
            pageNo: this.pageNo,
            pageSize: PAGE_SIZE,
            jsonParam: {
                queryType: 7, //包邮专区
                searchToken: text
            }
        };
        try {
            let {data} = await IndexApiManager.fetchTodayHotList(params);
            runInAction(() => {
                if (data && data.dresStyleResultList) {
                    this.hotStyles = data.dresStyleResultList;
                    this.noMore = data.dresStyleResultList.length === 0;
                }
                this.pageNo += 1;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };

    @action
    fetchMoreTodayHotList = async (text: string) => {
        let params = {
            pageNo: this.pageNo,
            pageSize: PAGE_SIZE,
            jsonParam: {
                queryType: 7, //包邮专区
                searchToken: text
            }
        };
        try {
            let {data} = await IndexApiManager.fetchTodayHotList(params);
            runInAction(() => {
                if (data && data.dresStyleResultList) {
                    var rows = data.dresStyleResultList;
                    if (rows) {
                        this.hotStyles.push(...rows);
                        this.noMore = rows.length === 0;
                    }
                    this.pageNo += 1;
                }
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 设置点赞数
     */
    @action
    setStarCount = (code: boolean, goodsid: number) => {
        let temp = [];
        this.hotStyles.forEach(element => {
            if (element.id === goodsid) {
                element.praiseNum = (element.praiseNum || 0) + 1;
                element.praiseFlag = 1;
            }
            temp.push(element);
        });
        this.hotStyles = temp;
    };

    /**
     * 设置关注或否
     */
    @action
    setFocusOrNot = (shopId: number, favorFlag: number) => {
        console.log(favorFlag);
        // let temp = [];
        // let favorFlag: number = 0;
        // this.hotStyles.forEach(element => {
        //     if (element.tenantId === shopId) {
        //         element.favorFlag = favorFlag === 1 ? 0 : 1;
        //     }
        //     // temp.push(element);
        // });
        // this.hotStyles = temp;
        // sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
        //     favorFlag: favorFlag,
        //     tenantId: shopId
        // });
        let newHotStyles = toJS(this.hotStyles);
        newHotStyles.forEach(element => {
            if (element.tenantId === shopId) {
                element.favorFlag = favorFlag;
            }
        });
        runInAction(() => {
            this.hotStyles = newHotStyles;
        });
    };

    @action
    deleteHotStyle = (styleId: number) => {
        let temp = this.hotStyles.filter(element => {
            return element.id != styleId;
        });
        this.hotStyles = temp;
    };

    @action
    watchCallBack(goodsId: number, viewNum: number) {
        let temp = [];
        this.hotStyles.forEach(element => {
            if (element['id'] === goodsId) {
                element['viewNum'] = viewNum;
            }
            temp.push(element);
        });
        this.hotStyles = temp;
    }

    @action
    toggleFavorClick(
        goodsId: number,
        spuFavorNum: number,
        spuFavorFlag: number
    ) {
        let temp = [];
        this.hotStyles.forEach(element => {
            if (element['id'] === goodsId) {
                element['spuFavorNum'] = spuFavorNum;
                element['spuFavorFlag'] = spuFavorFlag;
            }
            temp.push(element);
        });
        this.hotStyles = temp;
    }
}
