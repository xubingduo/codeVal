/**
 * author: tuhui
 * Date: 2018/7/31
 * Time: 14:26
 * @flow
 * des:
 */

export type SKUType = {
    //服务端返回的每条记录的id,初始为空
    id: number,
    //sku的唯一标示
    skuId: number,
    //规格1
    spec1: number,
    //规格1名称
    spec1Name: string,
    //规格2
    spec2: number,
    //规格2名称
    spec2Name: string,
    //规格3
    spec3: number,
    //规格3名称
    spec3Name: string,
    //价格
    skuPrice: number,
    //数量
    skuNum: number,
    //总金额
    money: number,
    //是否选中
    checked: boolean,
    //原价
    originalPrice: number,
    //库存
    invNum: number,
    //童装模式一组数量
    groupNum: number,
    // 
    salesWayId: number,
    // 款号名称
    spuTitle?: string,
    // 图片链接
    spuDocId?: string,
}

export type SPUType = {
    spuId: number,
    //款式名称
    spuName: string,
    //款式描述
    title: string,
    //款式封面url
    spuPic: string,
    //spu图片id列表
    spuList: Array<string>,
    //是否选中
    checked: boolean,
    //类别id
    classId: number,
    //状态 1正常  其他是失效
    spuFlag: number,
    // 卖货模式
    salesWayId: number,
    //
    data: Array<SKUType>,
}

export type ShopType = {
    //店铺名称
    traderName: string,
    //店铺id
    tenantId: number,
    //卖家单元id
    unitId: number,
    money: number,
    shopCoupsMoney: number,
    shipFeeMoney: number,
    totalMoney: number,
    totalNum: number,
    payKind: number,
    buyerRem: string,
    hashKey: string,
    addressId: string,
    //是否选中
    checked: boolean,
    //优惠券ids
    couponIds: string,
    //优惠券名称
    coupons: string
}


