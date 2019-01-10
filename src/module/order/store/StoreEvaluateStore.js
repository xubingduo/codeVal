/**
 *@author xbu
 *@date 2018/08/17
 *@flow
 *@desc  订单评价
 *
 */

import { observable, action, computed ,runInAction } from 'mobx';
import OrderApiManager from '../../../apiManager/OrderApiManager';

export default class StoreEvaluateStore {

    @observable logisticsScore: Array<boolean> = [false,false,false,false,false];
    @observable goodsScore: Array<boolean> = [false,false,false,false,false];


    @computed
    get logisticsCompute(): Array<boolean> {
        return this.logisticsScore.slice();
    }

    @computed
    get goodsCompute(): Array<boolean> {
        return this.goodsScore.slice();
    }

    // 点赞
    @action
    requestData = async (id: string) => {
        try {
            let data = await OrderApiManager.fetchThumbsUp({
                id: id
            });
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }

    };

    // 点击评价
    @action
    requestUpdateData = async (obj: Object) => {
        try {
            let data = await OrderApiManager.fetchEvaluateUpdate(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 物流评分
    @action
    actionLogistics = (score: number) => {
        let data = [];
        this.logisticsScore.map((item,index)=>{
            if(score >= index){
                data.push(true);
            } else {
                data.push(false);
            }
        });
        runInAction(()=>{
            this.logisticsScore = data;
        });
    };

    // 物流评分
    @action
    actionGoodsScore = (score: number) => {
        let data = [];
        this.goodsScore.map((item,index)=>{
            if(score >= index){
                data.push(true);
            } else {
                data.push(false);
            }
        });
        runInAction(()=>{
            this.goodsScore = data;
        });
    };

    // 查看订单评价
    @action
    lookEvaluate = async (obj: Object) => {
        try {
            let data = await OrderApiManager.fetchLookEvaluate(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };
}