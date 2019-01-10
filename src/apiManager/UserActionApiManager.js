/**
 * @author [author]
 * @email [example@mail.com]
 * @create date 2018-07-23 05:28:04
 * @modify date 2018-07-23 05:28:04
 * @desc [description]
 * @flow
 */
import {Platform} from 'react-native';
import DLFetch from '@ecool/react-native-dlfetch';

/**
 * 提交埋点数据
 */
export async function upload(params: Object = {}) {
    params = Object.assign({}, params,
        {
            productType: Platform.select({
                ios: 'slhGoodShopIOS',
                android: 'slhGoodShopAndroid'
            }),
        });
    return DLFetch.postFullUrl('http://log.hzdlsoft.com:8081/clog/api.do', {apiKey: 'log_user_act_bean', ...params});
}
