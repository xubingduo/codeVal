/**
 * author: tuhui
 * Date: 2018/7/10
 * Time: 15:25
 * @flow
 * des: 登录的store
 */

import { RootStore } from 'store/RootStore';
import { NativeModules } from 'react-native';
import { observable, computed, action, runInAction } from 'mobx';
import DLFetch from '@ecool/react-native-dlfetch';
import regUtil from 'utl/RegUtil';
import MessageSvc from 'svc/MessageSvc';
import DataSyncSvc from 'svc/DataSyncSvc';
import storage from 'utl/DLStorage';
import { STORAGE_INDEX_CACHE } from 'module/index/store/IndexStore';
import { DLIMManagerLib } from '@ecool/react-native-dlimlib';
import Config from '../config/Config';
import OtherApiManager from 'apiManager/OtherApiManager';

const STORAGE_LAST_LOGIN_ACCOUNT = 'LASTACCOUNT';

// const STORAGE_IN_TRU_USE = 'INTRYUSE';

class AuthStore {
    @observable
    account: string = '';
    @observable
    verifyCode: string = '';

    @observable
    syncError: ?Object = null;

    /**
     * 能否试用
     */
    // @observable
    // canTryUse: boolean;

    /**
     * 是否点过试用
     */
    // @observable
    // inTryUse: boolean;

    /**
     * 邀请码
     */
    // @observable
    // inviteCode: string;

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    /**
     * 设置上次登录账号
     */
    @action
    initLastAccount = async (callback: Function) => {
        this.verifyCode = '';
        await storage
            .load({
                key: STORAGE_LAST_LOGIN_ACCOUNT
            })
            .then(ret => {
                if (ret) {
                    runInAction(() => (this.account = ret));
                    callback(true);
                }
            })
            .catch(error => {
                callback(false);
            });
    };

    @action
    setAccount = (account: string) => {
        this.account = account;
        return regUtil.isPhoneNumber(account);
    };

    @action
    setVerifyCode = (verifyCode: string) => {
        this.verifyCode = verifyCode;
        return (
            regUtil.isPhoneNumber(this.account) &&
            verifyCode.length > 0 &&
            regUtil.isPureNumber(verifyCode)
        );
    };

    // @action
    // setInviteCode = (inviteCode: string) => {
    //     this.inviteCode = inviteCode;
    // };

    /**
     * 获取验证码
     */
    @action
    fetchVerifyCode = async () => {
        try {
            await DLFetch.post('/spg/api.do', {
                apiKey: 'ec-spugr-spSmsCaptcha-sendCode',
                mobile: this.account
            });
        } catch (error) {
            global.dlconsole.log(error.message);
            return Promise.reject(error);
        }
        return Promise.resolve();
    };

    @action
    login = async () => {
        global.dlconsole.log('点击登录');
        this.rootStore.userStore.clearCache();
        let params = {
            jsonParam: {
                code: this.account,
                captcha: this.verifyCode,
                authcType: '2' //验证码
            },
            apiKey: 'ec-spugr-spLogin-userLogin'
        };

        try {
            let loginInfo = await DLFetch.post('/spg/api.do', params);
            global.dlconsole.log(
                `用户登录成功:${
                    loginInfo.data ? JSON.stringify(loginInfo.data) : ''
                }`
            );
            this.rootStore.userStore.saveUser(loginInfo.data);
            this.startGetui();
            // if (this.inviteCode) {
            //     //填写了邀请码
            //     let verifyParams = {
            //         jsonParam: {
            //             mobile: this.account,
            //             inviteCode: this.inviteCode
            //         }
            //     };
            //     let { data } = await OtherApiManager.verifyInviteCode(
            //         verifyParams
            //     );
            //     global.dlconsole.log('邀请码验证结果：', data);
            //     if (data.val === -1) {
            //         return Promise.reject(new Error('请输入有效的邀请码'));
            //     } else if (data.val === 1) {
            //         //市场码可直接通过
            //         loginInfo.data.tenantFlag = 1;
            //         this.rootStore.userStore.saveUser(loginInfo.data);
            //     } else if (data.val === 0) {
            //         //街边码需验证,原逻辑
            //     }
            // }

            // if (this.rootStore.userStore.tenantFlag !== 1) {
            //     this.authTryUse();
            // }

            //同步本地缓存数据
            await DataSyncSvc.startSync();
            runInAction(() => {
                this.rootStore.isLogin = true;
            });

            await storage.save({
                key: STORAGE_LAST_LOGIN_ACCOUNT,
                data: loginInfo.data.mobile
            });
            this.imLogin();
        } catch (error) {
            this.rootStore.userStore.clearCache();
            return Promise.reject(error);
        }

        return Promise.resolve();
    };

    @action
    logout = async () => {
        //退出登录接口
        global.dlconsole.log('退出登录');
        try {
            await DLFetch.post('/spg/api.do', {
                apiKey: 'ec-spugr-spLogin-logout'
            });
            this.clearLocalCache();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 登出时清理本地数据
     */
    @action
    clearLocalCache = () => {
        global.dlconsole.log('清理本地');
        runInAction(() => (this.rootStore.isLogin = false));
        storage.save({ key: STORAGE_INDEX_CACHE, data: null });
        // storage.save({ key: STORAGE_IN_TRU_USE, data: null });
        //清除本地用户信息
        this.rootStore.userStore.clearCache();
        //重置所有全局store
        this.rootStore.reset();
        //更新登录状态为false
        NativeModules.DLConfigManager.stop();
        MessageSvc.stop();
        DLIMManagerLib.logout();
    };

    /**
     * 登录时验证sessionId
     */
    checkSession = async () => {
        global.dlconsole.log('检查sessionId');
        try {
            let { code, data, msg } = await DLFetch.post('/spg/api.do', {
                apiKey: 'ec-spugr-spLogin-fetchSession'
            }, 2500);

            if (code !== 0) {
                let err = new Error(msg);
                return Promise.reject(err);
            } else {
                global.dlconsole.log(
                    `checkSession登录成功:${data ? JSON.stringify(data) : ''}`
                );
                this.rootStore.userStore.saveUser(data);

                // if (this.rootStore.userStore.tenantFlag !== 1) {
                //     this.authTryUse();
                // }
                //同步本地缓存数据
                await DataSyncSvc.startSync();
                this.startGetui();
                runInAction(() => {
                    this.rootStore.isLogin = true;
                });

                await storage.save({
                    key: STORAGE_LAST_LOGIN_ACCOUNT,
                    data: data.mobile
                });
                this.imLogin();
            }
            global.dlconsole.setAutoUpload(true);
        } catch (error) {
            if (!error) {
                this.rootStore.userStore.clearCache();
            }
            return Promise.reject(error);
        }
        return Promise.resolve();
    };

    /**
     * 注册个推
     */
    startGetui = () => {
        global.dlconsole.log('启动个推');
        // app开启接收消息服务
        MessageSvc.start();
        // 启动个推服务 appId appKey appSecret
        NativeModules.DLConfigManager.startGetui();
    };

    /**
     * IM登录
     */
    imLogin = () => {
        //IM登录
        DLIMManagerLib.setupConfig({
            imageBaseUrl: Config.DocDownUrl
        });
        if (
            this.rootStore.userStore.user &&
            this.rootStore.userStore.user.extProps &&
            this.rootStore.userStore.user.extProps.im
        ) {
            DLIMManagerLib.login(
                this.rootStore.userStore.user.extProps.im.imAccid,
                this.rootStore.userStore.user.extProps.im.imToken,
                (result, desc) => {
                    DLIMManagerLib.fetchAllUnreadCount(count => {
                        runInAction(() => {
                            this.rootStore.messageCenterStore.imUnreadMessageCount = count;
                        });
                    });
                }
            );
        }
    };

    /**
     * 试用权限认证
     */
    // @action
    // authTryUse = () => {
    //     this.initialTryUse();
    //     try {
    //         OtherApiManager.checkTryUse().then(result => {
    //             let { data } = result;
    //             global.dlconsole.log('试用权限认证结果： ', data);
    //             if (data.val === -1) {
    //                 //试用结束
    //                 runInAction(() => {
    //                     this.inTryUse = false;
    //                     this.canTryUse = false;
    //                 });
    //                 storage.save({ key: 'INTRYUSE', data: false });
    //             } else {
    //                 runInAction(() => (this.canTryUse = true));
    //             }
    //         });
    //     } catch (error) {
    //         this.canTryUse = true;
    //     }
    // };

    /**
     * 初始化是否在试用中
     */
    // initialTryUse = async () => {
    //     if (this.inTryUse) {
    //         return;
    //     }
    //     await storage
    //         .load({
    //             key: STORAGE_IN_TRU_USE
    //         })
    //         .then(ret => {
    //             this.inTryUse = ret;
    //         })
    //         .catch(error => {});
    // };
}

export default AuthStore;
