/**
 * author: wwj
 * Date: 2018/7/31
 * Time: 15:25
 * des: 地址管理的store
 * @flow
 */

import {observable, computed, action} from 'mobx';
import UserApiManager from '../../../../apiManager/UserApiManager';

export default class AddressListStore {

    @observable allAddressList: Array<Object> = [];

    @computed
    get getAddressList(): Array<Object> {
        return this.allAddressList.slice();
    }

    @computed
    get isAnyAddrSelected(): boolean {
        let i = 0;
        for (i; i < this.allAddressList.length; i++) {
            if (this.allAddressList[i].checked) {
                return true;
            }
        }
        return false;
    }

    /**
     * 编辑时的checkbox状态 多选
     */
    @action
    updateCheckStatus(checked: boolean, id: number) {
        this.allAddressList.forEach((item) => {
            if (item.recInfo.id === id) {
                item.checked = checked;
            }
        });
    }

    /**
     * 选择地址时的item状态 单选
     */
    @action
    updateSelectedStatus(selected: boolean, id: number) {
        this.allAddressList.forEach((item) => {
            item.selected = false;
            if (item.recInfo.id === id) {
                item.selected = selected;
            }
        });
    }

    /**
     * 选择地址时 初始化选中地址
     */
    @action
    setSelectedAddr(id: number) {
        if(id === -1){
            return;
        }
        for(let i=0; i<this.allAddressList.length; i++){
            if (this.allAddressList[i].recInfo.id === id) {
                this.allAddressList[i].selected = true;
                break;
            }
        }
    }

    /**
     * 获取所有地址
     * @param callback
     */
    queryAddressList = (callback: Function) => {
        UserApiManager.fetchAddrListProvider()
            .then(action(({data})=>{
                let {rows} = data;
                if (rows) {
                    rows.forEach((item)=>{
                        Object.assign(item, {checked: false, selected: false});
                        // 保留之前选中的状态
                        this.allAddressList.forEach((originalItem) => {
                            if (originalItem.recInfo.id === item.recInfo.id){
                                Object.assign(item, {checked: originalItem.checked, selected: originalItem.selected});
                            }
                        });
                    });
                    this.allAddressList = rows;
                    callback(true, 0);
                } else {
                    this.allAddressList = [];
                    callback(true, 0);
                }
            }), (error)=>{
                callback(false, error.message?error.message:'出错了');
            });
    };

    /**
     * 批量删除地址
     * @param requestCallback
     */
    batchDeleteAddr = (requestCallback: Function) => {
        // 筛选出checked选中的ids
        let ids = '';
        this.allAddressList.forEach((item) => {
            if (item.checked) {
                ids += item.recInfo.id+',';
            }
        });
        ids = ids.substring(0, ids.length - 1);
        UserApiManager.batchDeleteAddr({jsonParam: {
            ids: ids,
        }})
            .then(action(({data})=>{
                requestCallback(true, ids);
            }), (error)=> {
                requestCallback(false, error.message);
            });
    }
}