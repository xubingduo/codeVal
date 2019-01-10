/**
 * author: tuhui
 * Date: 2018/7/23
 * Time: 13:41
 * @flow
 * des: 搜索界面store
 */

import React from 'react';
import {observable, computed, action, runInAction} from 'mobx';
import DLFetch from '@ecool/react-native-dlfetch';
import ShopApiManager, {fetchFocusOnTypeList, getConfigListDict} from '../../../apiManager/ShopApiManager';
import UserApiManager from 'apiManager/UserApiManager';
import ConfigListDictApiManager from 'apiManager/ConfigListDictApiManager';

export default class ShopSearchStore {

    @observable listData: Array<Object> = [];
    @observable filterDataSource: Array<Object> = [];

    /**
     * 店铺搜索结果展示
     * @returns {number[]}
     */
    @computed
    get shopSearchListShow(): Array<Object> {
        return this.listData.slice();
    }


    searchShop(fresh: boolean, commonParams: Object, jsonParams: Object, callBack: Function) {
        ShopApiManager.shopSearchProvider({
            jsonParam: this.configJsonParams(jsonParams),
            ...commonParams
        }).then(action(({data}) => {
            const {rows} = data;
            if (rows) {
                if (fresh) {
                    this.listData = rows;
                } else {
                    this.listData.push(...rows);
                }
                callBack(true, rows.length);
            } else {
                callBack(true, 0);
            }
        }), (error) => {
            callBack(false, error.message);
        });
    }

    /**
     * 配置筛选条件
     * @param condition
     * @returns {Object & {}}
     */
    configJsonParams(condition: Object): Object {
        return Object.assign(condition, {isSlhShop:1});
    }

    // 手动更改关注
    @action
    changeFlag(id: number) {
        let data = [];
        this.shopSearchListShow.forEach(el => {
            if (el.id === id) {
                if (el.favorFlag === 1) {
                    el['favorFlag'] = 0;
                } else {
                    el['favorFlag'] = 1;
                }
            }
            data.push(el);
        });
        runInAction(() => {
            this.listData = data;
        });
    }

    @action
    async getFilterConfigData(callback: Function){
        try{
            let {data} = await ConfigListDictApiManager.fetchFilterConfigDataProvider({filterType: 3});
            if (data.rows && data.rows.length > 0) {
                this.filterDataSource = data.rows;
                callback(true, this.filterDataSource);
            } else {
                callback(false, '无筛选数据');
            }
        }catch (e) {
            callback(false, e.message);
        }
    }

    // @action
    // getCatConfig(callback: Function) {
    //     // 城市
    //     const promise1 = fetchFocusOnTypeList({type: '1,2'});
    //     // 主营类目
    //     const promise2 = getConfigListDict({typeId: '2010'});
    //     // 标签
    //     const promise3 = getConfigListDict({typeId: '2020'});
    //     // 勋章
    //     const promise4 = UserApiManager.fetchMedalListProvider({jsonParam:{}});
    //     Promise.all([promise1, promise2, promise3, promise4]).then((result) => {
    //         if (result[0].code === 0 && result[1].code === 0 && result[2].code === 0 &&
    //             result[3].code === 0) {
    //             let filterDataSource = result[0]['data'];
    //             let masterClassId = result[1]['data']['rows'];
    //             let serverDict = result[2]['data']['rows'];
    //             let medalList = result[3]['data']['rows'];
    //
    //             masterClassId.forEach(element => {
    //                 element.typeName = element['codeName'];
    //                 element.type = 5;
    //             });
    //             serverDict.forEach(element => {
    //                 element.typeName = element['codeName'];
    //                 element.type = 'servers';
    //                 element.typeId = element['codeValue'];
    //             });
    //             medalList.forEach(element => {
    //                 element.typeName = element['name'];
    //                 element.type = 'medals';
    //                 element.typeId = element['code'];
    //             });
    //
    //             filterDataSource['5'] = masterClassId;
    //             filterDataSource['servers'] = serverDict;
    //             filterDataSource['medals'] = medalList;
    //             runInAction(() => {
    //                 this.filterDataSource = filterDataSource;
    //             });
    //             callback(true, filterDataSource);
    //         } else {
    //             callback(false, '无筛选数据');
    //         }
    //     }).catch((error) => {
    //         console.log(error);
    //         callback(false, '无筛选数据');
    //     });
    //     // fetchFocusOnTypeList({
    //     //     type: '1'
    //     // // }).then(({code, data}) => {
    //     //     if (code === 0) {
    //     //         runInAction(() => {
    //     //             this.filterDataSource = data;
    //     //         });
    //     //         callback(true, data);
    //     //     } else {
    //     //         callback(false, '无筛选数据');
    //     //     }
    //     // }, err => {
    //     //     console.log(err);
    //     //     callback(false, err.message);
    //     // })
    // }
}

