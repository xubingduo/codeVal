/**
 * author: tuhui
 * Date: 2018/10/16
 * Time: 17:11
 * @flow
 * des:选择优惠券
 */
import {computed, action, observable, toJS} from 'mobx';
import CouponApiManager, {fetchShopCoupons} from '../../../apiManager/CouponApiManager';
import NP from 'number-precision';
import CouponSvc from '../../coupon/svc/CouponSvc';

export default class SelectCouponStore {
    /**
     * 请求返回可用的优惠券
     */
    @observable availableCoupons: Array<Object> = [];
    /**
     * 请求返回不可用的优惠券
     */
    @observable unavailableCoupons: Array<Object> = [];

    /**
     * 货品信息(请求平台优惠券时)
     */
    @observable goods: Object;
    /**
     * 进来的时候初始化选中的优惠券
     * @type {Array}
     */
    @observable selectedCoupons: Array<Object> = [];

    @observable cardType: number;
    // 平台卡券参数
    @observable platCouponParam: {minePlatCouponsIds: string,platCouponsIds: string};

    @action
    setCardType(cardType: number){
        this.cardType = cardType;
    }

    @action
    setPlatCouponParam(platCouponParam: Object){
        this.platCouponParam = platCouponParam;
    }

    @computed
    get hasCoupons(): boolean {
        return this.availableCoupons.length > 0 || this.unavailableCoupons.length > 0;
    }

    getSelectedCoupon() {
        let data = [];
        if (this.availableCoupons) {
            for (let i = 0; i < this.availableCoupons.length; i++) {
                if (this.availableCoupons[i].checked) {
                    data.push(this.availableCoupons[i]);
                }
            }
        }
        return data;
    }

    /**
     * 有没有运费券已经被选中
     * @return {boolean}
     */
    hasFeeShipCouponsSelected() {
        for (let j = 0; j < this.availableCoupons.length; j++) {
            if (this.availableCoupons[j].cardType === 3 && this.availableCoupons[j].checked) {
                return true;
            }
        }

        return false;
    }

    /**
     * 有没有优惠券已经被选中
     * @return {boolean}
     */
    hasOtherCouponsSelected() {
        for (let j = 0; j < this.availableCoupons.length; j++) {
            if (this.availableCoupons[j].cardType !== 3 && this.availableCoupons[j].checked) {
                return true;
            }
        }

        return false;
    }


    @action
    selectOne(selectedCoupons: Object, callBack: Function) {
        if (this.availableCoupons) {

            if (selectedCoupons === null) {
                for (let i = 0; i < this.availableCoupons.length; i++) {
                    this.availableCoupons[i].checked = false;
                }
            } else {
                for (let j = 0; j < this.availableCoupons.length; j++) {
                    // if (this.availableCoupons[j].id === selectedCoupons.id) {
                    //
                    //     if (this.availableCoupons[j].cardType === 3) {
                    //         if (this.hasFeeShipCouponsSelected() && !this.availableCoupons[j].checked) {
                    //             //提示重复
                    //             callBack('同类型的优惠券只能选择一张');
                    //             return;
                    //         }
                    //     } else {
                    //         if (this.hasOtherCouponsSelected() && !this.availableCoupons[j].checked) {
                    //             //提示重复
                    //             callBack('同类型的优惠券只能选择一张');
                    //             return;
                    //         }
                    //     }
                    //
                    //     this.availableCoupons[j].checked = !this.availableCoupons[j].checked;
                    // }
                    this.availableCoupons[j].checked = this.availableCoupons[j].id === selectedCoupons.id;

                }
            }
        }
    }

    @action
    setSelectCoupons(selectedCoupons: Array<Object>) {
        this.selectedCoupons = selectedCoupons;
    }


    @action
    setGoods(allGoods: Object) {
        this.goods = allGoods;
    }

    @action
    setAvailableCoupons(coupons: Array<Object>) {
        this.availableCoupons = coupons;

        if (this.selectedCoupons && this.availableCoupons) {
            for (let i = 0; i < this.selectedCoupons.length; i++) {
                let selectItem = this.selectedCoupons[i];
                for (let j = 0; j < this.availableCoupons.length; j++) {
                    let item = this.availableCoupons[j];
                    if (item.id === selectItem.id) {
                        item.checked = true;
                    }
                }
            }
        }
    }

    @action
    setUnAvailableCoupons(coupons: Array<Object>) {
        this.unavailableCoupons = coupons;
    }

    @computed
    get availableCouponsListShow(): Array<Object> {
        return toJS(this.availableCoupons).sort((item1,item2)=>{
            return item1.avlExecNum < item2.avlExecNum ? 1 : -1;
        });

    }

    @computed
    get unavailableCouponsListShow(): Array<Object> {
        return this.unavailableCoupons.slice();
    }

    /**
     * 请求卖家的可用优惠券
     * @return {Promise<*>}
     */
    @action
    queryShopCoupons = async () => {
        try {
            let {data} = await CouponApiManager.fetchShopCoupons(CouponSvc.configPlat(this.goods.slice(), this.cardType,this.platCouponParam));
            this.resolveResponseData(data);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    /**
     * 请求平台优惠券
     * @return {Promise<*>}
     */
    queryPlatCoupons = async () => {

        try {
            let {data} = await CouponApiManager.fetchPlatCoupons(CouponSvc.configPlat(this.goods.slice(), this.cardType));

            this.resolveResponseData(data);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    @action
    resolveResponseData(data: Object) {
        if (data.avlCoups && data.avlCoups.length > 0) {

            for (let i = 0; i < data.avlCoups.length; i++) {
                Object.assign(data.avlCoups[i], {checked: false});
            }

            this.setAvailableCoupons(data.avlCoups);
        }

        if (data.unavlCoups && data.unavlCoups.length > 0) {
            for (let i = 0; i < data.unavlCoups.length; i++) {
                Object.assign(data.unavlCoups[i], {checked: false});
            }
            this.setUnAvailableCoupons(data.unavlCoups);
        }
    }
}

