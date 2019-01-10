/**
 * @author tutu
 * @create date 2018-7-10
 * @flow
 */
import AuthStore from 'store/AuthStore';
import ShoppingCartStore from 'store/ShoppingCartStore';
import UserStore from 'store/UserStore';
import ShopStore from 'module/login/store/ShopStore';
import { observable } from 'mobx';
import DLFetch from '@ecool/react-native-dlfetch';
import configStore, { ConfigStore } from './ConfigStore';
import GuideStore from './GuideStore';
import MessageCenterStore from './MessageCenterStore';
import SearchHistoryStore from './SearchHistoryStore';
import MaskStore from './MaskStore';
import commonStore, { CommonStore } from './CommonStore';
import BillingConfirmStore from 'module/bill/store/BillingConfirmStore';

export class RootStore {
    // 是否登录
    @observable
    isLogin: boolean = false;

    /**
     * 根视图
     */
    app: Object;
    /**
     * 通用
     */
    commonStore: CommonStore;
    /**
     * 授权
     */
    authStore: AuthStore;
    /**
     * 购物车
     */
    shoppingCartStore: ShoppingCartStore;
    /**
     * 用户信息
     */
    userStore: UserStore;

    /**
     * 店铺信息
     */
    shopStore: ShopStore;

    /**
     * 下单Store
     */
    billingConfirmStore: BillingConfirmStore;

    configStore: ConfigStore;
    /**
     * 引导页信息
     */
    guideStore: GuideStore;

    /**
     * 搜索历史
     */
    searchHistoryStore: SearchHistoryStore;

    messageCenterStore: MessageCenterStore;
    /**
     * 新手引导页面
     */

    maskStore: MaskStore;

    constructor() {
        this.reset();
    }

    /**
     * 重置所有的全局Store
     */
    reset = () => {
        // 全局Store （登入前需要加载的store）
        this.configStore = configStore;
        this.commonStore = commonStore;
        this.authStore = new AuthStore(this);
        this.shoppingCartStore = new ShoppingCartStore(this);
        this.userStore = new UserStore(this);
        this.shopStore = new ShopStore();
        this.messageCenterStore = new MessageCenterStore(this);
        this.guideStore = new GuideStore(this);
        this.searchHistoryStore = new SearchHistoryStore(this);
        this.maskStore = new MaskStore();
        this.billingConfirmStore = new BillingConfirmStore(this);
    };

    /**
     * 应用启动的时候加载缓存数据
     */
    loadCache = async () => {
        await this.userStore.initialSetup();
    };

    updateApp() {
        this.app.forceUpdate();
    }
}

export default new RootStore();
