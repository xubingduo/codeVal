/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品详情组件-购买弹出窗-工具类函数
 * @Last Modified by: Miao Yunliang
 * @Last Modified time: 2018-11-06 10:54:36
 * @flow
 */
import {deepClone} from 'outils';
import NP from 'number-precision';
import util from 'utl/NumberUtl';
// import * as math from 'mathjs';

// 计算当前颜色的总数
function countCurrentColorNum(sizeList: Array<Object>) {
    let buyNum = 0;
    sizeList.forEach(el => {
        buyNum += el['buyNum'];
    });
    return buyNum;
}

// 计算当前商品总数
function countCurrentGoodsNum(colorList: Array<Object>) {
    let buyNum = 0;
    colorList.forEach(el => {
        buyNum += el['buyNum'];
    });
    return buyNum;
}

// 计算总价的函数
function countCurrentGoodsPay(buyNum: Number, price: Number) {
    return NP.times(price, buyNum);
}

function getCaption(skuList: Array<Object>, key: string, value: number) {
    let returnCaption = '';
    skuList.forEach(element => {
        if (element[key].toString() === value.toString()) {
            returnCaption = element['ecCaption'][key];
        }
    });
    return returnCaption;
}

// 处理商品详情的函数
// 1是尺码 2是颜色
export function goodsBuyUtil(data: Object) {
    let innerSpu = data.spu;
    let innerSkus = data.skus;

    let innerSpec1Ids = innerSpu.spec1IdList;
    let innerSpec2Ids = innerSpu.spec2IdList;

    // let innerSpec1Ids = JSON.parse(innerSpu.spec1Ids);
    // let innerSpec2Ids = JSON.parse(innerSpu.spec2Ids);

    let innerSkuList = [];
    innerSpec2Ids.forEach(element => {
        let color = {};
        color.spec2 = element;
        color.active = false;
        color.buyNum = 0;
        color.buyPay = 0;
        let innerSizeList = [];
        innerSpec1Ids.forEach(elem => {
            innerSizeList.push({
                spec1: elem,
                buyNum: 0,
                buyPay: 0
            });
        });
        color['sizeList'] = innerSizeList;
        innerSkuList.push(color);
    });
    // __DEV__ && console.warn(innerSkuList);
    // 生成二维数组
    // for (let key2 in innerSpec2Ids) {
    //     let color = {};
    //     color.spec2 = key2;
    //     color.active = false;
    //     color.buyNum = 0;
    //     color.buyPay = 0;
    //     let innerSizeList = [];
    //     for (let key1 in innerSpec1Ids) {
    //         innerSizeList.push({
    //             spec1: key1,
    //             buyNum: 0,
    //             buyPay: 0
    //         });
    //     }
    //     color['sizeList'] = innerSizeList;
    //     innerSkuList.push(color);
    // });

    // innerSkuList[0].active = true; // 第一个显示
    // 添加其他sku属性
    innerSkuList.forEach((element: Object) => {
        let innerSpec2 = element.spec2;
        let innerSizeList = element.sizeList;
        // 添加caption(汉字)
        element['caption'] = getCaption(innerSkus, 'spec2', innerSpec2);
        innerSizeList.forEach(ele => {
            let innerSpec1 = ele.spec1;
            innerSkus.forEach(e => {
                if (e.spec2.toString() === innerSpec2 && e.spec1.toString() === innerSpec1) {
                    for (let key in e) {
                        ele[key] = e[key];
                    }
                }
                ele['caption'] = getCaption(innerSkus, 'spec1', innerSpec1);
            });
        });
    });

    let innerGoods = innerSpu;
    innerGoods.docHeader = JSON.parse(innerSpu.docHeader);
    innerGoods.docContent = JSON.parse(innerSpu.docContent);
    let allBuyNum = 0;
    let allBuyPay = 0;

    innerSkuList.forEach(element => {
        let currentSkuBuyNum = 0;
        let currentSkuBuyPay = 0;
        element.sizeList.forEach(elem => {
            currentSkuBuyNum += elem.buyNum;
            currentSkuBuyPay += ((elem.buyNum || 0) * elem.price);
            allBuyNum += elem.buyNum;
            allBuyPay += ((elem.buyNum || 0) * elem.price);
        });
        element.buyNum = currentSkuBuyNum;
        element.buyPay = currentSkuBuyPay;
    });

    innerGoods.buyNum = allBuyNum;
    innerGoods.buyPay = allBuyPay;

    innerGoods['skuList'] = innerSkuList;

    // 显示第一个有数量的颜色下的货品。
    let actived = false;

    for(let i = 0; i < innerSkuList.length; i++) {
        const sku = innerSkuList[i];
        if (sku.buyNum > 0) {
            sku.active = true;
            actived = true;
            break;
        }
    }

    if (!actived) {
        innerSkuList[0].active = true;
    }

    return deepClone(innerGoods);
}

// 点击新增或者减少的操作
export function goodsColorSizeMinusAdd(currentGoods: Object, color: Object, size: Object, newValue: number) {
    let innerCurrentGoods = deepClone(currentGoods);
    let currentColor = {};
    let currentSize = {};
    innerCurrentGoods['skuList'].forEach(element => {
        if (element['spec2'] === color['spec2']) {
            currentColor = element;
        }
    });
    currentColor['sizeList'].forEach(element => {
        if (element['spec1'] === size['spec1']) {
            currentSize = element;
            currentSize['buyNum'] = newValue;
            // todo 后期需要改动算法
            currentSize['buyPay'] = countCurrentGoodsPay(currentSize.buyNum, currentSize.price);
        }
    });
    currentColor.buyNum = countCurrentColorNum(currentColor['sizeList']);
    innerCurrentGoods.buyNum = countCurrentGoodsNum(innerCurrentGoods['skuList']);
    // todo 后期需要改动算法
    innerCurrentGoods.buyPay = countCurrentGoodsPay(innerCurrentGoods['buyNum'], innerCurrentGoods.price);
    return innerCurrentGoods;
}

// 点击提交购物车操作数据
export function addShoppingCart(goods: Object, shopMsg: Object) {
    let innerGoods = deepClone(goods);
    let innerShopMsg = deepClone(shopMsg);

    let innerReturnSkuList = [];
    let innerReturnSpu = {};
    let innerReturnShop = {};

    let innerSkuList = innerGoods['skuList'];
    innerSkuList.forEach(element => {
        element['sizeList'].forEach(size => {
            if (size['buyNum'] > 0) {
                innerReturnSkuList.push({
                    id: '',
                    skuId: size['id'] || '',//sku的唯一标示
                    spec1: size['spec1'] || '',//规格1
                    spec1Name: element['caption'],//规格1名称
                    spec2: size['spec2'],//规格2
                    spec2Name: size['caption'],//规格2名称
                    spec3: size['spec3'],//规格3
                    spec3Name: '',//规格3名称
                    // todo 后期需要改动算法
                    // 修改为price
                    // skuPrice: size['pubPrice'],//价格
                    skuPrice: size['price'],//价格
                    skuNum: size['buyNum'],//数量
                    money: parseFloat(size['buyPay']),//总金额
                    checked: false,//是否选中
                    originalPrice: size['pubPrice'],// 原价
                    invNum: size['num'],// 库存
                    groupNum: size.groupNum // 童装模式一手的数量
                });
            }
        });
    });
    // 封面图
    let spuPic = '';
    if (innerGoods.coverUrl) {
        spuPic = innerGoods.coverUrl;
    } else {
        try {
            // spuPic = innerGoods['docHeader'][0].docId;
            innerGoods.docHeader.forEach(ele => {
                if (ele.coverFlag && ele.coverFlag === 1) {
                    spuPic = ele.docId;
                }
            });
            innerGoods.docContent.forEach(ele => {
                if (ele.coverFlag && ele.coverFlag === 1) {
                    spuPic = ele.docId;
                }
            });
            if (!spuPic) {
                spuPic = innerGoods.docHeader[0].docId || innerGoods.docContent[0].docId;
            }
        } catch (e) {

            console.log(e);
        }
    }
    // coverUrl
    // if (innerGoods['docHeader'][0].typeId === 1) {
    //     spuPic = innerGoods['docHeader'][0].docId;
    // } else {
    //     try {
    //         spuPic = innerGoods['docHeader'][1].docId;
    //     } catch (e) {
    //         console.log(e);
    //     }
    // }
    let spuList = [];
    if (innerGoods.docContent) {
        innerGoods.docContent.forEach(element => {
            if (element.typeId === 1 && spuList.length < 8) {
                spuList.push(element.docId);
            }
        });
    }
    // 处理图片列表
    let spuPicIndex = spuList.indexOf(spuPic);
    spuList.splice(spuPicIndex, 1);
    spuList.unshift(spuPic);

    innerReturnSpu = {
        spuList: spuList.join(','),// 款号的图片id列表
        spuId: innerGoods['id'],
        spuName: innerGoods['name'],// 款式名称
        title: innerGoods['title'],// 款式描述
        spuPic: spuPic,
        checked: false,// 是否选中
        classId: innerGoods['classId'],// 类别id
        shipFeeMoney: 0,
        spuFlag: 1, // 1代表正常 其他的代表失效
        salesWayId: innerGoods.salesWayId
    };
    innerReturnShop = {
        traderName: innerShopMsg['tenantName'] || innerShopMsg['traderName'],// 店铺名称
        tenantId: innerShopMsg['tenantId'],// 店铺id
        unitId: innerShopMsg['unitId'],// 卖家单元id
        checked: false,//是否选中
        shipFeeMoney: 0,
        buyerRem: '',
        clusterCode: innerShopMsg.clusterCode,
        //是否有待领取优惠券
        couponsToGet: false,
        //可用优惠券数量
        couponsCount: 0,
    };
    return {
        skuList: innerReturnSkuList,
        spu: innerReturnSpu,
        shop: innerReturnShop
    };
}

export function getColorSizeNum(skuList: Array<Object>) {
    let colorNum = 0;
    let sizeNum = 0;
    let colorList = [];
    let sizeList = [];
    skuList.forEach(element => {
        if (colorList.indexOf(element['spec2']) === -1) {
            colorList.push(element['spec2']);
        }
        if (sizeList.indexOf(element['spec1']) === -1) {
            sizeList.push(element['spec1']);
        }
    });
    colorNum = colorList.length;
    sizeNum = sizeList.length;
    return {
        colorNum, sizeNum
    };
}

export function mininGoodsOrder(goodsDetailMsg: Object, lastOrderDetail: Array<Object>) {
    let newGoodsDetailMsg = deepClone(goodsDetailMsg);
    newGoodsDetailMsg.skus.forEach(element => {
        element.buyNum = 0;
        lastOrderDetail.forEach(elem => {
            if (element.id === elem.skuId) {
                const buyNum = elem.skuNum <= 0 ? 0 : elem.skuNum;
                element.buyNum = buyNum;
            }
        });
    });
    return newGoodsDetailMsg;
}