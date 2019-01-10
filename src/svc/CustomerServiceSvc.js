/**
 * author: wwj
 * Date: 2018/9/11
 * Time: 下午4:51
 * des:
 * @flow
 */

import rootStore from '../store/RootStore';
import DLCustomerServiceLib from '@ecool/react-native-dlcustomerservicelib';
import DeviceInfo from 'react-native-device-info';

/**
 * 跳转到平台客服
 */
const showChatScreen = (customInfo: ?Object) => {
    let user = rootStore.userStore.user;
    DLCustomerServiceLib.setupUserInfo({
        appkey: '8cc4af9d71944689a3e45669b720d426',
        userId: user && user.userId ? user.userId.toString() : '',
        phone: user && user.mobile ? user.mobile.toString() : '',
        nickName: user && user.nickName ? user.nickName.toString() : '',
        customTitle: '平台客服',
        skillSetName: '商陆好店',
        skillSetId: '5bde5be7ce714cb2b6adee9622ad4804',
        shopName: user && user.shopName ? user.shopName.toString() : '',
        appVersion: DeviceInfo.getVersion() ? DeviceInfo.getVersion() : '',
        ...customInfo
    });
    DLCustomerServiceLib.showChatScreen();
};

export default {
    showChatScreen
};
