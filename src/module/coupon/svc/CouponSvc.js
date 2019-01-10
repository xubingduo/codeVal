/**
 *@author tutu
 *@date 2018/10/31
 *@flow
 *@desc  优惠券的工具类
 *
 */
import NP from 'number-precision';

export default class CouponSvc {
    /**
     * 商品本身的价格总和
     */
    static computedShopOrderTotalMoney(shopItem: Object): Object {
        let result = {
            totalMoney: 0,
            totalCount: 0,
            shipFeeMoney: 0,
        };
        shopItem.data.forEach(item => {
            item.spu.forEach(spuItem => {
                spuItem.data.forEach(skuItem => {
                    result.totalMoney = NP.plus(result.totalMoney, NP.times(skuItem.skuPrice, skuItem.skuNum));
                    result.totalCount = NP.plus(result.totalCount, skuItem.skuNum);
                });
                result.shipFeeMoney = shopItem.shipFeeMoney;
            });
        });

        return result;
    }

    static configPlat(goods: Array<Object>, cardType: ?number,platCouponsParam?: Object = {}): Object {
        let jsonParam = {
            orders: [],
            cardType: cardType,
            platCoupons:platCouponsParam,
        };

        if (!goods) {
            return jsonParam;
        }

        for (let i = 0; i < goods.length; i++) {
            let shopItem = goods[i];
            let shopGather = this.computedShopOrderTotalMoney(shopItem);

            let main = {
                sellerId: shopItem.tenantId,
                money: shopGather.totalMoney,
                totalNum: shopGather.totalCount,
                shipFeeMoney: shopGather.shipFeeMoney,
                mineCouponsIds:shopItem.mineCouponsIds ? shopItem.mineCouponsIds : '',
                couponsIds:shopItem.couponsIds ? shopItem.couponsIds : '',
                checkFlag: shopItem.checkFlag ? shopItem.checkFlag : 0,
                couponsAvlExecNums: shopItem.couponsAvlExecNums ? shopItem.couponsAvlExecNums : '',
            };

            let details = [];
            shopItem.data.forEach(item => {
                item.spu.forEach(spuItem => {
                    spuItem.data.forEach(skuItem => {
                        details.push({
                            skuId: skuItem.skuId,
                            spuId: spuItem.spuId,
                            num: skuItem.skuNum,
                            money: NP.times(skuItem.skuNum, skuItem.skuPrice)
                        });
                    });
                });
            });

            jsonParam.orders.push({
                main: main,
                details: details,
            });
        }

        return {
            jsonParam: jsonParam,
        };
    }
}