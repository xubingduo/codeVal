/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 */

import React, { Component } from 'react';
import {
    View,
    Platform,
    StatusBar,
    Linking,
    Image,
    Dimensions,
    AppState
} from 'react-native';
import StackViewStyleInterpolator from 'react-navigation-stack/dist/views/StackView/StackViewStyleInterpolator';
import { Provider, observer } from 'mobx-react';
import DLFetch from '@ecool/react-native-dlfetch';
import rootStore from 'store/RootStore';

import { createStackNavigator } from 'react-navigation';
import MainContainerScreen from './src/module/main/MainContainerScreen';
import NavigationSvc from './src/svc/NavigationSvc';
import goods from './src/module/goods';
import index from './src/module/index/index';
import DeviceInfo from 'react-native-device-info';
import mine from './src/module/mine/index';
import bill from './src/module/bill';
import order from './src/module/order/index';
import scan from './src/module/scan/index';
import LoginScreen from './src/module/login/screen/LoginScreen';
import BusinessCategoryChooseScreen from 'module/login/screen/BusinessCategoryChooseScreen';
import PriceRangeScreen from 'module/login/screen/PriceRangeScreen';
import coupon from './src/module/coupon/index';
import EmptyView from './src/component/EmptyView';
import ShopAuthScreen from 'module/login/screen/ShopAuthScreen';
import UserProtocol from 'module/login/screen/UserProtocol';
import { action, runInAction, observable } from 'mobx';
import codePush from 'react-native-code-push';
import ShoppingCartWrapScreen from './src/module/shoppingCart/screen/ShoppingCartWrapScreen';
import LoginWrapScreen from './src/module/login/screen/LoginWrapScreen';
//import { Sentry } from 'react-native-sentry';
import Config, { IS_STAND_APP, TEST_ENVIRONMENT } from './src/config/Config';
import GuideScreen from './src/module/guide/screen/GuideScreen';
import SplashScreen from '@ecool/react-native-splash-screen';
import MessageSvc from 'svc/MessageSvc';
import * as _ from 'lodash';
import Alert from './src/component/Alert';
import isIphoneX from 'utl/PhoneUtl';
import NetWorkUtl from 'utl/NetWorkUtl';
import { getStorage } from './src/svc/StorageSvc';
import { IS_AUTO_CHANGE_NET } from './src/config/Constant';
import LinkingSvc from './src/svc/LinkingSvc';
import OtherApiManager from 'apiManager/OtherApiManager';

const { width, height } = Dimensions.get('window');
const deepLink =
    Platform.OS === 'android' ? 'ShopIndex://shopId/' : 'ShopIndex://';

IS_STAND_APP &&
    codePush.getUpdateMetadata().then(update => {
        if (update) {
            //Sentry.setVersion(update.appVersion + '-codepush:' + update.label);
        }
    });

const routeConfigs = {
    MainContainerScreen: {
        screen: MainContainerScreen
    },
    LoginScreen: {
        screen: LoginScreen
    },
    LoginWrapScreen: {
        screen: LoginWrapScreen
    },
    ShoppingCartWrapScreen: {
        screen: ShoppingCartWrapScreen
    },
    BusinessCategoryChooseScreen: {
        screen: BusinessCategoryChooseScreen
    },
    PriceRangeScreen: {
        screen: PriceRangeScreen
    },
    ShopAuthScreen: {
        screen: ShopAuthScreen
    },
    UserProtocol: {
        screen: UserProtocol
    },
    ...goods,
    ...index,
    ...mine,
    ...bill,
    ...order,
    ...scan, // 扫码页面
    ...coupon
};

const shopAuthRouteConfigs = {
    ShopAuthScreen: {
        screen: ShopAuthScreen
    },
    UserProtocol: {
        screen: UserProtocol
    },
    ...routeConfigs
};

const stackNavigatorConfig = {
    headerMode: 'screen',
    transitionConfig: () => ({
        screenInterpolator: StackViewStyleInterpolator.forHorizontal
    })
};

const MainStack = createStackNavigator(routeConfigs, stackNavigatorConfig);

const ShopAuthStack = createStackNavigator(
    shopAuthRouteConfigs,
    stackNavigatorConfig
);

@observer
class App extends Component<any> {
    //登录信息缓存是否加载完成
    @observable
    loadCacheCompleted = false;

    @observable
    loadGuideCompeleted = false;

    constructor(props) {
        super(props);
        // 开启外链监听
        dlconsole.log('打开app过程日志----->constructor');
        dlconsole.log(
            '打开app过程日志----->loadCacheCompleted=' + this.loadCacheCompleted
        );
        //Alert.alert(JSON.stringify(props));
        this.state = {
            currentAppState: AppState.currentState,
            emptyViewType: '',
            emptyViewMsg: ''
        };
        rootStore.app = this;
    }

    componentDidMount() {
        DLFetch.init();
        DLFetch.setTimeOutSeconds(7000);

        DLFetch.setLogInterceptor(data => {
            try {
                if (typeof data === 'object') {
                    global.dlconsole.log(JSON.stringify(data));
                } else {
                    global.dlconsole.log(data);
                }
            } catch (e) {
                global.dlconsole.log(e);
            }
        });

        // 配置网路请求统一参数
        DLFetch.setCommonParams({
            productCode: Platform.select({
                ios: 'slhGoodShopIOS',
                android: 'slhGoodShopAndroid'
            }),
            productVersion: DeviceInfo.getVersion(),
            devicetype: Platform.OS === 'ios' ? 18 : 19
        });

        DLFetch.setResultFilterOr(response => {
            if (response.code === -9) {
                /**
                 * session失效
                 */
                Alert.alert('登录过期,请重新登录');
                rootStore.authStore.clearLocalCache();
            }
        });
        // todo 测试时网络错误频繁 暂时屏蔽 以免影响测试
        DLFetch.setOriginalNetErrorFilterOr(error => {
            try {
                this.switchBaseUrl(error);
            } catch (e) {
                dlconsole.log('切换网络报错');
                dlconsole.log(e.message);
            }
        });

        //DLFetch.setBaseUrl('http://192.168.0.34:80');
        DLFetch.setBaseUrl(Config.entranceServerUrl1);
        dlconsole.log('打开app过程日志----->componentDidMount1');

        rootStore.configStore.loadIndexCacheData();

        // appq启动先调用一次网络检测
        NetWorkUtl.getNetWorkState();

        dlconsole.log('打开app过程日志----->componentDidMount2');
        dlconsole.log('打开app过程日志----->componentDidMount3');
        this.syncData();
        AppState.addEventListener('change', this.handleAppStateChange);
        Platform.OS === 'android' && SplashScreen.hide();
        dlconsole.log('打开app过程日志----->componentDidMount4');
    }

    componentWillUnmount() {
        dlconsole.log('打开app过程日志----->componentWillUnmount');
        AppState.removeEventListener('change', this.handleAppStateChange);
        // 停止外链监听
        LinkingSvc.stopListner();
        this.timer && clearTimeout(this.tier);
    }

    handleAppStateChange = nextAppState => {
        if (
            this.state.currentAppState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            MessageSvc.setupBadgeCount(0);
            // rootStore.authStore.authTryUse();
        } else if (
            this.state.currentAppState === 'active' &&
            nextAppState.match(/inactive|background/)
        ) {
            if (rootStore.messageCenterStore.unreadMessageCount > 0) {
                MessageSvc.setupBadgeCount(1);
            } else {
                MessageSvc.setupBadgeCount(0);
            }
        }
        this.setState({ currentAppState: nextAppState });
    };

    //同步缓存数据
    syncData = async () => {
        this.timer = setTimeout(() => {
            this.setState({emptyViewType: 'LOADING', emptyViewMsg: '努力请求中...'});
        }, 200);
        // this.setState({emptyViewType: 'LOADING', emptyViewMsg: '努力请求中...'});
        dlconsole.log('打开app过程日志----->syncData');
        this.setLoadCacheFinish(false);
        runInAction(() => {
            rootStore.isLogin = false;
        });

        // 判断是否需要显示引导页
        rootStore.guideStore.needShow().finally(
            action(() => {
                this.loadGuideCompeleted = true;
            })
        );

        //1.查看本地缓存数据是否存在
        try {
            dlconsole.log('打开app过程日志----->syncData1');
            dlconsole.log(
                '打开app过程日志----->syncData1 loadCacheCompleted=' +
                    this.loadCacheCompleted
            );
            await rootStore.loadCache();
            dlconsole.log('打开app过程日志----->syncData2');
        } catch (error) {
            dlconsole.log('打开app过程日志----->syncData3');
            this.setLoadCacheFinish(true);
            runInAction(() => {
                rootStore.isLogin = false;
            });
            return;
        }

        //2.如果缓存数据存在则验证sesstionId是否生效
        try {
            dlconsole.log('打开app过程日志----->syncData4');
            await rootStore.authStore.checkSession();
            runInAction(() => {
                rootStore.authStore.syncError = null;
            });
            dlconsole.log('打开app过程日志----->syncData5');
        } catch (error) {
            if (error) {
                this.timer && clearTimeout(this.timer);
                this.setState({emptyViewType: '', emptyViewMsg: error.message});
                runInAction(() => {
                    rootStore.authStore.syncError = error;
                    dlconsole.log('打开app过程日志----->syncData6');
                });
            } else {
                dlconsole.log('打开app过程日志----->syncData7');
                this.setLoadCacheFinish(true);
                runInAction(() => {
                    rootStore.isLogin = false;
                });
            }
        }
        dlconsole.log('打开app过程日志----->syncData8');
        this.setLoadCacheFinish(true);
    };

    @action
    setLoadCacheFinish(finish) {
        dlconsole.log('打开app过程日志----->setLoadCacheFinish=' + finish);
        this.loadCacheCompleted = finish;
    }

    render() {
        // return (<PriceRangeScreen/>);
        dlconsole.log('打开app过程日志----->render1');
        dlconsole.log(
            '打开app过程日志----->render1 this.loadCacheCompleted=' +
                this.loadCacheCompleted
        );

        const isNetError = rootStore.authStore.syncError && (rootStore.authStore.syncError.message === '网络错误' || rootStore.authStore.syncError.message === '请求超时');

        if (this.loadCacheCompleted && this.loadGuideCompeleted && !isNetError) {
            dlconsole.log('打开app过程日志----->render2');
            //缓存加载完毕
            if (rootStore.guideStore.needShowGuideScreen) {
                dlconsole.log('打开app过程日志----->render3');
                return <GuideScreen guideStore={rootStore.guideStore} />;
            } else {
                dlconsole.log('打开app过程日志----->render4');
                if (rootStore.isLogin) {
                    dlconsole.log('打开app过程日志----->render5');
                    //登录成功
                    // 0审核不通过/已下架  1审核通过  2待审核  3待完善资料"
                    if (rootStore.userStore.tenantFlag === 1) {
                        dlconsole.log('打开app过程日志----->render7');
                        return this.mainAuthStackConstruct();
                    } else if (rootStore.userStore.tenantFlag === 0) {
                        dlconsole.log('打开app过程日志----->render11');
                        return this.shopAuthStackConstruct();
                    } else if (rootStore.userStore.tenantFlag === 2) {
                        dlconsole.log('打开app过程日志----->render12');
                        return this.mainAuthStackConstruct();
                    } else if (rootStore.userStore.tenantFlag === 3) {
                        // if (rootStore.authStore.inTryUse != null) {
                        //     dlconsole.log('打开app过程日志----->render13');
                        //     return this.mainAuthStackConstruct();
                        // } else {
                        dlconsole.log('打开app过程日志----->render14');
                        return this.shopAuthStackConstruct();
                        // }
                    }
                } else {
                    dlconsole.log('打开app过程日志----->render8');
                    //未能登录
                    return (
                        <LoginScreen
                            authStore={rootStore.authStore}
                            ref={navigatorRef => {
                                NavigationSvc.setTopLevelNavigator(
                                    navigatorRef
                                );
                            }}
                        />
                    );
                }
            }
        } else if (isNetError) {
            // 弱网以及无网络的情况
            dlconsole.log('打开app过程日志----->render9');
            //加载缓存失败
            return (
                <EmptyView
                    containReload
                    desc={this.state.emptyViewMsg}
                    onReloadHandler={this.syncData}
                    emptyViewType={this.state.emptyViewType}
                />
            );
        } else {
            dlconsole.log('打开app过程日志----->render10');
            //正在加载缓存
            return (
                <View style={{ flex: 1 }}>
                    <StatusBar hidden />
                    <Image
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            bottom: 0,
                            top: 0,
                            width: width,
                            height: height,
                            backgroundColor: '#fff'
                        }}
                        resizeMethod={'resize'}
                        source={
                            isIphoneX()
                                ? require('gsresource/img/splash_X.png')
                                : require('gsresource/img/splash.png')
                        }
                    />
                </View>
            );
        }
    }

    shopAuthStackConstruct = () => {
        return (
            <Provider {...rootStore}>
                <ShopAuthStack
                    ref={navigatorRef => {
                        NavigationSvc.setTopLevelNavigator(navigatorRef);
                    }}
                />
            </Provider>
        );
    };

    mainAuthStackConstruct = () => {
        return (
            <Provider {...rootStore}>
                <MainStack
                    uriPrefix={deepLink}
                    ref={navigatorRef => {
                        NavigationSvc.setTopLevelNavigator(navigatorRef);
                    }}
                />
            </Provider>
        );
    };

    switchBaseUrl = async error => {
        let change = await getStorage(IS_AUTO_CHANGE_NET);
        dlconsole.log('switchBaseUrl change:' + change);
        if (change === undefined) {
            change = true;
        }
        if (
            (error && error.request && error.request._timedOut) ||
            error.request._timedOut === true ||
            (error && error.response && error.response.status >= 400)
        ) {
            if (change) {
                this.throttleSwitchBaseUrl(error);
            }
        }
    };

    /**
     * 一定时间间隔内 只执行一次切换网络操作
     * @type {Function}
     */
    throttleSwitchBaseUrl = _.throttle(error => {
        global.dlconsole.log('开始切换url了 网络切换,原因=' + error.message);
        DLFetch.getBaseUrl() === Config.entranceServerUrl1
            ? DLFetch.setBaseUrl(Config.entranceServerUrl2)
            : DLFetch.setBaseUrl(Config.entranceServerUrl1);
        global.dlconsole.log('切换完成，现在的baseurl=' + DLFetch.getBaseUrl());
    }, 2000);
}

let codePushOptions = IS_STAND_APP
    ? { checkFrequency: codePush.CheckFrequency.ON_APP_RESUME }
    : {};
export default (IS_STAND_APP ? codePush(codePushOptions)(App) : App);
