/**
 * @author sml2
 * @date 2018/11/27.
 * @desc
 * @flow
 */

import type {SPUType,SKUType} from 'module/model/ShoppingCartModel';
import CouponModel,{CouponType} from 'module/model/CouponModel';

export type BillConfirmOrderGoodsSpuType = {
    checked: boolean,
    salesWayId: number,
    spuFlag: number,
    spuId: number,
    spuList: string,
    spuName: string,
    spuPic: string,
    title: string,
    data: Array<SKUType>,
}

export class BillCouponInfo {
    // 运费卡券模型
    feeCoupon: ?CouponModel;
    // 可用运费卡券数量
    feeCouponAvlCount: number = 0;
    // 优惠卡券模型
    favorCoupon: ?CouponModel;
    // 可用优惠卡券数量
    favorCouponAvlCount: number = 0;
}

export type BillConfirmOrderShopGoodsCellItemType = {
    addressId: string,
    buyerRem: string,
    clusterCode: number,
    couponsCount: number,
    hashKey: string,
    payKind: number,
    shipFeeMoney: number,
    shopCoupsMoney: number,
    mineCouponsIds: string,
    couponsIds: string,
    tenantId: number,
    totalMoney: number,
    traderName: string,
    unitId: string,
    coupons: string,
    data: Array<{
        spu: Array<BillConfirmOrderGoodsSpuType>,
    }>,
    couponItems: Array<CouponModel>;
    // 卡券信息
    couponInfo: ?BillCouponInfo,
}

export class BillConfirmOrderCellModel{
    // 0普通模式 1合包 2一件代发
    orderMode: number = 0;
    // 门店订单
    shopOrders: Array<BillConfirmOrderShopGoodsCellItemType> = [];
    // 现邮费
    feeMoneyNow: number = 0;
    // 原邮费
    feeMoneyOrigin: number = 0;
}