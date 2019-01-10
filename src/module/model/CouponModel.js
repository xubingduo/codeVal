/**
 * @author sml2
 * @date 2018/11/29.
 * @desc
 * @flow
 */

export const CouponType = {
    // 运费券
    Fee:3,
    // 礼品券
    Gifts:2,
    // 优惠券
    Favor:1,
};

export default class CouponModel{
    // 卡券大类：1优惠券、2礼品券、3运费券
    cardType: number;
    // 库存数量
    quantity: number;
    // 卡劵所属单元Id:-10 平台 其他表示门店
    couponUnitId: number;
    color: string;
    // 分享能力位：0没有能力 1可分享
    shareBits: number;
    // 生效时间(大于等于该时间)，’yyyy-MM-dd’格式
    effectiveDate: string;
    // 到期时间（小于等于该时间），’yyyy-MM-dd’格式
    expiresDate: number;
    // 领取后有效时间，0表示无限制 其他表示具体数值
    receiveEffectPeriod: number;
    // 领取后有效时间的单位，默认天：0年, 1月, 2天, 3时
    receiveEffectPeriodUnit: number;
    // 卡券可见范围类型: 0普通券 1内部券
    scopeType: number;
    // 	领券限制，每个用户领券上限，如不填，则默认为1
    getLimit: number;
    // 达成金额
    fulfilValue: number;
    // 优惠金额
    execNum: number;
    // 实际可用的优惠金额；如满10减20的券，商品只有12元，那avlExecNum=12
    avlExecNum: number = 0;
    // 先不传，后台自动填充
    domainKind: number;
    // 优惠类型:5满额减（cardType=1/3），9满额赠（cardType=2）
    execType: number;
    // json cardType=2时代表赠送的物品id,格式如[{“id”:”赠送商品id”,num”:”赠送商品的数量”,”caption”:”赠送商品的名称”}]
    execOther: string;
}