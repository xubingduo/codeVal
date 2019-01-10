/**
 * author: tuhui
 * Date: 2018/7/10
 * Time: 15:25
 * @flow
 * des: 保存用户信息的全局store
 */
import { RootStore } from 'store/RootStore';
import { observable, computed, action } from 'mobx';
import storage from 'utl/DLStorage';
import DLFetch from '@ecool/react-native-dlfetch';
import UserApiManager from '../apiManager/UserApiManager';
import DocSvc from '../svc/DocSvc';
import IndexApiManager from '../apiManager/IndexApiManager';
import rootStore from './RootStore';
import { SYS_CONFIG_PARAMS } from './ConfigStore';

type UserType = {
    sessionId: string, //会话id
    tenantId: number, // 租户id
    tenantName: string, //租户名称
    unitId: number, //单元id
    userId: number, // 用户id
    clusterId: number, // 集群id
    clusterCode: string, //集群代码
    tenantFlag: number, //店铺认证状态 1已审核  0待审核
    mobile: string, //手机号
    nickName: string, //昵称
    avatar: string, //头像
    loginTime: string, //登录时间,
    shopName: string, // 店铺名称
    extProps: Object //IM额外信息
};

/**
 * 缓存用户信息的KEY
 */
const STORAGE_LOGIN_USER_INFO = 'USERINFO';

class UserStore {
    @observable
    user: ?UserType;
    @observable
    sessionId: ?string;

    @observable
    tenantFlag: ?number;
    /**
     * 账户资料信息 如头像 昵称等
     * @type {null}
     */
    @observable
    accountInfo = {};

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    /**
     * 初始化设置
     */
    initialSetup = async () => {
        let userInfo = await storage.load({ key: STORAGE_LOGIN_USER_INFO });
        if (!userInfo) {
            return Promise.reject('缓存用户不存在');
        }
        this.saveUser(userInfo);
    };

    @action
    saveUser = async (user: ?UserType) => {
        this.user = user;
        this.sessionId = user ? user.sessionId : null;
        this.tenantFlag = user ? user.tenantFlag : null;
        DLFetch.setCommonParams({ sessionId: this.sessionId });
        DLFetch.setUrlCommonParams({
            _cid: this.user ? this.user.clusterCode : 0,
            _tid: this.user ? this.user.tenantId : 0
        });
        storage.save({
            key: STORAGE_LOGIN_USER_INFO,
            data: user
        });

        this.syncSysParams();
    };

    async syncSysParams() {
        await rootStore.configStore.fetchSysParamsBatch({
            jsonParam: {
                codes: SYS_CONFIG_PARAMS.join(','),
                domainKind: 'system',
                ownerKind: '1',
                readOnlyAll: '1',
                ownerLevelAll: '1'
            }
        });
    }

    @action
    updateTenantFlag = (tenantFlag: number) => {
        if (this.user) {
            this.user.tenantFlag = tenantFlag;
        }

        this.saveUser(this.user);
    };

    @action
    clearCache = () => {
        this.saveUser(null);
    };

    /**
     * 获取用户账户信息
     */
    queryAccountInfo(callback?: Function) {
        UserApiManager.fetchUserInfoProvider().then(
            action(({ data }) => {
                if (data) {
                    this.accountInfo = data;
                    if (this.accountInfo.avatar) {
                        this.accountInfo.avatarId = this.accountInfo.avatar;
                        this.accountInfo.avatar = DocSvc.docURLS(
                            this.accountInfo.avatar
                        );
                    }
                    if (this.user) {
                        this.user.mobile = data.mobile;
                        this.user.nickName = data.nickName;
                        this.user.avatar = this.accountInfo.avatar ? this.accountInfo.avatar : '';
                    }
                    if (callback) {
                        callback(true, data);
                    }
                }
            }),
            error => {
                if (callback) {
                    callback(false, error.message);
                }
            }
        );
    }

    /**
     * 获取并将店铺名称存放入 user
     * @param callback
     */
    queryAndLoadShopName() {
        IndexApiManager.fetchShopAuthInfo({ jsonParam: {} }).then(
            action(({ data }) => {
                if (data && this.user) {
                    this.user.shopName = data.shopName;
                }
            }),
            error => {}
        );
    }
}

export default UserStore;
