/**
 * author: tuhui
 * Date: 2018/8/2
 * Time: 17:11
 * @flow
 * des:确认订单store
 */
import {computed, action, observable, toJS,runInAction,autorun} from 'mobx';
import moment from 'moment';
import ShoppingCartStore from '../../../store/ShoppingCartStore';
import BillingApiManager from '../../../apiManager/BillingApiManager';
import type {ShopType, SKUType, SPUType} from '../../model/ShoppingCartModel';
import UserApiManager from '../../../apiManager/UserApiManager';
import rootStore from 'store/RootStore';
import CouponApiManager from '../../../apiManager/CouponApiManager';
import * as _ from 'lodash';
import NP from 'number-precision';
import CouponSvc from '../../coupon/svc/CouponSvc';
import Alert from '../../../component/Alert';
import BillGoodsFeeData from '../model/BillGoodsFeeData';
import {BillConfirmOrderCellModel,BillCouponInfo} from '../model/BillConfirmCellItemType';
import CouponModel,{CouponType} from 'module/model/CouponModel';
import {Toast} from '@ecool/react-native-ui';
import {RootStore} from 'store/RootStore';

export default class BillingConfirmStore {
    // 收货地址
    @observable acceptInfo: Object;
    // 运费数据
    @observable feeData: BillGoodsFeeData = new BillGoodsFeeData();
    // 是否启用合包
    @observable isOpenCombinative: boolean = false;
    // 是否启用一件代发
    @observable isOpenSingleFogs: boolean = false;
    // 下单用的列表
    @observable orders: Array<Object> = [];
    // 购物车传递过来的货品数据
    @observable goodsArr: Array<Object> = [];
    // 最新的商品详细列表
    @observable realGoodsInfoList: Array<Object> = [];
    // 平台可用运费券数量
    @observable platFeeCouponAvlCount: number = 0;
    // 平台可用优惠券数量
    @observable platFavorCouponAvlCount: number = 0;

    @observable canOrderBtnEnable = false;
    orderBtnunEnableMsg = '';

    hashKey = '';

    /**
     * 平台优惠券
     */
    @observable platCoupons: Array<Object> = [];
    /**
     * 平台优惠券可用数量
     */
    @observable platCouponsCount: number = 0;

    shopCartStore: ShoppingCartStore;

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    configure(){
        this.hashKey = moment().valueOf();
    }

    @computed
    get hasAddress(): boolean {
        return !!this.acceptInfo;
    }

    @computed
    get goodsArrShow(): Array<BillConfirmOrderCellModel> {
        // 先将goodsArr根据tenantId转为map
        let goodsArrMap = new Map();
        for(let i = 0;i < this.goodsArr.length;i++){
            let goods = this.goodsArr[i];
            goods && goodsArrMap.set(goods.tenantId,JSON.parse(JSON.stringify(goods)));
        }
        let items = [];
        // 是否显示合包
        let isCombinative = this.feeData.isCombinative;
        // 是否显示一件代发
        let isSingleFog = this.feeData.isSingleFog;

        // 合包
        if(isCombinative && this.isOpenCombinative){
            let combinatives = this.feeData.combinatives ? this.feeData.combinatives : [];
            for(let i = 0;i < combinatives.length;i++){
                let combinativesItem = combinatives[i];
                let model = new BillConfirmOrderCellModel();
                model.orderMode = 1;
                model.shopOrders = [];
                model.feeMoneyNow = combinativesItem.fee;
                model.feeMoneyOrigin = combinativesItem.feeOrg;
                // 遍历匹配合包数据，将对应sellerId的货品加入到model.shopOrders数组中
                for(let j = 0;j < combinativesItem.sellerIds.length;j++){
                    let sellerId = combinativesItem.sellerIds[j];
                    if(!goodsArrMap.get(sellerId)) continue;
                    let shopInfo = JSON.parse(JSON.stringify(goodsArrMap.get(sellerId)));
                    // 加入到属性数组中
                    model.shopOrders.push(shopInfo);
                    // 删除原有map中的数据
                    goodsArrMap.delete(sellerId);
                }
                items.push(model);
            }
        }
        // 一件代发
        if(isSingleFog && this.isOpenSingleFogs){
            let singleFogs = this.feeData.singleFogs ? this.feeData.singleFogs : [];
            // 一件代发list转换成map
            let singleFogsMap = new Map();
            for(let j = 0;j < singleFogs.length;j++){
                let singleFogsItem = singleFogs[j];
                if(singleFogsItem.sellerIds && singleFogsItem.sellerIds.length > 0){
                    singleFogsMap.set(singleFogsItem.sellerIds[0],singleFogsItem);
                }
            }
            let restGoodArr = this.valuesOfMap(goodsArrMap);
            for(let i = 0;i < restGoodArr.length;i++){
                let originRow = restGoodArr[i];
                let singleFogsItem = singleFogsMap.get(originRow.tenantId);
                if(singleFogsItem){
                    let model = new BillConfirmOrderCellModel();
                    model.orderMode = 2;
                    model.shopOrders = [{...originRow}];
                    model.feeMoneyNow = singleFogsItem.fee;
                    model.feeMoneyOrigin = singleFogsItem.feeOrg;
                    items.push(model);
                    // 删除原有map中的数据
                    goodsArrMap.delete(originRow.tenantId);
                }
            }
        }
        // 普通模式
        let restGoodArr = this.valuesOfMap(goodsArrMap);
        for(let i = 0;i < restGoodArr.length;i++){
            let originRow = restGoodArr[i];
            let model = new BillConfirmOrderCellModel();
            model.orderMode = 0;
            model.shopOrders = [{...originRow}];
            items.push(model);
        }
        return items;
    }

    /**
     * 获取Map的values
     * @param map Map
     */
    valuesOfMap = (map: Object)=>{
        let values = [];
        map && map.forEach && map.forEach((row)=>{
            values.push(row);
        });
        return values;
    }

    @action
    setGoodArr(goodsArr: Array<Object>) {
        this.goodsArr = goodsArr;
    }

    /**
     * 设置优惠券模型（包括运费券跟优惠券）
     * @param tenantId
     * @param coupon
     * @param cardType 3运费券 1优惠券
     */
    @action
    setShopCoupon(tenantId: number,coupon: ?Object,cardType: number) {
        let itemIndex = -1;
        let item = this.goodsArr.find((row,i)=>{
            itemIndex = i;
            return row.tenantId === tenantId;
        });
        if(item){
            if(!item.couponInfo){
                item.couponInfo = new BillCouponInfo();
            }
            if(coupon && coupon.cardType !== cardType){
                Toast.show('卡券类型不一致');
                return;
            }
            if(cardType === CouponType.Fee){
                item.couponInfo.feeCoupon = coupon;
            } else {
                item.couponInfo.favorCoupon = coupon;
            }
            // 更新对于店铺卡券信息
            this.goodsArr[itemIndex] = Object.assign({},item,this.getShopCouponParam(item));
        } else {
            //
        }
        // 重新查询卡券数量
        this.queryAvailableCouponCount();
    }

    /**
     * 移除选择的卖家运费券
     * @param orderMode 0普通模式 1合包 2一件代发 3所有
     */
    @action
    removeShopSelectFeeCoupon = (orderMode: number)=>{
        for(let i = 0;i < this.goodsArr.length;i++){
            let shopInfo = this.goodsArr[i];
            if(shopInfo.couponInfo){
                if(orderMode >= 3){
                    shopInfo.couponInfo.feeCoupon = null;
                } else {
                    if(this.getOrderMode(shopInfo.tenantId) === orderMode){
                        shopInfo.couponInfo.feeCoupon = null;
                    }
                }
            }
        }
        // 替换进行刷新
        if(this.goodsArr && this.goodsArr.length > 0){
            let item = this.goodsArr[0];
            this.goodsArr[0] = Object.assign({},item);
        }
    }

    // /**
    //  * 移除卖家所有运费券
    //  */
    // @action
    // removeAllShopFeeCoupon = ()=>{
    //     for(let i = 0;i < this.goodsArr.length;i++){
    //         let shopInfo = this.goodsArr[i];
    //         if(shopInfo.couponInfo){
    //             shopInfo.couponInfo.feeCoupon = null;
    //         }
    //     }
    //     // 替换进行刷新
    //     if(this.goodsArr && this.goodsArr.length > 0){
    //         let item = this.goodsArr[0];
    //         this.goodsArr[0] = Object.assign({},item);
    //     }
    // }

    /**
     * 清空平台运费券
     */
    removePlatFeeCoupon = ()=>{
        this.setPlatCoupon(null,3);
    }

    /**
     * 设置平台券
     * @param coupon
     * @param cardType 3运费券 1优惠券
     */
    @action
    setPlatCoupon(coupon: ?Array<Object>,cardType: number) {
        let index = -1;
        let originCoupon = this.platCoupons.find((row,i)=>{
            index = i;
            return row.cardType === cardType;
        });
        let couponNow = coupon && coupon.length > 0 ? coupon[0] : {};

        if(couponNow.hasOwnProperty('avlExecNum')){
            if(couponNow.cardType !== cardType){

                return;
            }
            // 新增/替换
            if(originCoupon){
                this.platCoupons.splice(index,1,couponNow);
            } else {
                this.platCoupons.push(couponNow);
            }
        } else {
            // 删除
            if(originCoupon){
                this.platCoupons.splice(index,1);
            }
        }
        // 重新查询卡券数量
        this.queryAvailableCouponCount();
    }

    /**
     * 检测一个店铺最多sku数量
     */
    checkSkuCountOutOfRang() {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            let skuCount = 0;
            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    skuCount = NP.plus(skuCount, spuItem.data.length);
                    if (skuCount > 200) {
                        return shopItem;
                    }
                }
            }
        }

        return null;
    }

    /**
     * 合包/一件代发模式的运费优惠（不包括店铺运费券）
     * @returns {string}
     */
    @computed
    get feeFavor(): number {
        let combinativesFavor = 0;
        let singleFogsFavor = 0;
        if(this.feeData.isCombinative && this.feeData.combinatives){
            let combinatives = this.feeData.combinatives;
            for(let i = 0;i < combinatives.length;i++){
                let item = combinatives[i];
                combinativesFavor = NP.plus(combinativesFavor, item.feeOrg - item.fee);
            }
        }
        if(this.feeData.isSingleFog && this.feeData.singleFogs){
            let singleFogs = this.feeData.singleFogs;
            for(let i = 0;i < singleFogs.length;i++){
                let item = singleFogs[i];
                singleFogsFavor = NP.plus(singleFogsFavor, item.feeOrg - item.fee);
            }
        }
        if(this.isOpenCombinative || this.isOpenSingleFogs){
            // return '已为您运费优惠¥' + NP.plus(singleFogsFavor, singleFogsFavor);
            let total = 0;
            if(this.isOpenCombinative){
                total = NP.plus(total,combinativesFavor);
            }
            if(this.isOpenSingleFogs){
                total = NP.plus(total, singleFogsFavor);
            }
            return total;
        } else {
            // 合包，一件代发都未开启
            return NP.plus(combinativesFavor, singleFogsFavor);
        }
    }

    /**
     * 运费总计
     * @returns {number}
     */
    @computed
    get shipFeeMoneyTotal(): number {
        let total = 0;
        for (let i = 0; i < this.goodsArr.length; i++) {
            let shopItem = this.goodsArr[i];
            if (shopItem.shipFeeMoney) {
                total = NP.plus(total, shopItem.shipFeeMoney);
            }
        }
        return total;
    }

    /**
     * 卖家优惠总计（含运费券，现金券，合包）
     */
    @computed get sellerFavorTotal(): number{
        let total = 0;
        // 卖家券
        for (let i = 0; i < this.goodsArr.length; i++) {
            let shopItem = this.goodsArr[i];
            if(shopItem.couponInfo){
                let feeCoupon = shopItem.couponInfo.feeCoupon;
                let favorCoupon = shopItem.couponInfo.favorCoupon;
                if(favorCoupon){
                    total = NP.plus(total,favorCoupon.avlExecNum);
                }
                // 卖家运费券
                if(feeCoupon && this.isNomarlOrder(shopItem.tenantId)){
                    // 不是合包跟一件代发才计算金额
                    total = NP.plus(total,feeCoupon.avlExecNum);
                }
            }
        }

        return total;
    }

    /**
     * 平台优惠总计（含运费券，现金券）
     */
    @computed get platFavorTotal(): number{
        let total = 0;
        // 平台券
        for(let i = 0;i < this.platCoupons.length;i++){
            let coupon = this.platCoupons[i];
            total = NP.plus(total,coupon.avlExecNum);
        }
        // 合包,一件代发
        if(this.isOpenCombinative || this.isOpenSingleFogs){
            total = NP.plus(total,this.feeFavor);
        }
        return total;
    }

    @computed get activityFavorFinal(): number{
        let total = 0;
        // 卖家
        total = NP.plus(total,this.sellerFavorTotal);
        // 平台券
        total = NP.plus(total,this.platFavorTotal);
        // 边界处理：优惠不能超过 总运费+货款
        if(NP.plus(this.shipFeeMoneyTotal,this.totalCheckMoney) < total){
            total = NP.plus(this.shipFeeMoneyTotal,this.totalCheckMoney);
        }
        return NP.round(total,2);
    }

    /**
     * 能否选择平台运费券
     */
    @computed get platfromFeeChooseEnable(): boolean{
        return !this.isOpenSingleFogs && !this.isOpenCombinative;
    }

    /**
     * 是否普通模式包裹（算法需要改进）:合包/一件代发return fasle,其他return true
     */
    isNomarlOrder = (tenantId: number)=>{
        return this.getOrderMode(tenantId) === 0;
    }

    /**
     * 获取包裹的模式
     * @return 0普通模式 1合包 2一件代发
     */
    getOrderMode = (tenantId: number)=>{
        if(this.isOpenSingleFogs && this.feeData.singleFogs){
            let singleFogs = this.feeData.singleFogs;
            for(let i = 0;i < singleFogs.length;i++){
                let item = singleFogs[i];
                let sellers = item.sellerIds;
                for(let j = 0;j < sellers.length;j++){
                    if(sellers[j] === tenantId){
                        return 2;
                    }
                }
            }
        }
        if(this.isOpenCombinative && this.feeData.combinatives){
            let combinatives = this.feeData.combinatives;
            for(let i = 0;i < combinatives.length;i++){
                let item = combinatives[i];
                let sellers = item.sellerIds;
                for(let j = 0;j < sellers.length;j++){
                    if(sellers[j] === tenantId){
                        return 1;
                    }
                }
            }
        }
        return 0;
    }



    // /**
    //  * 运费最终
    //  * @author sml
    //  */
    // @computed get feeFinal(): number {
    //     if(this.isOpenCombinative || this.isOpenSingleFogs){
    //         // 开启合包或者一件代发
    //         if(this.shipFeeMoneyTotal <= this.feeFavor){
    //             return 0;
    //         }
    //         return NP.minus(this.shipFeeMoneyTotal,this.feeFavor);
    //     }
    //     return this.shipFeeMoneyTotal;
    // }


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
                        total = NP.plus(total, NP.times(skuItem.skuNum, skuItem.skuPrice));
                    }
                }
            }
        }
        return total;
    }

    /**
     * 给每个店铺设置收货地址id
     * @param addressId
     */
    @action
    setAddressId(addressId: number) {
        for (let i = 0; i < this.orders.length; i++) {
            let order = this.orders[i];
            order.main.addressId = addressId;
        }
    }

    /**
     * 购物车数据转换为下单数据格式
     * @param goods
     */
    @action
    setGoodsArr(goods: Array<Object>) {
        this.setGoodArr(toJS(goods));

        /**
         * 如果有收货地址 则更新运费
         */
        if (this.acceptInfo) {
            this.requestFreight(()=>{
                runInAction(()=>{
                    if(this.feeData.isSingleFog){
                        this.isOpenSingleFogs = true;
                    }
                    if(this.feeData.isCombinative){
                        this.isOpenCombinative = true;
                    }
                });
            });
        }

        __DEV__ && console.log('setGoodsArr=>', this.orders);
    }

    /**
     * 直接购买时添加到结算界面的货品
     * @param skuArray sku列表
     * @param spu
     * @param shop
     */
    @action
    setGoodArrDirect(skuArray: Array<SKUType>, spu: SPUType, shop: ShopType) {
        for (let i = 0; i < skuArray.length; i++) {
            let skuItem = skuArray[i];
            this.addSKU(skuItem, spu, shop);
        }

        /**
         * 如果有收货地址 则更新运费
         */
        if (this.acceptInfo) {
            this.requestFreight(()=>{
                runInAction(()=>{
                    if(this.feeData.isSingleFog){
                        this.isOpenSingleFogs = true;
                    }
                    if(this.feeData.isCombinative){
                        this.isOpenCombinative = true;
                    }
                });
            });
        }
    }

    // /**
    //  * 设置卖家运费券
    //  */
    // @action
    // setShopFeeFavorMoney = (tenantId: number,money: number)=>{
    //     for(let i = 0;i < this.goodsArr.length;i++){
    //         let item = this.goodsArr[i];
    //         if(item.tenantId === tenantId){
    //             item.shopFeeFavor = money;
    //             return;
    //         }
    //     }
    // }
    //
    // /**
    //  * 设置卖家现金券
    //  */
    // setShopCashFavorMoney = (tenantId: number,money: number)=>{
    //     for(let i = 0;i < this.goodsArr.length;i++){
    //         let item = this.goodsArr[i];
    //         if(item.tenantId === tenantId){
    //             item.cashFeeFavor = money;
    //             return;
    //         }
    //     }
    // }

    /**
     * 直接购买时添加到结算界面的货品
     * @param sku
     * @param spu
     * @param shop
     */
    @action
    addSKU(sku: SKUType, spu: SPUType, shop: ShopType) {
        //判断店铺是否存在(tenantId)
        let shopItem;
        for (let i = 0; i < this.goodsArr.length; i++) {
            if (shop.tenantId === this.goodsArr[i].tenantId) {
                //店铺存在
                shopItem = this.goodsArr[i];
                break;
            }
        }

        //店铺不存在 添加进去  同时spu sku都添加进去
        if (!shopItem) {
            this.goodsArr.push({
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
                shopItem.data.push({
                    spu: [{
                        data: [{
                            ...sku,
                        }],
                        ...spu
                    }]
                });
            } else {
                //spu存在 判断sku是否存在
                let skuItem;
                for (let i = 0; i < spuItem.data.length; i++) {
                    if (sku.skuId === spuItem.data[i].skuId) {
                        //sku存在
                        skuItem = spuItem.data[i];
                        skuItem.checked = sku.checked;
                        skuItem.skuNum = NP.plus(skuItem.skuNum, sku.skuNum);
                        break;
                    }
                }

                if (!skuItem) {
                    spuItem.data.push({
                        ...sku,
                    });
                }
            }
        }
    }

    getShopCouponParam = (shopItem: Object)=>{
        let shopCoupsMoney = 0;
        let mineCouponsIds = '';
        let couponsIds = '';
        let couponsAvlExecNums = '';
        if(shopItem && shopItem.couponInfo){
            let feeCoupon = shopItem.couponInfo.feeCoupon;
            let favorCoupon = shopItem.couponInfo.favorCoupon;

            if(feeCoupon){
                shopCoupsMoney = NP.plus(shopCoupsMoney,feeCoupon.avlExecNum);
                mineCouponsIds += (feeCoupon.id + ',');
                couponsIds += (feeCoupon.couponId + ',');
                couponsAvlExecNums += (feeCoupon.avlExecNum + ',');
            }
            if(favorCoupon){
                shopCoupsMoney = NP.plus(shopCoupsMoney,favorCoupon.avlExecNum);
                mineCouponsIds += (favorCoupon.id + ',');
                couponsIds += (favorCoupon.couponId + ',');
                couponsAvlExecNums += (favorCoupon.avlExecNum + ',');
            }
            // 去除末尾的逗号
            if(mineCouponsIds.length > 0 && couponsIds.length > 0){
                mineCouponsIds = mineCouponsIds.substr(0,mineCouponsIds.length - 1);
                couponsIds = couponsIds.substr(0,couponsIds.length - 1);
                couponsAvlExecNums = couponsAvlExecNums.substr(0,couponsAvlExecNums.length - 1);
            }

        }
        return {
            shopCoupsMoney:shopCoupsMoney,
            mineCouponsIds:mineCouponsIds,
            couponsIds:couponsIds,
            couponsAvlExecNums:couponsAvlExecNums,
        };
    }

    /**
     * 计算一个店铺的订单 需要的信息，如总额，总数等
     * @param shopItem 店铺以及店铺商品信息
     */
    computedShopOrderInfo = (shopItem: Object): Object => {
        let main = {
            sellerId: 0,
            money: 0,
            shopCoupsMoney: 0,
            shipFeeMoney: 0,
            originalMoney: 0,
            totalMoney: 0,
            totalNum: 0,
            payKind: 0,
            couponsIds: '',
            buyerRem: '',
            mineCouponsIds:'',
            hashKey: this.hashKey,
            addressId: 0,
            couponsAvlExecNums:'',
        };
        main.sellerId = shopItem.tenantId;
        main.shipFeeMoney = shopItem.shipFeeMoney;
        main.buyerRem = shopItem.buyerRem;
        main.shopCoupsMoney = shopItem.shopCoupsMoney ? shopItem.shopCoupsMoney : 0;
        main.mineCouponsIds = shopItem.mineCouponsIds ? shopItem.mineCouponsIds : '';
        main.couponsIds = shopItem.couponsIds ? shopItem.couponsIds : '';
        main.couponsAvlExecNums = shopItem.couponsAvlExecNums ? shopItem.couponsAvlExecNums : '';

        for (let j = 0; j < shopItem.data.length; j++) {
            for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                let spuItem = shopItem.data[j].spu[k];
                for (let m = 0; m < spuItem.data.length; m++) {
                    let skuItem = spuItem.data[m];
                    main.money = NP.plus(main.money, NP.times(skuItem.skuPrice, skuItem.skuNum));
                    main.originalMoney = NP.plus(main.originalMoney, skuItem.originalPrice);
                    main.totalNum = NP.plus(main.totalNum, skuItem.skuNum);
                    //todo 付款方式。1 预付，2 货到付款。 没有货到付款,这里先写死
                    main.payKind = 1;
                    //使用的券领用号ids。该订单使用的优惠券领用编号列表，多个逗号分隔
                    // main.couponsIds = '';
                }
            }
        }

        main.totalMoney = NP.round(NP.plus(NP.minus(main.money, main.shopCoupsMoney), main.shipFeeMoney), 2);
        return {main: main};
    };

    /**
     * 根据店铺对象 生成下单需要的货品想去列表
     * @param shopItem
     * @returns {Array}
     */
    genDetails = (shopItem: Object): Array<Object> => {
        let details = [];

        for (let j = 0; j < shopItem.data.length; j++) {
            for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                let spuItem = shopItem.data[j].spu[k];
                for (let m = 0; m < spuItem.data.length; m++) {
                    let skuItem = spuItem.data[m];
                    details.push({
                        cartId: skuItem.id,
                        skuId: skuItem.skuId,
                        spuId: spuItem.spuId,
                        spuCode: spuItem.spuCode,
                        spuDocId: spuItem.spuPic,
                        spuTitle: spuItem.title,
                        spec1: skuItem.spec1,
                        spec1Name: skuItem.spec1Name,
                        spec2: skuItem.spec2,
                        spec2Name: skuItem.spec2Name,
                        spec3: skuItem.spec3,
                        spec3Name: skuItem.spec3Name,
                        num: skuItem.skuNum,
                        originalPrice: skuItem.skuPrice,
                        price: skuItem.skuPrice,
                        money: NP.times(skuItem.skuNum, skuItem.skuPrice)
                    });
                }
            }
        }
        return details;
    };

    /**
     * 设置备注
     * @param tenantId
     * @param rem
     */
    @action
    updateShopRem(tenantId: number, rem: string) {
        for (let i = 0; i < this.goodsArr.slice().length; i++) {
            let shopItem = this.goodsArr[i];
            if (tenantId === shopItem.tenantId) {
                shopItem.buyerRem = rem;
                break;
            }
        }
    }

    /**
     * 请求最新价格 spu的title 更新spec名称
     * @param rows
     */
    @action
    updateRealGoodsInfo(rows: Array<Object>) {

        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];

            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];

                    for (let p = 0; p < rows.length; p++) {
                        let realShop = rows[p];

                        if (spuItem.spuId === realShop.spu.id) {
                            spuItem.title = realShop.spu.title;
                            spuItem.spuCode = realShop.spu.code;
                            for (let m = 0; m < spuItem.data.length; m++) {
                                let skuItem = spuItem.data[m];
                                for (let w = 0; w < realShop.skus.length; w++) {
                                    let realSku = realShop.skus[w];
                                    if (skuItem.skuId === realSku.id) {
                                        skuItem.skuPrice = realSku.price;
                                        skuItem.spec1Name = realSku.ecCaption.spec1;
                                        skuItem.spec2Name = realSku.ecCaption.spec2;
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * 获取默认收货地址
     */
    requestDefaultRecAddress() {
        BillingApiManager.requestDefaultRecAddressProvider({
            jsonParam: {},
        }).then(action(({data}) => {
            this.setAcceptInfo(data);
            this.setAddressId(this.acceptInfo.recInfo.id);
        }), (error) => {
            // 当前没有默认收货地址 则获取用户地址列表中的第一个
            if (error.errorCode === -10) {
                UserApiManager.fetchAddrListProvider()
                    .then(action(({data}) => {
                        let {rows} = data;
                        if(rows && rows.length > 0){
                            let row = rows[0];
                            this.setAcceptInfo(row);
                            this.setAddressId(this.acceptInfo.recInfo.id);
                        }
                    }), (error)=>{
                    });
            }
        });
    }

    hasDefaultRecAddress(id: string, callback: Function) {
        BillingApiManager.requestDefaultRecAddressProvider({
            jsonParam: {},
        }).then(action(({data}) => {
            callback(true);
        }), (error) => {
            callback(false, id);
        });
    }

    /**
     * 保存默认地址到服务器
     * @param callback
     * @param id
     */
    saveDefaultRecAddrress(id: string, callback: Function) {
        UserApiManager.setDefaultRecAddr({
            jsonParam: {
                id: id,
            }
        }).then(action(({data}) => {
            callback(true, 0);
        }), (error) => {
            callback(false, error.message);
        });
    }


    /**
     * 设置收货地址
     * @param info
     */
    @action
    setAcceptInfo(info: Object) {
        this.acceptInfo = info;
        //先清除掉前面的运费信息
        this.clearShopShipFeeMoney();

        if (info) {
            this.requestFreight(()=>{
                runInAction(()=>{
                    this.isOpenCombinative = this.feeData.isCombinative;
                    this.isOpenSingleFogs = this.feeData.isSingleFog;
                });
                this.removePlatFeeCoupon();
                this.removeShopSelectFeeCoupon(3);
            });
        }
    }

    /**
     * 更新运费
     * @param item
     */
    @action
    setShopShipFeeMoney(item: Object) {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            if (shopItem.tenantId === item.sellerId) {
                shopItem.shipFeeMoney = item.fee;
            }
        }
    }

    /**
     * 删除收货地址之后 清除所有的运费为0
     * @param item
     */
    @action
    clearShopShipFeeMoney() {
        let arrAll = this.goodsArr;
        for (let i = 0; i < arrAll.length; i++) {
            let shopItem = arrAll[i];
            shopItem.shipFeeMoney = 0;
        }
    }


    /**
     * 平台现金券优惠
     * @param item
     * @param isFavorite
     */
    @computed
    get platFavorCouponMoneyTotal(): number {
        let total = 0;
        for (let i = 0; i < this.platCoupons.length; i++) {
            if(this.platCoupons[i].cardType === 1){
                total = NP.plus(total, this.platCoupons[i].avlExecNum); 
            }
        }

        return total;
    }

    /**
     * 平台运费券
     */
    @computed
    get platFeeCouponMoneyTotal(): number {
        let total = 0;
        for (let i = 0; i < this.platCoupons.length; i++) {
            if(this.platCoupons[i].cardType === 3){
                total = NP.plus(total, this.platCoupons[i].avlExecNum);
            }
        }

        return total;
    }




    //0-折扣券 1-优惠券 2-礼品券 3-运费卷 用于底部显示
    @computed
    get computedFinalPayMoney(): number {
        // 最终货款
        let goodsMoney = this.totalCheckMoney;
        // 最终运费
        let shipFee = this.shipFeeMoneyTotal;


        let total = 0;

        total = NP.plus(total, goodsMoney);
        total = NP.plus(total, shipFee);

        // shipFee = NP.minus(shipFee, this.couponsFeeShipMoney);
        // if (shipFee < 0) {
        //     shipFee = 0;
        // }
        //
        // goodsMoney = NP.minus(goodsMoney, this.couponsOtherCouponsMoney);
        // if (goodsMoney < 0) {
        //     goodsMoney = 0;
        // }
        //
        // total = NP.plus(goodsMoney, shipFee);
        // if (total < 0) {
        //     total = 0;
        // }

        if(total > this.activityFavorFinal){
            total = NP.minus(total, this.activityFavorFinal);
        } else {
            total = 0;
        }

        total = NP.round(total, 2);

        return total;
    }

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
                        orderNum = NP.plus(orderNum, skuItem.skuNum);
                        spuMoney = NP.plus(spuMoney, NP.times(skuItem.skuNum, skuItem.skuPrice));
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

    @action
    setOrderBtnEnableStatus(enable: boolean) {
        this.canOrderBtnEnable = enable;
    }

    /**
     * 获取运费
     * @param callback
     * @returns {Promise<void>}
     */
    async requestFreight(callback?: Function) {
        if (!this.acceptInfo) {
            return;
        }

        try {
            const result = await BillingApiManager.requestFreightProvider({
                jsonParam: {
                    provinceCode: this.acceptInfo.address.provinceCode,
                    orders: this.configSPUs(),
                }
            });
            result.data.fees.forEach(item => {
                this.setShopShipFeeMoney(item);
            });
            this.setOrderBtnEnableStatus(true);
            this.orderBtnunEnableMsg = '';

            // 设置运费数据
            runInAction(()=>{
                this.feeData = result.data;
            });

            this.queryAvailableCouponCount()
                .then((data) => {

                }, (e) => {
                    //Alert.alert(e.message);
                });
            if(callback){
                callback();
            }
        } catch (e) {
            __DEV__ && console.warn( e.message );
            global.dlconsole.log('运费获取失败' + e.message);
            this.setOrderBtnEnableStatus(false);
            this.orderBtnunEnableMsg = '运费获取失败,请返回重试';
            //获取运费失败
            this.queryAvailableCouponCount()
                .then((data) => {

                }, (e) => {
                    //Alert.alert(e.message);
                });
        }
    }

    /**
     * 配置最终下单的列表
     * @returns {Array<Object>}
     */
    configOrders = () => {
        let goods = this.goodsArr;
        this.orders = [];
        for (let i = 0; i < goods.length; i++) {
            let details = this.genDetails(goods[i]);

            if (details && details.length > 0) {
                this.orders.push({
                    ...this.computedShopOrderInfo(goods[i]),
                    details: details
                });
            }
        }
    };

    /**
     * 配置平台优惠券参数
     */
    configPlatCoupons() {
        let platCoupsMoney = 0;
        let minePlatCouponsIds = '';
        let platCouponsIds = '';
        let platCouponsAvlExecNums = '';

        if (this.platCoupons && this.platCoupons.length > 0) {
            for (let i = 0; i < this.platCoupons.length; i++) {
                platCoupsMoney = platCoupsMoney + this.platCoupons[i].execNum;
                minePlatCouponsIds = minePlatCouponsIds + this.platCoupons[i].id + ',';
                platCouponsIds = platCouponsIds + this.platCoupons[i].couponId + ',';
                platCouponsAvlExecNums = platCouponsAvlExecNums + this.platCoupons[i].avlExecNum + ',';
            }

            return {
                platCoupsMoney: platCoupsMoney,
                minePlatCouponsIds: minePlatCouponsIds,
                platCouponsIds: platCouponsIds,
                platCouponsAvlExecNums:platCouponsAvlExecNums,
            };
        } else {
            return {};
        }
    }


    /**
     * 下单
     */
    async ordering() {
        try {
            this.configOrders();
            this.setAddressId(this.acceptInfo.recInfo.id);
            // 没有存在库存>0的商品时，this.orders中的details不会被放入，此时不应进行下单请求
            if (this.orders.length <= 0) {
                return Promise.reject({message: '所有的商品库存均为0，下单失败'});
            }
            let combOrders = [];
            if(this.isOpenCombinative && this.feeData.combinatives){
                combOrders.push(...this.feeData.combinatives);
            }
            if(this.isOpenSingleFogs && this.feeData.singleFogs){
                combOrders.push(...this.feeData.singleFogs);
            }
            let result = await BillingApiManager.orderingProvider({
                jsonParam: {
                    orders: this.orders,
                    platCoupons: this.configPlatCoupons(),
                    combOrders: combOrders,
                },
            });
            return Promise.resolve(result.data);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    /**
     * 请求实时的价格 库存
     * @param callBack
     */
    getSkusInfoInBatch(callBack: Function) {
        let promisAll = [];
        let arrAll = this.goodsArr;

        for (let i = 0; i < arrAll.length; i++) {
            let spus = [];
            let shopItem = arrAll[i];

            for (let j = 0; j < shopItem.data.length; j++) {
                for (let k = 0; k < shopItem.data[j].spu.length; k++) {
                    let spuItem = shopItem.data[j].spu[k];
                    let item = {
                        spuId: spuItem.spuId,
                        skuIds: []
                    };

                    for (let m = 0; m < spuItem.data.length; m++) {
                        let skuItem = spuItem.data[m];
                        item.skuIds.push(skuItem.skuId);
                    }
                    spus.push(item);
                }
            }

            promisAll.push(BillingApiManager.getSkusInfoInBatch(
                shopItem.clusterCode,
                shopItem.tenantId,
                {
                    jsonParam: {
                        buyerId: rootStore.userStore.user ? rootStore.userStore.user.tenantId : '',
                        spus: spus
                    },
                }));
        }

        Promise.all(promisAll)
            .then(action((result) => {

                let goodsArr = [];

                for (let i = 0; i < result.length; i++) {
                    let resultItem = result[i];
                    if (resultItem.code === 0 && resultItem) {
                        goodsArr.push(...resultItem.data.rows);
                    }
                }
                this.realGoodsInfoList = goodsArr;
                this.updateRealGoodsInfo(goodsArr);
                callBack(true);
            }), (error) => {
                callBack(false, error.message);
            });
    }

    /**
     * 确定SKU最后的下单数量
     * 库存为0的直接 不提交
     * 库存大于0的 按库存的数量提交
     */
    @action
    correctOrderSkuNumbers(callBack: Function) {
        let msg = '';

        let arrAll = this.goodsArr;
        let realSkus = toJS(this.realGoodsInfoList);
        for (let i = arrAll.length - 1; i >= 0; i--) {
            let shopItem = arrAll[i];

            for (let j = shopItem.data.length - 1; j >= 0; j--) {
                for (let k = shopItem.data[j].spu.length - 1; k >= 0; k--) {
                    let spuItem = shopItem.data[j].spu[k];

                    for (let p = realSkus.length - 1; p >= 0; p--) {
                        let realShop = realSkus[p];

                        if (spuItem.spuId === realShop.spu.id) {
                            for (let m = spuItem.data.length - 1; m >= 0; m--) {
                                let skuItem = spuItem.data[m];
                                for (let w = realShop.skus.length - 1; w >= 0; w--) {
                                    let realSku = realShop.skus[w];
                                    if (skuItem.skuId === realSku.id) {
                                        if (skuItem.skuNum > realSku.num) {
                                            msg += spuItem.title + ' ' + skuItem.spec2Name + ' ' + skuItem.spec1Name + '缺' + (skuItem.skuNum - realSku.num) + '件\n';
                                            const groupNum = realSku.groupNum
                                                ? realSku.groupNum
                                                : 1;
                                            skuItem.skuNum = Math.floor(realSku.num / groupNum) * groupNum;
                                        }

                                        // 库存为0的时候需要删除该sku  然后重新请求计算运费
                                        if (realSku.num === 0) {
                                            spuItem.data.splice(w, 1);
                                            //当spu中sku都没有之后 删除当前spu
                                            if (spuItem.data.length === 0) {
                                                shopItem.data[j].spu.splice(k, 1);
                                                //如果店铺中的spu都没有之后删除店铺
                                                if (shopItem.data.length === 0) {
                                                    arrAll.splice(i, 1);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        callBack(msg);
    }

    /**
     * 请求店铺有多少可用优惠券
     * @return {Promise<*>}
     */
    queryShopCanUseCouponsCount = async () => {
        try {
            let {data} = await CouponApiManager.checkOrderAvailableCouponsCount(CouponSvc.configPlat(this.goodsArr.slice(),CouponType.Favor,this.configPlatCoupons()));
            // 保存店铺对应的可用卡券
            let infoMap = new Map();
            // 平台卡券信息
            let platInfo;
            data && data.rows && data.rows.forEach((item: {sellerId: number,cardTypeStatsMap: Object})=>{
                infoMap.set(item.sellerId,item.cardTypeStatsMap);
                if(item.sellerId === -10){
                    platInfo = item.cardTypeStatsMap;
                }
            });
            runInAction(()=>{
                for(let i = 0;i < this.goodsArr.length;i++){
                    let shopInfo = this.goodsArr[i];
                    if(!shopInfo.couponInfo){
                        shopInfo.couponInfo = new BillCouponInfo();
                    }
                    let cardTypeStatsMap = infoMap.get(shopInfo.tenantId);
                    if(cardTypeStatsMap && cardTypeStatsMap[CouponType.Favor + '']){
                        shopInfo.couponInfo.favorCouponAvlCount = cardTypeStatsMap[CouponType.Favor + ''].avlCount;
                    }
                }
                // 替换来刷新列表
                if(this.goodsArr && this.goodsArr.length > 0){
                    this.goodsArr[0] = Object.assign({},this.goodsArr[0]);
                }
                if(platInfo){
                    this.platFeeCouponAvlCount = platInfo[CouponType.Fee + ''].avlCount;
                    this.platFavorCouponAvlCount = platInfo[CouponType.Favor + ''].avlCount;
                }
            });
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // /**
    //  * 请求平台有多少可用优惠券
    //  * @return {Promise<*>}
    //  */
    // queryPlatCanUseCouponsCount = async () => {
    //     try {
    //         let {data} = await CouponApiManager.fetchPlatCoupons(CouponSvc.configPlat(this.goodsArr.slice()));
    //         runInAction(()=>{
    //             let platFavorCouponAvlCount = 0;
    //             let platFeeCouponAvlCount = 0;
    //             data && data.avlCoups && data.avlCoups.forEach((coupon: CouponModel)=>{
    //                 if(coupon.cardType === CouponType.Fee){
    //                     platFeeCouponAvlCount++;
    //                 } else if(coupon.cardType === CouponType.Favor) {
    //                     platFavorCouponAvlCount++;
    //                 }
    //             });
    //             this.platFavorCouponAvlCount = platFavorCouponAvlCount;
    //             this.platFeeCouponAvlCount = platFeeCouponAvlCount;
    //         });
    //         return Promise.resolve(data);
    //     } catch (e) {
    //         return Promise.reject(e);
    //     }
    // };

    /**
     * 查询可以券数量
     */
    queryAvailableCouponCount = async ()=>{
        try {
            let {data} = await CouponApiManager.checkOrderAvailableCouponsCount(CouponSvc.configPlat(this.goodsArr.slice(),null,this.configPlatCoupons()));
            // 保存店铺对应的可用卡券
            let infoMap = new Map();
            // 平台卡券信息
            let platInfo;
            data && data.rows && data.rows.forEach((item: {sellerId: number,cardTypeStatsMap: Object})=>{
                infoMap.set(item.sellerId,item.cardTypeStatsMap);
                if(item.sellerId === -10){
                    platInfo = item.cardTypeStatsMap;
                }
            });
            runInAction(()=>{
                for(let i = 0;i < this.goodsArr.length;i++){
                    let shopInfo = this.goodsArr[i];
                    if(!shopInfo.couponInfo){
                        shopInfo.couponInfo = new BillCouponInfo();
                    }
                    let cardTypeStatsMap = infoMap.get(shopInfo.tenantId);
                    if(cardTypeStatsMap){
                        // 保存店铺优惠券可用数量
                        if(cardTypeStatsMap[CouponType.Favor + '']){
                            shopInfo.couponInfo.favorCouponAvlCount = cardTypeStatsMap[CouponType.Favor + ''].avlCount;
                        }
                        // 保存店铺运费券可用数量
                        if(cardTypeStatsMap[CouponType.Fee + '']){
                            shopInfo.couponInfo.feeCouponAvlCount = cardTypeStatsMap[CouponType.Fee + ''].avlCount;
                        }
                    }

                }
                // 替换来刷新列表
                if(this.goodsArr && this.goodsArr.length > 0){
                    this.goodsArr[0] = Object.assign({},this.goodsArr[0]);
                }
                // 设置平台券数量
                if(platInfo){
                    this.platFeeCouponAvlCount = platInfo[CouponType.Fee + ''].avlCount;
                    this.platFavorCouponAvlCount = platInfo[CouponType.Favor + ''].avlCount;
                }
            });
            return Promise.resolve(data);
        } catch (e) {
            global.dlconsole.log(e.message);
            return Promise.reject(e);
        }
    }

}

