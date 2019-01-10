/**
 * @author sml2
 * @date 2018/11/27.
 * @desc 订单运费response
 * @flow
 */

type GoodsFeeType = {
    sellerId: number,
    fee: number,
    shopName: string,
    weight: number,
    shopId: number,
    marketId: number,
}

type GoodsCombinativesDataType = {
    // 1合包 2一件代发
    combinativesType: number,
    fee: number,
    feeOrg: number,
    sellerIds: Array<number>,
    warehouseCid: string,
    warehouseId: string,
    warehouseName: string,
    warehouseUnitId: string,
    weight: number,
}

export default class BillGoodsFeeData{
    // 是否有合包
    isCombinative: boolean = false;
    // 是否有一件代发
    isSingleFog: boolean = false;
    fees: Array<GoodsFeeType>;
    combinatives: Array<GoodsCombinativesDataType>;
    singleFogs: Array<GoodsCombinativesDataType>;
}