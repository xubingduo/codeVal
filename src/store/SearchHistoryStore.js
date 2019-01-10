/**
 * author: tuhui
 * Date: 2018/7/23
 * Time: 15:53
 * @flow
 * des:搜索历史
 */

import React from 'react';
import {observable, computed, action, runInAction} from 'mobx';
import storage from '../utl/DLStorage';
import {RootStore} from './RootStore';
import {searchDresAndShopProvider, searchAssoWord} from '../apiManager/GoodsApiManager';
import type {IObservableArray} from 'mobx';
import _ from 'lodash';
import StringUtl from 'utl/StringUtl';


const SEARCH_HISTORY_TAG = 'searchHistoryTag';
export default class SearchHistoryStore {

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @observable currentSearchType: number = 0;
    @observable searchHistoryTagArr: Array<string> = [];
    /**
     * 商品门店联合搜索的结果集
     * @type {Array}
     */
    @observable searchGoodsResult: Array<Object> = [];
    @observable searchShopResult: Array<Object> = [];

    /**
     * 搜索类型tab
     * @returns {string[]}
     */
    @computed
    get typeTabShow(): Array<Object> {
        return [
            {
                key: '1',
                item: {
                    title: '商品'
                }
            },
            {
                key: '2',
                item: {
                    title: '门店'
                }
            }
        ];
    }

    /**
     * 搜索历史tag显示数据
     * @returns {string[]}
     */
    @computed
    get historyTagShow(): Array<string> {
        let data = this.searchHistoryTagArr.slice();
        return data;
    }

    /**
     * 取出搜索历史
     * @returns {Promise<void>}
     */
    @action
    loadSearchHistoryTag = () => {
        storage.load({key: SEARCH_HISTORY_TAG}).then(ret => {
            runInAction(() => {
                if (ret) {
                    this.searchHistoryTagArr = ret;
                }
            });
        }).catch(err => {
            switch (err.name) {
            case 'NotFoundError':
                break;
            case 'ExpiredError':
                break;
            }
        });
    };

    /**
     * 保存搜索历史
     */
    saveSearchHistoryTag = async () => {
        await storage.save({
            key: SEARCH_HISTORY_TAG,
            data: this.searchHistoryTagArr,
        });
    };

    /**
     * 更新界面的 搜索历史
     */
    @action
    saveSearchHistoryMemory(tag: string) {
        let index = this.searchHistoryTagArr.indexOf(tag);
        if (index !== -1) {
            this.searchHistoryTagArr.splice(index, 1);
        }
        this.searchHistoryTagArr.unshift(tag);
    }

    @action
    clearSearchHistory() {
        this.searchHistoryTagArr = [];
        storage.remove({
            key: SEARCH_HISTORY_TAG,
        });
    }

    queryGoodsAndShop(searchKey: string, oldTabIndex: number, callback: Function) {
        searchDresAndShopProvider({
            pageSize: 2,
            pageNo: 1,
            jsonParam: {
                searchToken: searchKey
            }
        }).then(action(({data}) => {
            if (data) {
                if (data.dres && data.dres.dresStyleResultList) {
                    this.searchGoodsResult = data.dres.dresStyleResultList;
                }
                if (data.shop && data.shop.shopList) {
                    this.searchShopResult = data.shop.shopList;
                }
                callback(true, this.changeTabIndex(searchKey, oldTabIndex));
            }
        })).catch((error) => {
            callback(false, error.message);
        });
    }

    changeTabIndex(key: string, oldTabIndex: number): number {
        // 如关键字和门店一对一精确匹配，结果：款号=0-n，门店=1，前端跳转到门店Tab页
        if (this.searchShopResult.length === 1) {
            return 1;
        } else if (this.rootStore.configStore.masterCategaryList && this.matchMasterCategoryKey(key)) {
            return 1;
        } else if (this.searchGoodsResult.length === 0 && this.searchShopResult.length !== 0) {
            // 如果 款号=0，门店=n，前端跳转到门店Tab页
            return 1;
        } else if (this.searchGoodsResult.length !== 0 && this.searchShopResult.length !== 0) {
            // 除去以上情况，如羽绒马甲，结果：款号=n，门店=n，前端跳转到商品Tab页
            return 0;
        } else { // 其他结果返回原本tabindex
            return 0;
        }
    }

    /**
     * 如关键字和主营类目(童装，女装等)一对一精确匹配，结果：款号=n，门店=n，返回true
     * @param key
     * @returns {boolean}
     */
    matchMasterCategoryKey(key: string): boolean {
        let result = false;
        this.rootStore.configStore.masterCategaryList.forEach((item) => {
            if (item.codeName && item.codeName === key && this.searchGoodsResult.length > 0 && this.searchShopResult.length > 0) {
                result = true;
            }
        });
        return result;
    }

    @action
    changeFlag(id: number) {
        let data = [];
        this.searchShopResult.forEach(el => {
            if (el.id === id) {
                if (el.favorFlag === 1) {
                    el['favorFlag'] = 0;
                } else {
                    el['favorFlag'] = 1;
                }
            }
            data.push(el);
        });
        runInAction(() => {
            this.searchShopResult = data;
        });
    }

    /**
     * 获取当店铺唯一的时候显示的店铺
     */
    getSingleShopItem() {
        if (this.searchShopResult && this.searchShopResult.length === 1) {
            return this.searchShopResult[0];
        }else {
            return null;
        }
    }

    /**
     * 更新点赞数
     * @param id
     * @param praiseFlag
     * @param praiseNum
     */
    @action
    updateStarNumByGoodsId(id: number, praiseFlag: number, praiseNum: number) {
        let i = 0;
        let newList = [];
        for (i; i < this.searchGoodsResult.length; i++) {
            if (this.searchGoodsResult[i].id === id) {
                this.searchGoodsResult[i].praiseFlag = praiseFlag;
                this.searchGoodsResult[i].praiseNum = praiseNum;
            }
            newList.push(this.searchGoodsResult[i]);
        }
        this.searchGoodsResult = newList;
    }

    /**
     * 更新阅读数
     * @param id
     */
    @action
    updateViewNumByGoodsId(id: number) {
        this.searchGoodsResult = this.searchGoodsResult.map((item: Object) => {
            if (item.id === id) {
                item.viewNum += 1;
            }
            return item;
        });
    }

    /**
     * 更新收藏数量
     * @param id
     * @param favorNum
     * @param favorFlag
     */
    @action
    updateFavorNumByGoodsId(id: number, favorNum: number, favorFlag: number) {
        let innerList = this.searchGoodsResult.slice();
        innerList.forEach((item) => {
            if (item.id === id) {
                item.spuFavorNum = favorNum;
                item.spuFavorFlag = favorFlag;
            }
        });
        this.searchGoodsResult = innerList;
    }

    /**
     * 更新店铺关注状态
     * @param tenantId
     * @param favorFlag
     */
    @action
    updateFocusStatusByGoodsId(tenantId: number, favorFlag: number) {
        let i = 0;
        let newList = [];
        for (i; i < this.searchGoodsResult.length; i++) {
            if (this.searchGoodsResult[i].tenantId === tenantId) {
                this.searchGoodsResult[i].favorFlag = favorFlag;
            }
            newList.push(this.searchGoodsResult[i]);
        }
        this.searchGoodsResult = newList;
    }

    @action
    clearSearchResult = () => {
        this.searchShopResult = [];
        this.searchGoodsResult = [];
        this.clearRecommendList();
        this.hideRecommendList();
    };

    // 搜索推荐部分

    @observable isRecommendVisiable: boolean = true;

    @action
    showRecommendList() {
        this.isRecommendVisiable = true;
    }

    @action
    hideRecommendList() {
        this.isRecommendVisiable = false;
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

    // @action
    updateRecommendList = _.debounce(action(({keyword, tenantId}: {keyword: string, tenantId?: string}) => {
        const _keyword = StringUtl.filterChineseSpace(keyword).trim();
        if (keyword === '') return this.clearRecommendList();
        const params = {searchToken: keyword, tenantId};
        searchAssoWord(params)
            .then(action(response => {
                if (response.code === 0) {
                    const {rows} = response.data;
                    this.recommendList = rows.map(item => ({text: item}));
                    this.showRecommendList();
                } else {
                    this.clearRecommendList();
                }
            }))
            .catch(this.clearRecommendList);
    }));
}
