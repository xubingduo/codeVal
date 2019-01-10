/**
 *@author xbu
 *@date 2018/09/05
 *@flow
 *@desc   退货退款
 *
 */


import {observable, computed, action, runInAction,toJS} from 'mobx';
import OrderApiManager from 'apiManager/OrderApiManager';
import NP from 'number-precision';

export default class ReturnGoodsStore {
    @observable getMoney: number = 0;
    @observable getReturnMoney: number = 0;
    @observable sortNumber = 0;
    @observable checkAll: boolean = false;
    @observable orgReturnGoods: Object;

    @computed
    get orgReturnGoodsData(): Object {
        return this.orgReturnGoods;
    }

    // 聚合skus
    @computed
    get methodsReturnData(): Array<Object> {
        let arrayData = [];
        let checkId = [];
        if (this.orgReturnGoods) {
            this.orgReturnGoods.skus.forEach((el) => {
                let obj = {
                    spuId:'',
                    spuDocId: '',
                    spuTitle: '',
                    iconIsTrue: '',
                    arrowIsTrue: '',
                    data: []
                };
                let objIndex = checkId.indexOf(el.spuId);
                if (objIndex === -1) {
                    checkId.push(el.spuId);
                    obj['spuId'] = el.spuId;
                    obj['spuDocId'] = el.spuDocId;
                    obj['spuTitle'] = el.spuTitle;
                    obj['iconIsTrue'] = el.iconIsTrue;
                    obj['arrowIsTrue'] = el.arrowIsTrue;
                    obj.data.push(el);
                    arrayData.push(obj);
                } else {
                    arrayData[objIndex].data.push(el);
                }
            });
        }

        console.log('jajjaj====>',arrayData);
        return arrayData;
    }

    @computed
    get sort(): number {
        return this.methodsReturnData.length;
    }

    @computed
    get myNeedData(): Array<Object> {
        return [{
            data: [{
                data: this.methodsReturnData,
            }],
            title: this.orgReturnGoods.trader,
        }];
    }

    //创建退款退货单
    @action
    createReturnBill = async (obj: Object) => {
        try {
            let data = await OrderApiManager.fetchCreateBillApiManager(obj);
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    // 获取退货列表
    @action
    getReturnGoodsList = async (id: Number) => {
        try {
            let {data} = await OrderApiManager.fetchReturnOrderDetails({id: id});


            if (data.trader) {
                data.trader['checked'] = false;
                data.skus.forEach((el, index) => {
                    el['iconIsTrue'] = false;
                    el['arrowIsTrue'] = false;
                    el['checkIsTrue'] = false;
                    el['maxReturn'] = el.skuNum;
                    el['backReturn'] = el.backNum;
                    el['skuNum'] = el.skuNum - el.backNum;
                });
            }

            runInAction(() => {
                this.orgReturnGoods = data;
                // let storePrice = data.bill.favorMoney; // 商家修改价格
                // let shipFeeMoney = 0; // 运费金额
                // let money = 0; // 退款金额
                // if(storePrice === 0){ //商家不改价格
                //     shipFeeMoney = NP.minus(data.bill.totalMoney,data.bill.shipFeeMoney);
                //     money= NP.minus(shipFeeMoney,data.bill.backMoney);
                // } else {
                //     let goodsTotal = NP.plus(data.bill.money,data.bill.shipFeeMoney); // 商品价格 + 运费
                //     let rate = NP.divide(data.bill.money,goodsTotal); // 商品的比列
                //     let rateTowBit = NP.round(rate, 2);
                //     money = NP.round(NP.times(data.bill.totalMoney, rateTowBit),2);
                // }
                this.getReturnMoney = data.bill.totalMoney;

            });

        } catch (e) {
            return Promise.reject(e);
        }

    };

    // 选择全部 尺寸
    @action
    chooseGoodsSize(is_check: boolean) {
        let data = this.orgReturnGoods;
        data.trader.checked = is_check;
        this.checkAll = is_check;
        data.skus.forEach((el) => {
            el['iconIsTrue'] = is_check;
            el['checkIsTrue'] = is_check;
        });
        this.getTotalMoney();
    }

    // 全选获取到金额
    @action
    getTotalMoney() {
        let data = this.orgReturnGoods.skus;
        let total = 0;
        data.forEach((el) => {
            if (el.checkIsTrue) {
                let nub = NP.times(el.skuNum, el.skuAvgPrice);
                total = NP.plus(total,nub);
            }
        });

        if(total > this.getReturnMoney){
            this.getMoney= this.getReturnMoney;
            // this.getReturnMoney = total;
        }else {
            this.getMoney= total;
        }
    }

    //单个获取增减
    @action
    getSingleClick(value: number, id: number) {
        let org_data = this.orgReturnGoods;
        let data = org_data.skus;
        data.forEach((el) => {
            if (el.skuId === id) {
                el.skuNum = value;
            }
        });
        this.getTotalMoney();
    }

    // 选中单个
    @action
    singleChecked(isTrue: boolean, id: number) {
        let data = this.orgReturnGoods;
        let spuId = null;
        data.skus.forEach((el) => {
            if (id === el.skuId) {
                el['checkIsTrue'] = isTrue;
                spuId = el.spuId;
            }
        });

        runInAction(()=>{
            this.orgReturnGoods = toJS(data);
            this.getTotalMoney();
        });
        this.singleCheckedIsAll(spuId);
    }

    // 选中单个之后肯能是全选
    @action
    singleCheckedIsAll (id: any) {
        let data = this.orgReturnGoods;
        let len = data.skus.length;
        let lenData = 0;
        data.skus.forEach((el) => {
            if (el.checkIsTrue) {
                lenData ++;
            }
        });


        if(len === lenData){
            this.checkAll = true;
            this.chooseGoodsSize(true);
        } else {
            data.skus.forEach((el) => {
                if(el.spuId === id){
                    el['iconIsTrue'] = this.getEqualSupId(id);
                }
            });
            this.checkAll = false;
            data.trader.checked = false;
        }
    }


    // 全选单个Spu
    @action
    checkSPUChangeAll(isTrue: boolean, id: number){
        let data = this.orgReturnGoods;
        data.skus.forEach((el) => {
            if (id === el.spuId) {
                el['checkIsTrue'] = isTrue;
            }
        });

        runInAction(()=>{
            this.orgReturnGoods = toJS(data);
            this.singleCheckedIsAll(id);
            this.getTotalMoney();
        });
    }

    // 获取相同supid
    @action
    getEqualSupId(id: any){
        let data = this.orgReturnGoods;
        let isTrue = true;
        data.skus.forEach((el) => {
            if(el.spuId === id && !el.checkIsTrue){
                isTrue = false;
            }
        });
        return isTrue;
    }

    //全部btn按钮
    @action
    btnCheckAll(isTrue: boolean) {
        this.checkAll = isTrue;
        this.chooseGoodsSize(isTrue);
    }

    // 保存
    @action
    getLastData() {
        let data = this.orgReturnGoods;
        let conformData = [];
        let totalNub = 0;
        data.skus.slice().forEach((el) => {
            let newObj = {};
            if (el.checkIsTrue) {
                newObj['purDetailId'] = el.id;
                newObj['num'] = el.skuNum;
                conformData.push(newObj);
                totalNub += el.skuNum;
            }
        });
        return {obj: conformData, nub: totalNub,totalMoney: this.getMoney};
    }

    //显示隐藏
    @action
    changeArrowIsTrue(isTrue: boolean,id: number){
        let data = this.orgReturnGoods;
        data.skus.forEach((el) => {
            if (id === el.spuId) {
                el['arrowIsTrue'] = isTrue;
            }
        });
    }

    // 改变checkall
    @action
    changeCheckAllStatus (){
        runInAction(()=>{
            this.checkAll = false;
        });
    }

    // 从父页面获取数据
    @action
    getParentData = (data: Object,footData: Object) => {
        runInAction(()=>{
            this.orgReturnGoods = data;
            this.getMoney = footData.backMoney;
            this.checkAll = footData.allCheck;
            this.getReturnMoney = footData.returnMoney;
        });
    }
}

