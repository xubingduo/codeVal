/**
 * author: tuhui
 * Date: 2018/7/17
 * Time: 08:40
 * @flow
 * des:
 */
import UserApiManager from '../../../apiManager/UserApiManager';
import OrderApiManager from '../../../apiManager/OrderApiManager';
import {observable, action} from 'mobx';

export default class MineStore{

    @observable statisticsData: Object = {
        viewSpuNum: 0,
        totalPurTimes: 0,
        totalPurNum: 0,
        totalPurMoney: 0,
        avgDeliverElapsed: 0
    };

    @observable billsCount: Object = {
        toDelivelNum: 0,
        toPayNum: 0,
        toReceiveNum: 0,
        backingNum: 0,
    };

    /**
     * 我的统计数据
     * @param callback
     */
    fetchMyStatistics(callback: Function) {
        UserApiManager.fetchMyStatisticsProvider()
            .then(action(({data}) => {
                if (data) {
                    this.statisticsData = data;
                }
            }), (error) => {
                //console.warn(error.message);
            });
    }

    /**
     * 我的订单数量
     * @param callback
     */
    fetchBillsCount(callback: Function) {
        OrderApiManager.fetchBillsCount()
            .then(action(({data}) => {
                this.billsCount = data;
            }))
            .catch((error) => {
                //console.warn(error.message);
            });
    }
}

