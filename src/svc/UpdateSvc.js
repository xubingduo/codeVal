import Alert from '../component/Alert';
import {Toast} from '@ecool/react-native-ui';
import IndexApiManager from '../apiManager/IndexApiManager';
import {Linking, Platform} from 'react-native';
import rootStore from 'store/RootStore';
import Config from '../config/Config';
import DeviceInfo from 'react-native-device-info/deviceinfo';
import {NativeModules} from 'react-native';


let UpdateModule = NativeModules.UpdateModule;

/**
 * @Author: tt
 * @CreateDate:2018/11/20
 * @ModifyDate:2018/11/20
 * @desc 升级服务
 */

const checkUpdateIos = async () => {

};

const checkUpdateAndroid=()=>{

    let baseUrl = Config.entranceServerUrl1;
    let phone = rootStore.userStore.user
        ? rootStore.userStore.user.mobile
        : '';

    if (!phone || !baseUrl) {
        return;
    }

    global.dlconsole.log(
        'sessionId=' + rootStore.userStore.user.sessionId
    );
    global.dlconsole.log('安卓检查更新');

    let params = {
        deviceno: phone.toString(),
        devicetype: Platform.OS === 'ios' ? '18' : '19',
        sessionId: rootStore.userStore.user.sessionId,
        productVersion: DeviceInfo.getVersion().toString(),
        dlProductCode:
            Platform.OS === 'ios' ? 'slhGoodShopIOS' : 'slhGoodShopAndroid'
    };
    UpdateModule.checkUpdate(
        baseUrl + '/spg/checkUpgrade.do',
        params,
        isNeedUpdate => {
        }
    );
};

export default {
    checkUpdateIos,
    checkUpdateAndroid
};