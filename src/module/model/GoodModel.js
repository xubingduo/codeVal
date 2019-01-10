/**
 * @author sml2
 * @date 2018/12/13.
 * @desc 货品模型
 * @flow
 */
export interface GoodModel {
    id: number;
    // 1，推荐 0 不推荐
    specialFlag: number;
    // true，爆款 false 非爆款
    hotFlag: number;
    // 是否为上架一个月之内的新品
    newDresFlag: boolean;
    name: string;
    masterClassId: number;
    masterClassName: number;
    title: number;
    // 吊牌价（原价）
    tagPrice: number;
    // 发布价
    pubPrice: number;
    // 销量
    sellNum: number;
    // 阅读量
    viewNum: number;
    // 点赞量
    praiseNum: number;
    // 标签
    labels: string;
    tenantName: string;
    // 集群编码
    clusterCode: string;
    // 店铺地址
    tenantAddr: string;
    // 店铺关注标志, 0 未关注, 1 已关注
    favorFlag: number;
    // 店铺关注人数
    favorNum: number;
    // 商品关注（收藏）标志, 0 未关注, 1 已关注
    spuFavorFlag: number;
    // 商品关注（收藏）人数
    spuFavorNum: number;
    // 店铺logo图片URL
    tenantLogoUrl: string;
    // 详情url，详见备注
    detailUrl: string;
    marketDate: string;
    // 卖家单元id
    unitId: number;
    // 卖家租户id
    tenantId: number;
    // 推荐上新能力位中区分， 0 (00000) 正常搜索出来的商品 1 (00001)热度附加的商品 2(00010) 推荐位查出来的商品
    // 4 (00100)款 8 (01000)推荐上新商品 16 (10000)一个月内上新商品 能力位可能有交叉 比如17(10001) 即是热度附加的商品又是 一个月内上新商品
    showCaption: number;
    /**
     * head视频图像url，list数据结构，jsonArray的字符串
     * typeId	short	文档类型，1 图片，2 文本，3 视频
     * docUrl	string	文档url
     * coverUrl	string	视频封面URL(类型为视频时启用)
     */
    docHeader: string;
    // 同docHeader
    docContent: string;
    // 是否选中
    checked: boolean;
}