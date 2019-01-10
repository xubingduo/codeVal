/**
 *@author xbu
 *@date 2018/08/13
 *@flow
 *@desc
 *
 */

import { observable,computed,action,runInAction } from 'mobx';
import OrderApiManager from '../../../apiManager/OrderApiManager';
import {OrderListBillModel} from '../model/OrderListCombBillModel';

type OrderDetailListType = {
    orderMode: number,
    shopOrders: Array<OrderListBillModel>,
}

type CombBillInfo = {
    // 合包/一件代发运费
    combineFee: number,
    // 原运费
    fee: number,
    totalFee: number,
    totalFeeOrg: number,
    warehouseId: number,
    warehouseUnitId: number,
    warehouseCid: string,
}

export default class OrderDetailsStore {
    @observable orderDetails: Object = {};

    @computed
    get orderDetailsData(): Object {
        return this.orderDetails;
    }

    @computed get detailBillOrders(): Array<OrderDetailListType>{
        let list = this.billList;
        // 先转成Map
        let listBillNoMap = new Map();
        for(let i = 0;i < list.length;i++){
            let row = list[i];
            if(row.bill.ware && row.bill.ware.billNos){
                listBillNoMap.set(row.bill.billNo,row.bill.ware.billNos);
            }
        }
        // 将相同的billNos的订单合并
        let itemMap = new Map();
        for(let i = 0;i < list.length;i++){
            let row = list[i];
            let billNos = listBillNoMap.get(row.bill.billNo);
            let item = itemMap.get(billNos);
            if(!item){
                item = {};
                item.orderMode = this.getOrderMode(row);
                item.shopOrders = [];
                item.shopOrders.push(row);
                itemMap.set(billNos,item);
            } else {
                item.shopOrders.push(row);
            }
        }
        // 普通模式订单
        let normals = [];
        // 一件代发
        let singleLogs = [];
        // 合包
        let compitives = [];
        // 遍历map
        itemMap.forEach((item: OrderDetailListType)=>{
            if(item.orderMode === 0){
                normals.push(item);
            } else if(item.orderMode === 1){
                compitives.push(item);
            } else {
                singleLogs.push(item);
            }
        });
        // 排序数据
        return [...compitives,...singleLogs,...normals];
    }

    /**
     * 获取所有订单列表
     */
    @computed get billList(): Array<OrderListBillModel>{
        let {combBillList,...otherProps} = this.orderDetails;
        if(!otherProps || !otherProps.bill){
            return [];
        }
        let list = [];
        list.push(otherProps);
        if(combBillList){
            list.push(...combBillList);
        }
        return list;
    }

    /**
     * 获取订单模式 0普通 1合包 2一件代发
     * @param billInfo
     */
    getOrderMode = (billInfo: OrderListBillModel)=>{
        if(billInfo.combBill){
            if(billInfo.bill && billInfo.bill.ware.billNos && billInfo.bill.ware.billNos.split(',').length > 1){
                return 1;
            } else {
                return 2;
            }
        } else {
            return 0;
        }
    }

    // 聚合skus
    @computed
    get orderDetailsSkus(): Array<Object> {
        let arrayData = [];
        let checkId =[];
        if(this.orderDetails){
            this.orderDetails.skus.forEach((el)=>{
                let obj = {
                    spuId:'',
                    spuDocId:'',
                    spuTitle: '',
                    data:[],
                };
                let objIndex = checkId.indexOf(el.spuId);
                if( objIndex === -1){
                    checkId.push(el.spuId);
                    obj['spuId'] = el.spuId;
                    obj['spuDocId'] = el.spuDocId;
                    obj['spuTitle'] = el.spuTitle;
                    obj.data.push(el);
                    arrayData.push(obj);
                } else{
                    arrayData[objIndex].data.push(el);
                }

            });
        }
        return arrayData;
    }

    /**
     * 订单合包信息：有值-合包 为空-不是合包
     */
    @computed get combBillInfo(): ?CombBillInfo{
        return this.orderDetails ? this.orderDetails.combBill : null;
    }

    @action
    requestData = async (id: number) => {
        let data = await OrderApiManager.fetchOrderDetails({id: id,isCombFilter:true});
        runInAction(()=>{
            this.orderDetails = data.data;
        });
    };


    // 买家确认收货
    @action
    confirmReceiptGoods = async (id: number) => {
        let objArray = [];
        objArray.push(id);
        try {
            let data = await OrderApiManager.fetchConfirmReceiptGoods({
                jsonParam: {
                    purBillIds: objArray,
                }
            });
            return Promise.resolve(data.data.rows);
        } catch (error) {
            return Promise.reject(error);
        }

    };

    // 取消（关闭）订单
    @action
    cancelOrder = async (id: number,rem: string,cancelKind: string | number,isRetShopCart?: boolean = false) => {
        let jsonParam = {};
        jsonParam.id = id;
        jsonParam.buyerRem = rem;
        jsonParam.cancelKind = cancelKind;
        // 处理取消多个订单
        let ids = (id + '').split(',');
        if(ids.length > 1){
            delete jsonParam.id;
            jsonParam.ids = id;
        }
        let data = await OrderApiManager.fetchCancelOrder({
            jsonParam:jsonParam,
            retShopCart:isRetShopCart,
        });
    };
    
    //提醒发货
    @action
    remembeGoods = async (id: number) => {
        try {
            let data = await OrderApiManager.fetchRemindingShipments({
                billId: id
            });
            return Promise.resolve(data);
        } catch (error) {
            return Promise.reject(error);
        }
    };

    // 延长收货
    @action
    delayGetGoods = async (id: number) => {
        try {
            let data = await OrderApiManager.fetchDelayGetGoods({
                jsonParam:{
                    id: id,
                }
            });
            return Promise.resolve(data);
        } catch (error) {
            return Promise.reject(error);
        }
    };
}
