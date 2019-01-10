/**
 *@author xbu
 *@date 2018/08/28
 *@flow
 *@desc   物流信息store
 *
 */


import {observable, computed, action, runInAction} from 'mobx';
import LogisticsApiManager from '../../../apiManager/OrderApiManager';

export default class OrderDetailsStore {
    @observable ReturnBillId: number = 0;
    @observable LogisticsArray: Array<Object> = [];
    @observable OrgReturnData: Array<Object> = [];
    @observable TransportData: Array<Object> = [];
    @observable FlowLogs: Array<Object> = [];
    @observable orgReturnGoods: Array<Object> = [];


    @computed
    get orgReturnGoodsData(): Array<Object> {
        return this.orgReturnGoods;
    }

    // 聚合skus
    @computed
    get methodsReturnData(): Array<Object> {
        let arrayData = [];
        let checkId = [];
        if (this.orgReturnGoods.length) {
            this.orgReturnGoods.forEach((item, index) => {
                let obj = {
                    data: [],
                    flows: item.flows,
                    spuId: 0,
                    spuDocId: '',
                    spuTitle: null,
                    iconIsTrue: false,
                    arrowIsTrue: false
                };
                item.skus.forEach((el) => {
                    checkId.push(el.spuId);
                    obj['spuId'] = index;
                    obj['spuDocId'] = el.spuDocId;
                    obj['spuTitle'] = el.spuTitle;
                    obj['iconIsTrue'] = el.iconIsTrue;
                    obj['arrowIsTrue'] = el.arrowIsTrue;
                    obj.data.push(el);
                });
                arrayData.push(obj);
            });
        }
        return arrayData;
    }

    @computed
    get sort(): number {
        return this.methodsReturnData.length;
    }

    @computed
    get myNeedData(): Array<Object> {

        let newArray = [];
        this.methodsReturnData.forEach((el, index) => {
            let obj = [{
                data: [el],
            }];
            newArray.push({data: obj, title: this.orgReturnGoods[index].trader, flows: el.flows});
        });
        return newArray;
    }


    // 获取订单物流
    @computed
    get logisticsArrayData(): Array<Object> {
        return this.LogisticsArray.slice().reverse();
    }

    // 物流商
    @computed
    get transportList(): Array<Object> {
        return this.TransportData.slice();
    }


    // 流水
    @computed
    get getFlowLogs(): Array<Object> {
        return this.FlowLogs.slice();
    }

    // 获取订单物流
    @action
    requestData = async (id: String, code: String) => {
        try {
            let {data} = await LogisticsApiManager.logistics({logisCompId: code, waybillNo: id,newFlag: 1});
            runInAction(() => {
                this.LogisticsArray = data.Traces ? data.Traces : data.traces ;
            });
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    //退款退货
    @action
    returnData = async (id: String) => {
        try {
            let data = await LogisticsApiManager.returnlogistics({jsonParam: {purId: id}});

            // 处理按钮状态
            if (data.data.rows.length) {
                data.data.rows.forEach((item) => {
                    item.trader['checked'] = false;
                    item.skus.forEach((el, index) => {
                        el['iconIsTrue'] = false;
                        el['arrowIsTrue'] = false;
                        el['checkIsTrue'] = false;
                        el['maxReturn'] = el.skuNum;
                        el['backReturn'] = el.backNum;
                    });
                });
            }

            let flowsArray = [];
            let ReturnBillId = 0;
            data.data.rows.forEach((el) => {
                ReturnBillId = el.bill.id;
                let flowsObj = {};
                flowsObj['flows'] = el.flows;
                flowsArray.push(flowsObj);
            });


            runInAction(() => {
                this.FlowLogs = flowsArray;
                this.ReturnBillId = ReturnBillId;
                this.orgReturnGoods = data.data.rows;
            });
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 获取物流商
    @action
    requestTransStore = async (freshStatus: boolean, obj: Object, callBack: Function) => {
        try {
            let {data} = await LogisticsApiManager.TransStore(obj);
            let length = data.total;
            let rows = data.rows;
            runInAction(() => {
                if (freshStatus) {
                    this.TransportData.push(...rows);
                } else {
                    this.TransportData = rows;
                }
            });
            let objLength = this.TransportData.length;
            if (length === 0) {
                callBack(0);
            } else {
                if (length > objLength) {
                    callBack(1);
                } else {
                    callBack(2);
                }
            }
        } catch (e) {
            return Promise.reject(e);
        }
    };

    //买家保存退货物流
    @action
    sureBtnTrans = async (obj: Object) => {
        try {
            let data = await LogisticsApiManager.sureBtnTrans(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    //买家撤销退货退款
    @action
    buyManRevokeBill = async (obj: Object) => {
        try {
            let data = await LogisticsApiManager.buyManRevokeBill(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    //显示隐藏
    @action
    changeArrowIsTrue(isTrue: boolean, id: number) {
        let data = this.orgReturnGoods;
        data.forEach((el, index) => {
            el.skus.forEach(item => {
                if (id === index) {
                    item['arrowIsTrue'] = isTrue;
                }
            });
        });
    }
}


