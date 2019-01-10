/**
 * @author [lyq]
 * @email
 * @create date 2018-11-21 17:23:54
 * @modify date 2018-11-21 17:23:54
 * @desc [description]
 * flow
 */

import Alert from 'component/Alert';
import rootStore from 'store/RootStore';
import NavigationSvc from 'svc/NavigationSvc';
import { runInAction } from 'mobx';

// 0审核不通过/已下架  1审核通过  2待审核  3待完善资料"
const isShopAuthed = () => {
    if (rootStore.userStore.tenantFlag === 1) {
        return true;
    } else {
        Alert.alert(
            '提示',
            '门店信息审核中，如须加急，请联系好店客服，18143464200。',
            [
                {
                    text: '取消',
                    onPress: () => {}
                },
                {
                    text: '重新认证',
                    onPress: () => {
                        if (rootStore.userStore.tenantFlag === 1) {
                            return;
                        }
                        runInAction(() => {
                            NavigationSvc.navigate('ShopAuthScreen');
                        });
                    }
                }
            ]
        );
        return false;
    }
};

// 0审核不通过/已下架  1审核通过  2待审核  3待完善资料"
// const isBuyAuthed = () => {
//     if (rootStore.userStore.tenantFlag === 1) {
//         return true;
//     } else {
//         if (rootStore.userStore.tenantFlag === 3) {
//             Alert.alert(
//                 '提示',
//                 '商陆好店是一款仅限实体服装零售店主使用的APP，购买前请先完成店主认证',
//                 [
//                     {
//                         text: '立即前往',
//                         onPress: () => {
//                             if (rootStore.userStore.tenantFlag === 1) {
//                                 return;
//                             }
//                             NavigationSvc.navigate('ShopAuthScreen');
//                         }
//                     }
//                 ]
//             );
//         } else {
//             Alert.alert(
//                 '提示',
//                 '门店信息审核中，如须加急，请联系好店客服，18143464200。',
//                 [
//                     {
//                         text: '取消',
//                         onPress: () => {}
//                     },
//                     {
//                         text: '重新认证',
//                         onPress: () => {
//                             if (rootStore.userStore.tenantFlag === 1) {
//                                 return;
//                             }
//                             NavigationSvc.navigate('ShopAuthScreen');
//                         }
//                     }
//                 ]
//             );
//         }
//         return false;
//     }
// };

export default {
    isShopAuthed
    // isBuyAuthed
};
