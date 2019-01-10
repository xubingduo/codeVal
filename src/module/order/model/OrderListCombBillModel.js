/**
 * @author sml2
 * @date 2018/12/7.
 * @desc
 * @flow
 */
import type {SPUType,SKUType} from 'module/model/ShoppingCartModel';
import CouponModel,{CouponType} from 'module/model/CouponModel';

type OrderBillInfoType = {
    addressId: number,
    backFlag: number,
    backMoney: number,
    backNum: number,
    favorMoney: number,
    flag: number,
    id: number,
    frontFlag: number,
    money: number,
    payFlag: number,
    payKind: number,
    salesBillId: number,
    shipFeeMoney: number,
    shopCoupsMoney: number,
    totalMoney: number,
    totalNum: number,
    backFlagName: string,
    billNo: string,
    buyerRem: string,
    frontFlagName: string,
    logisCompName: string,
    logisCompid: string,
    logisData: [],
    proTime: string,
    procFlag: string,
    waybillNo: string,
    confirmTime: string,
    //
    sort?: number,
    ware: {
        billNos: string,
    }
}

type OrderCombBillInfoType = {
    billNos: string,
    collectionNo: string,
    combineFee: number,
    combineNo: number,
    fee: number,
    spPurBillIds: string,
    totalFee: number,
    totalFeeOrg: number,
    warehouseCid: string,
    warehouseId: number,
    warehouseUnitId: number,
}

type OrderCoupBillInfoType = {
    platCoupsMoney: number,
    platFeeCoupsMoney: number,
    platShopCoupsMoney: number,
    platShopFeeCoupsMoney: number,
    shopCoupsMoney: number,
    shopFeeCoupsMoney: number,
}

type OrderTraderInfoType = {
    clusterCode: string,
    detailUrl: string,
    logoPic: string,
    tenantId: number,
    unitId: number,
    tenantName: string,
}

export class OrderListBillModel{
    bill: OrderBillInfoType;
    combBill: OrderCombBillInfoType;
    coupBill: OrderCoupBillInfoType;
    skus: Array<SKUType> = [];
    coupons: [];
    trader: OrderTraderInfoType;
}

export default class OrderListCombBillModel{
    // combBillList存在，说明是合包单数据
    combBillList: Array<OrderListBillModel>;
    bill: OrderBillInfoType;
    combBill: OrderCombBillInfoType;
    coupBill: OrderCoupBillInfoType;
    skus: Array<SKUType>;
    coupons: [];
    trader: OrderTraderInfoType;
    // 订单总金额
    billTotalMoney: number = 0;
}