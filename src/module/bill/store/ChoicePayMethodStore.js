/**
 * author: tuhui
 * Date: 2018/8/7
 * Time: 14:07
 * @flow
 * des:支付方式选择store
 */

import { action, computed, observable } from 'mobx';
import BillingApiManager from '../../../apiManager/BillingApiManager';

export default class ChoicePayMethodStore {
    @observable
    payMethodArr: Array<Object>;

    @computed
    get payMethodArrShow(): Array<Object> {
        return [{}, {}];
    }

    async createPay(params: Object) {
        try {
            let result = await BillingApiManager.createPayProvider({
                jsonParam: params
            });
            return Promise.resolve(result.data);
        } catch (e) {
            return Promise.reject(e);
        }
    }

    getPayStatus = (billId: number, callback: Function) => {
        BillingApiManager.getBillPayStatus({
            id: billId
        }).then(
            action(({ data }) => {
                if (data && data.val) {
                    if (data.val === '已付款') {
                        callback(true, '已付款');
                    } else {
                        callback(false, data.val);
                    }
                }
            }),
            error => {
                dlconsole.log(error.message);
            }
        );
    };
}
