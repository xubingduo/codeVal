/**
 *@author wengdongyang
 *@date 2018/07/27
 *@desc  频道列表
 *@flow
 */
import React from 'react';
import { action } from 'mobx';
import { deepClone } from 'outils';
import ShopApiManager, { fetchWatchGoods } from 'apiManager/ShopApiManager';
import {
    fetchGoodsStar,
    fetchGoodsAddFavor,
    fetchGoodscCancelFavor
} from 'apiManager/GoodsApiManager';

import UserApiManager from 'apiManager/UserApiManager';

export default class GoodsItemStore {
    @action
    async toggleFocusOnClick(goods: Object) {
        // 未关注状态=》关注
        if (goods['favorFlag'] === 0) {
            let jsonParam = {
                jsonParam: {
                    shopId: goods['tenantId'],
                    shopName: goods['tenantName'],
                    rem: ''
                }
            };
            return await ShopApiManager.focusShop(jsonParam);
        }
        // 关注状态=》取消关注
        if (goods['favorFlag'] === 1) {
            let jsonParam = {
                shopId: goods['tenantId']
            };
            return await ShopApiManager.unFocusShop(jsonParam);
        }
    }

    @action
    async toggleStarClick(goods: Object) {
        let praiseFlag = goods.praiseFlag || 0;
        let currentGoodsId = goods['id'];
        // 未点赞状态=》点赞
        if (praiseFlag === 0) {
            let param = {
                jsonParam: {
                    spuId: goods['id'], // 商品spu的ID
                    sellerId: goods['tenantId'], // 卖家租户ID
                    sellerUnitId: goods['unitId'] // 卖家单元ID
                }
            };
            return await fetchGoodsStar(param);
        }
        // 关注状态=》取消关注
        if (praiseFlag === 1) {
            return new Promise((resolve: Function) => {
                resolve({
                    code: -1,
                    msg: '暂不支持取消点赞功能'
                });
            });
        }
    }

    @action
    async deleteClick(goods: Object) {
        let currentGoodsId = goods['id'];
        return new Promise((resolve: Function) => {
            resolve({
                code: 0,
                id: currentGoodsId
            });
        });
    }

    @action
    async watchGoods(goods: Object, type: Number) {
        let jsonParam = {
            jsonParam: {
                spuId: goods['id'], // 商品spu的ID
                sellerId: goods['tenantId'], // 卖家租户ID
                sellerUnitId: goods['unitId'], // 卖家单元ID
                type: type
            }
        };
        return await fetchWatchGoods(jsonParam);
    }

    @action
    async toggleGoodsFavor(goods: Object) {
        let spuFavorFlag = goods.spuFavorFlag || 0;
        let spuDocId = '';
        goods.docHeader.forEach(ele => {
            if (ele.coverFlag && ele.coverFlag === 1) {
                spuDocId = ele.docId;
            }
        });
        goods.docContent.forEach(ele => {
            if (ele.coverFlag && ele.coverFlag === 1) {
                spuDocId = ele.docId;
            }
        });
        if (!spuDocId) {
            spuDocId = goods.docHeader[0].docId || goods.docContent[0].docId;
        }
        // 未收藏=》收藏
        if (spuFavorFlag === 0) {
            let param = {
                jsonParam: {
                    spuDocId: spuDocId, // 商品图片
                    spuId: goods['id'], // 商品spu的ID
                    spuTitle: goods['title'], //
                    shopId: goods['tenantId'], // 卖家租户ID
                    shopName: goods['unitId'] // 卖家单元ID
                }
            };
            return await fetchGoodsAddFavor(param);
        }
        // 收藏=》取消收藏
        if (spuFavorFlag === 1) {
            let param = {
                jsonParam: {
                    spuId: goods['id'] // 商品spu的ID
                }
            };
            return await fetchGoodscCancelFavor(param);
        }
    }

    /**
     * 保存用户倾向
     */
    saveUserTendency = async (goods: Object, tendencyType: number) => {
        // 1本商品 2类别 3板式 4风格 等不感兴趣
        if (tendencyType === 1) {
            await UserApiManager.saveUserTendency({
                jsonParam: {
                    typeId: 0,
                    tendencyType: 1,
                    tendencyId: goods.id
                }
            });
        } else {
            let promiseGoods = UserApiManager.saveUserTendency({
                jsonParam: {
                    typeId: 0,
                    tendencyType: 1,
                    tendencyId: goods.id
                }
            });

            let jsonParams = {
                typeId: 0,
                tendencyType: tendencyType,
                tendencyId: ''
            };
            if (tendencyType === 2) {
                jsonParams.tendencyId = goods.classId;
            } else if (tendencyType === 3) {
                jsonParams.tendencyId = '0';
            } else if (tendencyType === 4) {
                jsonParams.tendencyId = goods.esProps.theme;
            }
            let promiseOther = UserApiManager.saveUserTendency({
                jsonParam: jsonParams
            });
            await Promise.all([promiseGoods, promiseOther])
                .then(() => {
                    return Promise.resolve();
                })
                .catch(error => {
                    return Promise.reject(error);
                });
        }
    };
}
