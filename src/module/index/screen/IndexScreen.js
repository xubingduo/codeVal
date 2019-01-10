/**
 * author: tuhui
 * Date: 2018/7/17
 * Time: 08:40
 * des:app首页
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Platform,
    Dimensions,
    NativeModules,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    BackHandler,
    DeviceEventEmitter,
    AppState,
    Linking,
    NativeEventEmitter
} from 'react-native';
import {
    Banner,
    DLFlatList,
    RefreshState,
    Toast,
    TabsView
} from '@ecool/react-native-ui';
import NetWorkUtl from 'utl/NetWorkUtl';
import _ from 'lodash';
import { observer, inject } from 'mobx-react';
import { runInAction, autorun } from 'mobx';
import colors from '../../../gsresource/ui/colors';
import IndexStore from '../store/IndexStore';
import Image from '../../../component/Image';
import SearchView from '../../../component/SearchView';
import SearchHistoryScreen from './search/SearchHistoryScreen';
import Alert from 'component/Alert';
import ShopCell from '../widget/ShopCell';
import UGCModule from '@ecool/react-native-video';
import DeviceInfo from 'react-native-device-info';
import Config, { IS_STAND_APP } from '../../../config/Config';
import UserActionSvc from 'svc/UserActionSvc';
import ShopSvc from 'svc/ShopSvc';
import isIphoneX from 'utl/PhoneUtl';
import DLMessageCenter from '@ecool/react-native-message';
import { DLMessageType } from '@ecool/react-native-message/lib/DLMessageCenter';
import DocSvc from 'svc/DocSvc';
import I18n from 'gsresource/string/i18n';
import rootStore from 'store/RootStore';
import fonts from '../../../gsresource/ui/fonts';
import IndexApiManager from 'apiManager/IndexApiManager';
import Mask from 'component/Mask';
import IndexCoupon from '../../coupon/widget/IndexCoupon';
import storage from 'utl/DLStorage';
import NewMessagePopupView from './msg/cell/NewMessagePopupView';
import AuthService from 'svc/AuthService';
import ActivityNotifyScreen from 'module/index/screen/msg/ActivityNotifyScreen';
import { NotifyType } from 'store/MessageCenterStore';
import configStore from 'store/ConfigStore';
import BannerActivitySvc from 'svc/BannerActivitySvc';
import LogFileUpload from 'utl/DLLog';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import { getStorage, removeStorage, setStorage } from '../../../svc/StorageSvc';
import SplashScreen from '@ecool/react-native-splash-screen';
import { DLIMManagerLib } from '@ecool/react-native-dlimlib';
import LinkingSvc from 'svc/LinkingSvc';
import { requestMultiplePermission } from '../../../utl/PermissionsUtl.android';
import UpdateSvc from '../../../svc/UpdateSvc';
import DividerLineV from '../../../component/DividerLineV';
import MessageActivitySvc from 'svc/MessageActivitySvc';
import CategoryPopupView from 'module/index/widget/CategoryPopupView';
import TBanner, {IndicaterAlign, IndicaterType} from '../../../component/TBanner';
import ImageButton from '../../../component/ImageButton';

let UpdateModule = NativeModules.UpdateModule;
let UGC = NativeModules.UGCModule;
let channel = NativeModules.ChannelModule;
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const STORAGE_UPLOAD_CHANNE_FLAG = 'STORAGEUPLOADCHANNELFLAG';

export const VIEWABILITY_CONFIG = {
    minimumViewTime: 100,
    viewAreaCoveragePercentThreshold: 10,
    waitForInteraction: true
};

@inject(
    'shoppingCartStore',
    'userStore',
    'messageCenterStore',
    'maskStore',
    'configStore'
)
@observer
export default class IndexScreen extends Component {
    observers = []; // 记录监听消息
    subscriptions = []; //监听事件
    constructor() {
        super();
        this.store = new IndexStore();
        this.state = {
            refreshState: RefreshState.Idle,
            naviBackColor: 'transparent', //顶部导航栏背景颜色
            msgImgSource: require('gsresource/img/homeMsgOri.png'),
            searchBarBackColor: 'white',
            masterCategoryTextColor:'white',
            arrowImgSource:require('gsresource/img/arrowDownWhite.png'),
            alreadyNotifyUpdate: false, // 是否已经提醒App升级,
            currentAppState: AppState.currentState
        };

        this.store.loadCacheData();
    }

    componentWillUnmount() {
        global.dlconsole.log('首页销毁');
        // 移除事件监听
        this.deEmitter.remove();
        this.observers.forEach(item => {
            DLMessageCenter.removeObserver(item);
        });
        AppState.removeEventListener('change', this.handleAppStateChange);
        // 销毁autorun
        this.masterCategaryRun();
        // 注销电话状态监听
        if (Platform.OS === 'android') {
            this.store.unregisterCallStateListener();
        }
        // 去除监听返回顶部
        this.goToTop.remove();
        if (this.subscriptions) this.subscriptions.forEach(sub => sub.remove());
    }

    checkMasterCategary = () => {
        // 是否在选择主营类目
        this.isChooseMasterCategary = false;
        if (configStore.isMasterCategaryComplete === 0) {
            // 置为true
            this.isChooseMasterCategary = true;
            Alert.alert('您未设置主营类目立即前往设置?', '', [
                {
                    text: '确定',
                    onPress: () => {
                        this.props.navigation.navigate(
                            'BusinessCategoryChooseScreen',
                            {
                                mode: 1,
                                completeHandler: () => {
                                    this.isChooseMasterCategary = false;
                                    // 是否需要展示引导
                                    if (this.willLoadDataCoupon) {
                                        this.loadDataCoupon();
                                    }
                                }
                            }
                        );
                    }
                }
            ]);
        }
    };

    // 主营类目改变自动刷新(默认会首先调一次)
    registerMainClass() {
        this.masterCategaryRun = autorun(() => {
            if (
                (configStore.localBusinessCategary &&
                configStore.localBusinessCategary.codeValue > 0 )|| configStore.localBusinessCategary ==undefined
            ) {
                this.onHeaderRefresh(true);
            }
        });
    }

    //监听IM未读数变化
    registerImListener() {
        const imEventManager = new NativeEventEmitter(DLIMManagerLib);
        this.subscriptions.push(
            imEventManager.addListener(
                'DLIMMessageTotalCountChangedEvent',
                messageTotalCount => {
                    runInAction(
                        () =>
                            (rootStore.messageCenterStore.imUnreadMessageCount = messageTotalCount)
                    );
                }
            )
        );
    }

    //监听智齿客服未读数变化
    registerSobotListener() {
        const sobotEventManager = new NativeEventEmitter(
            NativeModules.DLSobotModule
        );
        this.subscriptions.push(
            sobotEventManager.addListener(
                'sobotUnreadCountChangedNotification',
                unread => {
                    runInAction(
                        () =>
                            (rootStore.messageCenterStore.sobotUnreadMessageCount = unread)
                    );
                }
            )
        );
    }

    //监听原生通知栏跳转事件
    registerNotificationNavigateListener() {
        let notificationEventEmitter = DeviceEventEmitter.addListener(
            'payloadMsgFromNative',
            payloadMsgStr => {
                let payloadMsg = JSON.parse(payloadMsgStr);
                this.navigateScreen(payloadMsg);
            }
        );
        this.subscriptions.push(
            notificationEventEmitter
        );
    }

    requestShoppingCartData() {
        this.props.shoppingCartStore.requestShoppingCart(() => {});
    }

    requestUnReadMsg() {
        this.props.messageCenterStore.syncUnreadMessageCount(
            NotifyType.LOGISTICS
        );
        this.props.messageCenterStore.syncUnreadMessageCount(
            NotifyType.ACTIVITY
        );
    }

    requestPermisson() {
        if (Platform.OS === 'android') {
            const apiLevel = DeviceInfo.getAPILevel();
            if (apiLevel >= 23) {
                requestMultiplePermission();
            }
            this.checkUpdateAndroid();
        } else {
            this.checkUpdateIos();
        }
    }

    // 注册店铺关注状态变化事件监听
    registerFocusEvent() {
        this.deEmitter = DeviceEventEmitter.addListener(
            GOODS_ITEM_CHANGE,
            ({ key, data }) => {
                switch (key) {
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let { tenantId, favorFlag } = data;
                    this.store.updateShopFocusStatus(tenantId, favorFlag);
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );
    }

    //订阅账号在其他设备登录的消息通知
    registerGeTuiLogoutMsg() {
        this.observers.push(
            DLMessageCenter.addObserver(data => {
                global.dlconsole.log('接收单点登录通知：' + data);
                if (data && data.length > 0) {
                    const message = data.pop();
                    const msg = message.msgBean;
                    if (msg && msg.body) {
                        let oldSessionId = msg.body.oldSessionId;
                        if (rootStore.userStore.sessionId != oldSessionId) {
                            return;
                        }
                        const message = msg.body.text;
                        Alert.alert('消息通知', message, [
                            {
                                text: I18n.t('confirm'),
                                onPress: () => {
                                    rootStore.authStore.clearLocalCache();
                                }
                            }
                        ]);
                    }
                }
            }, DLMessageType.DLMessageLoginInOtherDevice)
        );
    }

    //监听消息中心的消息
    registerMessageGeTui() {
        this.observers.push(
            DLMessageCenter.addObserver(async data => {
                global.dlconsole.log('接收消息中心通知：' + JSON.stringify(data));
                if (data && data.length > 0) {
                    const message = data.pop();
                    this.handleGeTuiMessage(message);
                }
            }, DLMessageType.DLMessageNewLinkOrder)
        );
    }

    async handleGeTuiMessage(message) {
        let msgBean = message.msgBean;
        let metas = message.metas;

        if (metas.tagOne === 201) {
            global.dlconsole.log('首页收到新人券消息');
            // 是否将要展示新人优惠券引导
            this.willLoadDataCoupon = true;
            if (!this.isChooseMasterCategary) {
                //新人优惠券通知处理
                global.dlconsole.log('首页弹出新人券');
                await setStorage('HAS_NEW_COUPONS', true);
                this.loadDataCoupon();
                this.willLoadDataCoupon = false;
            }
        } else if (
            metas.tagOne === 91 ||
            metas.tagOne === 99 ||
            metas.tagOne === 100 ||
            metas.tagOne === 90 ||
            metas.tagOne === 94 ||
            metas.tagOne === 300 ||
            metas.tagOne === 301 ||
            metas.tagOne === 302
        ) {
            //添加弹框提醒
            NewMessagePopupView.show(msgBean, async () => {
                this.navigateScreen(message);
            });
            if (
                metas.tagOne === 300 ||
                metas.tagOne === 301 ||
                metas.tagOne === 302
            ) {
                rootStore.messageCenterStore.syncUnreadMessageCount(
                    NotifyType.ACTIVITY
                );
            } else {
                rootStore.messageCenterStore.syncUnreadMessageCount(
                    NotifyType.LOGISTICS
                );
            }
        }
    }

    async navigateScreen(message) {
        try {
            let msgBean = message.msgBean;
            let metas = message.metas;
            //Toast.loading();
            if (
                metas.tagOne === 91 ||
                metas.tagOne === 99 ||
                metas.tagOne === 100
            ) {
                //发货通知90，卖家不同意退款91，同意并发货91，退款成功91，金额变动94
                this.props.navigation.navigate(
                    'OrderDetailsScreen',
                    {
                        id: msgBean.body.billId,
                        returnFlag: 0
                    }
                );
            } else if (
                metas.tagOne === 90 ||
                metas.tagOne === 94
            ) {
                //发货通知90，卖家不同意退款91，同意并发货91，退款成功91，金额变动94

                this.props.navigation.navigate(
                    'OrderDetailsScreen',
                    {
                        id: msgBean.body.billId,
                        returnFlag: 1
                    }
                );
            } else if (
                metas.tagOne === 300 ||
                metas.tagOne === 301 ||
                metas.tagOne === 302
            ) {
                //活动通知  消息通知302 优惠领取300 活动提醒301
                let navTitle = '';
                if (metas.tagOne === 300) {
                    navTitle = '优惠领取';
                } else if (metas.tagOne === 301) {
                    navTitle = '活动提醒';
                } else if (metas.tagOne === 302) {
                    navTitle = '消息通知';
                }

                //平台消息,分内链和外链
                let item = msgBean.body;
                // if (item && item.inFlag === '1') {
                //     // 本地页面
                //     if (item.inUrlType != '0') {
                //         MessageActivitySvc.actLocal(
                //             item.inUrlType,
                //             item.inParam
                //         );
                //     }
                // } else if (item) {
                //     // 远程链接
                //     MessageActivitySvc.actRemote(
                //         item.detailOutUrl
                //     );
                // }
                // 兼容新老消息列表
                if (item && item.linkType) {
                    if ((item.linkType === '1' || item.linkType === 1) && item.jumpLink && item.jumpLink.param) {
                        // 远程链接
                        BannerActivitySvc.actRemote(item.jumpLink.param.url, item.jumpLink.param);
                    } else if((item.linkType === '2' || item.linkType === 2) && item.jumpLink && item.jumpLink.param && item.jumpLink.contentType){
                        // 本地页面
                        BannerActivitySvc.actLocal(item.jumpLink.contentType, item.jumpLink.param);
                    }
                } else if(item && item.inFlag) {
                    if (item && item.inFlag === '1') {
                        // 本地页面
                        if (item.inUrlType !== '0') {
                            MessageActivitySvc.actLocal(
                                item.inUrlType,
                                item.inParam
                            );
                        }
                    } else if (item) {
                        // 远程链接
                        MessageActivitySvc.actRemote(item.detailOutUrl);
                    }
                }

                dlconsole.log(item.linkType);
            }
            //更新未读状态
            if (
                metas.tagOne === 300 ||
                metas.tagOne === 301 ||
                metas.tagOne === 302
            ) {
                await rootStore.messageCenterStore.updateUnreadMessageState(
                    msgBean.id,
                    NotifyType.ACTIVITY
                );
            } else {
                await rootStore.messageCenterStore.updateUnreadMessageState(
                    msgBean.id,
                    NotifyType.LOGISTICS
                );
            }
            Toast.dismiss();
        } catch (error) {
            Toast.dismiss();
            Alert.alert(error.message);
        }
    }

    // 0审核不通过/已下架  1审核通过  2待审核  3待完善资料"
    //监听店铺认证失败消息通知
    registerAuthMsg() {
        this.observers.push(
            DLMessageCenter.addObserver(data => {
                global.dlconsole.log(
                    '接收认证驳回通知：' + JSON.stringify(data)
                );
                if (data && data.length > 0) {
                    const message = data.pop();
                    const msg = message.msgBean;
                    if (msg && msg.body) {
                        const message = msg.body.text;
                        Alert.alert('消息通知', message, [
                            {
                                text: I18n.t('confirm'),
                                onPress: () => {
                                    runInAction(() => {
                                        rootStore.userStore.updateTenantFlag(0);
                                    });
                                }
                            }
                        ]);
                    }
                }
            }, DLMessageType.DLMessageGoodShopAuthShopFail)
        );

        //监听店铺认证通过消息通知
        this.observers.push(
            DLMessageCenter.addObserver(data => {
                global.dlconsole.log('接收认证通过通知：' + data);
                if (data && data.length > 0) {
                    const message = data.pop();
                    const msg = message.msgBean;
                    if (msg && msg.body) {
                        const message = msg.body.text;
                        Alert.alert('消息通知', message, [
                            {
                                text: I18n.t('confirm'),
                                onPress: () => {
                                    if (Platform.OS === 'ios') {
                                        this.loadDataCoupon();
                                    }
                                    runInAction(() => {
                                        rootStore.userStore.updateTenantFlag(1);
                                    });
                                }
                            }
                        ]);
                    }
                }
            }, DLMessageType.DLMessageGoodShopAuthShopSuccess)
        );
    }

    //监听日志自动上传通知
    registerLogEvent() {
        let user = rootStore.userStore.user;
        LogFileUpload.setParams(
            user ? user.mobile : '',
            user ? user.uniCode : ''
        );
        this.observers.push(
            DLMessageCenter.addObserver(data => {
                global.dlconsole.log('接收认证通过通知：' + data);
                // 后台上传最新日志
                setTimeout(() => {
                    dlconsole.allLogFileMessages((err, results) => {
                        results = _.filter(results, item => {
                            return item.type === '.log' || item.type === '.zip';
                        });
                        let list = _.sortBy(results, function(item) {
                            return -item.fileName;
                        });
                        if (list && list.length > 0) {
                            dlconsole.uploadLogFileForDate(
                                list[0].fileName.split('.')[0]
                            );
                        }
                        dlconsole.log(list[0]);
                    });
                });
            }, DLMessageType.DLMessageUploadLogFile)
        );
    }

    registerAndroidBackKey() {
        this.backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => {
                if (this.props.navigation.isFocused()) {
                    NativeModules.DLConfigManager.toHome();
                    return true;
                } else {
                    return false;
                }
            }
        );
    }

    componentDidMount() {
        // 开始埋点操作
        // UserActionSvc.upload();
        // UserActionSvc.initUserAction();
        // 获取城市
        dlconsole.log('进入首页');
        // 处理主营类目
        this.checkMasterCategary();
        this.registerMainClass();
        this.registerImListener();
        this.registerSobotListener();
        this.registerNotificationNavigateListener();
        this.showCoupon();
        this.requestShoppingCartData();
        this.requestUnReadMsg();
        this.requestPermisson();
        //若正在认证可
        //上传渠道信息
        // this.needUploadChannel();
        this.registerFocusEvent();
        // 事先获取用户信息和店铺名称
        this.props.userStore.queryAccountInfo();
        this.props.userStore.queryAndLoadShopName();
        this.props.configStore.fetchMasterCategoryList();
        this.registerGeTuiLogoutMsg();
        this.registerMessageGeTui();
        this.registerAuthMsg();
        this.registerLogEvent();
        AppState.addEventListener('change', this.handleAppStateChange);
        // 注册拨打电话状态监听
        this.store.registerCallStateListener();
        Platform.OS === 'android' && SplashScreen.hide();
        // 尝试加载服务保障
        rootStore.configStore.fetchServiceGuarantee();
        // 注册监控方法 返回顶部
        this.goTopPosition();
        this.registerAndroidBackKey();
        this.addLinkSvc();
    }

    addLinkSvc() {
        LinkingSvc.startListner();
        Linking.getInitialURL()
            .then(url => {
                if (url) {
                    dlconsole.log('Link 启动app', url);
                    LinkingSvc.onRecieved({ url: url });
                }
            })
            .catch(err => {
                dlconsole.log('An error occurred', err);
            });
    }

    showCoupon = async () => {
        try {
            let has = await getStorage('HAS_NEW_COUPONS');
            if (has) {
                this.loadDataCoupon();
                console.log('我的新人优惠券');
            }
        } catch (e) {
            if (e.name === 'NotFoundError') {
                console.log('新人优惠券存储错误');
            }
        }
    };

    // 优惠券列表
    loadDataCoupon = async () => {
        let obj = {
            pageNo: 1,
            pageSize: 100,
            jsonParam: {
                belongPackageType: 2
            }
        };
        try {
            await this.store.getCouponCenterList(obj, data => {
                if (data !== 0) {
                    setTimeout(() => {
                        this.IndexCoupon.show();
                    }, 3500);
                }
            });
        } catch (e) {
            Alert.alert(e.message);
        }
    };

    handleAppStateChange = nextAppState => {
        if (
            this.state.currentAppState.match(/inactive|background/) &&
            nextAppState === 'active'
        ) {
            // 当App从后台回到前台需要判断App是否需要升级
            if (Platform.OS === 'ios') {
                !this.state.alreadyNotifyUpdate && this.checkUpdateIos();
            }
        }
        this.setState({ currentAppState: nextAppState });
    };

    checkUpdateAndroid = () => {
        UpdateSvc.checkUpdateAndroid();
    };

    /**
     * 检查升级提醒
     */
    checkUpdateIos = async () => {
        let phone = this.props.userStore.user
            ? this.props.userStore.user.deviceNo
            : '';
        let params = {
            deviceno: phone,
            devicetype: Platform.OS === 'ios' ? '18' : '19',
            dlProductCode:
                Platform.OS === 'ios' ? 'slhGoodShopIOS' : 'slhGoodShopAndroid'
        };
        try {
            const data = await IndexApiManager.checkUpdate(params);
            dlconsole.log(
                `升级提醒--------->\n${
                    data ? JSON.stringify(data) : ''
                }\n------------<`
            );
            const upgradeFlag = data.upgradeFlag;
            if (upgradeFlag !== '0') {
                // 提醒信息
                const msg = data.upgradeMsg.upgradeMessage;
                // 更新方式 （0:仅通知非升级；1:提醒升级；2.强制升级）
                const noticemethod = data.upgradeMsg.noticemethod;
                if (noticemethod === 0) {
                    !this.state.alreadyNotifyUpdate && Toast.show(msg, 3);
                    this.setState({ alreadyNotifyUpdate: true });
                } else {
                    let options = [];
                    // 取消事件
                    noticemethod === 1 && options.push({ text: '取消' });

                    // 标记位
                    // 处理升级
                    options.push({
                        text: '升级',
                        onPress: () => {
                            Linking.openURL(
                                'itms-apps://itunes.apple.com/app/id1436455359'
                            );
                            if (noticemethod === 2) {
                                this.setState({ alreadyNotifyUpdate: false });
                            }
                        }
                    });
                    !this.state.alreadyNotifyUpdate &&
                        Alert.alert('升级提醒', msg, options);
                    this.setState({ alreadyNotifyUpdate: true });
                }
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    /**
     * 首页下拉刷新页面
     */
    onHeaderRefresh = async isLoading => {
        //获取banner数据
        try {
            this.store.fetchBannerData();
            this.store.fetchHomePageStatisticsData();
        } catch (error) {
            Alert.alert(error.message);
        }
        //获取好店列表
        this.getIndexCity();
    };

    /**
     * 加载好店列表数据
     */
    loadShopNewData = async isLoading => {
        if (isLoading) {
            this.setState({ refreshState: RefreshState.HeaderRefreshing });
        }
        try {
            await this.store.loadShopNewData();
        } catch (error) {
            Alert.alert(error.message);
        }
        if (this.store.noMore === true && this.store.shopList.length > 0) {
            this.setState({
                refreshState: RefreshState.NoMoreData
            });
        } else {
            if (this.store.shopList.length === 0) {
                this.setState({
                    refreshState: RefreshState.NoMoreData
                });
            } else {
                this.setState({
                    refreshState: RefreshState.Idle
                });
            }
        }
    };

    //列表滚动变化事件
    _onViewableItemsChanged = changed => {
        // console.log(changed);
    };

    itemSeparateComponent = () => {
        return <View style={{ width: WIDTH, height: 10 }} />;
    };

    /**
     * 滑动列表
     */
    onScrollList = nativeEvent => {
        let offsetY = nativeEvent.contentOffset.y; //滑动距离

        if (offsetY > 64) {
            this.setState({
                naviBackColor: 'white',
                msgImgSource: require('gsresource/img/homeMsgDest.png'),
                masterCategoryTextColor:colors.normalFont,
                arrowImgSource:require('gsresource/img/arrowDownBlack.png'),
                searchBarBackColor: '#f5f5f5'
            });
  
        } else {
            let alpha = offsetY / 64;
            this.setState({
                naviBackColor: 'rgba(255, 255, 255,' + alpha + ')',
                msgImgSource: require('gsresource/img/homeMsgOri.png'),
                masterCategoryTextColor:'white',
                arrowImgSource:require('gsresource/img/arrowDownWhite.png'),
                searchBarBackColor:
                        'white'
            });
        }
    };

    /**
     * 发现好店上拉加载
     */
    onFooterRefresh = async () => {
        if (!AuthService.isShopAuthed()) {
            return;
        }
        this.setState({
            refreshState: RefreshState.FooterRefreshing
        });
        try {
            await this.store.loadShopMoreData();
        } catch (error) {
            Alert.alert(error.message);
        }

        if (this.store.noMore && this.store.shopList.length > 0) {
            this.setState({ refreshState: RefreshState.NoMoreData });
        } else {
            this.setState({
                refreshState: RefreshState.Idle
            });
        }
    };

    /**
     * 关注店铺
     * item 好店列表item
     */
    onFocusShopClick = async item => {
        if (!AuthService.isShopAuthed()) {
            return;
        }
        Toast.loading();
        try {
            Toast.dismiss();
            if (item.favorFlag === 1) {
                //已关注
                await this.store.unFocusShop(item);
                Toast.success('取消成功', 2);
            } else {
                await this.store.focusShop(item);
                Toast.success('关注成功', 2);
            }
            sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                favorFlag: item.favorFlag ? 0 : 1,
                tenantId: item.id
            });
        } catch (error) {
            Toast.dismiss();
            Alert.alert(error.message);
        }
    };

    /**
     * 跳转到门店
     * item 好店列表item
     */
    jumpToShop = item => {
        if (!AuthService.isShopAuthed()) {
            return;
        }
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: item.id,
            tenantName: item.name
        });
    };

    /**
     * 点击门头照或播放按钮
     * item 门店列表item
     */
    playVideo = item => {
        if (!AuthService.isShopAuthed()) {
            return;
        }
        if (item.videoUrl && item.videoUrl.length > 0) {
            //有视频点击播放视频
            if (Platform.OS === 'ios') {
                NetWorkUtl.getNetWorkState().then(enable => {
                    if (enable) {
                        UGCModule.autoPlay(item.videoUrl, item.coverUrl);
                    } else {
                        Toast.show('网络似乎不给力', 2);
                    }
                });
            } else {
                UGC.play(item.videoUrl, item.coverUrl);
            }
        }else {
            this.jumpToShop(item);
        }
    };

    /**
     * 跳转到今日新款
     */
    jumpToTodayNew = () => {
        //@queryType  default:2 1 关注上新，2 推荐上新
        if (!AuthService.isShopAuthed()) {
            return;
        }
        UserActionSvc.track('TODAY_NEW_GOODS');
        this.props.navigation.navigate('TodayNewArrivalScreen');
    };

    /**
     * 跳转到包邮专区
     */
    jumpToFreeShipping = () => {
        if (!AuthService.isShopAuthed()) {
            return;
        }
        // UserActionSvc.track('TODAY_HOT_GOODS');
        this.props.navigation.navigate('FreeShippingScreen');
    };

    // 获取城市
    getIndexCity = async () => {
        try {
            await this.store.getCity().then((data) => {
                if (this.store.tabIndex === -1) {
                    // if (data.length === 1) {
                    this.tabsView.gotoIndex(0);
                    // }
                } else {
                    this.tabsView.gotoIndex(this.store.tabIndex);
                }
            });
        } catch (e) {
            this.tabsView.gotoIndex(0);
            //Alert.alert(e.message);
        }
        // 重新获取页面上数据
        // setTimeout(() => {
        //     this.loadShopNewData(true);
        // }, 300);
    };

    // 切换城市tab页面
    goToPage = index => {
        let data = this.store.indexCityObj.slice();
        let items = data[index];
        if (items) {
            this.store.setCityCodeIndex(index, items.key);
            setTimeout(() => {
                this.loadShopNewData(true);
            }, 300);
        }
    };

    /**
     * 跳转到banner链接网页
     */
    jumpToBannerWebView = index => {
        if (rootStore.userStore.tenantFlag !== 1) {
            return;
        }
        let item = this.store.bannerDatas[index];
        if (item && item.linkType === 1) {
            // 远程链接
            BannerActivitySvc.actRemote(item.url, item.param);
        } else if (item && item.linkType === 2) {
            // 本地页面
            BannerActivitySvc.actLocal(item.contentType, item.param);
        }
        dlconsole.log(item.linkType);
    };

    /**
     * 跳转到今日门店上新
     */
    jumpToTodayShopNew = () => {
        if (!AuthService.isShopAuthed()) {
            return;
        }
        UserActionSvc.track('TODAY_NEW_SHOP');
        this.props.navigation.navigate('ShopListScreen');
    };

    async needUploadChannel() {
        try {
            let flag = await storage.load({ key: STORAGE_UPLOAD_CHANNE_FLAG });
            if (flag === false) {
                //this.uploadChannel();
            }
        } catch (error) {
            //this.uploadChannel();
        }
    }

    uploadChannel() {
        if (Platform.OS === 'ios') {
            let info = {
                name: rootStore.userStore.user.userId,
                system: DeviceInfo.getSystemVersion(),
                model: DeviceInfo.getDeviceName()
            };
            DeviceInfo.getIPAddress().then(ip => {
                Object.assign(info, { clientip: ip });
                try {
                    this.store.uploadChannel(info);
                    storage.save({
                        key: STORAGE_UPLOAD_CHANNE_FLAG,
                        data: true
                    });
                } catch (e) {
                    dlconsole.log('上传渠道号失败-->' + e.message);
                    storage.save({
                        key: STORAGE_UPLOAD_CHANNE_FLAG,
                        data: false
                    });
                }
            });
        } else {
            IS_STAND_APP &&
                channel.getChannel(channel => {
                    try {
                        this.store.requestChannel(channel);
                        storage.save({
                            key: STORAGE_UPLOAD_CHANNE_FLAG,
                            data: true
                        });
                    } catch (e) {
                        dlconsole.log('上传渠道号失败-->' + e.message);
                        storage.save({
                            key: STORAGE_UPLOAD_CHANNE_FLAG,
                            data: false
                        });
                    }
                });
        }
    }

    // 返回顶部
    goTopPosition = () => {
        this.goToTop = DeviceEventEmitter.addListener('GO_TO_INDEX_TOP', () => {
            let height = WIDTH * 0.53 + WIDTH * 0.5;
            setTimeout(() => {
                this.flatListRef.scrollToOffset({
                    offset: 0
                });
            }, 500);
        });
    };

    //************************ */以下视图渲染/* ************************* 

    /**
     * 包邮专区
     */
    renderFreeShipping = item => {
        return (
            <TouchableWithoutFeedback onPress={this.jumpToFreeShipping}>
                <View style={styles.freeShipping}>
                    <Image
                        style={styles.leftUpdateImg}
                        source={{
                            uri: item? DocSvc.originDocURL(item.shippingDocId) : ''
                        }}
                        resizeMode={'cover'}
                    />
                    <View style={{flexDirection:'row',alignItems:'flex-end',marginTop:15}}>
                        <Text
                            style={styles.statisticsTitle}
                        >
                            包邮专区
                        </Text>
                        <Image style={{marginLeft:6}} source={require('gsresource/img/fire.png')} />
                    </View>
                    <Text style={styles.seeDetail}>
                        {'点击查看>'}
                    </Text>       
                </View>
            </TouchableWithoutFeedback>
        );
    };

    /**
     * 今日上新门店
     */
    renderTodayNewShop = item => {
        return (
            <TouchableWithoutFeedback onPress={this.jumpToTodayShopNew}>
                <View style={styles.newContainer}>
                    <Image
                        style={styles.newImg}
                        source={{
                            uri: item
                                ? DocSvc.originDocURL(item.newShopDocId)
                                : ''
                        }}
                        resizeMode={'cover'}
                    />
                    <Text
                        style={styles.statisticsTitle}
                    >
                        今日上新门店
                    </Text>
                    <View style={styles.newCountContainer}>
                        <View style={styles.styleCountContainer}>
                            <Text style={styles.styleCount}>
                                {this.store.statisticsData
                                    ? this.store.statisticsData.newShopNum
                                    : 0}
                            </Text>
                            <Text style={styles.style}>家</Text>
                        </View>
                        <Text style={styles.seeDetail}>{'点击查看>'}</Text>
                    </View>
 
                </View>
            </TouchableWithoutFeedback>
        );
    };

    /**
     * 今日新款
     */
    renderTodayNew = item => {
        return (
            <TouchableWithoutFeedback onPress={this.jumpToTodayNew}>
                <View style={styles.newContainer}>
                    <Image
                        style={styles.newImg}
                        source={{
                            uri: item
                                ? DocSvc.originDocURL(item.newSpuDocId)
                                : ''
                        }}
                        resizeMode={'cover'}
                    />
                    <Text
                        style={styles.statisticsTitle}
                    >
                        今日新款
                    </Text>
                    <View style={styles.newCountContainer}>
                        <View style={styles.styleCountContainer}>
                            <Text style={styles.styleCount}>
                                {this.store.statisticsData
                                    ? this.store.statisticsData.newSpuNum
                                    : 0}
                            </Text>
                            <Text style={styles.style}>款</Text>
                        </View>
                        <Text style={styles.seeDetail}>{'点击查看>'}</Text>
                    </View>
 
                </View>
            </TouchableWithoutFeedback>
        );
    };

    /**
     * 包邮专区，今日新款，今日上新门店
     */
    // TODO
    renderUpdate = item => {
        return (
            <View style={styles.updateContainer}>
                {/* 左侧包邮专区 */}
                {this.renderFreeShipping(item)}
                <View
                    style={{
                        backgroundColor: colors.divide,
                        width: 1,
                        height:'100%'
                    }}
                />
                {/* 右侧今日新款今日上线门店 */}
                <View style={{ width: '50%',height: '100%'}}>
                    {this.renderTodayNew(item)}
                    <View
                        style={{
                            backgroundColor: colors.divide,
                            height: 1,
                            width:'100%'
                        }}
                    />
                    {this.renderTodayNewShop(item)}
                </View>
            </View>
        );
    };

    /**
     * 渲染累计门店数和累计商品数
     */
    renderTotalShopAndGoods = ()=> {
        return (
            <View style = {styles.totalShopAndGoodsContainer}>
                <View style={styles.totalShopAndGoodsItem}>
                    <Text style={{fontSize:fonts.font12,color:colors.greyFont}}>累计门店数：</Text>
                    <Text style={{fontSize:fonts.font12,color:colors.activeBtn}}>{`${(this.store.statisticsData && this.store.statisticsData.allShopNum)?this.store.statisticsData.allShopNum:0}家`}</Text>
                </View>
                <View style={styles.totalShopAndGoodsItem}>
                    <Text style={{fontSize:fonts.font12,color:colors.greyFont}}>累计商品数：</Text>
                    <Text style={{fontSize:fonts.font12,color:colors.activeBtn}}>{`${(this.store.statisticsData && this.store.statisticsData.allSpuNum)?this.store.statisticsData.allSpuNum:0}款`}</Text>
                </View>
            </View>
        );
    }

    /**
     * 渲染城市切换tab
     */
    renderTabBar = () => {
        return (
            <TabsView
                ref={ins => {
                    if (ins) {
                        this.tabsView = ins;
                    }
                }}
                containerStyle={{
                    width: WIDTH,
                    alignItems: 'center',
                    height: 35,
                    backgroundColor: '#fff'
                }}
                underlineStyle={{
                    width: 40,
                    backgroundColor: colors.activeFont
                }}
                underlineWidth={40}
                tabItemTextTyle={{ fontSize: fonts.font14 }}
                activeTextStyle={{ fontWeight: '600' }}
                activeTextColor={colors.activeFont}
                defaultTextColor={colors.normalFont}
                activeItemIndex={this.store.tabIndex}
                items={this.store.indexCityObj}
                goToPage={this.goToPage}
            />
        );
    };

    /**
     * 发现好店列表头部组件(banner,统计数据，城市选择tab)
     */
    renderFindShopListHeader = () => {
        return (
            <View>
                <Banner
                    scrollTimeInterval={2000}
                    style={{width: WIDTH, height: isIphoneX() ? WIDTH * 0.53 + 20 : WIDTH * 0.53}}
                    indicatorSelectedColor={colors.white}
                    indicatorNormalColor={colors.greyFont}
                    dataSource={this.store.bannerDatas.slice().map(item => {
                        return DocSvc.originDocURL(item.itemId);
                    })}
                    didClickItem={(item, index) => {
                        // 统计点击了第几张banner
                        UserActionSvc.trackWithParam('HOME_BANNER', {'page': (index+1) + ''});
                        this.jumpToBannerWebView(index);
                    }}
                />
                {this.renderUpdate(this.store.statisticsData)}
                <View
                    style={{
                        width: WIDTH,
                        height: 1,
                        backgroundColor: colors.divide
                    }}
                />
                {this.renderTotalShopAndGoods()}
                <View
                    style={{
                        width: WIDTH,
                        height: 10,
                        backgroundColor: colors.divide
                    }}
                />
                {this.renderTabBar()}
            </View>
        );
    };

    /**
     * 渲染好店列表item
     */
    renderShopListItem = ({ item }) => {
        return (
            <ShopCell
                cellItem={item}
                onFocusClick={this.onFocusShopClick}
                onPlayClick={this.playVideo}
                onBackGroundImageClick={this.playVideo}
                onShopInfoClick = {this.jumpToShop}
            />
        );
    };

    listEmptyView = () => {
        return (
            <View style={{ flexDirection: 'column', alignItems: 'center' }}>
                <Image source={require('gsresource/img/noFocusOnShop.png')} />
                <Text
                    style={{
                        fontSize: fonts.font12,
                        color: '#9b9b9b',
                        marginTop: 12
                    }}
                >
                    没有数据哦～
                </Text>
            </View>
        );
    };

    /**
     * 发现好店列表
     */
    renderFindShopList = () => {
        return (
            <DLFlatList
                listRef={ref => {
                    this.flatListRef = ref;
                }}
                refreshState={this.state.refreshState}
                onHeaderRefresh={() => this.onHeaderRefresh(true)}
                onFooterRefresh={this.onFooterRefresh}
                ListHeaderComponent={this.renderFindShopListHeader}
                data={this.store.shopList.slice()}
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderShopListItem}
                showsVerticalScrollIndicator={false}
                onScrollFunc={nativeEvent => this.onScrollList(nativeEvent)}
                ItemSeparatorComponent={this.itemSeparateComponent}
                ListEmptyComponent={this.listEmptyView}
                removeClippedSubviews={Platform.OS === 'android'}
                onViewableItemsChanged={this._onViewableItemsChanged}
                viewabilityConfig={VIEWABILITY_CONFIG}
            />
        );
    };

    /**
     * 首页顶部 搜索框，bannber
     */
    renderHeader = () => {
        let absoluteTop = 0;
        if (isIphoneX()) {
            absoluteTop = 24;
        } else if (Platform.OS === 'ios') {
            absoluteTop = 0;
        } else {
            absoluteTop = 0;
        }
        return (
            <View
                style={{
                    position: 'absolute',
                    height: 64 + absoluteTop,
                    width: WIDTH,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    backgroundColor: this.state.naviBackColor
                }}
            >
                <View
                    style={{
                        height: 44,
                        width: WIDTH,
                        justifyContent: 'flex-start',
                        alignItems: 'center',
                        flexDirection: 'row'
                    }}
                >
                    {/* //主营类目 */}
                    <TouchableOpacity style={{flexDirection:'row',alignItems:'center',marginLeft:15,maxWidth:66,height:28}} onPress={()=> {
                        CategoryPopupView.show(configStore.localBusinessCategary,configStore.masterCategaryList,(item)=> {
                            runInAction(() => configStore.localBusinessCategary = item);
                        });
                    }}
                    >
                        <Text numberOfLines = {1} style={{fontSize:fonts.font14,color:this.state.masterCategoryTextColor,marginRight:4}}>
                            {configStore.localBusinessCategary?configStore.localBusinessCategary.codeName:''}
                        </Text>
                        <Image source={this.state.arrowImgSource} />
                    </TouchableOpacity>
                    <SearchView
                        style={{
                            // position: 'absolute',
                            borderRadius: 14,
                            // left: 85,
                            // right: 48,
                            marginLeft:5,
                            flex:1,
                            backgroundColor: this.state.searchBarBackColor,
                            height:28
                        }}
                        hint={'搜商品,店铺...'}
                        onTextChange={() => {}}
                        onClick={() => {
                            if (!AuthService.isShopAuthed()) {
                                return;
                            }
                            UserActionSvc.track('HOME_SEARCH');
                            this.props.navigation.navigate(
                                'SearchHistoryScreen'
                            );
                        }}
                        isTextInput={false}
                    />
                    <TouchableOpacity
                        style={{
                            // right: 10,
                            // position: 'absolute'
                            marginRight:10,
                            marginLeft:10,

                        }}
                        onPress={() => {
                            if (!AuthService.isShopAuthed()) {
                                return;
                            }
                            UserActionSvc.track('HOME_MSG_CENTER');
                            this.props.navigation.navigate(
                                'ConsultationScreen'
                            );
                        }}
                    >
                        <Image source={this.state.msgImgSource} />
                        {this.props.messageCenterStore.unreadMessageCount >
                            0 && (
                            <View style={styles.redPointBack}>
                                <Text style={styles.redPoint}>
                                    {
                                        this.props.messageCenterStore
                                            .unreadMessageCount
                                    }
                                </Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    /**
     * 渲染悬浮券按钮
     */
    renderTicket = ()=> {
        return (
            <TouchableOpacity style={{position:'absolute',zIndex:2,top:HEIGHT * 0.67,right:0}} onPress={() => {
                if (!AuthService.isShopAuthed()) {
                    return;
                }
                UserActionSvc.track('HOME_RED_PACKET');
                this.props.navigation.navigate('GetCouponCenter');
            }}
            >
                <Image source={require('gsresource/img/ticket.png')} />
            </TouchableOpacity>
        );
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderTicket()}
                {this.renderFindShopList()}
                {this.renderHeader()}

                {/*新手引导*/}
                <Mask
                    type={'index'}
                    len={3}
                    isShow={this.props.maskStore.indexMask}
                    isAction={() => {
                        this.props.maskStore.indexShowAction();
                    }}
                />

                {/*新人优惠券*/}
                <IndexCoupon
                    ref={ref => {
                        this.IndexCoupon = ref;
                    }}
                    data={this.store.couponNewArray}
                    allMoney={this.store.allCouponMoney}
                    onDismiss={() => {
                        removeStorage('HAS_NEW_COUPONS');
                    }}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },
    freeShipping: {
        width: '50%',
        height: '100%',
        backgroundColor:'white'
    },
    seeDetail: {
        color: colors.greyFont,
        fontSize: fonts.font12,
        marginLeft:15,
        marginTop:8
    },
    statisticsTitle: {
        color: colors.goodFont,
        fontSize: fonts.font16,
        marginLeft:15
    },
    styleCount: {
        color: colors.title,
        fontSize: fonts.font19,
        marginLeft:15
    },
    style: {
        color: colors.greyFont,
        fontSize: fonts.font12,
        paddingBottom: 3,
        marginLeft: 5,
    },
    newContainer: {
        backgroundColor: 'white',
        width: '100%',
        height: '50%',
        justifyContent: 'space-between',
        paddingTop:15 ,
        paddingBottom:11
    },
    newCountContainer: {
        justifyContent: 'flex-end',
    },
    newImg: {
        position:'absolute',
        width: WIDTH *0.5,
        height: WIDTH *0.59*0.5,
    },
    styleCountContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },
    updateContainer: {
        width: '100%',
        height: WIDTH * 0.59,
        flexDirection: 'row'
    },
    leftUpdateImg: {
        width: '100%',
        height: '100%',
        zIndex: -1,
        position: 'absolute'
    },
    redPointBack: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 15,
        height: 15,
        borderRadius: 7.5,
        overflow: 'hidden',
        backgroundColor: '#ff5500',
        justifyContent: 'center',
        alignItems: 'center'
    },
    redPoint: {
        color: 'white',
        fontSize: fonts.font8
    },
    totalShopAndGoodsContainer: {
        flex:1,
        flexDirection:'row',
        height:30,
        alignItems:'center',
        backgroundColor:'white'
    },
    totalShopAndGoodsItem: {
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center'
    },
});
