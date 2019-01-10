/**
 *@author wengdongyang
 *@date 2018/07/27
 *@desc  频道列表
 *@flow
 */
import React from 'react';
import {observable, computed, action, toJS, runInAction} from 'mobx';
import {deepClone} from 'outils';
import {fetchBannerLabel, fetchGoodsList} from 'apiManager/ShopApiManager';
import ConfigListDictApiManager from 'apiManager/ConfigListDictApiManager';
import ShopApiManager from 'apiManager/ShopApiManager';
import Alert from 'component/Alert';
import {fetchGoodsStar} from 'apiManager/GoodsApiManager';
import NewestApiManager from '../apiManager/NewestApiManager';
import {
    detailFocusOnTypeList,
    chooseCurrentFocusOnType,
    toggleFavorFlagByShopId,
    togglePraiseFlagByGoodsId,
    toggleFavorCallBack,
    deleteGoodsByGoodsId,
    watchCallBack
} from '../util/NewestUtil';
import {goodsBuyUtil} from '../../goods/util/GoodsBuyUtil';
import DLStorage from 'utl/DLStorage';
import rootStore from 'store/RootStore';

export default class NewestStore {

    @observable
    currentCityIndex: number = 0;
    @observable
    _cityTabItems: Array<Object> = [
        {
            key: '0',
            item: {
                title: '其他'
            }
        }
    ];

    /**
     * 保存是否首次进入关注页面
     * @param flag
     */
    saveIsFirstToConcernPage = (flag: boolean)=>{
        DLStorage.save({key:this.keyForFirstToConcernPage(),data:flag});
    }

    /**
     * 是否首次进入关注页面
     * @return Promise
     */
    getIsFirstToConcernPage = ()=>{
        return DLStorage.load({key:this.keyForFirstToConcernPage()});
    }

    keyForFirstToConcernPage = ()=>{
        return (rootStore.userStore && rootStore.userStore.user ? rootStore.userStore.user.mobile : '') + 'FirstToConcernPageKey';
    }

    @computed
    get tabItemIds(): Array<number> {
        return this._cityTabItems.slice(0, this._cityTabItems.length - 1).map(item => Number(item.key));
    }
    @computed
    get cityTabItems(): Array<Object> {
        return this._cityTabItems.slice(0, 5);
    }
    // 是否展开focus组件
    @computed
    get focusOnModalVisiable(): boolean {
        return this.focusOnModalType;
    }

    // 关注类型列表
    @computed
    get focusOnTypeList(): Array<Object> {
        return this.observableFocusOnTypeList.slice();
    }

    // 当前关注类型列表
    @computed
    get currentFocusOnType(): Object {
        return toJS(this.observableCurrentFocusOnType);
    }

    @computed
    get classAccodeLike(): string {
        return this.observalbeClassAccodeLike;
    }

    // 主数据列表
    @computed
    get recommendDataList(): Array<Object> {
        return this.observableRecommendDataList.slice();
    }

    @computed
    get focusOnDataList(): Array<Object> {
        return this.observableFocusOnDataList.slice().filter((item)=>{
            return item.favorFlag === 1;
        });
    }

    @observable focusOnModalType: boolean = false;

    // 关注类型列表
    @observable observableFocusOnTypeList = [];

    // 当前关注类型列表
    @observable observableCurrentFocusOnType = {
        notInKeyWords: {},
        pubPriceStart: '',
        pubPriceEnd: '',
        keyWords: {},// 需要精确匹配的属性。key=属性名，value=需要搜索的属性列表。 支持的key：cityId - 地区城市，marketId - 市场，tenantId - 商户id，brandId - 品牌id，id - 商品id即skuId
        mutilVeluesKey: {},// 多值字段(字段内容为多个含义的值组合)匹配，只支持值为数值型的多值字段。查询时返回匹配任一查询值的所有内容。key=属性名，value=匹配的值列表。支持的key：shopStyles - 门店风格
        mutilVeluesKeyMust: {}, // 多值字段(字段内容为多个含义的值组合)匹配，只支持值为数值型的多值字段。查询时返回匹配全部查询值的所有内容。key=属性名，value=匹配的值列表。支持的key：labels - 门店标签，medalsCode - 勋章code集合
    };
    @observable observalbeClassAccodeLike = '';// 类别
    // 主数据列表
    @observable observableRecommendDataList: Array<Object> = [];
    @observable observableFocusOnDataList: Array<Object> = [];

    // 关注类型列表
    @action
    toggleFocusOnModalType(currentType: boolean) {
        runInAction(() => {
            this.focusOnModalType = currentType;
        });
    }

    // 关注类型列表
    @action
    getFocusOnTypeList() {
        ConfigListDictApiManager.fetchFilterConfigDataProvider({filterType: 1}).then(({data}) => {
            let focusOnTypeList = detailFocusOnTypeList(data);
            runInAction(() => {
                this.observableFocusOnTypeList = focusOnTypeList;
            });
        });
    }

    @action
    resetFocusOnTypeList() {
        let focusOnTypeList = toJS(this.observableFocusOnTypeList);
        focusOnTypeList.forEach(element => {
            element.detailList.forEach(elem => {
                elem.checked = false;
            });
            // 将价格区间置空
            if (element.id === 7) {
                element.pubPriceStart = '';
                element.pubPriceEnd = '';
            }
        });
        runInAction(() => {
            this.observableFocusOnTypeList = focusOnTypeList;
            this.observalbeClassAccodeLike = '';
            // 重置时，外部的城市id不进行重置
            this.observableCurrentFocusOnType.mutilVeluesKey = {};
            this.observableCurrentFocusOnType.mutilVeluesKeyMust = {};
            this.observableCurrentFocusOnType.pubPriceStart = '';
            this.observableCurrentFocusOnType.pubPriceEnd ='';
        });
    }

    // 选择当前关注类型列表
    @action
    chooseCurrentFocusOnType(smallClass: Object) {
        let {type} = smallClass;// type===1=>city
        let {focusOnTypeList, mutilVeluesKey, mutilVeluesKeyMust, pubPriceStart, pubPriceEnd} = chooseCurrentFocusOnType(toJS(this.observableFocusOnTypeList), this.observalbeClassAccodeLike, smallClass);
        // let {cityId: cityCodes} = keyWords;
        runInAction(() => {
            this.observableFocusOnTypeList = focusOnTypeList;
            this.observableCurrentFocusOnType.mutilVeluesKey = mutilVeluesKey;
            this.observableCurrentFocusOnType.mutilVeluesKeyMust = mutilVeluesKeyMust;
            this.observableCurrentFocusOnType.pubPriceStart = pubPriceStart;
            this.observableCurrentFocusOnType.pubPriceEnd = pubPriceEnd;
        });
        // if (type === 1) {
        //     this.getMarketList(cityCodes);
        // }
    }

    // 获取市场列表
    // @action
    // getMarketList(cityCodes: Array<number> = []) {
    //     let focusOnTypeList = toJS(this.observableFocusOnTypeList);
    //     let currentFocusOnType = toJS(this.observableCurrentFocusOnType);
    //     if (cityCodes.length > 0) {
    //         fetchFocusOnTypeList({
    //             type: 3,
    //             cityCodes: cityCodes.join(',')
    //         }).then(({data}) => {
    //             let marketList = data['3'];
    //             let currentChoosedMarket = currentFocusOnType.keyWords.marketId || [];
    //             marketList.forEach(elem => {
    //                 elem.checked = currentChoosedMarket.indexOf(elem.typeId) > -1;
    //             });
    //             let newMarketList = [];
    //             marketList.forEach(elem => {
    //                 if (elem.checked === true) {
    //                     newMarketList.push(elem.typeId);
    //                 }
    //             });
    //             focusOnTypeList.forEach(element => {
    //                 if (element.id === '3') {
    //                     element.detailList = marketList;
    //                 }
    //             });
    //             currentFocusOnType.keyWords.marketId = newMarketList;
    //             if (newMarketList.length === 0) {
    //                 delete currentFocusOnType.keyWords.marketId;
    //             }
    //             runInAction(() => {
    //                 this.observableFocusOnTypeList = focusOnTypeList;
    //                 this.observableCurrentFocusOnType = currentFocusOnType;
    //             });
    //         });
    //     } else {
    //         focusOnTypeList.forEach(element => {
    //             if (element.id === '3') {
    //                 element.detailList = [];
    //             }
    //         });
    //         delete currentFocusOnType.keyWords.marketId;
    //         runInAction(() => {
    //             this.observableFocusOnTypeList = focusOnTypeList;
    //             this.observableCurrentFocusOnType = currentFocusOnType;
    //         });
    //     }
    // }

    @action
    fetchRecommendCity = (cb: Function) => {
        return ShopApiManager.fetchRecommendCity()
            .then(action(res => {
                if (res.code === 0) {
                    const result = [];
                    res.data.rows.forEach(item => {
                        const cityItem = {};
                        for (const key in item) {
                            cityItem.key = key;
                            cityItem.item = {title: item[key]};
                        }
                        cityItem.hasOwnProperty('key') && result.push(cityItem);
                    });
                    result.push({
                        key: '0',
                        item: {
                            title: '其他'
                        }
                    });
                    this._cityTabItems = result;
                }
            }));
    }

    // 获取推荐数据列表
    // 目前只有goodsList，后期接入广告
    @action
    async getRecommendDataList(params: Object, getType: String) {
        return new Promise((resolve: Function, reject: Function) => {
            fetchGoodsList(params).then(res => {
                let {dresStyleResultList} = res.data;
                runInAction(() => {
                    if (getType === 'fresh') {
                        this.observableRecommendDataList = dresStyleResultList;
                    } else if (getType === 'more') {
                        this.observableRecommendDataList = this.observableRecommendDataList.slice().concat(dresStyleResultList);
                    }
                });
                resolve(dresStyleResultList);
            }, err => {
                runInAction(() => {
                    if (getType === 'fresh') {
                        this.observableFocusOnDataList = [];
                    } else if (getType === 'more') {
                        this.observableFocusOnDataList = [];
                    }
                });
                reject(err);
            });
        });
    }

    /**
     * 获取手机号匹配的推荐店铺，只在没有任何关注且第一次进入关注页面
     */
    getMobileMatchRecommandFocusList = (callback?: Function)=>{
        NewestApiManager.fetchMobileMatchRecomandFocusList({
            phone:rootStore.userStore && rootStore.userStore.user ? rootStore.userStore.user.mobile : '',
        }).then((result)=>{
            let list = result.data && result.data.rows ? result.data.rows : [];
            if(callback){
                callback(list);
            }
        }).catch((error)=>{
            Alert.alert(error.message);
        });
    }

    // 获取关注数据列表
    // 目前只有goodsList，后期接入广告
    @action
    async getFocusOnDataList(params: Object, getType: String) {
        return new Promise((resolve: Function, reject: Function) => {
            fetchGoodsList(params).then(res => {
                let {dresStyleResultList} = res.data;
                runInAction(() => {
                    if (getType === 'fresh') {
                        this.observableFocusOnDataList = dresStyleResultList;
                    } else if (getType === 'more') {
                        this.observableFocusOnDataList = this.observableFocusOnDataList.slice().concat(dresStyleResultList);
                    }
                });
                resolve(dresStyleResultList);
            }, err => {
                runInAction(() => {
                    if (getType === 'fresh') {
                        this.observableFocusOnDataList = [];
                    } else if (getType === 'more') {
                        this.observableFocusOnDataList = [];
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
            this.observableFocusOnDataList = toggleFavorFlagByShopId(this.observableFocusOnDataList, shopId, favorFlag);

            this.observableRecommendDataList = toggleFavorFlagByShopId(this.observableRecommendDataList, shopId, favorFlag);
        });
    }

    @action
    toggleFavorClick(goodsId: number, spuFavorFlag: number, spuFavorNum: number) {
        runInAction(() => {
            this.observableFocusOnDataList = toggleFavorCallBack(this.observableFocusOnDataList, goodsId, spuFavorFlag, spuFavorNum);
            this.observableRecommendDataList = toggleFavorCallBack(this.observableRecommendDataList, goodsId, spuFavorFlag, spuFavorNum);
        });
    }

    @action
    watchCallBack(goodsId: number, viewNum: number) {
        runInAction(() => {
            this.observableFocusOnDataList = watchCallBack(this.observableFocusOnDataList, goodsId, viewNum);
            this.observableRecommendDataList = watchCallBack(this.observableRecommendDataList, goodsId, viewNum);
        });
    }

    // 点赞操作
    @action
    toggleStarClick(goodsId: number, praiseFlag: number, praiseNum: number) {
        runInAction(() => {
            this.observableFocusOnDataList = togglePraiseFlagByGoodsId(this.observableFocusOnDataList, goodsId, praiseFlag, praiseNum);
            this.observableRecommendDataList = togglePraiseFlagByGoodsId(this.observableRecommendDataList, goodsId, praiseFlag, praiseNum);
        });
    }

    // 点击删除
    @action
    deleteClick(goodsId: number, queryType: String) {
        if (queryType === '1') {
            runInAction(() => {
                this.observableFocusOnDataList = deleteGoodsByGoodsId(this.observableFocusOnDataList, goodsId);
            });
        } else {
            runInAction(() => {
                this.observableRecommendDataList = deleteGoodsByGoodsId(this.observableRecommendDataList, goodsId);
            });
        }
    }
}
