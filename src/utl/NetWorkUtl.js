/**
 * @author sml2
 * @date 2018/10/27.
 * @desc 网络检测
 * @flow
 */
import {Platform,NetInfo} from 'react-native';

let connect = false;
let isListen = false;

const netChange = (isConnect) => {
    connect = isConnect;
};

const removeNetWorkListener = (handler: Function)=>{
    NetInfo.removeEventListener(
        'connectionChange',
        handler,
    );
};

const addNetWorkListener = (handler: Function)=>{
    NetInfo.addEventListener(
        'connectionChange',
        handler,
    );
};

/**
 * RN获取网络状态， iOS在第一次不能正确获取网络状态，以后的每次均能获取成功。所以需要在项目启动后调用一次getNetWorkState方法。
 */
async function getNetWorkState() {
    if(!isListen){
        isListen = true;
        await NetInfo.isConnected.addEventListener('connectionChange', netChange);
    }
    if (Platform.OS === 'ios') {
        return connect;
    } else {
        return await NetInfo.isConnected.fetch();
    }
}

export default {
    getNetWorkState:getNetWorkState,
    removeNetWorkListener:removeNetWorkListener,
    addNetWorkListener:addNetWorkListener,
};