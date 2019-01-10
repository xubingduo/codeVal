/**
 * author: tuhui
 * Date: 2018/7/10
 * Time: 15:25
 * des: 购物车全局store
 * @flow
 */

import {observable, computed, action, toJS, runInAction} from 'mobx';
import {RootStore} from './RootStore';
import type {ShopType, SKUType, SPUType} from '../module/model/ShoppingCartModel';
import ShoppingCartApiManager from '../apiManager/ShoppingCartApiManager';
import NP from 'number-precision';
import {fetchSellerCouponList} from '../apiManager/CouponApiManager';
import CouponApiManager from '../apiManager/CouponApiManager';
import * as _ from 'lodash';
import {Toast} from '@ecool/react-native-ui/index';

export const testSku = {
    id: undefined,
    skuId: 5,
    spec1: 1,
    spec1Name: '紫色',
    spec2: 3,
    spec2Name: 'm',
    spec3: 3,
    spec3Name: '3',
    skuPrice: 199,
    skuNum: 1,
    originalPrice: 300,
    invNum: 0, //库存
    checked: true
};

export const testSpu = {
    spuId: 5,
    spuName: '款式名san',
    title: '款式的san',
    spuPic: 'https://faceid.com/faceid-open-doc/img/doc/SDK_2.png',
    spuList: [],
    classId: 1,
    spuFlag: 1 //款式状态 1表示正常  其他表示失效
};

export const testShop = {
    traderName: '店铺名称3',
    tenantId: 5,
    clusterCode: 0,
    unitId: 2,
    shopCoupsMoney: 0,
    shipFeeMoney: 0,
    totalMoney: 0,
    totalNum: 0,
    payKind: 0,
    buyerRem: '',
    hashKey: '',
    addressId: '',
    //是否有优惠券待领取
    couponsToGet: false,
    //可用优惠券数量
    couponsCount: 0
};

class ShoppingCartStore {
    @observable toggle: boolean = false;
    @observable goodsArr: Array<Object> = [];

    /**
     * 点击领取优惠券的时候 请求回来的 当前点击的门店的优惠券
     * @type {Array}
     */
    @observable couponsList: Array<Object> = [];

    @observable manage: boolean = false;
    rootStore: RootStore;

    /**
     * 合包支持
     */
    @observable isCombinative: boolean = false;
    /**
     * 一件代发支持
     */
    @observable isSingleFog: boolean = false;
    /**
     * 代发合包 优惠金额
     */
    @observable feeAmount: number = 0;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @action
    setCloseTips() {
        this.isCombinative = false;
        this.isSingleFog = false;
    }

    @action
    setManage(manage: boolean) {
        if (manage){
            this.isSingleFog = false;
            this.isCombinative = false;
        }
        this.manage = manage;
    }

    /**
     * 加入购物车
     * @param sku
     * @param spu
     * @param shop
     * @param fromServer 不更新到服务器 (从服务器更新添加的)
     * @param callBack
     */
    @action
    addSKU(sku: Object, spu: Object, shop: Object, callBack: Function, fromServer: boolean = false) {
        if (!fromServer) {
            sku.checked = true;
            spu.checked = false;
            shop.checked = false;
        }

        let arrAll = this.goodsArr;

        //判断店铺是否存在(tenantId)
        let shopItem;
        for (let i = 0; i < arrAll.length; i++) {
            if (shop.tenantId === arrAll[i].tenantId) {
                //店铺存在
                shopItem = arrAll[i];
                break;
            }
        }

        //店铺不存在 添加进去  同时spu sku都添加进去
        if (!shopItem) {
            if (!fromServer) {
                shop.checked = true;
                spu.checked = true;
            }

            if (fromServer) {
                arrAll.push({
                    data: [
                        {
                            spu: [{
                                data: [
                                    {
                                        ...sku
                                    }
                                ],
                                ...spu,
                            }]
                        }
                    ],
                    ...shop,
                });
            } else {
                arrAll.unshift({
                    data: [
                        {
                            spu: [{
                                data: [
                                    {
                                        ...sku
                                    }
                                ],
                                ...spu,
                            }]
                        }
                    ],
                    ...shop,
                });
            }
            /**
             * 新添加店铺  请求是否有优惠券领取
             */
            this.querySellerCanGetCoupons();
        } else {
            //店铺存在  判断spu是否存在
            let spuItem;
            for (let i = 0; i < shopItem.data.length; i++) {
                for (let j = 0; j < shopItem.data[i].spu.length; j++) {
                    if (spu.spuId === shopItem.data[i].spu[j].spuId) {
                        //spu存在
                        spuItem = shopItem.data[i].spu[j];
                        break;
                    }
                }
            }

            if (!spuItem) {
                //spu不存在 添加进去
                if (!fromServer) {
                    spu.checked = true;
                }
                if (fromServer) {
                    shopItem.data.push({
                        spu: [{
                            data: [{
                                ...sku,
                            }],
                            ...spu
                        }]
                    });
                } else {
                    shopItem.data.unshift({
                        spu: [{
                            data: [{
                                ...sku,
                            }],
                            ...spu
                        }]
                    });
                }
            } else {
                //spu存在 判断sku是否存在
                let skuItem;
                for (let i = 0; i < spuItem.data.length; i++) {
                    if (sku.skuId === spuItem.data[i].skuId) {
                        //sku存在
                        skuItem = spuItem.data[i];
                        skuItem.checked = sku.checked;
                        if (NP.plus(skuItem.skuNum, sku.skuNum) > 9999) {
                            callBack(false, `${skuItem.spec1Name} ${skuItem.spec2Name} 数量超出`);
                            continue;
                        } else {
                            skuItem.skuNum = NP.plus(skuItem.skuNum, sku.skuNum);
                        }

                        this.checkSKU(skuItem.checked, skuItem.skuId);
                        break;
                    }
                }

                if (!skuItem) {
                    if (fromServer) {
                        spuItem.data.push({
                            ...sku,
                        });
                    } else {
                        spuItem.data.unshift({
                            ...sku,
                        });
                    }
                }
            }
        }
    }

    /**
     * 批量选中/取消选中sku
     * @param skuIds
     * @param isSelected
     */
    @action
    selectSkus(skuIds: Array<number>,isSelected: boolean){
        let skuIdsMap = new Map();
        for(let i = 0;i < skuIds.length;i++){
            let id = skuIds[i];
            skuIdsMap.set(id,id);
        }
        const goodsArr = this.goodsArr.slice();
        for (let i = 0; i < goodsArr.length; i++) {
            const shopItem = goodsArr[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    const spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        const skuItem = spuItem.data[m];
                        if (skuIdsMap.get(skuItem.skuId)) {
                            skuItem.checked = isSelected;
                        }
                    }
                }
            }
        }
        this.goodsArr = goodsArr;
    }


    /**
     * 批量添加到购物车 优化版
     * @param skuArray sku数组
     * @param spu
     * @param shop
     * @param callBack 回调
     * @param fromServer 是否是从服务器拉取的
     */
    @action
    addSKUs = (
        skuArray: Array<SKUType>,
        spu: SPUType,
        shop: ShopType,
        callBack: Function,
        fromServer: boolean = false
    ) => {
        if (!fromServer) {
            // sku.checked = true;
            spu.checked = false;
            shop.checked = false;
        }

        let arrAll = this.goodsArr;

        //判断店铺是否存在(tenantId)
        let shopItem;
        for (let i = 0; i < arrAll.length; i++) {
            if (shop.tenantId === arrAll[i].tenantId) {
                //店铺存在
                shopItem = arrAll[i];
                break;
            }
        }

        //店铺不存在 添加进去  同时spu sku都添加进去
        if (!shopItem) {
            if (!fromServer) {
                shop.checked = true;
                spu.checked = true;
            }

            if (fromServer) {
                arrAll.push({
                    data: [
                        {
                            spu: [{
                                data: [
                                    ...skuArray
                                ],
                                ...spu,
                            }]
                        }
                    ],
                    ...shop,
                });
            } else {
                arrAll.unshift({
                    data: [
                        {
                            spu: [{
                                data: [
                                    ...skuArray
                                ],
                                ...spu,
                            }]
                        }
                    ],
                    ...shop,
                });
            }
            /**
             * 新添加店铺  请求是否有优惠券领取
             */
            this.querySellerCanGetCoupons();
        } else {
            //店铺存在  判断spu是否存在
            let spuItem;
            for (let i = 0; i < shopItem.data.length; i++) {
                for (let j = 0; j < shopItem.data[i].spu.length; j++) {
                    if (spu.spuId === shopItem.data[i].spu[j].spuId) {
                        //spu存在
                        spuItem = shopItem.data[i].spu[j];
                        break;
                    }
                }
            }

            if (!spuItem) {
                //spu不存在 添加进去
                if (!fromServer) {
                    spu.checked = true;
                }
                if (fromServer) {
                    shopItem.data.push({
                        spu: [{
                            data: [...skuArray],
                            ...spu
                        }]
                    });
                } else {
                    shopItem.data.unshift({
                        spu: [{
                            data: [...skuArray],
                            ...spu
                        }]
                    });
                }
                if (this.isSPU2ShopAllCheck(shopItem)) {
                    shopItem.checked = true;
                }
            } else {
                //spu存在 判断sku是否存在
                // let skuItem;
                const data = [];
                for (let i = 0; i < spuItem.data.length; i++) {
                    const addedSkuItem = spuItem.data[i]; // 已在购物车内的sku
                    const len = data.length;
                    for (let j = 0; j < skuArray.length; j++) {
                        const skuItem = skuArray[j]; // 要添加的sku
                        if (!fromServer) {
                            skuItem.checked = true;
                        }
                        if (addedSkuItem.skuId === skuItem.skuId) {
                            const _skuItem = {...addedSkuItem};
                            _skuItem.checked = skuItem.checked;

                            if (NP.plus(addedSkuItem.skuNum, skuItem.skuNum) > 9999) {
                                callBack(false, `${skuItem.spec1Name} ${skuItem.spec2Name} 数量超出`);
                                continue;
                            } else {
                                _skuItem.skuNum = NP.plus(addedSkuItem.skuNum, skuItem.skuNum);
                            }
                            data.push(_skuItem);
                            skuArray.splice(j, 1);
                            break;
                        }
                    }
                    if (len === data.length) {
                        data.push({...addedSkuItem});
                    }
                }

                const _data = [...data, ...skuArray];

                spuItem.data = _data;

                if (this.isSKU2SPUAllCheck(spuItem)) {
                    spuItem.checked = true;
                }

                if (this.isSPU2ShopAllCheck(shopItem)) {
                    shopItem.checked = true;
                }
            }
        }
    };

    /**
     * @param skuArray sku列表  添加一个颜色尺码数组到进货车
     * @param spu
     * @param shop
     * @param fromServer
     * @param callBack
     */
    @action
    async addSkuArray(skuArray: Array<SKUType>, spu: SPUType, shop: ShopType, callBack: Function, fromServer: boolean = false) {
        const _skuArray = skuArray.map(sku => {
            if (!sku.groupNum) {
                sku.groupNum = 1;
            }
            sku.checked = true;
            sku.salesWayId = spu.salesWayId;
            return sku;
        });
        try {
            let result = await this.addGoodsBatchToShoppingCart(this.configTraderInfo(shop), this.configSpuInfo(spu), this.configSkuList(_skuArray));

            // for (let i = 0; i < _skuArray.length; i++) {
            //     let skuItem = _skuArray[i];
            //     this.addSKU(skuItem, spu, shop, callBack);
            // }

            this.addSKUs(_skuArray, spu, shop, callBack);

            if (result && result.data) {
                this.updateSkuShopCartIdBatch(result.data.rows);
            }
            callBack(true);
        } catch (e) {
            callBack(false, e.message);
        }
    }


    /**
     * 批量更新购物车的id  (当添加到服务器时会返回购物车skuId)
     * @param data
     */
    @action
    updateSkuShopCartIdBatch(data: Array<Object>) {
        const arrAll = this.goodsArr.slice();
        for (let i = 0; i < data.length; i++) {
            let skuItem = data[i];
            this.updateSkuId(skuItem.skuId, skuItem.id, arrAll);
        }
        this.goodsArr = arrAll;
    }

    /**
     * 更新sku的服务端id,不是skuId
     * @param skuId
     * @param id
     */
    @action
    updateSkuId(skuId: number, id: number, goodsArr?: Array<Object>) {
        let arrAll = goodsArr || this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuId === skuItem.skuId) {
                            skuItem.id = id;
                        }
                    }
                }
            }
        }
    }

    /**
     * 根据skuId删除sku
     * @param skuId
     */
    @action
    deleteSKU(skuId: number) {
        const goodsArr = this.goodsArr.slice();
        for (let i = 0; i < goodsArr.length; i++) {
            const shopItem = goodsArr[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    const spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        const skuItem = spuItem.data[m];
                        if (skuId === skuItem.skuId) {
                            spuItem.data.splice(m, 1);
                            m--;
                            break;
                        }
                    }
                    if (spuItem.data.length === 0) {
                        shopItem.data[j].spu.splice(k, 1);
                        k--;
                        break;
                    }
                }
                if (shopItem.data[j].spu.length === 0) {
                    shopItem.data.splice(j, 1);
                    j--;
                    break;
                }
            }
            if (shopItem.data.length === 0) {
                goodsArr.splice(i, 1);
                i--;
                break;
            }
        }
        this.goodsArr = goodsArr;
    }

    /**
     * 根据spuId删除款号
     * @param spuId
     */
    @action
    deleteSPU = (spuId: number, callBack?: Function) => {
        const goodsArr = this.goodsArr.slice();
        for (let i = 0; i < goodsArr.length; i++) {
            const shopItem = goodsArr[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    const spuItem = shopItem.data[j].spu[k];
                    if (spuItem.spuId === spuId) {
                        const ids = [];
                        for (let m = 0; m < spuItem.data.length; m++) {
                            ids.push(spuItem.data[m].id);
                        }
                        return this.deleteGoodsBatchToShoppingCart(ids, action((ret, msg) => {
                            if (ret) {
                                shopItem.data[j].spu.splice(k, 1);
                                k--;
                                if (shopItem.data[j].spu.length === 0) {
                                    shopItem.data.splice(j, 1);
                                }
                                if (shopItem.data.length === 0) {
                                    goodsArr.splice(i, 1);
                                }
                                this.goodsArr = goodsArr;
                            }
                            callBack && callBack(ret, msg);
                        }));
                    }
                }
            }
        }
    };

    /**
     * 批量删除sku
     */
    @action
    deleteSkus = (skuIds: Array<number>) => {
        const goodsArr = this.goodsArr.slice();
        for (let i = 0; i < goodsArr.length; i++) {
            const shopItem = goodsArr[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    const spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        const skuItem = spuItem.data[m];
                        if (skuIds.includes(skuItem.skuId)) {
                            spuItem.data.splice(m, 1);
                            m--;
                        }
                    }
                    if (spuItem.data.length === 0) {
                        shopItem.data[j].spu.splice(k, 1);
                        k--;
                    }
                }
                if (shopItem.data[j].spu.length === 0) {
                    shopItem.data.splice(j, 1);
                    j--;
                }
            }
            if (shopItem.data.length === 0) {
                goodsArr.splice(i, 1);
                i--;
            }
        }
        this.goodsArr = goodsArr;
    };


    /**
     * 根据店铺的id删除店铺
     * @param tenantId
     */
    @action
    deleteShop(tenantId: number) {
        let arrAll = this.goodsArr;
        for (let i = arrAll.length - 1; i >= 0; i--) {
            let shopItem = arrAll[i];
            if (tenantId === shopItem.tenantId) {
                arrAll.splice(i, 1);
            }
        }
    }

    /**
     * 购物车显示的列表
     * @returns {*}
     */
    @computed
    get goodsArrShow(): Array<Object> {

        if (this.toggle) {
            return this.toggleArrShow(toJS(this.goodsArr));
        } else {
            return toJS(this.goodsArr);
        }
    }

    /**
     * 更新店铺是否有购物券可以领用
     * @param tenantId
     * @param has
     */
    @action
    updateShopCouponCanGet(tenantId: number, has: boolean) {
        let arrAll = this.goodsArr;
        for (let i = arrAll.length - 1; i >= 0; i--) {
            let shopItem = arrAll[i];
            if (tenantId === shopItem.tenantId) {
                shopItem.couponsToGet = has;
                break;
            }
        }
    }

    /**
     * 已选商品货款总计
     * @returns {number}
     */
    @computed
    get totalCheckMoney(): number {

        let total = 0;
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];

                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            total = NP.plus(total, NP.times(skuItem.skuNum, skuItem.skuPrice));
                        }
                    }
                }
            }
        }
        return total;
    }

    /**
     * 确认订单显示的列表
     * @returns {*}
     */
    @computed
    get goodsArrOrderConfirmShow(): Array<Object> {
        let goods = toJS(this.goodsArr);
        return this.deleteUncheckItem(goods);
    }

    /**
     * 删除未选中的条目
     * @param goodsArr
     * @return {Array<Object>}
     */
    deleteUncheckItem = (goodsArr: Array<Object>) => {
        let arrAll = goodsArr;
        for (let i = arrAll.length - 1; i >= 0; i--) {
            let shopItem = arrAll[i];

            for (let j = shopItem.data.length - 1; j >= 0; j--) {
                for (let k = shopItem.data[j].spu.length - 1; k >= 0; k--) {
                    let spuItem = shopItem.data[j].spu[k];
                    for (let m = spuItem.data.length - 1; m >= 0; m--) {
                        let skuItem = spuItem.data[m];
                        if (!skuItem.checked) {
                            //如果当前spu只有一个sku 那么也将spu删除
                            if (spuItem.data.length === 1) {
                                //如果当前店铺只有这一个spu 整个店铺都删除掉
                                if (shopItem.data.length === 1) {
                                    arrAll.splice(i, 1);
                                } else {
                                    shopItem.data.splice(j, 1);
                                }
                            } else {
                                spuItem.data.splice(m, 1);
                            }
                        }
                    }
                }
            }
        }

        return arrAll;
    };

    /**
     * 收起 时候的展示数据
     * @returns {Array}
     */
    toggleArrShow = (arrThis: Array<Object>) => {
        let arr = [];
        for (let i = 0; i < arrThis.length; i++) {
            let shopItem = arrThis[i];
            let spuArr = [];

            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    spuArr.push(shopItem.data[j].spu[k]);
                }
            }

            arr.push({
                ...shopItem,
                data: spuArr
            });
        }
        return arr;
    };

    /**
     * 店铺情况汇总
     */
    computedShopSummary = (shopId: number): Object => {
        let shopSummary = {
            goodsType: 0,
            goodsCount: 0,
            priceTotal: 0,
        };
        for (let i = 0; i < this.goodsArr.length; i++) {
            let shopItem = this.goodsArr[i];
            if (shopItem.tenantId === shopId) {
                for (let j = 0; j < shopItem.data.length; j++) {
                    for (let m = 0; m < shopItem.data[j].spu.length; m++) {
                        let spuItem = shopItem.data[j].spu[m];
                        for (let k = 0; k < spuItem.data.length; k++) {
                            let skuItem = spuItem.data[k];
                            shopSummary.goodsCount = NP.plus(shopSummary.goodsCount, skuItem.skuNum);
                            shopSummary.goodsType = NP.plus(shopSummary.goodsType, 1);
                            shopSummary.priceTotal = NP.plus(shopSummary.priceTotal, NP.times(skuItem.skuPrice, skuItem.skuNum));
                        }
                    }
                }
            }
        }
        return shopSummary;
    };

    /**
     * sku数量设置
     */
    @action
    setSKUNumber(num: number, skuId: number, callBack: Function) {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuId === skuItem.skuId) {
                            skuItem.skuNum = num;
                            this.updateGoodsToShoppingCart(skuItem, callBack);
                        }
                    }
                }
            }
        }

        this.querySupportCombinatives();
    }

    /**
     * 展开 收起
     */
    @action
    toggleSpu() {
        this.toggle = !this.toggle;
    }

    /**
     * 获取所有的sku数量
     * @returns {number}
     */
    @computed
    get getAllCountShow(): string {
        let count = 0;
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        count = NP.plus(count, skuItem.skuNum);
                    }
                }
            }
        }
        if (count > 999) {
            return '999+';
        } else {
            return count + '';
        }
    }

    /**
     * 判断一个spu的Sku都选中了
     * @param spuItem
     * @return {boolean}
     */
    isSKU2SPUAllCheck = (spuItem: Object): boolean => {
        for (let i = 0; i < spuItem.data.length; i++) {
            let skuItem = spuItem.data[i];
            if (!skuItem.checked) {
                return false;
            }
        }
        return true;
    };

    /**
     * 是否一个spu的sku没有全部选中
     * @param spuItem
     * @return {boolean}
     */
    isSKU2SPUUnAllCheck = (spuItem: Object): boolean => {
        for (let i = 0; i < spuItem.data.length; i++) {
            let skuItem = spuItem.data[i];
            if (!skuItem.checked) {
                return true;
            }
        }
        return false;
    };

    /**
     * 是否一个店铺的spu都是选中的
     * @param shopItem
     * @return {boolean}
     */
    isSPU2ShopAllCheck = (shopItem: Object): boolean => {
        for (let i = 0; i < shopItem.data.length; i++) {
            for (let j = 0; j < shopItem.data[i].spu.length; j++) {
                let spuItem = shopItem.data[i].spu[j];
                if (!spuItem.checked) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * 是否一个店铺的spu都是选中状态
     * @param shopItem
     * @return {boolean}
     */
    isSPU2ShopUnAllCheck = (shopItem: Object): boolean => {
        for (let i = 0; i < shopItem.data.length; i++) {
            for (let j = 0; j < shopItem.data[i].spu.length; j++) {
                let spuItem = shopItem.data[i].spu[j];
                if (!spuItem.checked) {
                    return true;
                }
            }
        }
        return false;
    };

    /**
     * 选中一个sku
     * @param checked
     * @param skuId
     * @param manage
     */
    @action
    checkSKU(checked: boolean, skuId: number, manage?: boolean) {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuId === skuItem.skuId) {
                            if (skuItem.salesWayId === 2) { // 童装批量购买
                                return this.checkSkuGroup(checked, spuItem.spuId, skuItem.spec1Name, manage);
                            }
                            // 当管理状态时，库存不足的商品要可以被选中 进行删除操作
                            if (manage) {
                                skuItem.checked = checked;
                            } else if (skuItem.invNum > 0) {
                                skuItem.checked = checked;
                            } else {
                                continue;
                            }
                            if (checked) {
                                /**
                                 * 如果当前Spu的sku都被选中了 那么Spu也应该被选中
                                 */
                                if (this.isSKU2SPUAllCheck(spuItem)) {
                                    spuItem.checked = true;
                                    /**
                                     * 如果当前店铺的spu都被选中了 那么店铺也应该被选中
                                     */
                                    if (this.isSPU2ShopAllCheck(shopItem)) {
                                        shopItem.checked = true;
                                    }
                                }
                            } else {
                                /**
                                 * 如果当前Spu的sku没有全都被选中了 那么Spu也应该不被选中
                                 */
                                if (this.isSKU2SPUUnAllCheck(spuItem)) {
                                    spuItem.checked = false;
                                    /**
                                     * 如果当前店铺的spu都被选中了 那么店铺也应该被选中
                                     */
                                    if (this.isSPU2ShopUnAllCheck(shopItem)) {
                                        shopItem.checked = false;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        this.querySupportCombinatives();
    }

    /**
     * 选中一个spu
     * @param checked
     * @param spuId
     * @param manage
     */
    @action
    checkSPU(checked: boolean, spuId: number, manage?: boolean) {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    if (spuId === spuItem.spuId) {
                        spuItem.checked = checked;
                        for (let m = 0; m < spuItem.data.length; m++) {
                            let skuItem = spuItem.data[m];
                            // 当管理状态时，库存不足的商品要可以被选中 进行删除操作
                            if (manage) {
                                skuItem.checked = checked;
                            } else if (skuItem.invNum > 0) {
                                skuItem.checked = checked;
                            }
                        }
                        if (checked) {
                            /**
                             * 如果当前店铺的spu都被选中了 那么店铺也应该被选中
                             */
                            if (this.isSPU2ShopAllCheck(shopItem)) {
                                shopItem.checked = true;
                            }
                        } else {
                            /**
                             * 如果当前店铺的spu都被选中了 那么店铺也应该被选中
                             */
                            if (this.isSPU2ShopUnAllCheck(shopItem)) {
                                shopItem.checked = false;
                            }
                        }
                    }
                }
            }
        }

        this.querySupportCombinatives();
    }

    /**
     * 童装统一勾选同一组的sku
     */
    @action
    checkSkuGroup(checked: boolean, spuId: number, skuSpec: string, manage?: boolean) {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    if (spuItem.spuId === spuId) {
                        for (let m = 0; m < spuItem.data.length; m++) {
                            let skuItem = spuItem.data[m];
                            if (skuSpec === skuItem.spec1Name) {
                                // 当管理状态时，库存不足的商品要可以被选中 进行删除操作
                                if (manage) {
                                    skuItem.checked = checked;
                                } else if (skuItem.invNum > 0) {
                                    skuItem.checked = checked;
                                } else {
                                    continue;
                                }
                                if (checked) {
                                    /**
                                     * 如果当前Spu的sku都被选中了 那么Spu也应该被选中
                                     */
                                    if (this.isSKU2SPUAllCheck(spuItem)) {
                                        spuItem.checked = true;
                                        /**
                                         * 如果当前店铺的spu都被选中了 那么店铺也应该被选中
                                         */
                                        if (this.isSPU2ShopAllCheck(shopItem)) {
                                            shopItem.checked = true;
                                        }
                                    }
                                } else {
                                    /**
                                     * 如果当前Spu的sku没有全都被选中了 那么Spu也应该不被选中
                                     */
                                    if (this.isSKU2SPUUnAllCheck(spuItem)) {
                                        spuItem.checked = false;
                                        /**
                                         * 如果当前店铺的spu都被选中了 那么店铺也应该被选中
                                         */
                                        if (this.isSPU2ShopUnAllCheck(shopItem)) {
                                            shopItem.checked = false;
                                        }
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
    }

    /**
     * 获取某一sku对应的集合（童装的组）
     */
    getSkuGroup(skuItem: SKUType) {
        let result;
        const goodsArr = this.goodsArr.slice();
        for (let i = 0; i < goodsArr.length; i++) {
            const shopItem = goodsArr[i];
            if (result) break;
            for (let j = 0; j < shopItem.data.length; j++) {
                if (result) break;
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    if (result) break;
                    const spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        const _skuItem = spuItem.data[m];
                        if (skuItem.skuId === _skuItem.skuId) {
                            if (skuItem.salesWayId === 2) {
                                result = spuItem.data.filter(item => item.spec1Name === skuItem.spec1Name);
                                break;
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * 选中一个店铺
     * @param checked
     * @param tenantId
     * @param manage
     */
    @action
    checkShop(checked: boolean, tenantId: number, manage?: boolean) {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            if (tenantId === shopItem.tenantId) {
                for (let j = 0; j < shopItem.data.length; j++) {
                    let checkedSpuCount = 0;
                    for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                        let spuItem = shopItem.data[j].spu[k];

                        if (spuItem.spuFlag !== 1 && !manage) {
                            continue;
                        }

                        let checkedSkuCount = 0;
                        for (let m = 0; m < spuItem.data.length; m++) {
                            let skuItem = spuItem.data[m];
                            // 当管理状态时，库存不足的商品要可以被选中 进行删除操作
                            if (skuItem.invNum > 0 || manage) {
                                skuItem.checked = checked;
                                checkedSkuCount++;
                            }
                        }
                        if (checkedSkuCount > 0) {
                            spuItem.checked = checked;
                            checkedSpuCount++;
                        }
                    }
                    if (checkedSpuCount > 0) {
                        shopItem.checked = checked;
                    }
                }
            }
        }

        this.querySupportCombinatives();
    }

    /**
     * 全选
     * @param checked
     * @param manage
     */
    @action
    checkAll(checked: boolean) {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];

            this.checkShop(checked, shopItem.tenantId, this.manage);
        }

        if (!checked) {
            this.isSingleFog = false;
            this.isCombinative = false;
        }
    }

    /**
     * 判断是否全部sku被选中了
     * @return {boolean}
     */
    @computed
    get isAllChecked(): boolean {
        let arrAll = this.goodsArr;
        //是否所有的都售罄状态
        let isAllNoInv = true;
        //是否所有的都失效
        let isAllInvalid = true;

        if (arrAll.length === 0) {
            return false;
        }
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];

                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];

                        if (this.manage) {
                            if (!skuItem.checked) {
                                return false;
                            }
                        } else {
                            // 已售罄不算入在内
                            // 失效的spu不算入内
                            if (!skuItem.checked && skuItem.invNum > 0 && spuItem.spuFlag === 1) {
                                return false;
                            }

                            if (skuItem.invNum > 0) {
                                isAllNoInv = false;
                            }

                            if (spuItem.spuFlag===1){
                                isAllInvalid = false;
                            }
                        }

                    }
                }
            }
        }

        if (isAllNoInv && !this.manage) {
            return false;
        }

        if (isAllInvalid && !this.manage){
            return false;
        }
        return true;
    }

    /**
     * 是否有条目是被选中的
     * @return {boolean}
     */
    @computed
    get isAnyChecked(): boolean {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];

                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * 所有被选中的sku的数量
     * @return {number}
     */
    @computed
    get totalCheckSKUCount(): number {
        let total = 0;
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];

                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            total = NP.plus(total, 1);
                        }
                    }
                }
            }
        }
        return total;
    }

    /**
     * 所有被选中的sku数量(商品数量)
     * @return {number}
     */
    @computed
    get totalCheckGoodsCount(): number {
        let total = 0;
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            total = NP.plus(total, skuItem.skuNum);
                        }
                    }
                }
            }
        }
        return total;
    }

    /**
     * 是否是排在第一个店铺
     * @param tenantId
     * @return {boolean}
     */
    isFirstShop(tenantId: number): boolean {
        return !!(this.goodsArr && this.goodsArr[0].tenantId === tenantId);
    }

    /**
     * 取消所有的选中状态
     */
    @action
    clearAllCheck() {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            shopItem.checked = false;
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    spuItem.checked = false;
                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            skuItem.checked = false;
                        }
                    }
                }
            }
        }
    }

    /**
     * 删除所有的商品选中状态
     */
    @action
    deleteChecked() {
        let arrAll = this.goodsArr;
        for (let i = arrAll.length - 1; i >= 0; i--) {
            let shopItem = arrAll[i];
            if (shopItem.checked) {
                arrAll.splice(i, 1);
                continue;
            }

            for (let j = shopItem.data.length - 1; j >= 0; j--) {
                for (let k = shopItem.data[j].spu.length - 1; k >= 0; k--) {
                    let spuItem = shopItem.data[j].spu[k];
                    if (spuItem.checked) {
                        shopItem.data[j].spu.splice(k, 1);
                        continue;
                    }

                    for (let m = spuItem.data.length - 1; m >= 0; m--) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            spuItem.data.splice(m, 1);
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取所有店铺id数组
     * @return {boolean}
     */
    @computed
    get allShopArr(): Array<number> {
        let arrAll = this.goodsArr;

        let shopArr = [];

        if (arrAll.length === 0) {
            return shopArr;
        }
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            shopArr.push(shopItem.tenantId);
        }

        return shopArr;
    }


    /**
     * 获取所有被选中的sku的id(购物车id不是skuId)
     * @returns {Array}
     */
    getAllCheckedIds(): Array<number> {
        let ids = [];
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            ids.push(skuItem.id);
                        }
                    }
                }
            }
        }
        return ids;
    }

    /**
     * 配置订单信息  主要是店铺信息
     * @param shopInfo
     * @return {{tenantId: number, traderName: string, unitId: number}}
     */
    configTraderInfo = (shopInfo: ShopType): Object => {
        return {
            tenantId: shopInfo.tenantId,
            traderName: shopInfo.traderName,
            unitId: shopInfo.unitId,
        };
    };

    /**
     * 配置spu款式信息
     * @param spuInfo
     * @return {{classId: number, spuId: number, spuName: string, title: string, spuPic: string, spuFlag: number}}
     */
    configSpuInfo = (spuInfo: SPUType): Object => {
        return {
            classId: spuInfo.classId,
            spuId: spuInfo.spuId,
            spuName: spuInfo.spuName,
            title: spuInfo.title,
            spuPic: spuInfo.spuList,
            spuFlag: spuInfo.spuFlag,
        };
    };

    configCartInfo = (skuInfo: SKUType, spuInfo: SPUType): Object => {
        return {
            id: skuInfo.id,
            classId: spuInfo.classId,
            spuId: spuInfo.spuId,
            spuName: spuInfo.spuName,
            title: spuInfo.title,
            spuPic: spuInfo.spuPic,
            skuId: skuInfo.skuId,
            skuNum: skuInfo.skuNum,
            skuPrice: skuInfo.skuPrice,
            spec1: skuInfo.spec1,
            spec1Name: skuInfo.spec1Name,
            spec2: skuInfo.spec2,
            spec2Name: skuInfo.spec2Name,
            spec3: skuInfo.spec3,
            spec3Name: skuInfo.spec3Name,
            originalPrice: skuInfo.originalPrice,
        };
    };

    /**
     * 配置sku列表信息
     * @param skuList
     * @return {Array}
     */
    configSkuList = (skuList: Array<SKUType>): Array<Object> => {

        let data = [];
        for (let i = 0; i < skuList.length; i++) {
            let skuInfo = skuList[i];
            data.push({
                skuId: skuInfo.skuId,
                skuNum: skuInfo.skuNum,
                skuPrice: skuInfo.skuPrice,
                originalPrice: skuInfo.originalPrice,
                spec1: skuInfo.spec1,
                spec1Name: skuInfo.spec1Name,
                spec2: skuInfo.spec2,
                spec2Name: skuInfo.spec2Name,
                spec3: skuInfo.spec3,
                spec3Name: skuInfo.spec3Name,
                invNum: skuInfo.invNum,
                salesWayId: skuInfo.salesWayId,
                groupNum: skuInfo.groupNum
            });
        }

        return data;
    };

    /**
     * 点击领取优惠券时店铺里优惠券列表
     * @return {Object[]}
     */
    @computed
    get couponsListShow(): Array<Object> {
        return this.couponsList.slice();
    }

    @action
    setShopCoupons(coupons: Array<Object>) {
        this.couponsList = coupons;
    }

    /**
     * 获取购物车
     * @param callBack
     */
    requestShoppingCart(callBack: Function) {
        ShoppingCartApiManager.queryShoppingCartProvider({
            //不分页
            pageSize: 0,
            pageNo: 1,
        }).then(action(({data}) => {
            const {rows} = data;
            if (rows) {
                this.AddServerCartsToLocal(rows);
                callBack(true, rows.length);
            }
        }), (error) => {
            callBack(false, error.message);
        });
    }

    /**
     * 将服务器返回的购物车转换到UI对应的格式添加到购物车
     * @param rows
     */
    AddServerCartsToLocal(rows: Array<Object>) {
        /**
         * 先清空本地
         */
        this.goodsArr = [];
        for (let i = 0; i < rows.length; i++) {
            let shopItem = rows[i];
            let shop = {
                tenantId: shopItem.trader.tenantId,
                clusterCode: shopItem.trader.clusterCode,
                traderName: shopItem.trader.traderName,
                unitId: shopItem.trader.unitId,
                shipFeeMoney: 0,
                shopCoupsMoney: 0,
                totalMoney: 0,
                totalNum: 0,
                payKind: 0,
                buyerRem: '',
                hashKey: '',
                addressId: '',
                couponsToGet: false,
                //可用优惠券数量
                couponsCount: 0,
            };

            for (let j = 0; j < shopItem.carts.length; j++) {
                let spkuItem = shopItem.carts[j];
                let spu = {
                    spuId: spkuItem.spuId,
                    spuName: spkuItem.spuName,
                    title: spkuItem.title,
                    spuPic: spkuItem.spuPic,
                    spuList: spkuItem.spuPic,
                    checked: false,
                    spuFlag: spkuItem.spuFlag,
                    salesWayId: spkuItem.salesWayId
                };

                let sku = {
                    id: spkuItem.id,
                    skuId: spkuItem.skuId,
                    spec1: spkuItem.spec1,
                    spec1Name: spkuItem.spec1Name,
                    spec2: spkuItem.spec2,
                    spec2Name: spkuItem.spec2Name,
                    spec3: spkuItem.spec3,
                    spec3Name: spkuItem.spec3Name,
                    skuPrice: spkuItem.skuPrice,
                    skuNum: spkuItem.skuNum,
                    originalPrice: spkuItem.originalPrice,
                    checked: false,
                    invNum: spkuItem.invNum,
                    groupNum: spkuItem.groupNum,
                    salesWayId: spkuItem.salesWayId
                };

                this.addSKU(sku, spu, shop, () => {
                }, true);
            }
        }
    }

    /**
     * 购物车新增货品
     * @param trader 卖家信息
     * @param cart SKU信息
     * @param callBack
     */
    addGoodsToShoppingCart = (trader: Object, cart: Object, callBack: Function) => {
        ShoppingCartApiManager.addGoodsToShoppingCartProvider(
            {
                jsonParam: {
                    trader: trader,
                    cart: cart
                }
            }
        ).then(action(({data}) => {
            //添加货品成功
            this.updateSkuId(cart.skuId, data.val);
            callBack(true);
        }), (error) => {
            callBack(false, error.message);
        });
    };

    /**
     * 购物车批量新增货品
     * @param trader 卖家信息
     * @param carts SKU信息数组
     * @param spu spu
     * @param callBack
     */
    addGoodsBatchToShoppingCart = (trader: Object, spu: Object, carts: Array<Object>) => {
        return ShoppingCartApiManager.addGoodsBatchToShoppingCartProvider(
            {
                jsonParam: {
                    trader: trader,
                    spu: spu,
                    carts: carts
                }
            }
        );
    };

    /**
     * 删除购物车货品
     * @param id
     * @param callBack
     */
    deleteGoodsShoppingCart = (id: number, skuId: number, callBack?: Function) => {
        ShoppingCartApiManager.deleteGoodsShoppingCartProvider(
            {
                jsonParam: {
                    id: id
                }
            }
        ).then(action(({data}) => {
            //删除购物车货品成功
            this.deleteSKU(skuId);
            callBack && callBack(true);
        }), (error) => {
            callBack && callBack(false, error.message);
        });
    };

    /**
     * 批量删除购物车货品
     * @param ids
     * @param callBack
     */
    deleteGoodsBatchToShoppingCart = (ids: Array<number>, callBack?: Function) => {
        return ShoppingCartApiManager.deleteGoodsBatchToShoppingCartProvider({
            jsonParam: {
                ids: ids
            }
        }).then(action(({data}) => {
            //删除购物车货品成功
            callBack && callBack(true);
        }), (error) => {
            callBack && callBack(false, error.message);
        });
    };

    /**
     * 更新购物车sku
     * @param sku
     * @param callBack
     */
    updateGoodsToShoppingCart = (sku: Object, callBack: Function) => {
        ShoppingCartApiManager.updateGoodsToShoppingCartProvider({
            jsonParam: {
                ...sku
            }
        }).then(action(({data}) => {
            //更新购物车货品成功
            callBack(true);
        }), (error) => {
            callBack(false, error.message);
        });
    };

    /**
     * 请求店铺可用优惠券
     * @return {Promise<*>}
     */
    @action
    querySellerCanGetCoupons = async () => {

        try {
            if (this.allShopArr.length <= 0) {
                return;
            }

            let params = {
                jsonParam: {
                    shopIds: _.join(this.allShopArr, ',')
                }
            };

            let {data} = await CouponApiManager.fetchSellerCanGetCoupons(params);

            if (data.rows) {
                for (let i = 0; i < data.rows.length; i++) {

                    let item = data.rows[i];
                    if (item.num > 0) {
                        this.updateShopCouponCanGet(item.shopId, true);
                    } else {
                        this.updateShopCouponCanGet(item.shopId, false);
                    }
                }
            }

            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    /**
     * 搜索店铺优惠券
     * @param sellerId
     * @return {Promise<*>}
     */
    queryShopCouponsList = async (sellerId: number) => {

        try {
            let jsonParam = {
                shopId: sellerId
            };

            let {data} = await CouponApiManager.fetchShopCanGetCouponsList(jsonParam);

            return Promise.resolve(data.rows);
        } catch (e) {
            return Promise.reject(e);
        }
    };


    /**
     * 获取商品spu 列表用于请求运费
     * @returns {Array}
     */
    configSPUs = () => {
        let orders = [];
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {

            let shopItem = arrAll[i];
            let shopInfo = {
                sellerId: shopItem.tenantId,
                orderSpus: []
            };

            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];

                    let orderNum = 0;
                    let spuMoney = 0;
                    let spuId = spuItem.spuId;

                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        if (skuItem.checked) {
                            orderNum = NP.plus(orderNum, skuItem.skuNum);
                            spuMoney = NP.plus(spuMoney, NP.times(skuItem.skuNum, skuItem.skuPrice));
                        }
                    }

                    if (orderNum > 0) {
                        shopInfo.orderSpus.push({
                            spuId: spuId,
                            orderNum: orderNum,
                            orderMoney: spuMoney
                        });
                    }
                }
            }

            if (shopInfo.orderSpus.length > 0) {
                orders.push(shopInfo);
            }
        }

        return orders;
    };

    /**
     * 检测是否支持一件代发  合包
     * @return {Promise<*>}
     */
    @action
    querySupportCombinatives = () => {
        if (this.manage) {
            this.isCombinative = false;
            this.isSingleFog = false;
            return;
        }

        this.querySupportCombinativesDebounce();
    };

    querySupportCombinativesDebounce = _.debounce(async () => {
        try {
            let jsonParam = {
                orders: this.configSPUs()
            };

            let {data} = await ShoppingCartApiManager.supportCombinativesProvider({jsonParam: jsonParam});

            runInAction(() => {
                this.isCombinative = data.isCombinative;
                this.isSingleFog = data.isSingleFog;
            });

            runInAction(() => {
                if (data.isCombinative || data.combinatives) {
                    this.feeAmount = 0;
                    if (data.isCombinative && data.combinatives) {
                        for (let i = 0; i < data.combinatives.length; i++) {
                            this.feeAmount += data.combinatives[i].feeOrg - data.combinatives[i].fee;
                        }
                    }
                } else if (data.isSingleFog && data.singleFogs) {
                    this.feeAmount = 0;
                    for (let i = 0; i < data.singleFogs.length; i++) {
                        this.feeAmount += data.singleFogs[i].feeOrg - data.singleFogs[i].fee;
                    }
                } else {
                    this.feeAmount = 0;
                }
            });

        } catch (e) {
            return Promise.reject(e);
        }
    }, 300);
}

export default ShoppingCartStore;