/**
 *@author xbu
 *@date 2018/10/13
 *@flow
 *@desc  我的优惠券store管理
 *
 */

import { observable,computed,action,runInAction,toJS } from 'mobx';
import CouponApiManager from '../../../apiManager/CouponApiManager';

export default class CouponStore{
    @observable couponHeader: Array<Object> = [
        {
            id: 1,
            name: '全部',
            active: true,
        },
        {
            id: 2,
            name: '优惠券',
            active: false,
        },
        // {
        //     id: 3,
        //     name: '礼品券',
        //     active: false,
        // },
        {
            id: 4,
            name: '运费券',
            active: false,
        },
    ];
    @observable waitUse: number = 0;
    @observable hasUse: number = 0;
    @observable hasOver: number = 0;
    @observable waitUseArray: Array<Object> = [];
    @observable hasUseArray: Array<Object> = [];
    @observable hasOverUseArray: Array<Object> = [];
    @observable getCouponCenterArray: Array<Object> = [];
    @observable couponDetailsObj: Object = {};


    @computed
    get couponListTab(): Array<Object> {
        return [
            {
                key: '0',
                item: {
                    title: `未使用(${this.waitUse})`
                }
            },
            {
                key: '1',
                item: {
                    title: `已使用(${this.hasUse})`
                }
            },
            {
                key: '2',
                item: {
                    title: `已过期(${this.hasOver})`
                }
            }
        ];
    }

    @computed
    get waitUseArr(): Array<Object> {
        return this.waitUseArray.slice();
    }

    @computed
    get hasUseArr(): Array<Object> {
        return this.hasUseArray.slice();
    }

    @computed
    get hasOverUseArr(): Array<Object> {
        return this.hasOverUseArray.slice();
    }

    @computed
    get getCouponCenterArr(): Array<Object> {
        return this.getCouponCenterArray.slice();
    }

    @computed
    get couponDetails(): Object {
        return toJS(this.couponDetailsObj);
    }

    // 手动改变领券状态
    @action
    handlerChangeStore = (id: number,status: number) => {
        let objArray = this.getCouponCenterArray;
        let centerArray = [];
        if(objArray.length){
            objArray.forEach(data=>{
                if(data.couponId === id){
                    let limit = data.userGetNumber + 1;
                    data.userGetNumber = limit;
                    if(limit === data.getLimit){
                        data.userGetFlag = status;
                    }
                }
                centerArray.push(data);
            });
        }
        runInAction(()=>{
            this.getCouponCenterArray = centerArray;
        });
    };


    @action
    actionGetCouponType = (index: number) => {
        runInAction(()=>{
            this.couponHeader.forEach((el,key)=>{
                if(index === key){
                    el.active = true;
                } else {
                    el.active = false;
                }
            });
        });
    };

    // 获取优惠券类型
    @action
    getCouponType = async () => {
        try {
            let {data} = await CouponApiManager.fetchGetCouponType({domain: 'coupTypeDomain'});
            let options = data.options;
            let dataObj = [];
            options.forEach(data=>{
                let obj = {
                    id: data.code,
                    name: data.value,
                    active: false
                };
                dataObj.push(obj);
            });
            runInAction(()=>{
                this.couponHeader.push(...dataObj);
            });
        } catch (e) {
            return Promise.reject(e);
        }
    };

    //  领取领券中心优惠券列表
    @action
    getCouponCenterList = async (freshStatus: boolean,obj: Object,callBack: Function) => {

        try {
            let {data} = await CouponApiManager.fetchCouponCenterList(obj);
            let length = data.total;
            let rows = data.rows;
            runInAction(()=>{
                if(freshStatus){
                    this.getCouponCenterArray.push(...rows);
                } else {
                    this.getCouponCenterArray = rows;
                }
            });
            let objLength = this.getCouponCenterArray.length;
            if(length === 0){
                callBack(0);
            } else {
                if( length > objLength){
                    callBack(1);
                } else {
                    callBack(2);
                }
            }

        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 领取优惠券
    @action
    getCoupon = async (obj: Object) => {
        try {
            let data = await CouponApiManager.fetchCoupon(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 我的优惠券数量统计
    @action
    getMyCouponListCount = async (obj: Object) => {
        try {
            let {data} = await CouponApiManager.fetchMyCouponListCount(obj);
            runInAction(()=>{
                this.waitUse = data['1'];
                this.hasUse = data['2'] + data['3'];
                this.hasOver = data['0'];
            });

            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };


    // 我的优惠券
    @action
    getMyCouponList = async (freshStatus: boolean,obj: Object,callBack: Function) => {
        try {
            let {data} = await CouponApiManager.fetchMyCouponList(obj);
            let length = data.total;
            let rows = data.rows;
            let objLength = 0;
            runInAction(()=> {
                switch (obj.jsonParam.flags){
                // 未使用
                case 1:
                    if(freshStatus){
                        this.waitUseArray.push(...rows);
                    } else {
                        this.waitUseArray = rows;
                    }
                    objLength = this.waitUseArray.length;
                    break;
                    // 已使用
                case '2,3':
                    if(freshStatus){
                        this.hasUseArray.push(...rows);
                    } else {
                        this.hasUseArray = rows;
                    }
                    objLength = this.hasUseArray.length;
                    break;
                    // 已过期
                case 0:
                    if(freshStatus){
                        this.hasOverUseArray.push(...rows);
                    } else {
                        this.hasOverUseArray = rows;
                    }
                    objLength = this.hasOverUseArray.length;
                    break;
                }
            });

            if(length === 0){
                callBack(0,length);
            } else {
                if( length > objLength){
                    callBack(1,length);
                } else {
                    callBack(2,length);
                }
            }

        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 查看优惠券详情
    @action
    lookCouponDetails = async (obj: Object) => {
        try {
            let {data} = await CouponApiManager.fetchLookCouponDetails(obj);
            runInAction(()=>{
                this.couponDetailsObj = data;
            });
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 分享优惠券
    @action
    shareCoupon = async (obj: Object) => {
        try {
            let {data} = await CouponApiManager.fetchShareCoupon(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

}