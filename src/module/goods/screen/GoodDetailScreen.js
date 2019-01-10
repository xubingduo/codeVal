/**
 * author: xbu
 * Date: 2018/7/20
 * Time: 17:07
 * des:  商品详情页
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    NativeModules,
    NativeEventEmitter,
    Platform,
    AppState,
    InteractionManager, TouchableWithoutFeedback
} from 'react-native';
import BuyerComment from 'module/index/screen/shopIndex/widget/BuyerComment';
import {observer, inject} from 'mobx-react';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import {wFactor} from 'gsresource/ui/ui';
import Image from 'component/Image';
import GoodsDetailsImageViewer from 'component/GoodsDetailsImageViewer';
import ColorOnlyNavigationHeader from 'component/ColorOnlyNavigationHeader';
import ExpandAnimateView from '../widget/ExpandAnimateView';
import ImageTextView from 'component/ImageTextView';
import NumberEditView from 'component/NumberEditView';
import Alert from 'component/Alert';
import {Toast, Banner} from '@ecool/react-native-ui';
import DLFetch from '@ecool/react-native-dlfetch';
import GoodsParamsPop from '../widget/GoodsParamsPop';
import SliderShare from '../widget/SliderShare';
import GoodsShare from '../widget/GoodsShare';
import {addShoppingCart} from '../util/GoodsBuyUtil';
import NumberUtl from 'utl/NumberUtl';
import Communications from 'react-native-communications';
import IMService from 'svc/IMService';
import DocSvc from 'svc/DocSvc';
import sendGoodsItemChangeEvent, {CHANGE_GOODS_FAVOR_NUMBER_STATE} from 'svc/GoodsSvc';
import {parseUrl} from 'utl/ParseUrl';
import rootStore from 'store/RootStore';
import GoodsBuyStore from '../store/GoodsBuyStore';
import {GoodCategaryType} from 'svc/GoodsSvc';
import NetWorkUtl from 'utl/NetWorkUtl';
import UGCModule from '@ecool/react-native-video';
import AuthService from 'svc/AuthService';
import UserActionSvc from 'svc/UserActionSvc';
import {IndicaterAlign, IndicaterType} from '../../../component/TBanner';
import isIphoneX from '../../../utl/PhoneUtl';
import TBanner from '../../../component/TBanner';
import PropTypes from 'prop-types';
import NavigationSvc from 'svc/NavigationSvc';

const WIDTH = Dimensions.get('window').width;
const GOOD_SHOP_GUARANTEE_VIEW_H = 44;
const SERVICE_GUARUNTEE_VIEW_H = 33;
let UGC = NativeModules.UGCModule;

// 销售模式，普通，童装普通，童装批发
const NORMAL = 0;
const CHILD_NORMAL = 1;
const CHILD_GROUP = 2;


@inject('shoppingCartStore', 'userStore', 'configStore')
@observer
export default class GoodDetailScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param sourceFrom: PropTypes.number, // 1来自凑单商品列表 0默认
         * @param confirmHandler: PropTypes.func,
         */
        navigation: PropTypes.object,
    }

    static navigationOptions = () => {
        return {
            header: (<ColorOnlyNavigationHeader backgroundColor={colors.white} statusBarStyle={'dark-content'} />),
        };
    };

    constructor(props) {
        super(props);
        this.GoodsBuyStore = new GoodsBuyStore();
        this.canCollectAnimate = false;
        this.salesWayId = NORMAL;
        this.imgIndex = 0;
        this.state = {
            navBackColor: 'transparent', //顶部导航栏背景颜色
            backIcon: require('gsresource/img/headerBack.png'),
            msgIcon: require('gsresource/img/homeMsg.png'),
            phoneIcon: require('gsresource/img/phoneInverseActive.png'),
            shareIcon: require('gsresource/img/headerShareActive.png'),
            showTitle: false,
            shareObj: {},
            urlPrams: null,
            baseImg: '',
            myBaseImg: '',
            userBaseImg: '',
            bannerIndex: 1,
            showModal: false,
            priceObj: {
                orgPrice: '',
                defPrice: '',
            },
            currentAppState: AppState.currentState,
        };
        this.handleAppStateChange = this.handleAppStateChange.bind(this);
    }

    componentDidMount() {
        let {params} = this.props.navigation.state;
        // let indexData = 0;
        let data = parseUrl(params.url);
        // if(params.indexNub){
        // indexData = params.indexNub;
        // }
        this.setState({urlPrams: data});
        this.goodsBuyShow(params.url);
        this.getRqCode();

        // 监控app状态
        AppState.addEventListener('change', this.handleAppStateChange);
        this.confirmHandler = params.confirmHandler;
    }

    // 页面销毁
    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    // app状态改变
    handleAppStateChange = (nextAppState) => {
        if (Platform.OS === 'ios') {
            if (this.state.currentAppState === 'active' && nextAppState.match(/inactive|background/)) {
                if (this.shareGoodsStyle) {
                    this.shareGoodsStyle.dismiss();
                }
                this.sharePop.dismiss();
            }
            this.setState({currentAppState: nextAppState});
        }
    };

    // 当前页面刷新
    componentWillReceiveProps(nextProps) {
        let {params} = nextProps.navigation.state;
        // this.confirmHandler = params.confirmHandler;
        // let indexData = 0;
        let data = parseUrl(params.url);
        // if (params.indexNub) {
        //     indexData = params.indexNub;
        // }
        this.setState((prevState, props) => ({
            urlPrams: data,
            bannerIndex: 1
        }));

        this.goodsBuyShow(params.url);
        this.getRqCode();
    }

    //  导航返回
    onClickBack = () => {
        this.props.navigation.goBack();
    };

    // 页面滚动
    onScroll = (event) => {
        let offsetY = event.nativeEvent.contentOffset.y; //滑动距离
        if (offsetY > 64) {
            this.setState({
                navBackColor: 'white',
                backIcon: require('gsresource/img/headerBackActive.png'),
                msgIcon: require('gsresource/img/homeMsg2.png'),
                phoneIcon: require('gsresource/img/phoneInverse.png'),
                shareIcon: require('gsresource/img/headerShare.png'),
                showTitle: true,
            });
        } else {
            let alpha = offsetY / 64;
            this.setState({
                navBackColor: 'rgba(255, 255, 255,' + alpha + ')',
                backIcon: require('gsresource/img/headerBack.png'),
                msgIcon: require('gsresource/img/homeMsg.png'),
                phoneIcon: require('gsresource/img/phoneInverseActive.png'),
                shareIcon: require('gsresource/img/headerShareActive.png'),
                showTitle: false
            });
        }
    };

    // 收藏
    onClickCollection = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        if (goods.flag !== 1) {
            return Alert.alert('商品已下架,无法收藏');
        }
        if (goods.shopFlag !== 1) {
            return Alert.alert('店铺已下架,无法收藏');
        }

        this.GoodsBuyStore.changeFav();
        if (this.GoodsBuyStore.favorFlag) {
            this.canCollectAnimate = true;
            this.addCollection();
        } else {
            this.canCelCollection();
        }
    };

    // 收藏完成回调
    canCollectAnimateCallBack = () => {
        this.canCollectAnimate = false;
    };

    // 添加收藏
    addCollection = async () => {
        let goodsDetailMsg = this.GoodsBuyStore.goodsDetailMsg;
        let state = this.state.urlPrams;
        try {
            let param = {
                jsonParam: {
                    spuDocId: this.GoodsBuyStore.getImg(),// 商品图片
                    spuId: goodsDetailMsg['id'],// 商品spu的ID
                    spuTitle: goodsDetailMsg['title'],//
                    shopId: state['_tid'],// 卖家租户ID
                    shopName: goodsDetailMsg['unitId']// 卖家单元ID
                }
            };
            await this.GoodsBuyStore.fetchGoodsAddFavor(param).then(data => {
                sendGoodsItemChangeEvent(CHANGE_GOODS_FAVOR_NUMBER_STATE, {
                    goodsId: goodsDetailMsg['id'],
                    spuFavorFlag: 1,
                    spuFavorNum: this.GoodsBuyStore.favorNum,
                });
            });
        } catch (e) {
            Alert.alert(e.message);
        }
    };

    // 取消收藏
    canCelCollection = async () => {
        let goodsDetailMsg = this.GoodsBuyStore.goodsDetailMsg;
        try {
            let param = {
                jsonParam: {
                    spuId: goodsDetailMsg['id']// 商品spu的ID
                }
            };
            await this.GoodsBuyStore.fetchGoodsCancelFavor(param).then(data => {
                sendGoodsItemChangeEvent(CHANGE_GOODS_FAVOR_NUMBER_STATE, {
                    goodsId: goodsDetailMsg['id'],
                    spuFavorFlag: 0,
                    spuFavorNum: this.GoodsBuyStore.favorNum
                });
            });

        } catch (e) {
            Alert.alert(e.message);
        }
    };

    // 去担保页面
    onClickGuaranteeScreen = () => {
        this.props.navigation.navigate('GoodShopGuaranteeScreen');
    };

    // 去服务
    onClickServiceScreen = () => {
        this.props.navigation.navigate('ServiceGuaranteeScreen');
    };


    // 请求页面数据方法
    goodsBuyShow = (detailUrl) => {
        let baseUrl = DLFetch.getBaseUrl();
        if (detailUrl) {
            Toast.loading();
            let fullUrl = '';
            if (detailUrl.indexOf('http') === 0) {
                fullUrl = `${detailUrl}`;
            } else {
                fullUrl = `${baseUrl}${detailUrl}`;
            }
            const spuIdResult = detailUrl.match(/spuId=(\d+)/);
            const spuId = spuIdResult[1];
            const fetchBuyerCommentParams = {
                orderBy: 'show_order',
                jsonParam: {
                    type: 2,
                    bizId: spuId,
                    showFlag: 1,
                    auditFlag: 1
                }
            };
            try {
                // this.GoodsBuyStore.getGoodsDetail(fullUrl)
                Promise.all([
                    this.GoodsBuyStore.getGoodsDetail(fullUrl),
                    this.GoodsBuyStore.fetchBuyerComment(fetchBuyerCommentParams)
                ])
                    .then(([res]) => {
                        Toast.dismiss();
                        this.salesWayId = res.spu.salesWayId;
                        let params = parseUrl(detailUrl);

                        // 记录当前返回结果
                        this.setState({
                            shareObj: {
                                img: res.spu.coverUrl,
                                title: res.spu.title,
                                price: res.spu.pubPrice,
                                shopAddr: res.spu.shopAddr,
                                shopLogoPic: this.props.userStore.accountInfo.avatar ? this.props.userStore.accountInfo.avatar : '',
                                shopName: this.props.userStore.user.shopName,
                            }
                        });
                        // 查看
                        this.watchGoodsNumber(params, res.spu);
                        if (res['skus'].length > 0) {
                            // this.displayModalContent(res);
                            // this.goodsBuyModal.open();
                        } else {
                            Alert.alert('该商品不存在颜色或款号，无法购买！');
                        }

                    })
                    .catch(err => {
                        Toast.dismiss();
                        Alert.alert(err.message);
                    });
            } catch (e) {
                Toast.dismiss();
                Alert.alert('url参数错误！');
            }
        } else {
            Alert.alert('url参数错误！');
        }

        this.getShopPhone(detailUrl);
    };

    //获取查看数目
    watchGoodsNumber = async (obj, obj2) => {
        try {
            let params = {
                jsonParam: {
                    spuId: obj2.id, // 商品spu的ID
                    sellerId: obj['_tid'], // 卖家租户ID
                    sellerUnitId: obj2.unitId, // 卖家单元ID
                    type: 2,
                }
            };
            await this.GoodsBuyStore.watchGoodsNumber(params);
        } catch (e) {
            Alert.alert(e.message);
        }
    };


    // 获取电话
    getShopPhone(url) {
        let data = parseUrl(url);
        let tenantId = data['_tid'];
        this.GoodsBuyStore.getShopPhone(tenantId);
    }

    // 点击选择某个颜色
    colorClick(color) {
        this.GoodsBuyStore.colorClick(color);
    }

    // 加入购物车
    addCart = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return Alert.alert('页面出错了');
        }

        if (goods.flag !== 1) {
            return Alert.alert('商品已下架');
        }

        let state = this.state.urlPrams;
        let goodsDetailMsg = this.GoodsBuyStore.goodsDetailMsg;
        let newObj = {
            tenantName: goodsDetailMsg['shopName'],
            tenantId: goodsDetailMsg['shopId'],
            unitId: goodsDetailMsg['unitId'],
            clusterCode: state['_cid'],
        };


        if (goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) {
            Toast.show('该商品已经售罄');
        } else {
            try {
                let {skuList, spu, shop} = addShoppingCart(this.GoodsBuyStore.goodsDetail, newObj);
                if (skuList.length) {
                    InteractionManager.runAfterInteractions(() => {
                        this.props.shoppingCartStore.addSkuArray(skuList, spu, shop,
                            (ret, msg) => {
                                Toast._dismiss();
                                if (!ret) {
                                    Toast.show(msg, 3);
                                } else {
                                    this.GoodsBuyStore.resetData();
                                    Toast.show('加入进货车成功');
                                }
                            },
                            false
                        );
                    });
                } else {
                    Alert.alert('请先选择商品！');
                }
            } catch (e) {
                Toast._dismiss();
                Toast.show('本商品存在问题，无法加入购物车');
            }
        }
    };

    // 立即购买
    buyNow = () => {
        // if (!AuthService.isBuyAuthed()) {
        //     return;
        // }

        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return Alert.alert('页面出错了');
        }

        if (goods.flag !== 1) {
            return Alert.alert('商品已下架');
        }

        let state = this.state.urlPrams;
        let goodsDetailMsg = this.GoodsBuyStore.goodsDetailMsg;
        let newObj = {
            tenantName: goodsDetailMsg['shopName'],
            tenantId: goodsDetailMsg['shopId'],
            unitId: goodsDetailMsg['unitId'],
            clusterCode: state['_cid'],
        };
        if (goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) {
            Toast.show('该商品已经售罄');
        } else {
            try {
                let {skuList, spu, shop} = addShoppingCart(this.GoodsBuyStore.goodsDetail, newObj);
                if (skuList.length) {
                    this.GoodsBuyStore.resetData();
                    this.props.navigation.navigate('BillingConfirmScreen', {
                        skuArray: skuList,
                        spu: spu,
                        shop: shop
                    });
                } else {
                    Alert.alert('请先选择商品！');
                }
            } catch (e) {
                Toast.show('本商品存在问题，无法购买');
            }
        }
    };

    // 去购物车页面
    goToShoppingCartPage = () => {
        this.props.navigation.navigate('ShoppingCartWrapScreen');
    };

    // 去店铺界面
    goToStorePage = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return Alert.alert('页面出错了');
        }
        if (goods.shopFlag !== 1) {
            return Alert.alert('该商铺已经下架了～');
        }

        let goodsDetailMsg = this.GoodsBuyStore.goodsDetailMsg;
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: goodsDetailMsg.shopId,
            tenantName: goodsDetailMsg.shopName
        });
    };

    // 拨打电话
    callPhone = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return Alert.alert('页面出错了');
        }
        let {customPhoneType, customNo: phoneNum} = this.GoodsBuyStore.phoneMsg;
        let userMobile = rootStore.userStore.user.mobile;

        if (customPhoneType === 3) {
            if (userMobile.toString() === phoneNum.toString()) {
                Alert.alert('买家电话和卖家不能使用同一个号码');
            } else {
                Toast.loading();
                this.GoodsBuyStore.bindDummyPhone({callerNum: userMobile, calleeNum: phoneNum})
                    .then(res => {
                        Toast.dismiss(() => {
                            this.isAlertNow = true;
                            Alert.alert(
                                '好店提示',
                                `您可以使用手机号 ${userMobile} ，联系对方(对方使用虚拟号码  ${
                                    this.GoodsBuyStore.dummyPhone.relationNum} )！`,
                                [
                                    {
                                        text: '拨打电话',
                                        onPress: () => {
                                            // 新增电话挂断监听
                                            let callManagerEmitter = new NativeEventEmitter(
                                                NativeModules.DLCallCenterManager
                                            );
                                            NativeModules.DLCallCenterManager.registerCallStateListener();
                                            this.deEmitterPhone = callManagerEmitter.addListener(
                                                'phoneCallStateChange',
                                                result => {
                                                    if (result === 4) {
                                                        this.GoodsBuyStore.unBindDummyPhone()
                                                            .then(res => {
                                                                console.log(res);
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                            });
                                                    }
                                                }
                                            );
                                            this.isAlertNow = false;
                                            Communications.phonecall(
                                                this.GoodsBuyStore.dummyPhone
                                                    .relationNum,
                                                true
                                            );
                                        }
                                    },
                                    {
                                        text: '关闭',
                                        onPress: () => {
                                            this.isAlertNow = false;
                                        },
                                        style: 'cancel'
                                    }
                                ],
                                {cancelable: false}
                            );
                        });
                    })
                    .catch(err => {
                        Toast.show('虚拟号码无法获取，请联系客服处理！');
                    });
            }
        } else if (customPhoneType === 1) {
            if (phoneNum) {
                Toast.show('该商家未开通客服电话，将由好店客服为您服务！');
                Communications.phonecall(phoneNum, true);
            } else {
                Toast.show('号码无法获取，请联系客服处理！');
            }
        } else {
            if (phoneNum) {
                Communications.phonecall(phoneNum, true);
            } else {
                Toast.show('号码无法获取，请联系客服处理！');
            }
        }
    };

    // 携带商品信息到IM聊天界面
    goToIMWithGoodsInfo = async () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return Alert.alert('页面出错了');
        }
        let goodsDetailMsg = this.GoodsBuyStore.goodsDetailMsg;
        try {
            Toast.loading();
            let unitId = goodsDetailMsg.unitId;
            let data = await IMService.fetchSellerIMTeamId(rootStore.userStore.user.userId, unitId);
            Toast.dismiss();
            if (this.GoodsBuyStore.goodsDetailMsg) {
                // 构建商品提示信息所需对象
                let goodsMsg = IMService.createGoodsTipMsg(
                    this.GoodsBuyStore.goodsDetailMsg.id + '',
                    this.GoodsBuyStore.goodsDetailMsg.title,
                    this.GoodsBuyStore.goodsDetailMsg.price + '',
                    DocSvc.docURLM(this.GoodsBuyStore.goodsDetailMsg.coverUrl)
                );
                IMService.showIMScreenWithGoodsInfo(data.tid, goodsMsg);
            } else {
                IMService.showIMScreen(data.tid);
            }
        } catch (error) {
            Toast.dismiss();
            Alert.alert(error.message);
        }
    };

    // 查看商品参数
    getGoodsParams = () => {
        this.goodsParamsPop.show();
    };

    // 分享参数数控制
    getShareStyle = () => {
        let sharePrice = this.GoodsBuyStore.showSharePrice();
        let showStyle = this.GoodsBuyStore.showShareModalStyle();
        this.setState({
            showPrice: sharePrice,
            showModal: showStyle,
        });
    };

    // 获取二维码
    getRqCode = async (obj = {
        shareType: 1,
        originalPrice: '',
        distributionPrice: ''
    }, showModal = false, goodsParamsData) => {
        let {params} = this.props.navigation.state;
        let urlPrams = parseUrl(params.url);
        if (showModal) {
            Toast.loading();
        }
        try {
            // 给extProps添加小程序所需的额外参数
            Object.assign(obj, {
                srcType: '2', // 分享来源类型 买家分享传递2
                srcId: urlPrams._tid, // 做分享操作的用户的tenantId
            });

            let objData = {
                spuId: urlPrams.spuId,
                _tid: urlPrams._tid,
                _cid: urlPrams._cid,
                extProps: obj
            };
            let {data} = await this.GoodsBuyStore.fetchRqCode(objData, goodsParamsData);
            if (data.val) {
                if (!this.state.myBaseImg) {
                    this.setState({
                        myBaseImg: data.val,
                        userBaseImg: data.val,
                    });
                }

                this.setState({baseImg: data.val});
            }

            if (showModal) {
                Toast.dismiss();
                this.sharePop.show();
            }

        } catch (e) {
            Toast.dismiss();
            Alert.alert(e.message);
        }
    };

    // 分享详情页面
    shareDetailsPage = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return Alert.alert('页面出错了');
        }
        this.shareGoodsStyle.show();
    };

    // 分享款式一
    showSharePopBox = () => {
        let data = {orgPrice: '', defPrice: ''};
        this.setState({priceObj: data, showModal: false});

        let obj = {shareType: 1, originalPrice: '', distributionPrice: ''};
        this.getRqCode(obj, true);
        UserActionSvc.trackWithParam('GOODS_SHARE',
            {
                'type': '1',
                'originalPrice': '',
                'distributionPrice': '',
                'mobile': this.props.userStore.user && this.props.userStore.user.mobile ? this.props.userStore.user.mobile : '',
            });
    };

    // 分享款式二
    showSharePopBox2 = (obj) => {
        let data = {orgPrice: obj.originalPrice, defPrice: obj.defPrice};
        let goods = this.GoodsBuyStore.goodsDetail;

        this.setState({priceObj: data, showModal: true});

        let paramsData = {
            shareType: 2,
            originalPrice: obj.originalPrice,
            distributionPrice: obj.defPrice,
        };

        let goodsParamsData = {
            shopName: goods.shopName,
            title: goods.title,
            pubPrice: goods.pubPrice,
            docHeader: JSON.stringify(goods.docHeader),
            buyerLogoDocId: this.props.userStore.accountInfo.avatarId,
        };

        UserActionSvc.trackWithParam('GOODS_SHARE', {
            'type': '2',
            'originalPrice': obj.originalPrice + '',
            'distributionPrice': obj.defPrice + '',
            'mobile': this.props.userStore.user && this.props.userStore.user.mobile ? this.props.userStore.user.mobile : '',
        });
        this.getRqCode(paramsData, true, goodsParamsData);
    };


    // 获取类目对应图标
    getCategaryIcon = (goods) => {
        if (!goods || !goods.masterClassName) {
            return null;
        }
        let source = '';
        if (goods.masterClassName.indexOf(GoodCategaryType.men_cloth) >= 0) {
            source = require('gsresource/img/men_cloth.png');
        } else if (goods.masterClassName.indexOf(GoodCategaryType.women_cloth) >= 0) {
            source = require('gsresource/img/women_cloth.png');
        } else if (goods.masterClassName.indexOf(GoodCategaryType.child_cloth) >= 0) {
            source = require('gsresource/img/child_cloth.png');
        } else if (goods.masterClassName.indexOf(GoodCategaryType.child_shoe) >= 0) {
            source = require('gsresource/img/child_shoe.png');
        } else {
            source = null;
        }
        return source;
    };

    // Banner滚动回调
    selectedChangedBanner = (index) => {
        let orgIndex = Math.ceil(index);
        let canPay = this.GoodsBuyStore.showPayOrg;
        if (canPay) {
            if (orgIndex === 0) {
                orgIndex = 0;
            } else {
                orgIndex -= 1;
            }
            let data = this.GoodsBuyStore.goodsDetailImgCopy;
            let imgObj = data[0];
            if (imgObj.typeId === 3 && index === 0) {
                this.GoodsBuyStore.changePlayBtn(true);
            } else {
                this.GoodsBuyStore.changePlayBtn(false);
            }
        }
        this.imgIndex = orgIndex;
    };

    // 播放视屏
    onPlayClick = () => {
        let data = this.GoodsBuyStore.goodsDetailImgCopy;
        let imgObj = data[0];
        if (imgObj.typeId === 3) {
            if (Platform.OS === 'ios') {
                NetWorkUtl.getNetWorkState().then(enable => {
                    if (enable) {
                        UGCModule.autoPlay(imgObj.videoUrl, imgObj.coverUrl);
                    } else {
                        Toast.show('网络似乎不给力', 2);
                    }
                });
            } else {
                UGC.play(imgObj.videoUrl, imgObj.coverUrl);
            }
        }

    };

    // 点击banner
    onClickBanner = (item, index) => {
        let data = this.GoodsBuyStore.goodsDetailImgCopy;
        let imgObj = data[0];
        if (imgObj.typeId === 3 && index === 0) {
            this.onPlayClick();
        } else {
            this.setState({canRook: false});
            this.goodsDetailsImageViewer.exportMethods();
        }
    };

    hiddenImg = () => {
        this.setState({canRook: true});
    };

    renderHeader = () => {
        return (
            <View style={[styles.headerBox, {backgroundColor: this.state.navBackColor}]}>
                <TouchableOpacity onPress={this.onClickBack}>
                    <Image source={this.state.backIcon} />
                </TouchableOpacity>

                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                    <Text style={{
                        paddingLeft: 80,
                        fontSize: WIDTH <= 360 ? fonts.font14 : fonts.font18,
                        color: '#3d4245',
                    }}
                    >{this.state.showTitle ? '商品详情' : ''}</Text>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={styles.headerGap}
                        onPress={this.goToIMWithGoodsInfo}
                    >
                        <Image source={this.state.msgIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerGap}
                        onPress={this.callPhone}
                    >
                        <Image source={this.state.phoneIcon} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.headerGap}
                        onPress={this.shareDetailsPage}
                    >
                        <Image source={this.state.shareIcon} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    renderBodyImg = () => {
        return (
            <View style={styles.bodyImgBox}>
                {/*展示大图*/}
                <GoodsDetailsImageViewer
                    ref={pop => (this.goodsDetailsImageViewer = pop)}
                    source={{uri: ''}}
                    defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                    style={{width: WIDTH, height: 375}}
                    docIDs={this.GoodsBuyStore.goodsDetailImgPop}
                    index={this.imgIndex}
                    hideCallback={this.hiddenImg}
                />

                <TBanner
                    style={{width: WIDTH, height: WIDTH}}
                    autoPlay={true}
                    autoLoop={true}
                    alignStyle={{backgroundColor: colors.transparent}}
                    indicaterType={IndicaterType.dot}
                    indicaterAlign={IndicaterAlign.center}
                    duration={3000}
                    onItemChange={this.selectedChangedBanner}
                >
                    {
                        this.GoodsBuyStore.goodsDetailImg.map((item, index) => {
                            return (
                                <TouchableWithoutFeedback
                                    key={index.toString()}
                                    onPress={()=>{
                                        this.onClickBanner(item,index);
                                    }}
                                >
                                    <Image
                                        style={{width: WIDTH, height: WIDTH}}
                                        resizeMode={'cover'}
                                        source={{
                                            uri: item
                                        }}
                                    />
                                </TouchableWithoutFeedback>
                            );
                        })
                    }

                </TBanner>

                {
                    this.GoodsBuyStore.showPay ? (
                        <TouchableOpacity
                            activeOpacity={1}
                            onPress={this.onPlayClick}
                            style={styles.play}
                        >
                            <Image source={require('gsresource/img/videoPlay.png')} />
                        </TouchableOpacity>
                    ) : null
                }

            </View>
        );
    };

    renderLabels = (data) => {
        let objArray = [];
        let objElement = null;
        [2, 4, 8].forEach((val) => {
            if (data & val) {
                if (val === 2) {
                    objArray.push('推荐');
                } else if (val === 4) {
                    objArray.push('爆款');
                } else if (val === 8) {
                    objArray.push('上新');
                }
            }
        });

        objElement = objArray.map((el, index) => {
            return (
                <View
                    key={index}
                    style={{
                        backgroundColor: '#FFDDDC',
                        paddingTop: 2,
                        paddingBottom: 2,
                        paddingLeft: 5,
                        paddingRight: 5,
                        borderRadius: 2,
                        marginRight: 5
                    }}
                >
                    <Text style={{fontSize: 10, color: '#ff6699', opacity: 1}}>{el}</Text>
                </View>
            );
        });
        return objElement;
    };


    renderNavDesc = () => {
        let data = this.GoodsBuyStore.goodsDetail;
        let categarySource = this.getCategaryIcon(data);
        return (
            <View>
                <View style={styles.bodyNavBox}>
                    <View style={styles.bodyNavTextBox}>
                        <View style={styles.bodyNavTextBoxLeft}>
                            <Text style={{fontSize: fonts.font14, color: colors.activeFont}}>¥</Text>
                            <Text style={{
                                fontSize: fonts.font18,
                                color: colors.activeFont,
                                fontWeight: '600'
                            }}
                            >{data.price}{'   '}</Text>
                        </View>
                        <View style={styles.bodyNavTextBox}>
                            {this.renderLabels(data.abilityBits)}
                        </View>
                    </View>
                    <TouchableOpacity style={styles.favorBox} onPress={this.onClickCollection}>
                        <View>
                            {
                                this.GoodsBuyStore.favorFlag === 0 ? (
                                    <Image source={require('gsresource/img/goodsCollect.png')} />
                                ) : (
                                    <ExpandAnimateView
                                        animatedEnable={this.canCollectAnimate}
                                        animateCompleteHandler={this.canCollectAnimateCallBack}
                                    >
                                        <Image source={require('gsresource/img/goodsCollectActive.png')} />
                                    </ExpandAnimateView>
                                )
                            }
                            <Text style={{
                                fontSize: fonts.font12,
                                marginTop: 3,
                                marginLeft: 2,
                                color: this.GoodsBuyStore.favorFlag ? colors.activeFont : colors.greyFont
                            }}
                            >
                                {NumberUtl.NumberFormat(this.GoodsBuyStore.favorNum)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.descBox}>
                    {categarySource && <Image style={{marginRight: 5, marginTop: 2}} source={categarySource} />}
                    <Text style={styles.descText}>{data.title}</Text>
                </View>
            </View>
        );
    };

    // 好店担保View
    renderGoodShopGuaranteeView = () => {
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    height: SERVICE_GUARUNTEE_VIEW_H,
                    alignItems: 'center',
                    backgroundColor: '#7ed321'
                }}
                onPress={this.onClickGuaranteeScreen}
            >
                <View style={{marginLeft: 16, marginRight: 10}}>
                    <Image source={require('gsresource/img/guaruntee_small.png')} />
                </View>
                <Text style={{marginRight: 10, fontSize: 12, color: 'white'}}>商陆好店担保</Text>
                <Text style={{fontSize: 10, color: 'white'}}>全程护航，购物无忧</Text>
            </TouchableOpacity>
        );
    };

    // goods 参数
    renderGoodsParams = () => {
        let data = this.GoodsBuyStore.goodsDetail;
        let param = data.ecCaption;
        let isEmpty = (JSON.stringify(param) == '{}');
        if (isEmpty) {
            return null;
        }

        if (!param.fabric && !param.brandId && !param.season && !param.classId && !data.code && !data.theme) {
            return null;
        }
        let myWfactor = wFactor >= 1 ? 1 : wFactor;
        return (
            <TouchableOpacity
                style={styles.goodsQualityBox}
                onPress={this.getGoodsParams}
            >
                <Text style={{fontSize: fonts.font12, color: colors.greyFont}}>参数：</Text>
                <View style={{flex: 1, overflow: 'hidden', marginRight: 10}}>
                    <View style={styles.goodsQualityLabel}>
                        {
                            param.fabric ?
                                <Text
                                    style={[styles.labelText, {marginLeft: 12 * myWfactor}]}
                                    numberOfLines={1}
                                >
                                    材质：{param.fabric}</Text>
                                : null
                        }
                        {
                            param.brandId ?
                                <Text
                                    style={[styles.labelText, {marginLeft: 12 * myWfactor}]}
                                    numberOfLines={1}
                                >品牌：{param.brandId}</Text> : null
                        }
                        {
                            param.season ?
                                <Text
                                    style={[styles.labelText, {marginLeft: 12 * myWfactor}]}
                                    numberOfLines={1}
                                >季节：{param.season}</Text> : null
                        }
                        {
                            param.classId ?
                                <Text
                                    style={[styles.labelText, {marginLeft: 12 * myWfactor}]}
                                    numberOfLines={1}
                                >类别：{param.classId}</Text> : null
                        }
                        {/*{*/}
                        {/*data.marketDate ? (<Text style={styles.labelText} numberOfLines={1}>上架时间：{moment(data.marketDate).format('YYYY-MM-DD')}</Text>) : null*/}
                        {/*}*/}
                        {
                            data.code ?
                                <Text
                                    style={[styles.labelText, {marginLeft: 12 * myWfactor}]}
                                    numberOfLines={1}
                                >款号：{data.code}</Text> : null
                        }
                        {
                            param.theme ?
                                <Text
                                    style={[styles.labelText, {marginLeft: 12 * myWfactor}]}
                                    numberOfLines={1}
                                >风格：{param.theme}</Text> : null
                        }
                    </View>
                </View>
                <Image source={require('gsresource/img/arrowRight.png')} />
            </TouchableOpacity>
        );
    };

    // 服务保障View
    renderServiceGuaranteeView = () => {
        let myWfactor = wFactor >= 1 ? 1 : wFactor;
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    height: GOOD_SHOP_GUARANTEE_VIEW_H,
                    alignItems: 'center',
                    borderTopWidth: 1,
                    borderTopColor: '#eeeeee',
                    backgroundColor: colors.white,
                }}
                onPress={this.onClickServiceScreen}
            >
                <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', marginLeft: 16}}>
                    <Text style={{fontSize: 12 * myWfactor, color: colors.title}}>服务:</Text>
                    {rootStore.configStore &&
                    rootStore.configStore.serviceGuaranteeItems
                        .slice(0, 3)
                        .map((item, index) => {
                            return (
                                <View
                                    key={index}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        marginLeft: 20 * myWfactor,
                                        maxWidth: 83 * wFactor
                                    }}
                                >
                                    <Image source={require('gsresource/img/check_pink.png')} />
                                    <Text
                                        style={{fontSize: 12 * myWfactor, color: colors.title, marginLeft: 5}}
                                        numberOfLines={1}
                                    >
                                        {item.name}
                                    </Text>
                                </View>
                            );
                        })}
                </View>
                <View style={{marginRight: 14, paddingLeft: 4}}>
                    <Image source={require('gsresource/img/arrowRight.png')} />
                </View>
            </TouchableOpacity>
        );
    };

    // 商品颜色选择View
    renderGoodColorChoose = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        return (
            <View style={styles.colorBox}>
                <View style={styles.colorTitleBox}><Text style={styles.colorTitle}>颜色</Text></View>
                <View style={styles.colorDetailList}>
                    {goods.skuList.map((element, index) => {
                        return (
                            <View key={index} style={styles.colorDetailBox}>
                                <TouchableOpacity
                                    style={[
                                        styles.colorBtn,
                                        element.active === true && !(goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) ? styles.colorBtnActive : ''
                                    ]}
                                    onPress={() => {
                                        this.colorClick(element);
                                    }}
                                >
                                    <Text
                                        style={[
                                            styles.colorText,
                                            element.active === true && !(goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) ? styles.colorTextActive : ''
                                        ]}
                                    >
                                        {element.caption}
                                    </Text>
                                </TouchableOpacity>
                                {
                                    element.buyNum > 0 ? (
                                        <View style={[styles.colorBadgeBtn, styles.colorBadgeBtnActive]}>
                                            <Text style={[styles.colorBadgeText, styles.colorBadgeTextActive]}>
                                                {element.buyNum}
                                            </Text>
                                        </View>
                                    ) : null
                                }
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    // 商品尺寸选择View
    renderGoodSizeChoose() {
        let goods = this.GoodsBuyStore.goodsDetail;
        let canBuy = true;
        if (goods.flag === 1) {
            canBuy = true;
        } else {
            canBuy = false;
        }
        return goods.skuList.map((element, index) => {
            return (
                <View style={styles.buySize} key={index}>
                    {element.active && (
                        <View style={[styles.buySizeTr, styles.buySizeTheader]}>
                            <View style={[styles.buySizeTd, styles.size]}>
                                <Text style={styles.buyText}>尺码</Text>
                            </View>
                            <View style={[styles.buySizeTd, styles.buy]}>
                                <Text style={[styles.buyText, {marginRight: 55}]}>数量</Text>
                            </View>
                        </View>
                    )}
                    {element.active && (
                        <View
                            style={{
                                borderBottomColor: colors.borderE,
                                borderBottomWidth: 1,
                                borderTopColor: colors.borderE,
                                borderTopWidth: 1
                            }}
                        >
                            {element.sizeList.map((elem, idx) => {
                                const groupNum = elem.groupNum
                                    ? elem.groupNum
                                    : 1;
                                return (
                                    <View key={idx} style={[styles.buySizeTr, {backgroundColor: colors.white}]}>
                                        <View
                                            style={[
                                                styles.buySizeTd,
                                                styles.size
                                            ]}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode={'tail'}
                                                style={[styles.buyText, goods.hasOwnProperty('stockNum') && goods.stockNum <= 0 ? styles.sellOutOpacity : '']}
                                            >
                                                {elem.caption}
                                                {/*库={elem.num}*/}
                                            </Text>
                                            {!(goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) && elem.hasOwnProperty('num') && elem.num < groupNum && (
                                                <Image
                                                    style={styles.sellOutMin}
                                                    source={require('gsresource/img/sellOutMin.png')}
                                                />
                                            )}
                                            {
                                                goods.hasOwnProperty('stockNum') && goods.stockNum <= 0 ? (
                                                    <Image
                                                        style={styles.sellOutMin}
                                                        source={require('gsresource/img/sellOutMin.png')}
                                                    />
                                                ) : null
                                            }
                                        </View>
                                        <View
                                            style={[
                                                styles.buySizeTd,
                                                styles.buy
                                            ]}
                                        >
                                            <NumberEditView
                                                minNum={0}
                                                maxNum={elem.num}
                                                inputDirect={true}
                                                maxLength={4}
                                                defaultText={elem.buyNum}
                                                editable={
                                                    !(
                                                        (goods.hasOwnProperty(
                                                            'stockNum') &&
                                                            goods.stockNum <=
                                                            0) ||
                                                        (elem.hasOwnProperty(
                                                            'num') &&
                                                            elem.num < groupNum)
                                                    ) && canBuy
                                                }
                                                onTextChange={value => {
                                                    this.GoodsBuyStore.goodsColorSizeMinusAdd(
                                                        element,
                                                        elem,
                                                        value
                                                    );
                                                }}
                                                style={[{marginTop: 3}]}
                                                onceChange={groupNum}
                                            />
                                        </View>

                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            );
        });
    }

    /**
     * 童装批量模式
     * @param {*} goods
     */
    renderKidGoodsSizeChoose() {
        let goods = this.GoodsBuyStore.goodsDetail;
        return goods.skuList.map((element, index) => {
            const maxNum = this.GoodsBuyStore.getMaxNumInGroup(element);
            const saleOutStyle = maxNum < 1 ? {opacity: 0.3} : {};
            return (
                <View style={styles.buySize} key={index}>
                    {element.active && (
                        <React.Fragment>
                            <View style={[styles.buySizeTr, styles.buySizeTheader]}>
                                <View style={[styles.buySizeTd, styles.size]}>
                                    <Text style={styles.buyText}>尺码</Text>
                                </View>
                            </View>
                            <View style={[styles.sizeGroup, saleOutStyle]}>
                                <ScrollView
                                    horizontal={true}
                                    bounces={false}
                                >
                                    {element.sizeList.map((item, index) => {
                                        return <Text key={index} style={styles.sizeGroupText}>{item.caption}</Text>;
                                    })}
                                </ScrollView>
                            </View>
                            <View style={[styles.buySizeTr, styles.buySizeTheader]}>
                                <View style={[styles.buySizeTd, styles.size, styles.numContainer]}>
                                    <Text style={styles.buyText}>组数</Text>
                                </View>
                            </View>
                            <View style={styles.btnContainer}>
                                {
                                    maxNum < 1 &&
                                    <Image
                                        style={[styles.sellOutMin, {left: 60}]}
                                        source={require('gsresource/img/sellOutMin.png')}
                                    />
                                }
                                <NumberEditView
                                    minNum={0}
                                    maxNum={maxNum}
                                    inputDirect={true}
                                    maxLength={4}
                                    defaultText={element.sizeList[0].buyNum}
                                    editable={!(maxNum <= 0 && goods.hasOwnProperty(
                                        'stockNum') &&
                                        goods.stockNum <=
                                        0)}
                                    onTextChange={value => {
                                        this.GoodsBuyStore.kidGoodsColorSizeMinusAdd(
                                            element,
                                            value
                                        );
                                    }}
                                    style={[saleOutStyle, {
                                        marginTop: 3,
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }]}
                                    textPosition={'left'}
                                    unit={'组'}
                                />
                            </View>
                        </React.Fragment>
                    )}
                </View>
            );
        });
    }

    // 总价&&总件数View
    renderGoodTotal = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        return (
            <View style={{borderBottomWidth: 1, borderBottomColor: colors.borderE, backgroundColor: colors.white}}>
                <Text style={{
                    paddingTop: 10,
                    paddingRight: 10,
                    paddingBottom: 10,
                    textAlign: 'right',
                    fontSize: 12,
                    color: colors.normalFont
                }}
                >
                    共
                    {
                        this.salesWayId === CHILD_GROUP &&
                        <React.Fragment>
                            <Text style={{color: colors.activeFont}}>
                                {this.GoodsBuyStore.totalGroupNum}
                            </Text>
                            组
                        </React.Fragment>
                    }
                    <Text style={{color: colors.activeFont}}>{goods.buyNum}</Text>件
                    <Text style={{color: colors.activeFont}}>¥{goods.buyPay}</Text>
                </Text>
            </View>
        );
    };

    addToOrder = ()=>{
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return Alert.alert('页面出错了');
        }

        if (goods.flag !== 1) {
            return Alert.alert('商品已下架');
        }

        let state = this.state.urlPrams;
        let goodsDetailMsg = this.GoodsBuyStore.goodsDetailMsg;
        let newObj = {
            tenantName: goodsDetailMsg['shopName'],
            tenantId: goodsDetailMsg['shopId'],
            unitId: goodsDetailMsg['unitId'],
            clusterCode: state['_cid'],
        };
        if (goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) {
            Toast.show('该商品已经售罄');
        } else {
            try {
                let {skuList, spu, shop} = addShoppingCart(this.GoodsBuyStore.goodsDetail, newObj);
                if (skuList.length) {
                    this.GoodsBuyStore.resetData();
                    if(this.confirmHandler){
                        this.confirmHandler({
                            skuList: skuList,
                            spu: spu,
                            shop: shop
                        });
                    }
                } else {
                    Alert.alert('请先选择商品！');
                }
            } catch (e) {
                Toast.show('本商品存在问题，无法购买');
            }
        }
    }

    /**
     * 加入订单View
     */
    renderAddToOrderView = ()=>{
        return (
            <TouchableOpacity
                style={{height:40,backgroundColor:colors.activeBtn,alignItems:'center',justifyContent:'center'}}
                onPress={this.addToOrder}
            >
                <Text style={{fontSize:14, color:colors.white}}>加入订单</Text>
            </TouchableOpacity>
        );
    }


    // 立即购买按钮
    renderGoodBuyBtn = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return null;
        }
        return (
            <View style={styles.buyBtnList}>
                {this.props.configStore.isShowIm() && (
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ImageTextView
                            text={'店铺'}
                            requireIcon={require('gsresource/img/indexDisable.png')}
                            onItemClick={this.goToStorePage}
                            textStyle={styles.linkBtn}
                        />
                    </View>
                )}
                <View
                    style={{alignItems: 'center', justifyContent: 'center'}}
                >
                    <ImageTextView
                        text={'进货车'}
                        requireIcon={require('gsresource/img/shoppingCartDisable.png')}
                        onItemClick={this.goToShoppingCartPage}
                        textStyle={styles.linkBtn}
                    />
                    {
                        this.props.shoppingCartStore.getAllCountShow !== '0'
                        &&
                        <TouchableOpacity
                            onPress={this.goToShoppingCartPage}
                            style={{
                                top: 4,
                                paddingTop: 1,
                                paddingBottom: 1,
                                paddingLeft: 3,
                                paddingRight: 3,
                                borderRadius: 20,
                                position: 'absolute',
                                right: 6,
                                backgroundColor: colors.activeBtn
                            }}
                        >
                            <Text style={{
                                color: colors.white,
                                fontSize: fonts.font10
                            }}
                            >{this.props.shoppingCartStore.getAllCountShow}</Text>
                        </TouchableOpacity>
                    }
                </View>
                <TouchableOpacity
                    style={[
                        styles.buyBtn,
                        (goods.flag !== 1 || goods.hasOwnProperty('stockNum') && goods.stockNum <= 0)
                            ? {backgroundColor: '#d4d4d4'}
                            : {backgroundColor: '#ffdfe9'}
                    ]}
                    onPress={this.addCart}
                >
                    <Text
                        style={[
                            styles.buyBtnText,
                            (goods.flag !== 1 || goods.hasOwnProperty('stockNum') && goods.stockNum <= 0)
                                ? {color: '#fff'}
                                : {color: '#ff6699'}
                        ]}
                    >
                        加入进货车
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.buyBtn,
                        (goods.flag !== 1 || goods.hasOwnProperty('stockNum') && goods.stockNum <= 0)
                            ? {backgroundColor: '#9b9b9b'}
                            : {}
                    ]}
                    onPress={this.buyNow}
                >
                    <Text style={styles.buyBtnText}>立即购买</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // 售罄
    renderNoGoods = () => {
        let goods = this.GoodsBuyStore.goodsDetail;
        let isEmpty = (JSON.stringify(goods) == '{}');
        if (isEmpty) {
            return null;
        }
        if (goods.flag === 1) {
            return null;
        }
        return (
            <View style={styles.goodOverBox}>
                <Text style={{fontSize: fonts.font14, color: colors.white}}>商品已下架</Text>
            </View>
        );
    };

    renderBuyerComment = () => {
        const list = this.GoodsBuyStore.buyerCommentList;
        return list.length > 0 && (
            <View>
                <View style={styles.buyerCommentHeader}>
                    <View style={styles.divider} />
                    <Text style={styles.buyerCommentHeaderText}>买手说</Text>
                </View>
                {list.map(item => <BuyerComment key={item.itemId} {...item} isTagVisiable={false} />)}
            </View>
        );
    }

    // 空白或者错误页面
    pageNull = () => {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{flexDirection: 'column', alignItems: 'center'}}>
                    <Image source={require('gsresource/img/noFocusOnShop.png')} />
                    {/*<Text style={{fontSize: 18,color: colors.greyFont}}>没有数据</Text>*/}
                </View>
            </View>
        );
    };

    renderPage = () => {
        return (
            <ScrollView
                scrollEventThrottle={200}
                onScroll={this.onScroll}
            >
                {this.renderBodyImg()}
                {this.renderNavDesc()}
                {this.renderGoodShopGuaranteeView()}
                {this.renderGoodsParams()}
                {this.renderServiceGuaranteeView()}
                {this.renderBuyerComment()}
                {/*选择商品的颜色*/}
                {this.renderGoodColorChoose()}
                {/*尺寸选择部分*/}
                {this.salesWayId === CHILD_GROUP
                    ? this.renderKidGoodsSizeChoose()
                    : this.renderGoodSizeChoose()
                }
                {/*总价&&总件数*/}
                {this.renderGoodTotal()}
            </ScrollView>
        );
    };

    renderQuickBackView = ()=>{
        return (
            <TouchableOpacity
                style={{position:'absolute',right:14,bottom:200}}
                onPress={()=>{
                    // 返回BillingConfirmScreen
                    NavigationSvc.navigate('BillingConfirmScreen');
                }}
            >
                <Image source={require('gsresource/img/confirm_order_pink.png')} />
            </TouchableOpacity>
        );
    }

    render() {

        let goods = this.GoodsBuyStore.goodsDetail;
        let showPage = true;

        if (!goods || !goods.docHeader) {
            showPage = false;
        }

        if (goods.docHeader && goods.docHeader.length === 0) {
            showPage = false;
        }

        let sourceFrom = this.props.navigation.getParam('sourceFrom',0);

        console.log(goods);
        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeader()}
                {
                    showPage ? this.renderPage() : this.pageNull()
                }
                {/*下架商品*/}
                {this.renderNoGoods()}

                {/*按钮*/}
                {sourceFrom !== 1 && this.renderGoodBuyBtn(goods)}

                {/*/页面参数*/}
                <GoodsParamsPop
                    ref={pop => (this.goodsParamsPop = pop)}
                    data={goods.ecCaption}
                    date={goods.marketDate}
                    code={goods.code}
                />

                {/*分享*/}
                {
                    <GoodsShare
                        ref={(ref) => {
                            this.shareGoodsStyle = ref;
                        }}
                        baseImg={this.state.myBaseImg}
                        data={this.state.shareObj}
                        showPrice={this.state.showPrice}
                        unitId={this.props.userStore.user.unitId}
                        onClickLeft={this.showSharePopBox}
                        onClickRight={this.showSharePopBox2}
                    />
                }

                {/*分享*/}
                <SliderShare
                    ref={(ref) => {
                        this.sharePop = ref;
                    }}
                    // chooseItemCallback={this.shareItemCallback}
                    goodsPopShow={true}
                    baseImg={this.state.baseImg}
                    data={this.state.shareObj}
                    showPrice={this.state.priceObj}
                    showModal={this.state.showModal}
                    unitId={this.props.userStore.user.unitId}
                />

                {/*按钮*/}
                {sourceFrom === 1 && this.renderAddToOrderView()}
                {sourceFrom === 1 && this.renderQuickBackView()}
            </SafeAreaView>
        );
    }
}

const buyerCommentStyle = {
    buyerCommentContainer: {

    },
    buyerCommentHeader: {
        width: WIDTH,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        marginBottom: 1
    },
    buyerCommentHeaderText: {
        fontSize: fonts.font12,
        color: colors.normalFont
    },
    divider: {
        width: 3,
        height: 17,
        marginLeft: 17,
        marginRight: 7,
        backgroundColor: colors.activeBtn
    }

};

const styles = StyleSheet.create({
    ...buyerCommentStyle,
    play: {
        position: 'absolute',
        top: (WIDTH / 2) - 10,
        left: (WIDTH / 2) - 10,
    },

    // playBox: {
    //     width: WIDTH,
    //     height: WIDTH,
    //     position: 'absolute',
    //     top: 0,
    //     left: 0,
    // },

    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    headerBox: {
        height: 40,
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },

    headerRight: {
        flexDirection: 'row',
        justifyContent: 'flex-end'
    },

    headerGap: {
        marginLeft: 10,
    },

    bodyImgBox: {
        // height: 375,
        position: 'relative',
        backgroundColor: colors.white,
    },

    bodyNavBox: {
        height: 54,
        backgroundColor: colors.white,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingRight: 8,
        paddingLeft: 15,
    },

    bodyNavTextBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    bodyNavTextBoxLeft: {
        flexDirection: 'row',
        alignItems: 'flex-end',
    },

    favorBox: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 54,
    },

    descBox: {
        backgroundColor: colors.white,
        paddingRight: 15,
        paddingLeft: 15,
        flexDirection: 'row',
    },

    descText: {
        fontSize: fonts.font16,
        color: colors.normalFont,
        lineHeight: 20,
        marginBottom: 10,
        width: WIDTH - 60,
    },

    goodsQualityBox: {
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingRight: 14,
        paddingLeft: 16,
    },

    goodsQualityLabel: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.transparent,
        flexWrap: 'nowrap',
        height: 40,
    },

    labelText: {
        fontSize: fonts.font12,
        color: colors.normalFont,
        maxWidth: 150
    },

    buySize: {
        // position: 'relative',
        // borderTopWidth: 1,
        // borderColor: 'red',
    },

    buySizeTheader: {
        backgroundColor: colors.borderE
    },

    buySizeTr: {
        flexDirection: 'row',
        borderBottomColor: colors.borderE,
        borderBottomWidth: 1
    },

    buySizeTd: {
        paddingTop: 8,
        paddingBottom: 8
    },

    size: {
        flex: 1,
        paddingLeft: 30
    },

    buy: {
        width: 150,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 20
    },

    buyText: {
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: 14,
        lineHeight: 14
    },

    sellOutMin: {
        position: 'absolute',
        right: 20,
        top: 5
    },

    colorBox: {
        padding: 10,
        marginTop: 10,
        backgroundColor: colors.white,
    },

    colorTitleBox: {
        height: 24,
        paddingTop: 5,
        paddingLeft: 20
    },

    colorTitle: {
        fontSize: 14,
        color: colors.normalFont
    },

    colorDetailList: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },

    colorDetailBox: {
        width: (WIDTH - 20) / 4,
        padding: 5,
        position: 'relative'
    },

    colorBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.borderE
    },

    colorBtnActive: {
        backgroundColor: colors.activeBtn
    },

    colorText: {
        fontSize: 12,
        color: colors.greyFont,
        textAlign: 'center'
    },

    colorTextActive: {
        color: colors.white
    },

    colorBadgeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 10,
        height: 14,
        borderRadius: 7,
        paddingLeft: 3,
        paddingRight: 3,
        backgroundColor: colors.borderE,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1,
        overflow: 'hidden'
    },

    colorBadgeBtnActive: {
        backgroundColor: colors.activeBtn
    },

    colorBadgeText: {
        fontSize: 12,
        color: colors.greyFont
    },

    colorBadgeTextActive: {
        color: colors.white
    },

    buyBtnList: {
        height: 40,
        flexDirection: 'row',
        backgroundColor: colors.white,
    },

    buyBtn: {
        flex: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff6699'
    },

    buyBtnText: {
        fontSize: 14,
        color: '#fff'
    },

    linkBtn: {
        fontSize: 8,
        color: colors.greyFont
    },
    sizeGroup: {
        paddingLeft: 7,
        // height: 50,
        backgroundColor: colors.white,
        flexDirection: 'row'
    },
    sizeGroupText: {
        fontSize: 16,
        paddingLeft: 23,
        lineHeight: 50
    },
    numContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingRight: 20,
    },
    btnContainer: {
        height: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: colors.borderE,
        borderBottomWidth: 1
    },

    goodOverBox: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000',
        opacity: 0.5,
    }
});