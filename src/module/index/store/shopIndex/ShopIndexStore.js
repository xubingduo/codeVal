/**
 * author: wwj
 * Date: 2018/8/6
 * Time: 上午11:27
 * des:
 * @flow
 */

import {observable, action, computed, runInAction} from 'mobx';
import ShopApiManager from '../../../../apiManager/ShopApiManager';
import CouponApiManager from '../../../../apiManager/CouponApiManager';
import rootStore from 'store/RootStore';
import ShopDetailModel from '../../model/ShopDetailModel';

const DEFAULT = 0; // 未选中
const DECREASE = 1; // 降序
const INCREASE = 2; // 升序

class ShopIndexStore {
    @observable shopIndexData: Array<Object> = [];

    @observable shopDetailInfo: ShopDetailModel = new ShopDetailModel();
    @observable shopCoupon: Array<Object> = [];
    // 商品类型： 0：首页 3:爆款
    queryType: number = 0;
    // 真实电话相关数据
    @observable observablePhoneMsg: Object = {
        customPhoneType: '',
        customNo: ''
    };

    // 买手评论列表
    @observable buyerCommentList = [];

    @observable sortBtns = [
        {
            text: '销量',
            active: false,
            value: 'sellNum',
            sort: DEFAULT
        },
        {
            text: '价格',
            active: false,
            value: 'pubPrice',
            sort: DEFAULT
        },
        {
            text: '上新时间',
            active: false,
            value: 'marketDate',
            sort: DEFAULT
        }
    ]

    // 虚拟电话相关数据
    @observable observableDummyPhone: Object = {
        relationNum: '',// 绑定的全局格式虚拟号码
        subscriptionId: ''// 绑定关系ID
    };

    showSellNum(): boolean {
        let val = rootStore.configStore.getSysParamByKey('sp_shop_hide_sales');
        if (val && val === '0') {
            return true;
        } else {
            return false;
        }
    }

    @action
    handleSortBtn = (value: string) => {
        const btns = this.sortBtns.slice();
        btns.forEach(item => {
            if (item.value === value) {
                if (item.sort === 2) {
                    item.sort = 0;
                    item.active = false;
                } else {
                    item.sort += 1;
                    item.active = true;
                }
            } else {
                item.active = false;
                item.sort = 0;
            }
        });
        this.sortBtns = btns;
    }

    @action
    resetSortBtns = () => {
        this.sortBtns = [
            {
                text: '销量',
                active: false,
                value: 'sellNum',
                sort: DEFAULT
            },
            {
                text: '价格',
                active: false,
                value: 'pubPrice',
                sort: DEFAULT
            },
            {
                text: '上新时间',
                active: false,
                value: 'marketDate',
                sort: DEFAULT
            }
        ];
    }

    @computed
    get sortBy(): string {
        const btnItem = this.sortBtns.find(item => item.active);
        return btnItem
            ? btnItem.value
            : '';
    }

    @computed
    get orderByDesc(): boolean {
        const btnItem = this.sortBtns.find(item => item.active);
        return btnItem && btnItem.sort === DECREASE
            ? true
            : false;
    }

    @computed
    get shopGoodsListShow(): Array<Object> {
        return this.shopIndexData.slice();
    }

    @computed
    get shopCouponList(): Array<Object> {
        return this.shopCoupon.slice();
    }

    @computed
    get phoneMsg(): Object {
        return this.observablePhoneMsg;
    }

    // 虚拟电话相关数据
    @computed
    get dummyPhone(): Object {
        return this.observableDummyPhone;
    }

    // 门店标签
    @computed get shopLabels(): Array<Object> {
        let shopDetailInfo = this.shopDetailInfo;
        let ecCaption = shopDetailInfo.ecCaption;
        return ecCaption && ecCaption.labels && ecCaption.labels.length > 0 ? ecCaption.labels : [];
    }

    // 门店集群cid
    @computed
    get shopCid(): string {
        let shopDetailInfo = this.shopDetailInfo;
        return shopDetailInfo.clusterCode ? shopDetailInfo.clusterCode : '';
    }

    /**
     * 是否关注
     */
    @computed
    get isFocused(): boolean{
        let shopDetailInfo = this.shopDetailInfo;
        return shopDetailInfo && shopDetailInfo.favorFlag === 1;
    }

    // 排序后的评论列表 废弃，通过接口排序
    @computed
    get sortedBuyerCommentList(): Array<Object> {
        return this.buyerCommentList.slice();
    }

    /**
     * 查询店铺详情信息 如地址关注人数等
     * @param id
     * @param callback
     */
    queryShopDetail(id: number, callback: Function = () => {
    }) {
        ShopApiManager.fetchShopDetailProvider({
            jsonParam: {
                id: id,
            },
            wrapper: true,
        }).then(action(({data}) => {
            if (data) {
                this.shopDetailInfo = data;
            }
            callback(true, 0);
        }), (error) => {
            callback(false, error.message);
        }).catch((error) => {
            callback(false, error.message);
        });
    }

    @action
    fetchBuyerCommentList(fresh: boolean, commonParams: Object, jsonParam: Object) {
        return ShopApiManager.fetchBuyerCommentList(
            Object.assign({jsonParam}, commonParams)
        )
            .then(action(({data}) => {
                if (data && data.rows && data.rows.length > 0) {
                    if (fresh) {
                        this.buyerCommentList = data.rows;
                    } else {
                        this.buyerCommentList.push(...data.rows);
                    }
                }
            }))
            .catch(err => {
                // ignore
            });
    }

    searchShopGoods(fresh: boolean, commonParams: Object, jsonParams: Object, callback: Function) {
        ShopApiManager.fetchShopIndexProvider(Object.assign({
            jsonParam: jsonParams,
        }, commonParams))
            .then(action((result) => {
                let dresStyleResultList = result && result.data ? result.data.dresStyleResultList : null;
                // const {dresStyleResultList} = data;
                if (dresStyleResultList) {
                    if (fresh) {
                        this.shopIndexData = dresStyleResultList;
                    } else {
                        this.shopIndexData.push(...dresStyleResultList);
                    }
                    callback(true, dresStyleResultList.length);
                } else {
                    callback(true, 0);
                }
                
            }), (error) => {
                callback(false, error.message);
            }).catch((error) => {
                callback(false, error.message);
            });
    }

    /**
     * 关注店铺
     * @param id
     * @param name
     * @param callback
     */
    focusShop(shopId: number, shopName: string, callback: Function) {
        ShopApiManager.focusShop({
            jsonParam: {
                shopId: shopId,
                shopName: shopName,
            }
        }).then(action(({data}) => {
            callback(true, shopId);
        })).catch((error) => {
            callback(false, error.message);
        });
    }

    /**
     * 取消关注店铺
     * @param shopId
     * @param callback
     */
    unFocusShop(shopId: number, callback: Function) {
        ShopApiManager.unFocusShop({
            jsonParam: {
                shopId: shopId,
            }
        }).then(action(({data}) => {
            callback(true, shopId);
        })).catch((error) => {
            callback(false, error.message);
        });
    }

    /**
     * 更新点赞数
     * @param id
     * @param praiseFlag
     * @param viewNum
     */
    @action
    updateStarNumByGoodsId(id: number, praiseFlag: number, praiseNum: number) {
        let i = 0;
        let newList = [];
        for (i; i < this.shopIndexData.length; i++) {
            if (this.shopIndexData[i].id === id) {
                this.shopIndexData[i].praiseFlag = praiseFlag;
                this.shopIndexData[i].praiseNum = praiseNum;
            }
            newList.push(this.shopIndexData[i]);
        }
        this.shopIndexData = newList;
    }

    /**
     * 更新店铺关注状态
     * @param tenantId
     * @param favorFlag
     */
    @action
    updateFocusStatusByGoodsId(tenantId: number, favorFlag: number) {
        let i = 0;
        let newList = [];
        for (i; i < this.shopIndexData.length; i++) {
            if (this.shopIndexData[i].tenantId === tenantId) {
                this.shopIndexData[i].favorFlag = favorFlag;
            }
            newList.push(this.shopIndexData[i]);
        }
        this.shopIndexData = newList;
    }

    /**
     * 删除list中的item
     * @param id
     */
    @action
    removeGoodsItem(id: number) {
        let i = 0;
        let newList = [];
        for (i; i < this.shopIndexData.length; i++) {
            if (this.shopIndexData[i].id !== id) {
                newList.push(this.shopIndexData[i]);
            }
        }
        this.shopIndexData = newList;
    }

    /**
     * 更新阅读数
     * @param id
     */
    @action
    updateViewNumByGoodsId(id: number) {
        this.shopIndexData = this.shopIndexData.map((item: Object) => {
            if (item.id === id) {
                item.viewNum += 1;
            }
            return item;
        });
    }

    /**
     * 更新收藏数量
     * @param id
     * @param favorNum
     * @param favorFlag
     */
    @action
    updateFavorNumByGoodsId(id: number, favorNum: number, favorFlag: number) {
        let innerList = this.shopIndexData.slice();
        innerList.forEach((item) => {
            if (item.id === id) {
                item.spuFavorNum = favorNum;
                item.spuFavorFlag = favorFlag;
            }
        });
        this.shopIndexData = innerList;
    }

    /**
     * 买家联系卖家
     * @param mobile
     * @param sellerId
     * @param sellerUnitId
     * @param callback
     */
    consultToSeller(mobile: string, sellerId: number, sellerUnitId: number, userName: string, callback: Function) {
        ShopApiManager.consultToSellerProvider({
            jsonParam: {
                mobile: mobile,
                sellerId: sellerId,
                sellerUnitId: sellerUnitId,
                buyerName: userName ? userName : '',
            }
        }).then(action(({data}) => {
            callback(true, '');
        }), (error) => {
            callback(false, error.message);
        });
    }

    remindSeller(buyerId: number, callback: Function) {
        //console.warn('buyerId=' + buyerId);
        ShopApiManager.remindSellerProvider({
            jsonParam: {
                buyerId: buyerId,
            }
        }).then(action(({data}) => {
            callback(true, 0);
        }), (error) => {
            callback(false, error.message);
        });
    }

    /**
     * 获取店铺优惠券
     * @param obj
     * @return {Promise<*>}
     */
    @action
    getStoreCoupons = async (obj: Object) => {
        try {
            let {data} = await CouponApiManager.fetchSorerCoupons(obj);
            runInAction(() => {
                this.shopCoupon = data.rows;
            });
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 领取优惠券
    @action
    getCoupon = async (obj: Object) => {
        try {
            let data = await CouponApiManager.fetchCoupon(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 获取电话
    @action
    async getShopPhone(tenantId: [Number, String]) {
        try {
            let {data} = await ShopApiManager.getShopPhone({
                tenantId
            });
            runInAction(() => {
                for (let key in data) {
                    if (this.observablePhoneMsg.hasOwnProperty(key)) {
                        this.observablePhoneMsg[key] = data[key];
                    }
                }
            });
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    // bindDummyPhone绑定虚拟电话
    @action
    async bindDummyPhone(jsonParam: Object) {
        return ShopApiManager.bindDummyPhone({
            ...jsonParam
        }).then(({code, data, msg}) => {
            if (code === 0) {
                runInAction(() => {
                    for (let key in data) {
                        if (this.observableDummyPhone.hasOwnProperty(key)) {
                            this.observableDummyPhone[key] = data[key];
                        }
                    }
                });
                return Promise.resolve({code, data, msg});
            } else {
                return Promise.reject({
                    message: msg
                });
            }
        }, err => {
            return Promise.reject(err);
        });
    }

    // bindDummyPhone绑定虚拟电话
    @action
    async unBindDummyPhone() {
        return ShopApiManager.unBindDummyPhone({
            subscriptionId: this.observableDummyPhone.subscriptionId
        }).then(({code, data, msg}) => {
            if (code === 0) {
                runInAction(() => {
                    for (let key in this.observableDummyPhone) {
                        this.observableDummyPhone[key] = '';
                    }
                });
                return Promise.resolve({code, data, msg});
            } else {
                return Promise.reject({
                    message: msg
                });
            }
        }, err => {
            return Promise.reject(err);
        });
    }

    @computed get medalList(): Array<Object> {
        if (!this.shopDetailInfo.medalList) {
            return [];
        }
        let medalList = this.shopDetailInfo.medalList;
        // 过滤未拥有的
        let _returnMedalList = medalList.filter(item => {
            return item['showFlag'] === 1;
        });
        return _returnMedalList;
    }

    // 分享店铺
    @action
    fetchShareStore = async (shopId: Object) => {
        try {
            let data = await ShopApiManager.fetchShareStore(shopId);
            return Promise.resolve(data);
        } catch(e) {
            return Promise.reject();
        }
    }

    // 获取店铺分享的二维码图片
    @action
    fetchShopShareQrCode = async (tid: string, cid: string, extProps: Object) => {
        try{
            let data = ShopApiManager.fetchShopShareQrCode({tid: tid, cid: cid}, extProps);
            return Promise.resolve(data);
        }catch (e) {
            return Promise.reject();
        }

    }
}

export default ShopIndexStore;