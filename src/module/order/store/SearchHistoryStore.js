/**
 *@author xbu
 *@date 2018/08/28
 *@flow
 *@desc   搜索订单历史
 *
 */

import React from 'react';
import {observable, computed, action, runInAction} from 'mobx';
import storage from '../../../utl/DLStorage';

const SEARCH_HISTORY_TAG = 'searchHistoryOrder';
export default class SearchHistoryStore {
    @observable searchHistoryTagArr: Array<string> = [];


    /**
     * 搜索历史tag显示数据
     * @returns {string[]}
     */
    @computed
    get historyTagShow(): Array<string> {
        let data = this.searchHistoryTagArr.slice();
        return data;
    }

    /**
     * 取出搜索历史
     * @returns {Promise<void>}
     */
    @action
    loadSearchHistoryTag = () => {
        storage.load({key: SEARCH_HISTORY_TAG}).then(ret => {
            runInAction(() => {
                if (ret) {
                    this.searchHistoryTagArr = ret;
                }
            });
        }).catch(err => {
            switch (err.name) {
            case 'NotFoundError':
                break;
            case 'ExpiredError':
                break;
            }
        });
    };

    /**
     * 保存搜索历史
     */
    saveSearchHistoryTag = async () => {
        await storage.save({
            key: SEARCH_HISTORY_TAG,
            data: this.searchHistoryTagArr,
        });
    };

    /**
     * 更新界面的 搜索历史
     */
    @action
    saveSearchHistoryMemory(tag: string) {
        let index = this.searchHistoryTagArr.indexOf(tag);
        if( index !== -1){
            this.searchHistoryTagArr.splice(index, 1);
        }
        this.searchHistoryTagArr.unshift(tag);
    }

    @action
    clearSearchHistory() {
        this.searchHistoryTagArr = [];
        storage.remove({
            key: SEARCH_HISTORY_TAG,
        });
    }
}
