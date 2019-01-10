/**
 * @author Yunliang Miao
 * @create date 2018-11-16 15:15:00
 * @desc [首页今日上新页面]
 * @flow
 */

import {observable, action, computed, runInAction, toJS, type IObservableArray} from 'mobx';
import IndexApiManager from 'apiManager/IndexApiManager';
import shop from 'gsresource/string/language/index/shop';
import ShopSvc from 'svc/ShopSvc';
import _ from 'lodash';
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
import StringUtl from 'utl/StringUtl';
import { searchAssoWord } from 'apiManager/GoodsApiManager';

const PAGE_SIZE = 20;

export default class NewArrivalStore {
    @observable
    data: Array<Object> = [];

    @computed
    get list(): Array<Object> {
        return this.data.slice();
    }

    @observable
    noMore: boolean = false;

    @observable
    pageNo: number = 1;

    @action
    fetchTodayNewArrvialList = async (text?: string) => {
        this.pageNo = 1;
        let params = {
            pageNo: this.pageNo,
            pageSize: PAGE_SIZE,
            jsonParam: {
                queryType: 6, // 上新
                searchToken: text
            }
        };
        try {
            let {data} = await IndexApiManager.fetchTodayHotList(params);
            runInAction(() => {
                if (data && data.dresStyleResultList) {
                    this.data = data.dresStyleResultList;
                    this.noMore = data.dresStyleResultList.length < PAGE_SIZE;
                }
                this.pageNo += 1;
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };

    @action
    fetchMoreTodayNewArrivalList = async () => {
        let params = {
            pageNo: this.pageNo,
            pageSize: PAGE_SIZE,
            jsonParam: {
                queryType: 6 // 上新
            }
        };
        try {
            let {data} = await IndexApiManager.fetchTodayHotList(params);
            runInAction(() => {
                if (data && data.dresStyleResultList) {
                    var rows = data.dresStyleResultList;
                    if (rows) {
                        this.data.push(...rows);
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
        this.data.forEach(element => {
            if (element.id === goodsid) {
                element.praiseNum = (element.praiseNum || 0) + 1;
                element.praiseFlag = 1;
            }
            temp.push(element);
        });
        this.data = temp;
    };

    /**
     * 设置关注或否
     */
    @action
    setFocusOrNot = (shopId: number, favorFlag: number) => {
        this.data.forEach(item => {
            if (item.tenantId === shopId) {
                item.favorFlag = favorFlag;
            }
        });
    };

    @action
    deleteGoodsItem = (styleId: number) => {
        this.data = this.data.filter(element => {
            return element.id != styleId;
        });
    };

    @action
    watchCallBack(goodsId: number, viewNum: number) {
        let temp = [];
        this.data.forEach(element => {
            if (element['id'] === goodsId) {
                element['viewNum'] = viewNum;
            }
            temp.push(element);
        });
        this.data = temp;
    }

    @action
    toggleFavorClick(
        goodsId: number,
        spuFavorNum: number,
        spuFavorFlag: number
    ) {
        let temp = [];
        this.data.forEach(element => {
            if (element['id'] === goodsId) {
                element['spuFavorNum'] = spuFavorNum;
                element['spuFavorFlag'] = spuFavorFlag;
            }
            temp.push(element);
        });
        this.data = temp;
    }

    @observable
    recommendList: IObservableArray<{ text: string }> = observable([]);

    @computed
    get _recommendList(): Array<{ text: string }> {
        return this.recommendList.slice(0, 10);
    }

    @computed
    get shouldListShow(): boolean {
        return this._recommendList.length > 0;
    }

    @action
    clearRecommendList = (): void => {
        this.recommendList.clear();
    };

    updateRecommendList = _.debounce(action(({keyword}: {keyword: string}) => {
        const _keyword = StringUtl.filterChineseSpace(keyword).trim();
        if (keyword === '') return this.clearRecommendList();
        const params = {searchToken: keyword, isNewToday: 1};
        searchAssoWord(params)
            .then(action(response => {
                if (response.code === 0) {
                    const {rows} = response.data;
                    this.recommendList = rows.map(item => ({text: item}));
                } else {
                    this.clearRecommendList();
                }
            }))
            .catch(this.clearRecommendList);
    }));
}
