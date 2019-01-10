/**
 *@author xbu
 *@date 2018/07/23
 *@flow
 *@desc  分类首页store
 *
 */

import {observable, computed, action, runInAction} from 'mobx';
import SortApiManager from '../../../apiManager/SortApiManager';

export default class SortStore {
    // 保存原始数据
    @observable data: Array<Object> = [];
    @observable hotMarketData: Array<Object> = [];
    @observable LeftData: Array<Object> = [];
    @observable RightData: Array<Object> = [];
    // @observable type: string = 'hot';
    @observable type: string = 'item';


    // 分类左边数据
    @computed
    get getLeftData(): Array<Object> {
        let data = [];
        // data.push({name: '热门市场', index: 0, accode: '', type: 'hot'});
        if (this.data.length) {
            this.data.forEach((item, i) => {
                // data.push({name: item.name, index:  i + 1, indexId: i, accode: item.accode, type: 'item'});
                data.push({name: item.name, index:  i, indexId: i, accode: item.accode, type: 'item'});
            });
        }
        return data;
    }

    //分类右边数据
    @computed
    get getRightData(): Array<Object> {
        let dataArr = [];
        // if (this.type === 'hot') {
        //     if (this.hotMarketData.length) {
        //         let obj = {
        //             name: '热门市场',
        //             type: 'hot',
        //             accode: '',
        //             data: this.hotMarketData.slice()
        //         };
        //         dataArr.push(obj);
        //     }
        // } else {
        if (this.RightData.length) {
            this.RightData.forEach((item) => {
                if (item.subItems.length > 0) {
                    let obj = {
                        name: item.name,
                        accode: item.accode,
                        type: 'item',
                        data: []
                    };
                    obj.data.push((item.subItems).slice());
                    dataArr.push(obj);
                }
            });
        }
        // }
        return dataArr;
    }

    // 点击事件处理
    @action
    changeSortItem(index: number) {
        let data = this.data[index].subItems;
        runInAction(() => {
            this.RightData = data;
            // this.type = type;
        });
    }


    // 查询全局区商品类别树列表
    @action
    requestData = async (index: number) => {
        try {
            let orgData = await SortApiManager.fetchSortList({
                jsonParam: {
                    incDirectSub: true,
                    showFlag: 2,
                }
            });
            let datas = orgData.data.rows[index] ? orgData.data.rows[index].subItems : [];
            runInAction(() => {
                if (orgData.data && orgData.data.rows && orgData.data.rows.length) {
                    this.data = orgData.data.rows;
                    this.RightData = datas;
                }
            });
            return Promise.resolve(datas);
        } catch (e) {
            return Promise.reject(e);
        }

    };

    // 查询热门市场推荐
    @action
    requestGetHotMarket = async (dataType: string) => {
        let data = await SortApiManager.fetchSortHotMarket({
            type: 3,
            cityCodes: '',
            showFlagBit: 2
        });
        let new_data = data.data[3];
        runInAction(() => {
            this.hotMarketData = new_data;
            this.type = dataType;
        });
    };


}