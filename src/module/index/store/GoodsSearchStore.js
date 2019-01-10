/**
 * author: tuhui
 * Date: 2018/7/23
 * Time: 13:41
 * @flow
 * des: 货品搜索界面store
 */

import React from 'react';
import {observable, computed, action} from 'mobx';
import * as GoodsApiManager from '../../../apiManager/GoodsApiManager';
import ConfigListDictApiManager from '../../../apiManager/ConfigListDictApiManager';
import {TYPE_PRICE_RANGE} from './GoodsSlideFilterStore';
import * as _ from 'lodash';

export default class GoodsSearchStore {

    @observable listData: Array<Object> = [];

    @observable filterDataSource: Array<Object> = [];
    /**
     * 用户已选中的筛选条件
     */
    @observable seletedFilterCondition: {};

    @action
    setFilterDataSource(source: Array<Object>) {
        this.filterDataSource = source;
    }

    /**
     * 货品搜索结果展示
     * @returns {number[]}
     */
    @computed
    get goodsSearchListShow(): Array<Object> {
        return this.listData.slice();
    }

    searchGoods(fresh: boolean, commonParams: Object, jsonParams: Object, callBack: Function) {
        GoodsApiManager.fetchAllGoodsProvider(Object.assign({
            jsonParam: this.configJsonParams(jsonParams)
        }, commonParams))
            .then(action(({data}) => {
                const {dresStyleResultList} = data;
                if (dresStyleResultList) {
                    let goodsList = dresStyleResultList;
                    if (fresh) {
                        this.listData = goodsList;
                    } else {
                        this.listData.push(...goodsList);
                    }
                    callBack(true, goodsList.length);
                } else {
                    callBack(true, 0);
                }
            }), (error) => {
                callBack(false, error.message);
            });
    }

    @action
    updateSelectedFilter(condition: Object) {
        this.seletedFilterCondition = {};
        let keyWords = {};
        let mutilVeluesKey = {};
        // 支持的key：labels - 门店标签，medalsCode - 勋章code集合
        let mutilVeluesKeyMust = {};
        // 标签
        if (condition.hasOwnProperty('1')) {
            if (condition['1'] && condition['1'].length > 0) {
                Object.assign(mutilVeluesKeyMust, {labels: condition['1']});
            }
        }
        // 勋章
        if (condition.hasOwnProperty('2')) {
            if (condition['2'] && condition['2'].length > 0) {
                Object.assign(mutilVeluesKeyMust, {medalsCode: condition['2']});
            }
        }

        // 城市  如果有城市筛选条件 再加入 cityId参数  以下相同
        if (condition.hasOwnProperty('5')) {
            if (condition['5'] && condition['5'].length > 0) {
                Object.assign(keyWords, {cityId: condition['5']});
            }
        }
        // 市场
        if (condition.hasOwnProperty('6')) {
            if (condition['6'] && condition['6'].length > 0) {
                Object.assign(keyWords, {marketId: condition['6']});
            }
        }
        // 风格
        if (condition.hasOwnProperty('3')) {
            if (condition['3'] && condition['3'].length > 0) {
                Object.assign(mutilVeluesKey, {shopStyles: condition['3']});
            }
        }

        this.seletedFilterCondition = {
            keyWords: keyWords,
            mutilVeluesKey: mutilVeluesKey,
            mutilVeluesKeyMust: mutilVeluesKeyMust
        };

        // 价格区间
        if (condition.hasOwnProperty('7')) {
            if (condition['7'] && condition['7'].length > 0) {
                let rangeStr = condition['7'][0];
                let priceRange = _.split(rangeStr, ',');
                Object.assign(this.seletedFilterCondition, {pubPriceStart: parseInt(priceRange[0])});
                // 根据
                if (priceRange.length > 1 && priceRange[1] !== '-1') {
                    // 还有最大价格
                    Object.assign(this.seletedFilterCondition, {pubPriceEnd: parseInt(priceRange[1])});
                }
            }
        }
    }

    /**
     * 配置筛选条件
     * @param condition
     * @returns {Object & {}}
     */
    configJsonParams(condition: Object): Object {
        return Object.assign(condition, this.seletedFilterCondition);
    }

    /**
     *
     * @param callback
     * @param filterType    筛选对象， 1 推荐下拉， 2 商品搜索， 3 店铺搜索， 4 分类
     * @returns {Promise<void>}
     */
    @action
    async queryFilterConfigData(callback: Function, filterType: number){
        try{
            let {data} = await ConfigListDictApiManager.fetchFilterConfigDataProvider({filterType: filterType});
            if (data.rows && data.rows.length > 0) {
                this.filterDataSource = data.rows;
                callback(true, this.filterDataSource);
            } else {
                callback(false, '无筛选数据');
            }
        }catch (e) {
            callback(false, e.message);
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
        for (i; i < this.listData.length; i++) {
            if (this.listData[i].id === id) {
                this.listData[i].praiseFlag = praiseFlag;
                this.listData[i].praiseNum = praiseNum;
            }
            newList.push(this.listData[i]);
        }
        this.listData = newList;
    }

    /**
     * 更新阅读数
     * @param id
     */
    @action
    updateViewNumByGoodsId(id: number) {
        this.listData = this.listData.map((item: Object) => {
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
        let innerList = this.listData.slice();
        innerList.forEach((item) => {
            if (item.id === id) {
                item.spuFavorNum = favorNum;
                item.spuFavorFlag = favorFlag;
            }
        });
        this.listData = innerList;
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
        for (i; i < this.listData.length; i++) {
            if (this.listData[i].tenantId === tenantId) {
                this.listData[i].favorFlag = favorFlag;
            }
            newList.push(this.listData[i]);
        }
        this.listData = newList;
    }

    /**
     * 删除list中的item
     * @param id
     */
    @action
    removeGoodsItem(id: number) {
        let i = 0;
        let newList = [];
        for (i; i < this.listData.length; i++) {
            if (this.listData[i].id !== id) {
                newList.push(this.listData[i]);
            }
        }
        this.listData = newList;
    }
}

