/**
 *@author wdy
 *@date 2018/07/27
 *@desc  频道列表
 *@flow
 */
import {deepClone} from 'outils';
import * as types from './mutationTypes';
import DLFetch from '@ecool/react-native-dlfetch/index';
import * as _ from 'lodash';

// 处理关注的数据
export function detailFocusOnTypeList(data: Object) {
    let focusOnTypeList = [];
    let {rows} = data;
    // 将每一种筛选类型的id赋值给该类型下具体的筛选项中，用于后续的判断
    rows.forEach(row => {
        row.filterDatas.forEach(filterData => {
            filterData.id = row.typeValue;
            filterData.checked = false;
        });
    });
    for(let i=0;i<rows.length;i++){
        let filterItem = {
            id: rows[i].typeValue,
            des: rows[i].typeName,
            detailList: rows[i].filterDatas,
            pubPriceStart: '',
            pubPriceEnd: '',
        };
        if (filterItem.id === 7) {
            filterItem.detailList = createPriceRangeData();
        }
        focusOnTypeList.push(filterItem);
    }
    // let focusOnTypeList = deepClone(types['focusOnTypeList']);
    // for (let value in rows) {
    //     console.warn('key=' + value);
    //     focusOnTypeList.forEach(element => {
    //         if (element['typeValue'] === key) {
    //             let detailList = data[key];
    //             detailList.forEach(el => {
    //                 el.checked = false;
    //             });
    //             element['detailList'] = detailList;
    //         }
    //     });
    // }

    return focusOnTypeList;
}

function createPriceRangeData() {
    let datas = [];
    // 下面的价格区间段由运营确定
    // -1 表示不限制最大价格，在传值到服务器时会剔除
    datas.push({
        id: 7,
        codeValue: '0,200',
        codeName: '0-200',
        checked: false,
    });
    datas.push({
        id: 7,
        codeValue: '200,400',
        codeName: '200-400',
        checked: false,
    });
    datas.push({
        id: 7,
        codeValue: '400,-1',
        codeName: '400以上',
        checked: false,
    });
    return datas;
}

// "keyWords": {
//     "cityId": [],// 城市-1
//     "marketId": []// 市场-3
// },
// "mutilVeluesKey": {
//     "shopStyles": [],// 风格-2
//     "classId": []// 类别-4
// }
export function chooseCurrentFocusOnType(observableFocusOnTypeList: Array<Object>, observableClassAccodeLike: string, smallClass: Object) {
    let focusOnTypeList = deepClone(observableFocusOnTypeList);
    let focusOnType = deepClone(smallClass);
    focusOnTypeList.forEach(element => {
        let currentFocusOnTypeList = [];
        if (element.id === focusOnType.id) {
            currentFocusOnTypeList = element['detailList'];
            currentFocusOnTypeList.forEach(el => {
                if (element.id === 7) { // 价格选项为单选
                    if (el.codeValue !== focusOnType.codeValue) {
                        el.checked = false;
                    }
                }
                if(el.codeValue === focusOnType.codeValue){
                    el.checked = !el.checked;
                }
                // if (el.type === 1 || el.type === 2) {
                //     if (el.typeValue === focusOnType.typeValue) {
                //         el.checked = !el.checked;
                //     }
                // } else if (el.type === 3) {
                //     if (el.typeId === focusOnType.typeId) {
                //         el.checked = !el.checked;
                //     }
                // }
            });
        }
    });

    // 生成后台需要的数据
    // 价格区间起始
    let pubPriceStart = '0';
    // 价格区间截止  -1为没有最大值
    let pubPriceEnd = '-1';
    // mutilVeluesKey : 支持的key：shopStyles - 门店风格
    let mutilVeluesKey = {};
    // 支持的key：labels - 门店标签，medalsCode - 勋章code集合
    let mutilVeluesKeyMust = {};

    focusOnTypeList.forEach(element => {
        if (element.id === 1) { // 构造标签请求参数
            let labelList = [];
            element['detailList'].forEach(filterData => {
                if(filterData.checked){
                    labelList.push(filterData.codeValue);
                }
            });
            if (labelList.length > 0) {
                mutilVeluesKeyMust['labels'] = labelList;
            }
        } else if (element.id === 2){ // 勋章请求参数
            let medalList = [];
            element['detailList'].forEach(filterData => {
                if(filterData.checked){
                    medalList.push(filterData.codeValue);
                }
            });
            if(medalList.length > 0){
                mutilVeluesKeyMust['medalsCode'] = medalList;
            }
        } else if (element.id === 3){ // 风格请求参数
            let shopStyleList = [];
            element['detailList'].forEach(filterData => {
                if(filterData.checked){
                    shopStyleList.push(filterData.codeValue);
                }
            });
            if(shopStyleList.length > 0){
                mutilVeluesKeyMust['shopStyles'] = shopStyleList;
            }
        } else if (element.id === 7){ // 价格请求参数
            // 如果选中了某一价格区间
            let hasChecked = false;
            element['detailList'].forEach(filterData => {
                if(filterData.checked){
                    hasChecked = true;
                    let priceRange = _.split(filterData.codeValue, ',');
                    pubPriceStart = priceRange[0];
                    pubPriceEnd = priceRange[1] === '-1' ? '' : priceRange[1];
                }
            });
            if (!hasChecked) {
                pubPriceStart = element['pubPriceStart'] ? element['pubPriceStart'] : '';
                pubPriceEnd = element['pubPriceEnd'] ? element['pubPriceEnd'] : '';
            }
        }
    });
    return {
        focusOnTypeList, mutilVeluesKey, mutilVeluesKeyMust, pubPriceStart, pubPriceEnd
    };
}

export function toggleFavorFlagByShopId(mainDataList: Array<Object>, tenantId: number, favorFlag: ?number) {
    let innerMainDataList = mainDataList.slice();
    innerMainDataList.forEach(element => {
        if (element['tenantId'] === tenantId) {
            element['favorFlag'] = favorFlag;
        }
    });
    return innerMainDataList;
}

export function togglePraiseFlagByGoodsId(mainDataList: Array<Object>, goodsId: ?number, praiseFlag: ?number, praiseNum: ?number) {
    let innerMainDataList = mainDataList.slice();
    innerMainDataList.forEach(element => {
        if (element['id'] === goodsId) {
            element['praiseFlag'] = praiseFlag;
            element['praiseNum'] = praiseNum;
        }
    });
    return innerMainDataList;
}

export function deleteGoodsByGoodsId(mainDataList: Array<Object>, goodsId: ?number) {
    let innerMainDataList = deepClone(mainDataList);
    let deleteGoodsIndex;
    innerMainDataList.forEach((element, idx) => {
        if (element['id'] === goodsId) {
            deleteGoodsIndex = idx;
        }
    });
    innerMainDataList.splice(deleteGoodsIndex, 1);
    return innerMainDataList;
}

export function watchCallBack(mainDataList: Array<Object>, goodsId: number, viewNum: number) {
    let innerMainDataList = mainDataList.slice();
    innerMainDataList.forEach(element => {
        if (element['id'] === goodsId) {
            element['viewNum'] = viewNum;
        }
    });
    return innerMainDataList;
}

export function toggleFavorCallBack(mainDataList: Array<Object>, goodsId: number, spuFavorFlag: number, spuFavorNum: number) {
    let innerMainDataList = mainDataList.slice();
    innerMainDataList.forEach(element => {
        if (element['id'] === goodsId) {
            element['spuFavorNum'] = spuFavorNum;
            element['spuFavorFlag'] = spuFavorFlag;
        }
    });
    return innerMainDataList;
}