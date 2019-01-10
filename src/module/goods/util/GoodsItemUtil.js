/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品卡片组件处理函数
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-22 16:04:50
 * @flow
 */
import {deepClone} from 'outils';
import moment from 'moment';

// 处理勋章的函数
export function detailMedals(medals: Array<Object>) {
    // 过滤未拥有的
    let medalList = medals.filter((item) => {
        return item['showFlag'] === 1;
    });
    // 取出前三条
    let returnMedalList = medalList.filter((item, index) => {
        return index <= 2;
    });
    return returnMedalList;
}

export function detailGoodsList(goods: Object) {
    let returnGoods = {};
    for (let key in goods) {
        switch (key) {
        case 'marketDate': {
            if (goods[key] === '') {
                returnGoods['upDateTime'] = '无';
            } else {
                let upDateTime = 0;
                let newUpDateTime = goods[key].replace(/-/g, '/');
                upDateTime = (Date.parse(new Date()) - Date.parse(new Date(newUpDateTime))) / 1000 / 60;
                if (upDateTime < 1) {
                    returnGoods['upDateTime'] = '刚刚';
                } else {
                    returnGoods['upDateTime'] = moment(goods[key]).fromNow();
                }
            }
            break;
        }
        case 'docHeader': {
            returnGoods[key] = JSON.parse(goods[key]);
            break;
        }
        case 'docContent': {
            returnGoods[key] = JSON.parse(goods[key]);
            break;
        }
        case 'medals': {
            returnGoods[key] = detailMedals(goods[key]);
            break;
        }
        default: {
            returnGoods[key] = goods[key];
        }
        }
    }
    return returnGoods;
}


