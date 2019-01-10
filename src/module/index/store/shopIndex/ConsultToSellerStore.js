/**
 * author: wwj
 * Date: 2018/9/3
 * Time: 上午10:29
 * des:
 * @flow
 */
import ShopApiManager from '../../../../apiManager/ShopApiManager';
import {action} from 'mobx';

export default class ConsultToSellerStore {

    consultToSeller(mobile: string, sellerId: number, sellerUnitId: number, callback: Function){
        ShopApiManager.consultToSellerProvider({
            jsonParam: {
                mobile: mobile,
                sellerId: sellerId,
                sellerUnitId: sellerUnitId,
            }
        }).then(action(({data}) => {
            callback(true, '');
        }), (error) => {
            callback(false, error.message);
        });
    }
}