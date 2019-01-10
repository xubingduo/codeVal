/**
 *@author xbu
 *@date 2018/08/13
 *@flow
 *@desc
 *
 */

import { observable,computed,action,runInAction } from 'mobx';
import OrderApiManager from '../../../apiManager/OrderApiManager';

export default class OverTimeStore {
    @observable orderDetails: Object = {};
    @observable skus: Array<Object> = [];
    @observable trader: Object = null;
    @observable bill: Object = null;


    @computed
    get orderDetailsData(): Object {
        return this.orderDetails;
    }

    // 聚合skus
    @computed
    get orderReturnGoodsSkus(): Array<Object> {
        let arrayData = [{data:[]}];
        let elData = [];
        if(this.skus.length){
            this.skus.forEach((el)=>{
                let el_index = elData.indexOf(el.spuId);
                if( el_index === -1){
                    elData.push(el.spuId);
                    arrayData[0].data.push(el);
                }else {
                    arrayData[0].data[el_index].skuNum = arrayData[0].data[el_index].skuNum + el.skuNum;
                }
            });
        }
        console.log(arrayData);
        return arrayData.slice();
    }


    @action
    requestData = async (id: number) => {
        try {
            let {data} = await OrderApiManager.fetchOrderDetails({id: id});
            runInAction(()=>{
                this.orderDetails = data;
                this.skus = data.skus;
                this.trader = data.trader;
                this.bill = data.bill;
            });
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 是否满足退款48小时
    @action
    returnGoods = async(obj: Object) => {
        try {
            let data = await OrderApiManager.fetchOverTime(obj);
            return Promise.resolve(data);
        }catch (e) {
            return Promise.reject(e);
        }
    };

    @action
    returnGoodsList = async(obj: Object) => {
        try {
            let data = await OrderApiManager.fetchCreateBillApiManager(obj);
            return Promise.resolve(data);
        }catch (e) {
            return Promise.reject(e);
        }
    }



}
