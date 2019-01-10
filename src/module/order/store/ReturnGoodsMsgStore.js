/**
 *@author xbu
 *@date 2018/08/27
 *@flow
 *@desc  退货理由
 *
 */

import { observable,computed,action,runInAction } from 'mobx';
import ConfigListDictApiManager from '../../../apiManager/ConfigListDictApiManager';

export default class ReturnGoodsMsgStore {
    @observable returnMsg: Array<Object> = [];

    @computed
    get returnMsgList(): Array<Object> {
        return this.returnMsg.slice();
    }

    // 获取退款字典
    @action
    configListDictApiManager = async (id: any) =>{
        let obj = {
            typeId: id ? id : 2008,
            flag: 1,
        };
        let data = await ConfigListDictApiManager.fetchConfigListDict(obj);
        runInAction(()=>{
            this.returnMsg = data.data.rows;
        });
    };

    // 获取退款的金额
    @action
    getReturnGoodsPrice = async (id: any) => {
        try {
            let data = await ConfigListDictApiManager.fetchReturnGoodsPrice({id: id});
            return Promise.resolve(data);
        } catch (e) {
            return Promise.reject(e);
        }

    }


}