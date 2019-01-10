/**
 * author: wwj
 * Date: 2018/8/9
 * Time: 下午8:03
 * des:
 * @flow
 */

import {observable, action, computed,runInAction} from 'mobx';
import UserApiManager from '../../../apiManager/UserApiManager';
import Alert from 'component/Alert';
export default class MedalStore {
    @observable medalList: Array<Object> = [];
    // 门店ID
    shopId: number = 0;
    // 当前门店勋章
    medals: Array<Object> = [];

    @computed
    get medalListShow(): Array<Object> {
        return this.medalList.slice();
    }

    /**
     * 获取勋章列表
     * @param callback
     */
    queryMedalList(callback: Function){
        UserApiManager.fetchMedalListProvider({
            jsonParam:{

            }
        }).then(action(({data}) => {
            let {rows} = data;
            if (rows) {
                this.medalList = rows;
            }
        }), (error) => {
            callback(false, error.message);
        });
    }

    /**
     * 查询门店勋章
     */
    quertShopMedals = ()=>{
        UserApiManager.fetchShopMedalList({
            checkUnit:true,
            id:this.shopId,
        }).then((result)=>{
            runInAction(()=>{
                this.medalList = result.data.rows;
                // 匹配灰调图标
                for(let i = 0;i < this.medalList.length;i++){
                    let rowI = this.medalList[i];
                    // 是否使用灰调
                    rowI.useGray = true;
                    for(let j = 0;j < this.medals.length;j++){
                        let rowJ = this.medals[j];
                        if(rowI.code === rowJ.code){
                            rowI.useGray = false;
                            break;
                        }
                    }
                }
            });
        }).catch((error)=>{
            Alert.alert(error.message);
        });
    }


}