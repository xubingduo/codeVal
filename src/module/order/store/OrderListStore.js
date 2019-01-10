/**
 *@author xbu
 *@date 2018/07/27
 *@flow
 *@desc 订单列表
 *
 */

import { observable,computed,action,runInAction } from 'mobx';
import OrderApiManager from '../../../apiManager/OrderApiManager';
import I18n from 'gsresource/string/i18n';

export default class OrderListStore {
    @computed
    get areaListShow(): Array<Object> {
        return [
            {
                key: '0',
                item: {
                    title: I18n.t('all')
                }
            },
            {
                key: '1',
                item: {
                    title: I18n.t('waitPay')
                }
            },
            {
                key: '2',
                item: {
                    title: I18n.t('toDeliver')
                }
            },
            {
                key: '3',
                item: {
                    title: I18n.t('toReceive')
                }
            },
            {
                key: '4',
                item: {
                    title: I18n.t('hasDone')
                }
            }
        ];
    }

    // 所以订单 原始数据
    @observable ListAll: Array<Object> = [];
    @observable ListPayGoods: Array<Object> = [];
    @observable ListPendingGoods: Array<Object> = [];
    @observable ListReceivedGoods: Array<Object> = [];
    @observable ListDoneGoods: Array<Object> = [];
    @observable AfterSaleGoods: Array<Object> = [];


    @computed
    get orderListAll(): Array<Object> {
        let data = [];
        if(this.ListAll.length){
            data = this.ListAll.map((el) => {
                el.data = (el.skus).slice();
                return el;
            });
        }

        return data;
    }

    @computed
    get orderListPayGoods(): Array<Object> {
        let data = [];
        if(this.ListPayGoods.length){
            data = this.ListPayGoods.map((el) => {
                el.data = (el.skus).slice();
                return el;
            });
        }
        return data;
    }

    @computed
    get orderListPendingGoods(): Array<Object> {
        let data = [];
        if(this.ListPendingGoods.length){
            data = this.ListPendingGoods.map((el) => {
                el.data = (el.skus).slice();
                return el;
            });
        }
        return data;
    }

    @computed
    get orderListReceivedGoods(): Array<Object> {
        let data = [];
        if(this.ListReceivedGoods.length){
            data = this.ListReceivedGoods.map((el) => {
                el.data = (el.skus).slice();
                return el;
            });
        }
        return data;
    }

    @computed
    get orderListDoneGoods(): Array<Object> {
        let data = [];
        if(this.ListDoneGoods){
            data = this.ListDoneGoods.map((el) => {
                el.data = (el.skus).slice();
                return el;
            });
        }
        return data;
    }

    @computed
    get AfterSale(): Array<Object> {
        let data = [];
        if(this.AfterSaleGoods.length){
            data = this.AfterSaleGoods.map((el) => {
                el.data = (el.skus).slice();
                return el;
            });
        }
        return data;
    }


    // 数据请求
    @action
    getOrderListData = async (fresh: boolean, dataObj: Object , callBack: Function) => {
        let obj = {
            pageSize: dataObj.pageSize,
            pageNo: dataObj.pageNo,
            statusType: dataObj.statusType,
            searchToken: dataObj.searchToken,
            isCombFilter:true,
        };
        // if(dataObj.searchToken){
        //     obj['searchToken'] = dataObj.searchToken;
        // }

        let data = await OrderApiManager.fetchOrderList(obj);
        let newData = data.data.rows;
        newData.forEach((val,index)=>{
            val.bill['sort'] = val.skus.length;
            let indexof = [];
            let elData = [];
            val.skus.forEach((el,ind)=>{
                let el_index = indexof.indexOf(el.spuId);
                if( el_index === -1){
                    indexof.push(el.spuId);
                    elData.push(el);
                }else {
                    elData[el_index].skuNum = elData[el_index].skuNum + el.skuNum;
                }
            });
            val.skus = elData;
        });

        setTimeout(()=>{
            runInAction(()=>{
                const {rows} = data.data;
                console.log('type' + dataObj.statusType ,rows);
                if (rows) {
                    if (fresh) {
                        switch (dataObj.statusType) {
                        case 0:
                            this.ListAll = rows;
                            break;
                        case 1:
                            this.ListPayGoods = rows;
                            break;
                        case 2:
                            this.ListPendingGoods = rows;
                            break;
                        case 3:
                            this.ListReceivedGoods = rows;
                            break;
                        case 4:
                            this.ListDoneGoods = rows;
                            break;
                        case 5:
                            this.AfterSaleGoods = rows;
                            break;
                        }
                    } else {
                        switch (dataObj.statusType) {
                        case 0:
                            this.ListAll.push(...rows);
                            break;
                        case 1:
                            this.ListPayGoods.push(...rows);
                            break;
                        case 2:
                            this.ListPendingGoods.push(...rows);
                            break;
                        case 3:
                            this.ListReceivedGoods.push(...rows);
                            break;
                        case 4:
                            this.ListDoneGoods.push(...rows);
                            break;
                        case 5:
                            this.AfterSaleGoods.push(...rows);
                            break;
                        }
                    }
                    callBack(true, rows.length);
                } else {
                    callBack(true, 0);
                }
            });
        },1000);
    };

    // 手动删除待付款订单
    @action
    deleteOrderListPayGoods(id: string){
        let newObj = [];
        let allObj = [];
        // 转成Map
        let idMap = new Map();
        (id + '').split(',').forEach((value)=>{
            idMap.set(value,value);
        });
        this.ListPayGoods.forEach(el=>{
            // 不是需要删除的单据id,则保留新数组
            if(!idMap.get(el.bill.id + '')){
                newObj.push(el);
            }
        });
        // 全部置为交易已关闭
        this.ListAll.forEach(el=>{
            if(el.bill.id === id){
                el.bill['frontFlag'] = 5;
                el.bill['frontFlagName'] = '已关闭';
            }
            allObj.push(el);
        });


        runInAction(()=>{
            this.ListPayGoods = newObj;
            this.ListAll = allObj;
        });
    }

    // 手动删除待收货订单
    @action
    deleteOrderListReceivedGoods(id: number){
        let newObj = [];
        let allObj = [];
        this.ListReceivedGoods.forEach(el=>{
            if(el.bill.id !== id){
                newObj.push(el);
            }
        });

        // 全部置为交易已关闭
        this.ListAll.forEach(el=>{
            if(el.bill.id === id){
                el.bill['frontFlag'] = 4;
            }
            allObj.push(el);
        });

        runInAction(()=>{
            this.ListReceivedGoods = newObj;
            this.ListAll = allObj;
        });
    }


    //  监控评价状态改变
    @action
    changeFlagEva(id: String){
        let newObj = [];
        let allObj = [];

        //已完成
        this.ListDoneGoods.forEach(el=>{
            if(el.bill.id === id){
                el.bill['flag'] = 9;
            }
            newObj.push(el);
        });

        // 全部
        this.ListAll.forEach(el=>{
            if(el.bill.id === id){
                el.bill['flag'] = 9;
            }
            allObj.push(el);
        });


        runInAction(()=>{
            this.ListDoneGoods = newObj;
            this.ListAll = allObj;
        });
    }

    //  手动更改申请状态
    @action
    changeApplayData(id: String, type: number){
        let newObj = [];
        let allObj = [];
        let DoneObj = [];
        let listDone = [];

        //待收货
        this.ListReceivedGoods.forEach(el=>{
            if(el.bill.id === id){
                el.bill['backFlag'] = type;
                if( el.bill.backFlag === 10){
                    el.bill['backFlagName'] = '申请退款';
                } else {
                    el.bill['backFlagName'] = '申请退货退款';
                }
            }
            newObj.push(el);
        });

        // 待发货
        this.ListPendingGoods.forEach(el=>{
            if(el.bill.id === id){
                el.bill['backFlag'] = type;
                if(el.bill.backFlag === 10){
                    el.bill['backFlagName'] = '申请退款';
                } else {
                    el.bill['backFlagName'] = '申请退货退款';
                }
            }
            DoneObj.push(el);
        });

        // 全部
        this.ListAll.forEach(el=>{
            if(el.bill.id === id){
                el.bill['backFlag'] = type;
                if(el.bill.backFlag === 10){
                    el.bill['backFlagName'] = '申请退款';
                } else {
                    el.bill['backFlagName'] = '申请退货退款';
                }
            }
            allObj.push(el);
        });

        //已完成
        this.ListDoneGoods.forEach(el=>{
            if(el.bill.id === id){
                el.bill['backFlag'] = type;
                if(el.bill.backFlag === 10){
                    el.bill['backFlagName'] = '申请退款';
                } else {
                    el.bill['backFlagName'] = '申请退货退款';
                }
            }
            listDone.push(el);
        });

        runInAction(()=>{
            this.ListReceivedGoods = newObj;
            this.ListAll = allObj;
            this.ListPendingGoods = DoneObj;
            this.ListDoneGoods= listDone;
        });
    }


    //撤销更改状态
    @action
    RevokeDataType (obj: Object) {
        let allData = [];
        let waitData = [];
        let waitDataGet = [];
        let hasFlag = [];

        let id = obj.id;
        let flag = obj.flag;
        let frontFlag = obj.frontFlag;
        let frontFlagName = obj.frontFlagName;
        let backFlag = obj.backFlag;
        let backFlagName = obj.backFlagName;
        let backMoney = obj.backMoney;

        //待收货
        this.ListReceivedGoods.forEach(el=>{
            if(el.bill.id === id){
                el.bill['frontFlag'] = frontFlag;
                el.bill['frontFlagName'] = frontFlagName;
                el.bill['flag'] = flag;
                el.bill['backFlag'] = backFlag;
                el.bill['backFlagName'] = backFlagName;
                el.bill['backMoney'] = backMoney;
            }
            waitDataGet.push(el);
        });

        // 待发货
        this.ListPendingGoods.forEach(el=>{
            if(el.bill.id === id){
                el.bill['frontFlag'] = frontFlag;
                el.bill['frontFlagName'] = frontFlagName;
                el.bill['flag'] = flag;
                el.bill['backFlag'] = backFlag;
                el.bill['backFlagName'] = backFlagName;
                el.bill['backMoney'] = backMoney;
            }
            waitData.push(el);
        });

        // 全部
        this.ListAll.forEach(el=>{
            if(el.bill.id === id){
                el.bill['frontFlag'] = frontFlag;
                el.bill['frontFlagName'] = frontFlagName;
                el.bill['flag'] = flag;
                el.bill['backFlag'] = backFlag;
                el.bill['backFlagName'] = backFlagName;
                el.bill['backMoney'] = backMoney;
            }
            allData.push(el);
        });

        //已完成
        this.ListDoneGoods.forEach(el=>{
            if(el.bill.id === id){
                el.bill['frontFlag'] = frontFlag;
                el.bill['frontFlagName'] = frontFlagName;
                el.bill['flag'] = flag;
                el.bill['backFlag'] = backFlag;
                el.bill['backFlagName'] = backFlagName;
                el.bill['backMoney'] = backMoney;
            }
            hasFlag.push(el);
        });

        runInAction(()=>{
            this.ListReceivedGoods = waitDataGet;
            this.ListAll = allData;
            this.ListPendingGoods = waitData;
            this.ListDoneGoods = hasFlag;
        });
    }

}