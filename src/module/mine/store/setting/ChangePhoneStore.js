/**
 * author: wwj
 * Date: 2018/8/9
 * Time: 上午10:55
 * des:
 * @flow
 */
import { observable, computed, action, runInAction } from 'mobx';
import regUtil from '../../../../utl/RegUtil';
import DLFetch from '@ecool/react-native-dlfetch';
import UserApiManager from '../../../../apiManager/UserApiManager';
import storage from 'utl/DLStorage';

const STORAGE_LAST_LOGIN_ACCOUNT = 'LASTACCOUNT';

export default class ChangePhoneStore {
    @observable phone: string;
    @observable verifyCode: string;

    @action
    setPhone = (phone: string) => {
        this.phone = phone;
        return regUtil.isPhoneNumber(phone);
    };

    @action
    setVerifyCode = (verifyCode: string) => {
        this.verifyCode = verifyCode;
        return (
            regUtil.isPhoneNumber(this.phone) &&
            verifyCode.length > 0 &&
            regUtil.isPureNumber(verifyCode)
        );
    };

    /**
     * 获取验证码
     */
    @action
    fetchVerifyCode = async () => {
        try {
            await DLFetch.post('/spg/api.do', {
                apiKey: 'ec-spugr-spSmsCaptcha-sendCode',
                mobile: this.phone
            });
        } catch (error) {
            return Promise.reject(error);
        }
        return Promise.resolve();
    };

    /**
     * 修改用户的手机号码请求
     * @param verifyCode
     * @param callback
     */
    changeUserMobile(verifyCode: string, callback: Function){
        UserApiManager.changeMobileProvider({
            jsonParam: {
                mobile: this.phone,
                captcha: verifyCode,
            }
        }).then(action(({data}) => {
            callback(true, 0);
            // 将修改后的手机号码作为下次登录的手机号
            this.savePhoneToLocal(this.phone);
        }), (error) => {
            callback(false, error.message);
        });
    }

    savePhoneToLocal = async (mobile: string) => {
        try{
            await storage.save({
                key: STORAGE_LAST_LOGIN_ACCOUNT,
                data: mobile
            });
        }catch (e) {
            __DEV__ && console.log(e.message);
        }
    }
}