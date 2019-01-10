/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品详情组件-购买弹出窗
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-21 11:56:34
 * @flow
 */

import {observable, computed, action, toJS, runInAction} from 'mobx';
import {deepClone} from 'outils';

import {goodsBuyUtil, goodsColorSizeMinusAdd, mininGoodsOrder} from '../util/GoodsBuyUtil';
import shopApiManager,{fetchWatchGoods} from 'apiManager/ShopApiManager';
import {fetchGoodsDetail, fetchGoodsStar, fetchGoodsAddFavor, fetchGoodscCancelFavor} from 'apiManager/GoodsApiManager';
import OrderApiManager from 'apiManager/OrderApiManager';
import DocSvc from 'svc/DocSvc';
import rootStore from 'store/RootStore';
import {SYS_CONFIG_PARAMS} from 'store/ConfigStore';



export default class GoodsBuyStore {
    @observable favorFlag: number = 0;
    @observable favorNum: number = 0;
    @observable showPay: boolean = false;
    @observable showPayOrg: boolean = false;

    @computed
    get phoneMsg(): Object {
        return this.observablePhoneMsg;
    }

    @observable observablePhoneMsg: Object = {
        customPhoneType: '',
        customNo: ''
    };

    // 虚拟电话相关数据
    @observable observableDummyPhone: Object = {
        relationNum: '',// 绑定的全局格式虚拟号码
        subscriptionId: ''// 绑定关系ID
    };

    // 虚拟电话相关数据
    @computed
    get dummyPhone(): Object {
        return this.observableDummyPhone;
    }

    @computed
    get goodsDetail(): Object {
        return toJS(this.goodsDetailMsg);
    }

    @computed
    get totalGroupNum(): number {
        let result = 0;
        this.goodsDetail.skuList.forEach(color => {
            result += color.sizeList[0].buyNum;
        });
        return result;
    }

    // 获取图片
    @computed
    get goodsDetailImg(): Array<string> {
        let item = this.goodsDetail;

        let data = [];
        let _SpuListWithImage = [];
        let isEmpty = (JSON.stringify(item) == '{}');
        if(isEmpty){
            return data;
        }
        let spuList = typeof (item.docContent) === 'string' ? JSON.parse(item.docContent) : item.docContent;
        for (let i = 0; i < spuList.length; i++) {
            const item = spuList[i];
            if (item.typeId === 1) {
                item.docCdnUrl && item.docCdnUrl.org && _SpuListWithImage.push(item.docCdnUrl.org);
            } else {
                _SpuListWithImage.unshift(item.coverUrl);
            }
        }
        return _SpuListWithImage;
    }


    // copy获取图片
    @computed
    get goodsDetailImgCopy(): Array<string> {
        let item = this.goodsDetail;
        let data = [];
        let isEmpty = (JSON.stringify(item) == '{}');
        if(isEmpty){
            return data;
        }
        let spuList = typeof (item.docContent) === 'string' ? JSON.parse(item.docContent) : item.docContent;
        let _SpuListWithImage = [];

        for (let i = 0; i < spuList.length; i++) {
            const item = spuList[i];
            if (item.typeId === 1) {
                _SpuListWithImage.push(item);
            } else {
                _SpuListWithImage.unshift(item);
            }
        }
        return _SpuListWithImage;
    }

    // 弹出的大图
    @computed
    get goodsDetailImgPop(): Array<string> {
        let item = this.goodsDetail;
        let data = [];
        let isEmpty = (JSON.stringify(item) == '{}');
        if(isEmpty){
            return data;
        }
        let spuList = typeof (item.docContent) === 'string' ? JSON.parse(item.docContent) : item.docContent;
        let _SpuListWithImage = [];
        for (let i = 0; i < spuList.length; i++) {
            const item = spuList[i];
            if (item.typeId === 1) {
                item.docCdnUrl && item.docCdnUrl.org && _SpuListWithImage.push(item.docCdnUrl.org);
            }
        }
        return _SpuListWithImage;
    }


    // 分组模式下获取该组最小库存为最大可卖量
    getMaxNumInGroup(colorItem: Object): number {
        let num = Number.MAX_SAFE_INTEGER;
        // this.goodsDetail.skuList.forEach(item => {
        //     num = Math.min(num, item.num);
        // });
        colorItem.sizeList.forEach(sizeItem => {
            num = Math.min(num, sizeItem.num);
        });
        return num;
    }

    // 可改变数据
    @observable goodsDetailMsg: Object = {};
    // 保存的数据源码
    @observable goodsDetailMsgOrg: Object = {};
    // 评价
    @observable _buyerCommentList: Array<Object> = [];

    @computed
    get buyerCommentList(): Array<Object> {
        return this._buyerCommentList.filter(item => item.flag === 1);
    }

    // 获取商品详情
    @action
    async getGoodsDetail(parseUrl: string) {
        return new Promise((resolve: Function, reject: Function) => {
            fetchGoodsDetail(parseUrl).then(({data}) => {
                let dataOrg = goodsBuyUtil(data);
                let canPlay = false;
                dataOrg.docContent.forEach(el => {
                    if(el.typeId === 3){
                        canPlay = true;
                    }
                });

                runInAction(() => {
                    this.goodsDetailMsg = dataOrg;
                    this.goodsDetailMsgOrg = dataOrg;
                    this.favorFlag = data.spu.favorFlag;
                    this.favorNum = data.spu.favorNum;
                    this.showPay = canPlay;
                    this.showPayOrg = canPlay;
                });
                resolve(data);
            }, err => {
                reject(err);
            });
        });
    }

    // 获取买手说商品评价列表
    fetchBuyerComment(params: Object): Promise<string> {
        return new Promise((resolve: Function, reject: Function) => {
            return shopApiManager.fetchBuyerCommentList(params)
                .then(action(({data}) => {
                    if (data && data.rows && data.rows.length > 0) {
                        this._buyerCommentList = data.rows;
                    }
                    resolve(data);
                }))
                .catch(err => {
                    reject(err);
                });
        });
    }

    // TODO
    @action
    async getGoodsDetailAgain(parseUrl: string, orderFullUrl: any) {
        // let fetchGoodsDetailPromise = fetchGoodsDetail(parseUrl);
        // let getReplenishForBuyerPromise = OrderApiManager.getReplenishForBuyer(spuId, billNo);
        // return Promise.all([fetchGoodsDetailPromise, getReplenishForBuyerPromise]).then(res => {
        //     console.error(res);
        //     let goodsDetailMsg = res[0].data;
        //     let lastOrderDetail = res[1].data.rows;
        //     let goodsOrderDetailMsg = mininGoodsOrder(goodsDetailMsg, lastOrderDetail);
        //     runInAction(() => {
        //         this.goodsDetailMsg = goodsBuyUtil(goodsOrderDetailMsg);
        //         this.favorFlag = goodsOrderDetailMsg.spu.favorFlag;
        //         this.favorNum = goodsOrderDetailMsg.spu.favorNum;
        //     });
        //     Promise.resolve(goodsOrderDetailMsg);
        // }).catch(error => {
        //     Promise.reject(error);
        // });
        return new Promise((resolve: Function, reject: Function) => {
            fetchGoodsDetail(parseUrl).then(({data}) => {
                let goodsDetailMsg = data;
                OrderApiManager.getReplenishForBuyer(orderFullUrl).then(res => {
                    let lastOrderDetail = res.data.rows;
                    let goodsOrderDetailMsg = mininGoodsOrder(goodsDetailMsg, lastOrderDetail);
                    runInAction(() => {
                        this.goodsDetailMsg = goodsBuyUtil(goodsOrderDetailMsg);
                        this.favorFlag = goodsOrderDetailMsg.spu.favorFlag;
                        this.favorNum = goodsOrderDetailMsg.spu.favorNum;
                    });
                    resolve(goodsOrderDetailMsg);
                }).catch(err => {
                    reject(err);
                });
            }, error => {
                reject(error);
            });
        });
    }

    @action
    colorClick(color: Object) {
        let goods = deepClone(this.goodsDetailMsg);
        goods['skuList'].forEach((element) => {
            if (element.spec2 === color.spec2) {
                element.active = true;
            } else {
                element.active = false;
            }
        });
        runInAction(() => {
            this.goodsDetailMsg = goods;
        });
    }

    //
    @action
    goodsColorSizeMinusAdd(color: Object, size: Object, value: number) {
        runInAction(() => {
            this.goodsDetailMsg = goodsColorSizeMinusAdd(this.goodsDetailMsg, color, size, value);
        });
    }

    @action
    kidGoodsColorSizeMinusAdd(color: Object, value: number) {
        color.sizeList.forEach(size => {
            runInAction(() => {
                this.goodsDetailMsg = goodsColorSizeMinusAdd(this.goodsDetailMsg, color, size, value);
            });
        });
    }

    @action
    async getShopPhone(tenantId: [Number, String]) {
        try {
            let {data} = await shopApiManager.getShopPhone({
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
        return shopApiManager.bindDummyPhone({
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
        return shopApiManager.unBindDummyPhone({
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

    // 改变收藏数
    @action
    changeFav = () => {
        let data = this.favorFlag;
        if (data === 0) {
            this.favorFlag = 1;
            this.favorNum = this.favorNum + 1;
        } else {
            this.favorFlag = 0;
            this.favorNum = this.favorNum - 1;
        }
    };

    // 添加收藏
    @action
    fetchGoodsAddFavor = async (param: Object) => {
        try {
            let data = await fetchGoodsAddFavor(param);
            return Promise.resolve(data);
        } catch (e) {
            this.changeFav();
            return Promise.reject(e);
        }

    };

    // 取消收藏
    @action
    fetchGoodsCancelFavor = async (param: Object) => {
        try {
            let data = await fetchGoodscCancelFavor(param);
            return Promise.resolve(data);
        } catch (e) {
            this.changeFav();
            return Promise.reject(e);
        }
    };


    // 获取图片
    getImg = () => {
        let goods = this.goodsDetailMsg;
        let spuDocId = '';
        let docHeader = goods.docHeader.slice();
        let docContent = goods.docContent.slice();

        docHeader.forEach(ele => {
            if (ele.coverFlag && ele.coverFlag === 1) {
                spuDocId = ele.docId;
            }
        });
        docContent.forEach(ele => {
            if (ele.coverFlag && ele.coverFlag === 1) {
                spuDocId = ele.docId;
            }
        });
        if (!spuDocId) {
            spuDocId = docContent[0].docId || docContent[0].docId;
        }
        return spuDocId;
    };

    // 获取二维码
    @action
    fetchRqCode = async (param: Object, goodsObj: Object) => {
        try {
            let data = await shopApiManager.fetchRqCode(param._cid, param._tid, param.spuId, param.extProps,goodsObj);
            return Promise.resolve(data);
        } catch (e) {
            this.changeFav();
            return Promise.reject(e);
        }
    };

    // 重制数据
    @action
    resetData = () => {
        runInAction(()=>{
            this.goodsDetailMsg = this.goodsDetailMsgOrg;
        });
    };

    // 播放视屏控制
    @action
    changePlayBtn = (isTrue: boolean) => {
        runInAction(()=>{
            this.showPay = isTrue;
        });
    };

    // 分享是否显示价格
    @action
    showSharePrice(): boolean {
        let val = rootStore.configStore.getSysParamByKey(SYS_CONFIG_PARAMS[2]);
        if (val && val === '0') {
            return true;
        } else {
            return false;
        }
    }

    // 分享 modal风格
    @action
    showShareModalStyle(): boolean {
        let val = rootStore.configStore.getSysParamByKey(SYS_CONFIG_PARAMS[3]);
        if (val && val === '0') {
            return true;
        } else {
            return false;
        }
    }


    @action
    watchGoodsNumber = async(obj: Object) => {
        try {
            let data = await fetchWatchGoods(obj);
            return Promise.resolve(data);
        } catch (e) {
            this.changeFav();
            return Promise.reject(e);
        }
    }

}
