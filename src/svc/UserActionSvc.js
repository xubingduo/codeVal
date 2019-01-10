/**
 * @author [author]
 * @email [example@mail.com]
 * @create date 2018-07-18 03:03:29
 * @modify date 2018-07-18 03:03:29
 * @desc [处理用户行为]
 * @flow
 */
import {NativeModules} from 'react-native';
import rootStore from 'store/RootStore';
import eventName from 'config/EventName';
import storage from 'utl/DLStorage';
import DateUtl from 'utl/DateUtl';
import {upload} from 'apiManager/UserActionApiManager';
import {DLStatisticsModule} from '@ecool/dlsharebyumenglib';

const USER_ACTION = 'USERACTION';// 定义存储key

function getEvent(key: string) {
    let eventVal = '';
    eventName.forEach(item => {
        if (item['key'] === key) {
            // eventVal = item['val'];
            eventVal = item['des'];
        }
    });
    if (eventVal) {
        return eventVal;
    } else {
        console.log(`key${key}不存在`);
        return '';
    }
}

function isInArray(value: string, array: Array<any>, key: string) {
    let inArrayIndex = -1;
    array.forEach((element, index) => {
        if (element[key] === value) {
            inArrayIndex = index;
        }
    });
    return inArrayIndex;
}

// 最终处理用户行为数据
function detailActDetails(eventList: Array<Object>) {
    let ActDetailsList = [];
    eventList.forEach(element => {
        let optime = DateUtl.dateStr(element.optime);
        let currentInArrayIndex = isInArray(optime, ActDetailsList, 'optime');
        if (currentInArrayIndex > -1) {
            let menuCode = element.menuCode;
            let currentActDetails = ActDetailsList[currentInArrayIndex].actDetails;
            let currentActDetailIndex = isInArray(menuCode, currentActDetails, 'menuCode');
            if (currentActDetailIndex > -1) {
                currentActDetails[currentActDetailIndex].times++;
            } else {
                currentActDetails.push({
                    menuCode: menuCode,
                    times: 1
                });
            }
        } else {
            ActDetailsList.push({
                optime: optime,
                actDetails: []
            });
        }
    });
    return ActDetailsList;
}

class UserActionSvc {
    /**
     * 默认轮循时间 10 分钟
     */
    roundRobinInterval: number = 10 * 60 * 1000;

    interval: any;

    /**
     * 触发事件
     */
    async track(eventName: string) {
        this.trackByUmeng(eventName);
        // let item = {};
        // item.menuCode = getEvent(eventName);
        // item.optime = new Date();
        // try {
        //     storage.load({key: USER_ACTION}).then(res => {
        //         res.push(item);
        //         storage.save({
        //             key: USER_ACTION,
        //             data: res
        //         });
        //     });
        //
        // } catch (err) {
        //     let errRes = [].push(item);
        //     storage.save({
        //         key: USER_ACTION,
        //         data: errRes
        //     });
        // }
    }

    /**
     * 事件统计- 带参数
     * @param eventName     事件id      string
     * @param param         key: value 类型需要为 string: string
     * @returns {Promise<void>}
     */
    async trackWithParam(eventName: string, param: Object){
        this.trackByUmengWithParam(eventName, param);
    }

    /**
     * 友盟的事件统计
     * @param eventName
     */
    trackByUmeng(eventName: string) {
        try{
            DLStatisticsModule.onEvent(eventName);
        }catch (e) {
            console.log(e);
        }
    }

    /**
     * 友盟事件统计-携带参数
     * @param eventName
     */
    trackByUmengWithParam(eventName: string, param: Object) {
        try{
            DLStatisticsModule.onEventWithParam(eventName, param);
        }catch (e) {
            console.log(e);
        }
    }

    // stopRoundRobin() {
    //     // this.interval && clearInterval(this.interval);
    //     // this.interval = null;
    // }

    // initUserAction() {
    //     // this.interval = setInterval(() => {
    //     //     // 上传用户行为数据
    //     //     this.upload();
    //     // }, this.roundRobinInterval);
    // }

    // async upload() {
    //     // storage.load({key: USER_ACTION}).then(res => {
    //     //     let actDetails = detailActDetails(res);
    //     //     actDetails.forEach(element => {
    //     //         let params = {
    //     //             optime: element.optime
    //     //         };
    //     //         params.jsonParam = Object.assign({}, rootStore.userStore.user, {actDetails: element.actDetails});
    //     //         // upload(params);
    //     //     });
    //     //     storage.save({
    //     //         key: USER_ACTION,
    //     //         data: []
    //     //     });
    //     // }, err => {
    //     //     storage.save({
    //     //         key: USER_ACTION,
    //     //         data: []
    //     //     });
    //     // });
    // }
}

export default new UserActionSvc();


