/**
 * author: wwj
 * Date: 2018/8/16
 * Time: 下午8:12
 * des:
 * @flow
 */

import {observable, action, computed} from 'mobx';
import ShopApiManager from '../../../../apiManager/ShopApiManager';
import {GoodClass, GoodClassResponse} from '../../model/GoodClassModel';
import {Callback} from 'model/base';

export default class ShopGoodsCategoryStore {

    @observable categoryList: Array<GoodClass> = [];

    @computed get showCategoryList(): Array<GoodClass> {
        return this.categoryList.slice();
    }


    @action
    setList = ({data}: GoodClassResponse): void => {
        const { rows } = data;
        if (rows) {
            this.categoryList = rows;
        }
    }

    /**
     * 获取所有分类列表
     */

    @action
    queryAllCategoryList = (unitId: number | string, clusterCode: number | string, tenantId: number | string, callback: Callback) => {
        ShopApiManager.fetchShopCategoryListProvider(
            {
                jsonParam: {
                    unitId: unitId,
                    incDirectSub: true,
                    showFlag: 2
                }
            },
            clusterCode,
            tenantId
        )
            .then(this.setList)
            .then(() => callback(true))
            .catch((err: Error) => {
                callback(false, err.message);
            });
    };
}