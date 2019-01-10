/**
 * author: tuhui
 * Date: 2017/12/4
 * Time: 下午5:24
 * @flow
 */
import {DLLogFileModule} from '@ecool/react-native-dllog';
import {fetch} from 'fetch';
import {Platform} from 'react-native';
import DeviceInfo from 'react-native-device-info';

const logUploadUrl = 'http://log.hzdlsoft.com:8081/clog/clog';
let LogFileUpload = {};
import rootStore from 'store/RootStore';

let paramsFormData = {
    deviceNo: '',
    uniCode: '',
};

var dlconsole = new DLLogFileModule({
    /* 日志文件最大数量 默认=7*/
    maxCount: 7,

    /* 日志模式：0表示只打印控制台，1表示只写到文件 2表示控制台和文件(默认）*/
    logMode: 2,

    /* 目录文件夹名称 */
    directoryName: 'DLLog',

    /* 是否自动上传 默认为false*/
    autoUploadEnable: true,

    /* 文件上传操作 回调参数(filePath,isAuto,uploadFileCompleteHandler)
     *  param filePath string 压缩文件路径
     *  param isAuto bool 是否属于自动上传
     *  param 如果上传成功需要调用 uploadFileCompleteHandler(true) 反之 需要调用 uploadFileCompleteHandler(false)
     * */
    uploadFilehandler: (filePath, isAuto, uploadFileCompleteHandler) => {
        let formData = new FormData();
        let file = {uri: 'file://' + filePath, type: 'application/octet-stream', name: 'file.zip'};
        formData.append('file', file);

        let productType = Platform.OS === 'ios' ? 'slhGoodShopIOS' : 'slhGoodShopAndroid';
        formData.append('productType', productType);

        /**
         * 设备型号
         */
        formData.append('device', DeviceInfo.getBrand());
        /**
         * mac地址 传用户手机号
         */
        formData.append('mac', rootStore.userStore.user ? rootStore.userStore.user.mobile : '');
        /**
         * 客户编号
         */
        formData.append('sn', '');
        /**
         * 系统版本
         */
        formData.append('osVersion', DeviceInfo.getSystemVersion());
        /**
         * 产品版本
         */
        formData.append('productVersion', DeviceInfo.getVersion());

        return fetch(logUploadUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            body: formData,
        })
            .then((response) => response.text())
            .then((responseData) => {
                uploadFileCompleteHandler(true);
            })
            .catch((error) => {
                uploadFileCompleteHandler(false, error);
            });
    },
});

LogFileUpload.setParams = function (deviceNo: string, uniCode: string) {
    paramsFormData.uniCode = uniCode;
    paramsFormData.deviceNo = deviceNo;
};

// 这样可以全局使用这个dlconsole
global.dlconsole = dlconsole;
export default LogFileUpload;