/**
 * author: wwj
 * Date: 2018/8/6
 * Time: 上午10:45
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    FlatList,
    Dimensions,
    DeviceEventEmitter,
    Platform,
    NativeModules,
    NativeEventEmitter,
    Linking
} from 'react-native';
import {observer, inject} from 'mobx-react';
import {DLFlatList} from '@ecool/react-native-ui';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh';
import colors from '../../../../gsresource/ui/colors';
import fonts from '../../../../gsresource/ui/fonts';
import ShopIndexStore from '../../store/shopIndex/ShopIndexStore';
import GoodsItem from 'component/GoodsItem';
import _BottomItem from './widget/BuyerComment';
import * as _ from 'lodash';
import Alert from '../../../../component/Alert';
import GoodsBuy from '../../../goods/widget/GoodsBuy';
import ShopIndexEmptyView from '../../widget/ShopIndexEmptyView';
import Image from '../../../../component/Image';
import {Toast} from '@ecool/react-native-ui';
import {deepClone} from 'outils';
import UserActionSvc from 'svc/UserActionSvc';
import ShopSvc from '../../../../svc/ShopSvc';
import PopCoupon from '../../../coupon/widget/PopCoupon';
import IMService from 'svc/IMService';
import isIphoneX from 'utl/OsType';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import ShopIndexHeaderView from './view/ShopIndexHeaderView';
import rootStore from 'store/RootStore';
import Communications from 'react-native-communications';
import {SYS_CONFIG_PARAMS} from 'store/ConfigStore';
import {Observer} from 'mobx-react';
import ImageButton from '../../../../component/ImageButton';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import {VIEWABILITY_CONFIG} from '../IndexScreen';
import DLFetch from '@ecool/react-native-dlfetch';
import Config from 'config/Config';
import {fetchWatchGoods} from 'apiManager/ShopApiManager';
import ShopSliderShare from '../../widget/ShopSliderShare';

const PAGE_SIZE = 20;

const BottomItem = observer(_BottomItem);

/**
 * 导航跳转所需参数
 * tenantId: number = 店铺id
 * tenantName: string = 店铺名称(可不传)
 */
@inject('userStore', 'configStore')
@observer
export default class ShopIndexScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            // header: <ColorOnlyNavigationHeader backgroundColor={colors.white}/>
            header: null
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            isLoad: false,
            isFollow: false,
            freshState: RefreshState.Idle,
            tenantName: '',
            showInviteBtn: false,
            // goods购买专用
            shopMsg: {},
            // 店铺是否上线
            isShopOnline: true,
            // 分享相关state
            shareObj: {},
            baseImg: '',
            showModal: false,
        };
        this.shopIndexStore = new ShopIndexStore();
        // 是否可以点击im 初始不可以 需要加载完店铺信息后才可点击
        this.canIMClick = false;
        // 新品过滤标识
        this.newDresFlag = false;
        // 推荐过滤标识
        this.isRecommend = false;
    }

    beforeMount() {
        this.tenantId = this.props.navigation.state.params.tenantId;
        this.setState({
            tenantName: this.props.navigation.state.params.tenantName,
            isConsulted: false,
            isInvited: false
        });
        this.deEmitter = DeviceEventEmitter.addListener(
            GOODS_ITEM_CHANGE,
            ({key, data}) => {
                console.log(key.toLowerCase(), data);
                switch (key) {
                case GOODS_ITEM_DELETE: {
                    let {goodsId} = data;
                    this.shopIndexStore.removeGoodsItem(goodsId);
                    break;
                }
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let {tenantId, favorFlag} = data;
                    this.shopIndexStore.updateFocusStatusByGoodsId(
                        tenantId,
                        favorFlag
                    );
                    break;
                }
                case CHANGE_GOODS_WATCH_NUMBER: {
                    let {goodsId, viewNum} = data;
                    this.shopIndexStore.updateViewNumByGoodsId(goodsId);
                    break;
                }
                case CHANGE_GOODS_STAR_NUMBER_STATE: {
                    let {goodsId, praiseFlag, praiseNum} = data;
                    this.shopIndexStore.updateStarNumByGoodsId(
                        goodsId,
                        praiseFlag,
                        praiseNum
                    );
                    break;
                }
                case CHANGE_GOODS_FAVOR_NUMBER_STATE: {
                    let {goodsId, spuFavorFlag, spuFavorNum} = data;
                    this.shopIndexStore.updateFavorNumByGoodsId(
                        goodsId,
                        spuFavorNum,
                        spuFavorFlag
                    );
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );

        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('店铺首页');
        }
    }

    componentDidMount() {
        this.beforeMount();
        this.shopIndexStore.getShopPhone(this.tenantId);
        this.getCouponList();
        this.throttleLoadData();
        // 检查IM登录信息
        IMService.checkIMLoginStatus();
    }

    componentWillUnmount() {
        this.deEmitter && this.deEmitter.remove();
        this.deEmitterPhone && this.deEmitterPhone.remove();
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('店铺首页');
        }
    }

    throttleLoadData = _.throttle(() => {
        this.loadData(true);
        this.loadShopDetail();
    }, 300);

    render() {
        return (
            <View
                style={[
                    styles.container,
                    {paddingBottom: isIphoneX() ? 30 : 0}
                ]}
            >
                {this.state.isShopOnline
                    ? this.renderOnlineView()
                    : this.renderOfflineView()}

                {/*购买弹出窗口*/}
                <GoodsBuy
                    onRef={goodsBuy => {
                        this.goodsBuy = goodsBuy;
                    }}
                    shopMsg={this.state.shopMsg}
                />
                {/*领券弹出窗口*/}
                <PopCoupon
                    ref={ref => {
                        this.PopCoupon = ref;
                    }}
                    data={this.shopIndexStore.shopCouponList}
                    refreshState={0}
                />
                {/*分享*/}
                <ShopSliderShare
                    ref={(ref) => {this.sharePop = ref;}}
                    // chooseItemCallback={this.shareItemCallback}
                    goodsPopShow={true}
                    baseImg={this.state.baseImg}
                    data={this.state.shareObj}
                    showModal={this.state.showModal}
                    onShortMessageClickCallback={this.onClickShortMessageShare}
                />
            </View>
        );
    }

    imClick = () => {
        if (this.canIMClick) {
            // 获取系统参数配置 是否显示IM
            if (this.props.configStore.isShowIm()) {
                this.gotoIMScreen();
            } else {
                if (this.state.isConsulted) {
                    Toast.show('消息已发送，等待卖家联系您');
                } else if (
                    this.sellerId &&
                    this.sellerUnitId &&
                    this.clusterCode &&
                    (this.props.userStore.accountInfo &&
                        this.props.userStore.accountInfo.mobile)
                ) {
                    this.consultToSeller(
                        this.props.userStore.accountInfo.mobile,
                        this.sellerId,
                        this.sellerUnitId,
                        this.props.userStore.accountInfo.nickName
                            ? this.props.userStore.accountInfo.nickName
                            : ''
                    );
                }
            }
        }
    };

    gotoIMScreen = async () => {
        if (!this.canIMClick) {
            return;
        }
        this.canIMClick = false;
        try {
            Toast.loading();
            let data = await IMService.fetchSellerIMTeamId(
                this.props.userStore.user.userId,
                this.sellerUnitId
            );
            Toast.dismiss();
            IMService.showIMScreen(data.tid);
            this.canIMClick = true;
        } catch (error) {
            Toast.dismiss();
            Alert.alert(error.message);
            this.canIMClick = true;
        }
    };

    onGoodsItemClick = (goods) => {
        this.fetchWatchGoods(goods);
    };

    onSortBtnClick = (value) => {
        this.shopIndexStore.handleSortBtn(value);
        this.loadData(true);
    };

    fetchWatchGoods = (goods) => {
        const jsonParam = {
            spuId: goods.id,
            sellerId: goods.tenantId,
            sellerUnitId: goods.unitId,
            type: 1
        };
        fetchWatchGoods({jsonParam})
            .then(() => {
                sendGoodsItemChangeEvent(CHANGE_GOODS_WATCH_NUMBER, {
                    goodsId: goods['id'],
                    viewNum: (goods.viewNum || 0) + 1
                });
            });
    };

    // 获取分享店铺的信息
    fetchShareStore = (obj) => {
        console.log('获取分享店铺的信息===>',obj);
        let str = '【商陆好店】我在商陆好店app发现了一个优质店铺[' + obj.shopName + ']，分享给你哦~戳链接进入店铺~https://spdev.hzecool.com/msg/messages?id=' + obj.shopId + ' ';
        console.log(str);
        if (Platform.OS === 'ios') {
            Linking.openURL('sms: &body=' + str);
        } else {
            NativeModules.DLConfigManager.sendSms(str);
            // Linking.openURL('sms: ?body=' + str);
        }
    };

    // 短信分享店铺
    onClickShortMessageShare = () => {
        let {shopDetailInfo} = this.shopIndexStore;
        this.fetchShareStore({shopId: shopDetailInfo.id, shopName: shopDetailInfo.name});
    };

    // 分享店铺
    onClickShareStore = () => {
        this.sharePop.show();
    };

    // currentCommentIndex = 0;

    findCommentItem = (index) => {
        const list = this.shopIndexStore.sortedBuyerCommentList;
        const result = [];
        // 假设items按showOrder升序。showOrder为0时不显示。
        for (let i = 0; i < list.length; i++) {
            const item = list[i];
            if (index < item.showOrder) {
                break;
            } else if (index === item.showOrder) {
                // 0提交，1通过，9驳回。
                item.flag === 1 && result.push(item);
            }
        }

        return result;
    }

    // 店铺上线状态界面
    renderOnlineView = () => {
        let {shopDetailInfo} = this.shopIndexStore;
        __DEV__ && console.log('店铺上线状态界面===>', shopDetailInfo);

        return (
            <View style={{flex: 1}}>
                <ShopIndexHeaderView
                    store={this.shopIndexStore}
                    toDetailHandler={() => {
                        this.props.navigation.navigate('ShopDetailScreen', {
                            store: this.shopIndexStore
                        });
                    }}
                    searchClickHandler={value => {
                        this.props.navigation.push('SearchGoodsListScreen', {
                            key: '',
                            tenantId: this.tenantId,
                            isShowShopInfo: false,
                            autoFocus: true
                        });
                    }}
                    tabDidChange={(items, index) => {
                        if (this.listRef) {
                            this.listRef.scrollToOffset({
                                animated: false,
                                offset: 0
                            });
                        }
                        this.shopIndexStore.resetSortBtns();
                        this.shopIndexStore.queryType = items[index].value;
                        switch(items[index].key) {
                        // 新款
                        case '10':
                            this.isRecommend = false;
                            this.newDresFlag = true;
                            this.shopIndexStore.queryType = 0;
                            break;
                        // 推荐
                        case '2':
                            this.isRecommend = true;
                            this.newDresFlag = false;
                            this.shopIndexStore.queryType = 0;
                            break;
                        default:
                            this.isRecommend = false;
                            this.newDresFlag = false;
                            //
                        }
                        // if (items[index].key === '10') {
                        //     this.newDresFlag = true;
                        // } else {
                        //     this.newDresFlag = false;
                        // }
                        this.loadData(true);
                    }}
                    callHandler={this.callPhone}
                    followClickHandler={() => {
                        if (shopDetailInfo.id && shopDetailInfo.name) {
                            UserActionSvc.track('SHOP_TOGGLE_FOCUS_ON');
                            this.changeAttention(
                                shopDetailInfo.id,
                                shopDetailInfo.name
                            );
                        }
                    }}
                    imClickHanlder={() => {
                        this.imClick();
                    }}

                    onClickShareStore={this.onClickShareStore}
                    onSortBtnClick={this.onSortBtnClick}
                />
                <Observer>
                    {() => (
                        <DLFlatList
                            listRef={refList => {
                                this.listRef = refList;
                            }}
                            style={{flex: 1}}
                            keyExtractor={(item, index) => {
                                //商品id可能重复  不能使用id
                                return index.toString();
                            }}
                            renderItem={this.renderContent}
                            data={this.shopIndexStore.shopGoodsListShow}
                            refreshState={this.state.freshState}
                            onHeaderRefresh={this.onHeadFresh}
                            onFooterRefresh={this.onLoadMore}
                            ListEmptyComponent={this.renderEmptyView}
                            removeClippedSubviews={Platform.OS === 'android'}
                            viewabilityConfig={VIEWABILITY_CONFIG}
                        />
                    )}
                </Observer>

                {/*底部按钮*/}
                {this.renderFooter()}
            </View>
        );
    };

    renderEmptyView = () => {
        return (
            <ShopIndexEmptyView
                btnClickFunc={this.sendInvitation}
                showBtn={this.state.showInviteBtn}
            />
        );
    };

    // 店铺下线界面
    renderOfflineView = () => {
        return (
            <View style={{flex: 1}}>
                {this.renderOfflineHeader()}
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'column',
                            alignItems: 'center'
                        }}
                    >
                        <Image
                            source={require('gsresource/img/noFocusShop.png')}
                        />
                        <Text
                            style={{
                                fontSize: fonts.font12,
                                color: '#9b9b9b',
                                marginTop: 12
                            }}
                        >
                            {'您想查看的店铺已经下线~'}
                        </Text>
                    </View>
                </View>

                <TouchableOpacity
                    style={styles.offlineBottomButton}
                    onPress={() => {
                        DeviceEventEmitter.emit('GO_TO_INDEX_TOP');
                        this.props.navigation.navigate('IndexScreen');
                    }}
                >
                    <Text
                        style={{fontSize: fonts.font14, color: colors.white}}
                    >
                        {'去首页看看'}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    renderOfflineHeader = () => {
        return (
            <View>
                <ColorOnlyNavigationHeader backgroundColor={'white'} />
                <View style={styles.offlineHeaderContainer}>
                    <ImageButton
                        hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onClick={() => {
                            this.props.navigation.goBack();
                        }}
                        source={require('gsresource/img/arrowLeftGrey.png')}
                    />
                    <Text
                        style={{
                            fontSize: fonts.font18,
                            color: colors.normalFont,
                            maxWidth: 240
                        }}
                        numberOfLines={1}
                    >
                        {'店铺已下线'}
                    </Text>
                    <View style={{width: 20}} />
                </View>
            </View>
        );
    };

    renderContent = ({item, index}) => {
        const commentItems = this.findCommentItem(index);
        return (
            <View style={{flexDirection: 'column'}}>
                {
                    commentItems && commentItems.length > 0 && commentItems.map(commentItem => <BottomItem key={commentItem.itemId} {...commentItem} />)
                }
                <GoodsItem
                    key={item.id}
                    isShowShopInfo={false}
                    goods={item}
                    onGoodsItemClick={this.onGoodsItemClick}
                    buyClick={() => {
                        this.setState({shopMsg: item}, () => {
                            this.goodsBuy.goodsBuyShow(item.detailUrl);
                        });
                    }}
                />
            </View>
        );
    };

    // 底部按钮 @xbu
    renderFooter = () => {
        let img = this.shopIndexStore.shopCouponList.length
            ? require('gsresource/img/couponsHasIcon.png')
            : require('gsresource/img/couponsNoneIcon.png');
        return (
            <View style={styles.bottomBtnContainer}>
                <TouchableOpacity style={styles.bottomBtn}>
                    <Text
                        style={{
                            fontSize: fonts.font14,
                            color: colors.activeFont
                        }}
                    >
                        全部商品
                    </Text>
                </TouchableOpacity>
                <View
                    style={{
                        height: 15,
                        width: 1,
                        backgroundColor: colors.border1
                    }}
                />
                <TouchableOpacity
                    style={styles.bottomBtn}
                    onPress={this.goToShopGoodsCategory}
                >
                    <Text
                        style={{
                            fontSize: fonts.font14,
                            color: colors.greyFont
                        }}
                    >
                        商品分类
                    </Text>
                </TouchableOpacity>

                <View
                    style={{
                        height: 15,
                        width: 1,
                        backgroundColor: colors.border1
                    }}
                />
                <TouchableOpacity
                    style={styles.bottomBtn}
                    onPress={this.getCoupon}
                >
                    <Image
                        source={img}
                    />
                    <Text
                        style={{
                            fontSize: fonts.font9,
                            marginTop: 3,
                            color: this.shopIndexStore.shopCouponList.length
                                ? colors.activeFont
                                : colors.greyFont
                        }}
                    >
                        优惠券领取
                    </Text>
                </TouchableOpacity>

            </View>
        );
    };

    loadData(fresh) {
        if (fresh) {
            this.pageNo = 1;
            this.updateFreshState(RefreshState.HeaderRefreshing);
        } else {
            this.updateFreshState(RefreshState.FooterRefreshing);
        }

        fresh && this.shopIndexStore.fetchBuyerCommentList(
            fresh,
            {
                pageNo: this.pageNo,
                orderBy: 'show_order'
            },
            {
                type: 1,
                bizId: this.tenantId,
                showFlag: 1,
                auditFlag: 1
            }
        );
        const jsonParam = {
            tenantId: this.tenantId,
            queryType: this.shopIndexStore.queryType,
            keyWords: this.isRecommend ? {specialFlag:[1]} : {}
        };
        if (this.newDresFlag) {
            jsonParam.newDresFlag = true;
        }
        this.shopIndexStore.searchShopGoods(
            fresh,
            {
                pageSize: PAGE_SIZE,
                pageNo: this.pageNo,
                orderBy: this.shopIndexStore.sortBy,
                orderByDesc: this.shopIndexStore.orderByDesc
            },
            jsonParam,
            (ret, ext) => {
                if (!ret) {
                    Alert.alert(ext);
                    this.updateFreshState(RefreshState.Idle);
                } else {
                    if (fresh && this.listRef && Platform.OS === 'android') {
                        this.listRef.scrollToOffset({
                            animated: false,
                            offset: 0
                        });
                    }
                    if (ext === 0) {
                        setTimeout(() => {
                            this.updateFreshState(RefreshState.NoMoreData);
                        }, 500);
                    } else {
                        setTimeout(() => {
                            this.updateFreshState(RefreshState.Idle, {
                                showInviteBtn: true
                            });
                        }, 500);
                    }

                    this.pageNo = this.pageNo + 1;
                }
            }
        );
    }

    /**
     * 获取店铺详情信息
     */
    loadShopDetail() {
        this.shopIndexStore.queryShopDetail(this.tenantId, (ret, ext) => {
            if (ret && this.shopIndexStore.shopDetailInfo) {
                this.setState({
                    tenantName: this.shopIndexStore.shopDetailInfo.name,
                    isFollow:
                    this.shopIndexStore.shopDetailInfo.favorFlag === 1,
                    isShopOnline: this.shopIndexStore.shopDetailInfo.flag === 1,
                    isLoad: true,
                    shareObj: {
                        shopName: this.shopIndexStore.shopDetailInfo.name,
                        shopLogo: this.shopIndexStore.shopDetailInfo.logoPic,
                        img: this.shopIndexStore.shopDetailInfo.coverPic,
                    }
                });
                this.sellerId = this.shopIndexStore.shopDetailInfo.id;
                this.sellerUnitId = this.shopIndexStore.shopDetailInfo.unitId;
                this.clusterCode = this.shopIndexStore.shopDetailInfo.clusterCode;
                this.canIMClick = true;
                this.getShareQrCode(this.shopIndexStore.shopDetailInfo.tenantId, this.clusterCode);
            } else {
                Alert.alert(
                    '提示',
                    ext,
                    [
                        {
                            text: '确定',
                            onPress: () => {
                                this.props.navigation.goBack();
                            }
                        }
                    ],
                    {cancelable: false}
                );
            }
        });
    }

    getShareQrCode = async (tid, cid) => {
        try{
            let extProps ={
                srcType: 2, // 分享来源类型，买家分享传递2
                srcId: tid, // 做分享操作的用户的tenantId
            };
            let {data} = await this.shopIndexStore.fetchShopShareQrCode(tid, cid, extProps);
            if (data.val) {
                this.setState({baseImg: data.val});
            }

        } catch (e) {
            Toast.dismiss();
            Alert.alert(e.message);
        }
    };

    updateFreshState = (state, extraParam) => {
        this.setState({freshState: state, ...extraParam});
    };

    onHeadFresh = () => {
        this.throttleLoadData();
        this.getCouponList();
    };

    onLoadMore = () => {
        this.loadData(false);
    };

    changeAttention = (shopId, shopName) => {
        Toast.loading();

        let isFollow = this.shopIndexStore.isFocused;
        if (isFollow) {
            // 取消关注
            this.shopIndexStore.unFocusShop(shopId, (ret, ext) => {
                if (ret) {
                    this.setState({isFollow: !isFollow}, () => {
                        this.loadShopDetail();
                        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                            favorFlag: !isFollow ? 1 : 0,
                            tenantId: shopId
                        });
                    });
                    Toast.success('取消成功');
                } else {
                    Toast.show(ext);
                }
            });
        } else {
            // 关注店铺
            this.shopIndexStore.focusShop(shopId, shopName, (ret, ext) => {
                if (ret) {
                    this.setState({isFollow: !isFollow}, () => {
                        this.loadShopDetail();
                        // ShopSvc.sendFollowStatusChangeEvent(shopId, this.state.isFollow ? 1 : 0);
                        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                            favorFlag: !isFollow ? 1 : 0,
                            tenantId: shopId
                        });
                    });
                    Toast.success('关注成功');
                } else {
                    Toast.show(ext);
                }
            });
        }
    };

    // 拨打电话
    callPhone = () => {
        let {
            customPhoneType,
            customNo: phoneNum
        } = this.shopIndexStore.phoneMsg;
        let userMobile = rootStore.userStore.user.mobile;
        if (customPhoneType === 3) {
            if (userMobile.toString() === phoneNum.toString()) {
                Alert.alert('买家电话和卖家不能使用同一个号码');
            } else {
                Toast.loading();
                this.shopIndexStore
                    .bindDummyPhone({
                        callerNum: userMobile,
                        calleeNum: phoneNum
                    })
                    .then(res => {
                        Toast.dismiss(() => {
                            Alert.alert(
                                '好店提示',
                                `您可以使用手机号 ${userMobile} ，联系对方(对方使用虚拟号码  ${
                                    this.shopIndexStore.dummyPhone.relationNum
                                } )!  `,
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
                                                        this.shopIndexStore
                                                            .unBindDummyPhone()
                                                            .then(res => {
                                                                console.log(
                                                                    res
                                                                );
                                                            })
                                                            .catch(err => {
                                                                console.log(
                                                                    err
                                                                );
                                                            });
                                                    }
                                                }
                                            );
                                            Communications.phonecall(
                                                this.shopIndexStore.dummyPhone
                                                    .relationNum,
                                                true
                                            );
                                        }
                                    },
                                    {
                                        text: '关闭',
                                        onPress: () =>
                                            console.log('Cancel Pressed'),
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

    consultToSeller = (mobile, sellerId, sellerUnitId, nickName) => {
        Toast.loading();
        ShopSvc.consultToSeller(
            mobile,
            sellerId,
            sellerUnitId,
            nickName,
            (ret, ext) => {
                let msg = '消息已发送，等待卖家联系您';
                if (ret) {
                    this.setState({isConsulted: true});
                }
                if (ext) {
                    msg = ext;
                }
                Toast.dismiss();
                Alert.alert(msg);
            }
        );
    };

    goToShopGoodsCategory = () => {
        let cid = this.shopIndexStore.shopCid;
        this.props.navigation.navigate('ShopGoodsCategoryScreen', {
            tenantId: this.tenantId,
            unitId: this.shopIndexStore.shopDetailInfo.unitId,
            shopCid: cid
        });
    };

    /**
     * 发送邀请
     */
    sendInvitation = () => {
    };

    // 处理勋章的函数
    detailMedals(medals) {
        let returnMedalList = [];
        let medalList = deepClone(medals);
        // 转换格式
        Object.keys(medalList).forEach(key => {
            let medal = medalList[key];
            medal['key'] = key;
            returnMedalList.push(medal);
        });
        // 过滤未拥有的
        let _returnMedalList = returnMedalList.filter(item => {
            return item['showFlag'] === 1;
        });
        return _returnMedalList;
    }

    // 获取优惠券
    getCouponList = async () => {
        let data = {
            jsonParam: {
                shopId: this.props.navigation.state.params.tenantId
            }
        };
        try {
            await this.shopIndexStore.getStoreCoupons(data);
        } catch (e) {
            Alert.alert(e.message);
        }
    };

    // 优惠券
    getCoupon = () => {
        if (this.shopIndexStore.shopCouponList.length) {
            this.PopCoupon.show();
        } else {
            Toast.show('暂无优惠券', 2);
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: colors.bg
    },
    offlineHeaderContainer: {
        width: Dimensions.get('window').width,
        height: 40,
        backgroundColor: colors.white,
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#d8d8d8',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 6
    },
    bottomBtnContainer: {
        height: 40,
        flexDirection: 'row',
        borderTopWidth: StyleSheet.hairlineWidth,
        borderColor: '#d8d8d8',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white
    },
    bottomBtn: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    offlineBottomButton: {
        backgroundColor: colors.activeBtn,
        alignItems: 'center',
        height: 45,
        justifyContent: 'center'
    }
});
