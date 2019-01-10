/**
 * @author sml2
 * @date 2018/10/30.
 * @desc 店铺信息
 * @flow
 */

import {ListResponse} from 'model/base';

type ShopDetailDresBiType = {
    // 累计销售
    sellNum: number;
    skuNums: number;
    // 累计上新
    spuNums: number;
    spuOnlineNums: number;
    spuTotal: number;
}

export type MedalType = {
    code: string;
    logoDoc: string;
    lastDate: string;
    showOrder: number;
    ruleKind: number;
    showFlag: number;
}

export interface NewShopResponse extends ListResponse <ShopDetailModel> {}

export default class ShopDetailModel {
    // 店铺状态 0 失效 1 有效 2 待审核(暂时用不到)
    flag: number = 0;
    // 所在单元id
    unitId: number = 0;
    // 名称
    name: string = '';
    // logo文件id
    logoPic: string = '';
    // 门头照片
    headPic: string = '';
    // 内景照片
    contentPic: string = '';
    // 标签能力位，1，2，4，8二进制的十位数表示
    // tagsList: Array = [];
    // 好店评级，决定好店的排序
    score: number = 0;
    // 详细地址
    detailAddr: string = '';
    // 0，未关注，1，关注
    favorFlag: number = 0;
    // 收藏数
    favorNum: number = 0;
    // 好评数
    likeNum: number = 0;
    id: number = 0;
    // 关注数
    concernNum: number = 0;
    tenantId: number = 0;
    createdBy: number = 0;
    updatedBy: number = 0;
    // 发货地址
    deliverDetailAddr: string = '';
    // 店铺地址
    shopAddr: string = '';
    videoId: string = '';
    coverUrl: string = '';
    coverPic: string = '';
    doorNo: string = '';
    marketName: string = '';
    medalList: Array<MedalType> = [];
    dresBi: ShopDetailDresBiType;
    // 标签
    labels: string = '';
    // ecCaption
    ecCaption: Object;
    clusterCode: '';
}