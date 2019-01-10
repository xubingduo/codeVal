/**
 *@author wengdongyang
 *@date 2018/07/27
 *@desc  我的收藏/合包商品推荐 后期需要将项目中所有商品列表整合重构
 *@flow
 */
import React from 'react';
import {observable, computed, action, toJS, runInAction, extendObservable} from 'mobx';
import UserApiManager from 'apiManager/UserApiManager';
import {fetchGoodsList} from 'apiManager/ShopApiManager';
import { fetchGoodscCancelFavor, fetchGoodscCancelFavors, getGoodsStyleDict,fetchAllGoodsProvider } from 'apiManager/GoodsApiManager';
import {toggleFavorFlagByShopId, watchCallBack, togglePraiseFlagByGoodsId, toggleFavorCallBack} from '../../newest/util/NewestUtil';
import ConfigListDictApiManager from 'apiManager/ConfigListDictApiManager';
import { TYPE_PRICE_RANGE } from 'module/index/store/GoodsSlideFilterStore';
import * as _ from 'lodash';
import {GoodModel} from 'module/model/GoodModel';
import Alert from 'component/Alert';
import {GoodQueryType} from 'module/model/GoodConstants.js';
// function toggleFavorCallBack(mainDataList: Array<Object>, goodsId: number, num: number, flag: number) {
//     let innerMainDataList = toJS(mainDataList);
//     innerMainDataList.forEach(element => {
//         if (element['id'] === goodsId) {
//             element['spuFavorNum'] = num;
//             element['spuFavorFlag'] = flag;
//         }
//     });
//     return innerMainDataList.filter(element => {
//         return element.spuFavorFlag === 1;
//     });
// }

export default class GoodsListStore {

    /**
     *
     * 查询类型。
     * 0 普通搜索，1 关注上新，2 推荐上新（全局），3 爆款
     * 4、（平台）不考虑登录情况的普通搜索（推荐列表 keyWords:{“specialFlag”:[1]}），
     * 5 我（买家）的收藏。6 今日上新（全局）（不掺杂热度和推荐，今日零点到现在）默认为0。7 包邮搜索
     */
    @observable queryType: number = 4;

    /**
     * 来源类型 0默认 1凑合包推荐
     */
    @observable sourceFromType: number = 0;

    /**
     * 市场IDs
     */
    marketId: string = '';

    // @observable filterDataSource: Map<string, Object> = new Map();
    @observable filterDataSource: Array<Object>;
    /**
     * 用户已选中的筛选条件
     */
    @observable seletedFilterCondition: Object = {};

    // 主数据列表
    @computed
    get favorGoodsDataList(): Array<Object> {
        return this.observableFavorGoodsDataList.slice();
    }

    @computed
    get isAllGoodsChecked(): boolean {
        return this.favorGoodsDataList.length > 0
            ? this.favorGoodsDataList.every(item => item.checked)
            : false;
    }

    // 主数据列表
    @observable observableFavorGoodsDataList: Array<GoodModel> = [];

    @action
    setQueryType = (queryType: number)=>{
        this.queryType = queryType;
    }

    @action
    resetList() {
        const list = this.observableFavorGoodsDataList.slice();
        const result = list.map(item => ({...item, checked: false}));
        this.observableFavorGoodsDataList = result;
    }

    @action
    setSourceFromType = (sourceFromType: number)=>{
        this.sourceFromType = sourceFromType;
    }

    @action
    checkGood(id: number) {
        this.observableFavorGoodsDataList = this.observableFavorGoodsDataList.map(item => {
            if (id === item.id) {
                item.checked = !item.checked;
            }
            return item;
        });
    }

    @action
    toggleAllCheck() {
        const checkStatus = this.isAllGoodsChecked;
        this.observableFavorGoodsDataList = this.observableFavorGoodsDataList.map(item => {
            item.checked = !checkStatus;
            return item;
        });
    }

    queryFilterConfigData = async ()=>{
        try {
            let result = await ConfigListDictApiManager.fetchFilterConfigDataProvider({filterType: 2});
            if(result.data && result.data.rows){
                runInAction(()=>{
                    if(this.sourceFromType === 1){
                        this.filterDataSource = result.data.rows.filter((item)=>{
                            return item.typeValue !== 5;
                        });
                    } else {
                        this.filterDataSource = result.data.rows;
                    }
                });
            }
            return Promise.resolve();
        } catch (error){
            return Promise.reject(error);
        }
    }

    delGoods = (ids?: Array<number>): Promise<Error | Object> => {
        let spuIds = [];
        if (Array.isArray(ids)) {
            spuIds = ids;
        } else {
            this.favorGoodsDataList.forEach(item => {
                if (item.checked) {
                    spuIds.push(item.id);
                }
            });
        }
        if (spuIds.length > 0) {
            return fetchGoodscCancelFavors({jsonParam: {spuIds}});
        } else {
            return Promise.reject(new Error('请选择商品'));
        }
        
    }

    @action
    delGoodsLocal = (ids?: Array<number>) => {
        let spuIds = [];
        if (Array.isArray(ids)) {
            spuIds = ids;
        } else {
            this.favorGoodsDataList.forEach(item => {
                if (item.checked) {
                    spuIds.push(item.id);
                }
            });
        }
        const list = this.observableFavorGoodsDataList.slice();
        // const target = this.observableFavorGoodsDataList.find(item => item.id === ids);
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (spuIds.includes(item.id)) {
                list.splice(i, 1);
                i--;
            }
        }   

        this.observableFavorGoodsDataList = list;
    }


    // @action
    // setFilterDataSource(source: Map<string, Object>) {
    //     this.filterDataSource = source;
    // }
    //
    // /**
    //  * 获取筛选列表
    //  */
    // queryFilterConfigData(callback: Function) {
    //     Promise.all([
    //         ConfigListDictApiManager.fetchFilterConditionProvider({
    //             type: '1,3',
    //             showFlagBit: 2, //显示模式：2 买家可见；1 卖家可见；不传则默认所有
    //         }),
    //         getGoodsStyleDict()
    //     ])
    //         .then(action(([{data}, {data: {rows}}]) => {
    //             const goodsStyle = rows.map(item => {
    //                 const {codeName: typeName, codeValue: typeValue, typeId, id} = item;
    //                 return {
    //                     type: 2,
    //                     typeName,
    //                     typeValue,
    //                     typeId,
    //                     id
    //                 };
    //             });
    //             const source = {...data, '2': goodsStyle};
    //             if (source) {
    //                 this.setFilterDataSource(source);
    //                 callback(true, source);
    //             } else {
    //                 callback(false, '无筛选数据');
    //             }
    //         }), (error) => {
    //             callback(false, error.message);
    //         });
    // }

    @action
    updateSelectedFilter(condition: Object,callback?: Function) {
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

    // @action
    // updateSelectedFilter(condition: Object) {
    //     this.seletedFilterCondition = {};
    //     let keyWords = {};
    //     let mutilVeluesKey = {};
    //     // 城市  如果有城市筛选条件 再加入 cityId参数  以下相同
    //     if (condition.hasOwnProperty('1')) {
    //         if (condition['1'] && condition['1'].length > 0) {
    //             Object.assign(keyWords, {cityId: condition['1']});
    //         }
    //     }
    //     // 市场
    //     if (condition.hasOwnProperty('3')) {
    //         if (condition['3'] && condition['3'].length > 0) {
    //             Object.assign(keyWords, {marketId: condition['3']});
    //         }
    //     }
    //     // 风格
    //     if (condition.hasOwnProperty('2')) {
    //         if (condition['2'] && condition['2'].length > 0) {
    //             Object.assign(keyWords, {'esProps.theme': condition['2']});
    //         }
    //     }
    //
    //     this.seletedFilterCondition = {
    //         keyWords,
    //         mutilVeluesKey
    //     };
    //
    //     // 价格区间
    //     if (condition.hasOwnProperty(TYPE_PRICE_RANGE)) {
    //         if (condition[TYPE_PRICE_RANGE] && condition[TYPE_PRICE_RANGE].length > 0) {
    //             let rangeStr = condition[TYPE_PRICE_RANGE][0];
    //             let priceRange = _.split(rangeStr, ',');
    //             Object.assign(this.seletedFilterCondition, {pubPriceStart: parseInt(priceRange[0])});
    //             // 根据
    //             if (priceRange.length > 1 && priceRange[1] !== '-1') {
    //                 // 还有最大价格
    //                 Object.assign(this.seletedFilterCondition, {pubPriceEnd: parseInt(priceRange[1])});
    //             }
    //         }
    //     }
    // }

    /**
     * 配置筛选条件
     * @param condition
     * @returns {Object & {}}
     */
    configJsonParams(condition: Object): Object {
        return Object.assign(condition, this.seletedFilterCondition);
    }

    fetchFun = (params: Object)=>{
        if(this.queryType === GoodQueryType.normal){
            return fetchGoodsList(params);
        } else {
            return UserApiManager.fetchFavorGoods(params);
        }
    }

    // 获取推荐数据列表
    // 目前只有goodsList，后期接入广告
    @action
    async getFavorGoodsDataList(params: Object, getType: String) {
        return new Promise((resolve: Function, reject: Function) => {
            params.jsonParam = {...params.jsonParam};

            this.fetchFun(params).then(res => {
                let rows;
                if(this.queryType === GoodQueryType.normal){
                    rows = res.data.dresStyleResultList;
                } else {
                    rows = res.data.favorDresStyleResultList;
                }
                rows = rows.map(item => ({checked: false, ...item}));
                runInAction(() => {
                    if (getType === 'fresh') {
                        this.observableFavorGoodsDataList = rows;
                    } else if (getType === 'more') {
                        this.observableFavorGoodsDataList = this.observableFavorGoodsDataList.slice().concat(rows);
                    }
                });
                resolve(rows);
            }, err => {
                runInAction(() => {
                    if (getType === 'fresh') {
                        this.observableFavorGoodsDataList = [];
                    } else if (getType === 'more') {
                        this.observableFavorGoodsDataList = [];
                    }
                });
                reject(err);
            });
        });
    }

    // 点击关注按钮
    @action
    toggleFocusOnClick(shopId: number, favorFlag: number) {
        runInAction(() => {
            this.observableFavorGoodsDataList = toggleFavorFlagByShopId(this.observableFavorGoodsDataList, shopId, favorFlag);
        });
    }

    @action
    toggleFavorClick(goodsId: number, spuFavorFlag: number, spuFavorNum: number) {
        runInAction(() => {
            this.observableFavorGoodsDataList = toggleFavorCallBack(this.observableFavorGoodsDataList, goodsId, spuFavorFlag, spuFavorNum);
        });
    }

    @action
    watchCallBack(goodsId: number, viewNum: number) {
        runInAction(() => {
            this.observableFavorGoodsDataList = watchCallBack(this.observableFavorGoodsDataList, goodsId, viewNum);
        });
    }

    // 点赞操作
    @action
    toggleStarClick(goodsId: number, praiseFlag: number, praiseNum: number) {
        runInAction(() => {
            this.observableFavorGoodsDataList = togglePraiseFlagByGoodsId(this.observableFavorGoodsDataList, goodsId, praiseFlag, praiseNum);
        });
    }
}
