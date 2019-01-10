/**
 * author: wwj
 * Date: 2018/9/6
 * Time: 下午2:56
 * des:
 * @flow
 */

import { AsyncStorage, NativeModules, PermissionsAndroid } from 'react-native';
import Alert from 'component/Alert';

type Status = 'authorized' | 'denied' | 'restricted' | 'undetermined';
type Rationale = { title: string, message: string };
type CheckOptions = string | { type: string };
type RequestOptions = string | { type: string, rationale?: Rationale };

const permissionTypes = {
    location: PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    camera: PermissionsAndroid.PERMISSIONS.CAMERA,
    microphone: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    contacts: PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
    event: PermissionsAndroid.PERMISSIONS.READ_CALENDAR,
    storage: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    photo: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    callPhone: PermissionsAndroid.PERMISSIONS.CALL_PHONE,
    readSms: PermissionsAndroid.PERMISSIONS.READ_SMS,
    receiveSms: PermissionsAndroid.PERMISSIONS.RECEIVE_SMS
};

const RESULTS = {
    [PermissionsAndroid.RESULTS.GRANTED]: 'authorized',
    [PermissionsAndroid.RESULTS.DENIED]: 'denied',
    [PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN]: 'restricted'
};

const STORAGE_KEY = '@RNPermissions:didAskPermission:';

const setDidAskOnce = (permission: string) =>
    AsyncStorage.setItem(STORAGE_KEY + permission, 'true');

const getDidAskOnce = (permission: string) =>
    AsyncStorage.getItem(STORAGE_KEY + permission).then(item => !!item);

class PermissionsAndroidUtl {
    canOpenSettings: () => Promise<boolean> = () => Promise.resolve(false);

    openSettings: () => Promise<*> = () =>
        Promise.reject(new Error('openSettings is deprecated on android'));

    getTypes: () => Array<string> = () => Object.keys(permissionTypes);

    check = (permission: string, options?: CheckOptions): Promise<Status> => {
        if (!permissionTypes[permission]) {
            const error = new Error(
                `ReactNativePermissions: ${permission} is not a valid permission type on Android`
            );

            return Promise.reject(error);
        }

        return PermissionsAndroid.check(permissionTypes[permission]).then(
            isAuthorized => {
                if (isAuthorized) {
                    return 'authorized';
                }

                return getDidAskOnce(permission).then(didAsk => {
                    if (didAsk) {
                        return NativeModules.PermissionsAndroid.shouldShowRequestPermissionRationale(
                            permissionTypes[permission]
                        ).then(shouldShow =>
                            shouldShow ? 'denied' : 'restricted'
                        );
                    }

                    return 'undetermined';
                });
            }
        );
    };

    request = (
        permission: string,
        options?: RequestOptions
    ): Promise<Status> => {
        if (!permissionTypes[permission]) {
            const error = new Error(
                `ReactNativePermissions: ${permission} is not a valid permission type on Android`
            );

            return Promise.reject(error);
        }

        let rationale;

        if (options && options.rationale) {
            rationale = options.rationale;
        }

        return PermissionsAndroid.request(
            permissionTypes[permission],
            rationale
        ).then(result => {
            // PermissionsAndroid.request() to native module resolves to boolean
            // rather than string if running on OS version prior to Android M
            if (typeof result === 'boolean') {
                return result ? 'authorized' : 'denied';
            }

            return setDidAskOnce(permission).then(() => RESULTS[result]);
        });
    };

    checkMultiple = (
        permissions: Array<string>
    ): Promise<{ [string]: string }> =>
        Promise.all(permissions.map(permission => this.check(permission))).then(
            result =>
                result.reduce((acc, value, index) => {
                    const name = permissions[index];
                    acc[name] = value;
                    return acc;
                }, {})
        );
}

export const requestMultiplePermission = async () => {
    try {
        const permissions = [
            // 升级提醒中已经申请该权限
            //PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            PermissionsAndroid.PERMISSIONS.CAMERA,
            PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
            PermissionsAndroid.PERMISSIONS.PROCESS_OUTGOING_CALLS,
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
            PermissionsAndroid.PERMISSIONS.SEND_SMS,
        ];
        //返回得是对象类型
        const granteds = await PermissionsAndroid.requestMultiple(permissions);

        let location =
            granteds['android.permission.ACCESS_FINE_LOCATION'] === 'granted';
        let camera = granteds['android.permission.CAMERA'] === 'granted';
        // let storage =
        //     granteds['android.permission.WRITE_EXTERNAL_STORAGE'] ===
        //     'granted';
        // 监听电话状态
        let readPhoneState =
            granteds['android.permission.READ_PHONE_STATE'] === 'granted';
        let outgoingCalls =
            granteds['android.permission.PROCESS_OUTGOING_CALLS'] === 'granted';

        let recordAudio = granteds['android.permission.RECORD_AUDIO'] === 'granted';

        if (location && camera && readPhoneState && outgoingCalls && recordAudio) {
            /**
             * 权限都有
             */
        } else {
            Alert.alert('部分权限没有授予,可能导致app部分功能不可用');
        }
    } catch (err) {
        console.log(err.toString());
    }
};

export const requestCameraPermission = async () => {
    try {
        const permissions = [
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            PermissionsAndroid.PERMISSIONS.CAMERA
        ];
        //返回得是对象类型
        const granteds = await PermissionsAndroid.requestMultiple(
            permissions
        );

        let camera = granteds['android.permission.CAMERA'] === 'granted';
        let storage =
            granteds['android.permission.WRITE_EXTERNAL_STORAGE'] ===
            'granted';

        if (camera && storage) {
            /**
             * 权限都有
             */
            this.showImagePicker();
        } else {
            Alert.alert('相机或存储空间权限没有授予,请前往设置应用权限中开启权限');
        }
    } catch (err) {
        //
    }
};

export function getLocationImg(calBack,data,key) {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE)
        .then(result => {
            if (result) {
                calBack && calBack(data,key);
            } else {
                Alert.alert('没有存储权限,不能继续分享');
            }
        })
        .catch(error => {
            if (typeof error === 'string') {
                Alert.alert(error);
            }
        });
}


export default new PermissionsAndroidUtl();
