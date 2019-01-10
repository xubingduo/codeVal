/**
 * author: tuhui,wwj
 * Date: 2018/7/17
 * Time: 08:40
 * des:
 */

import React, { Component } from 'react';
import colors from '../../../gsresource/ui/colors';
import fonts from '../../../gsresource/ui/fonts';
import I18n from 'gsresource/string/i18n';
import moment from 'moment';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    ScrollView,
    View,
    RefreshControl,
    TouchableWithoutFeedback,
    Dimensions,
    Platform,
    DeviceEventEmitter,
    NativeModules
} from 'react-native';
import ImageTextView from '../../../component/ImageTextView';
import ImageTextWithArrowView from '../../../component/ImageTextWithArrowView';
import { inject, observer } from 'mobx-react';
import ImageButton from '../../../component/ImageButton';
import SettingScreen from './setting/SettingScreen';
import DividerLineH from '../../../component/DividerLineH';
import Image from '../../../component/Image';
import TopBottomText from '../widget/TopBottomText';
import MineStore from '../store/MineStore';
import * as _ from 'lodash';
import Mask from '../../../component/Mask';
import isIphoneX from 'utl/PhoneUtl';
import DocSvc from '../../../svc/DocSvc';
import UserActionSvc from '../../../svc/UserActionSvc';
import ShopSvc from 'svc/ShopSvc';

const WIDTH = Dimensions.get('window').width;

@inject('userStore', 'maskStore')
@observer
export default class MineScreen extends Component {
    constructor(props) {
        super(props);
        this.store = new MineStore();

        this.state = { isRefreshing: false };
    }

    componentDidMount() {
        this.loadUserData(false);
        // 监听我的数据刷新
        this.deEmitter = DeviceEventEmitter.addListener(
            'mineScreenrefresh',
            () => {
                this.loadUserData(false);
            }
        );
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('我的');
        }
    }

    componentWillUnmount() {
        // 移除事件监听
        this.deEmitter.remove();
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('我的');
        }
    }

    render() {
        return (
            <View style={{ flex: 1, backgroundColor: colors.bg }}>
                {this.renderBackgroundImg()}
                <ScrollView
                    style={styles.container}
                    refreshControl={this.renderRefreshControl()}
                >
                    <View style={styles.topContainer}>
                        <View style={styles.topOperationContainer}>
                            <ImageButton
                                hitSlop={{
                                    left: 16,
                                    right: 16,
                                    bottom: 16,
                                    top: 16
                                }}
                                style={styles.topOperation}
                                onClick={() => {
                                    UserActionSvc.track('MINE_SETTING');
                                    this.props.navigation.navigate(
                                        'SettingScreen'
                                    );
                                }}
                                source={require('gsresource/img/setting.png')}
                            />
                        </View>

                        <TouchableWithoutFeedback
                            onPress={this.goToAccountInfo}
                        >
                            <View style={styles.userInfoContaiber}>
                                {this.renderUserAvatar()}
                                {this.renderUserName()}
                                <Image
                                    source={require('gsresource/img/arrowRightSmall.png')}
                                />
                            </View>
                        </TouchableWithoutFeedback>
                    </View>

                    {this.renderStatisticsLayout()}

                    {this.renderOrderLayout()}

                    <View style={{ marginTop: 8 }}>
                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={I18n.t('myFocusShop')}
                            onArrowClick={() => {
                                UserActionSvc.track('MINE_FOCUS_SHOP');
                                this.props.navigation.navigate(
                                    'FocusShopScreen'
                                );
                            }}
                        />

                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={I18n.t('shopTakeGoodsFrom')}
                            onArrowClick={() => {
                                UserActionSvc.track('MINE_TAKE_GOODS_SHOP');
                                this.props.navigation.navigate(
                                    'ShopOfTakenGoodsScreen'
                                );
                            }}
                        />

                        {/* 我的分享 */}
                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={I18n.t('mySharing')}
                            onArrowClick={() => {
                                UserActionSvc.track('MINE_SHARED_GOODS');
                                this.props.navigation.navigate(
                                    'MySharedGoodsScreen'
                                );
                            }}
                        />

                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={'我的收藏'}
                            onArrowClick={() => {
                                UserActionSvc.track('MINE_FAVOR_GOODS');
                                this.props.navigation.navigate(
                                    'GoodsListScreen'
                                );
                            }}
                        />
                        {/*优惠券*/}
                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={I18n.t('discountCoupon')}
                            onArrowClick={() => {
                                UserActionSvc.track('MINE_COUPONS');
                                this.props.navigation.navigate('MyCoupon');
                            }}
                        />

                        {/*领取优惠券中心*/}
                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={'领券中心'}
                            onArrowClick={() => {
                                UserActionSvc.track('MINE_GET_COUPON_CENTER');
                                this.props.navigation.navigate(
                                    'GetCouponCenter'
                                );
                            }}
                        />

                        {/*<ImageTextWithArrowView*/}
                        {/*itemStyle={styles.itemContainer}*/}
                        {/*text1Style={styles.itemText}*/}
                        {/*textName={I18n.t('shopAuth')}*/}
                        {/*onArrowClick={()=>{*/}
                        {/*}}*/}
                        {/*/>*/}
                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={I18n.t('medalIntroduce')}
                            onArrowClick={() => {
                                UserActionSvc.track('MINE_MEDAL');
                                this.props.navigation.navigate('MedalScreen');
                                // NativeModules.DLShareByUmengManager.shareUrlLinkByUmeng(
                                //     4,
                                //     'https://www.baidu.com',
                                //     '',
                                //     'ShareTitle',
                                //     'ShareDesc',
                                //     (ret, ext) => {
                                //         console.warn(ret);
                                //     }
                                // );
                            }}
                        />
                        <ImageTextWithArrowView
                            itemStyle={styles.itemContainer}
                            text1Style={styles.itemText}
                            textName={'扫一扫'}
                            onArrowClick={() => {
                                UserActionSvc.track('HOME_SCAN');
                                this.props.navigation.navigate('ScanScreen', {
                                    codeType: 'qrCode',
                                    didRecievedData: (data, callback) => {
                                        ShopSvc.processScanCode(data, callback);
                                    },
                                    finishAfterResult: true
                                });
                            }}
                        />
                    </View>
                </ScrollView>
                {/*新手引导*/}
                <Mask
                    type={'mine'}
                    len={1}
                    isShow={this.props.maskStore.mineMask}
                    isAction={this.props.maskStore.mineShowAction}
                />
            </View>
        );
    }

    renderRefreshControl = () => {
        return (
            <RefreshControl
                refreshing={this.state.isRefreshing}
                onRefresh={() => {
                    this.loadUserData(true);
                }}
                tintColor='#000000'
                title=''
                titleColor='#000000'
                colors={['#000000']}
                progressBackgroundColor='#ffffff'
            />
        );
    };

    renderUserAvatar = () => {
        if (
            this.props.userStore.rootStore.isLogin &&
            this.props.userStore.accountInfo.avatar
        ) {
            return (
                <Image
                    resizeMode={'cover'}
                    style={styles.userImage}
                    defaultSource={require('gsresource/img/userAvatarDefault.png')}
                    source={{
                        uri: this.props.userStore.accountInfo.avatar
                    }}
                />
            );
        } else {
            return (
                <Image
                    source={require('gsresource/img/userAvatarDefault.png')}
                />
            );
        }
    };

    renderBackgroundImg = () => {
        if (
            this.props.userStore.rootStore.isLogin &&
            this.props.userStore.accountInfo.avatarId
        ) {
            return (
                <View style={styles.backgroundImg}>
                    <Image
                        resizeMode={'cover'}
                        style={styles.backgroundImg}
                        source={{
                            uri: DocSvc.originDocURL(
                                this.props.userStore.accountInfo.avatarId
                            )
                        }}
                    />
                    <View
                        style={[
                            styles.backgroundImg,
                            { backgroundColor: '#00000033' }
                        ]}
                    />
                </View>
            );
        } else {
            return <View style={styles.backgroundColor} />;
        }
    };

    renderStatisticsLayout = () => {
        return (
            <View style={styles.statisticsLayout}>
                <View
                    style={{
                        flexDirection: 'row',
                        paddingLeft: 30,
                        alignItems: 'center',
                        marginTop: 10
                    }}
                >
                    <TopBottomText
                        title={'看款数量'}
                        num={this.store.statisticsData.viewSpuNum}
                        isLogin={this.props.userStore.rootStore.isLogin}
                    />
                    <TopBottomText
                        title={'拿货次数'}
                        num={this.store.statisticsData.totalPurTimes}
                        isLogin={this.props.userStore.rootStore.isLogin}
                    />
                    <TopBottomText
                        title={'拿货件数'}
                        num={this.store.statisticsData.totalPurNum}
                        isLogin={this.props.userStore.rootStore.isLogin}
                    />
                </View>
                <DividerLineH />
                <View
                    style={{
                        flexDirection: 'row',
                        paddingLeft: 30,
                        marginBottom: 10
                    }}
                >
                    <TopBottomText
                        title={'拿款金额'}
                        num={this.store.statisticsData.totalPurMoney}
                        isLogin={this.props.userStore.rootStore.isLogin}
                    />
                    <TopBottomText
                        title={'订单平均发货时间'}
                        num={this.store.statisticsData.avgDeliverElapsed}
                        handleNumShowFun={num => {
                            if (num === 0) {
                                return 0;
                            }
                            return (
                                moment
                                    .duration(num)
                                    .asHours()
                                    .toFixed(2) + ' 小时'
                            );
                        }}
                        isLogin={this.props.userStore.rootStore.isLogin}
                    />
                    <TopBottomText title={''} num={0} hidden={true} />
                </View>
            </View>
        );
    };

    renderOrderLayout = () => {
        return (
            <View style={styles.orderLayout}>
                <TouchableOpacity
                    onPress={() => {
                        UserActionSvc.track('MINE_ORDER');
                        this.props.navigation.navigate('OrderListScreen', {
                            id: 0
                        });
                    }}
                    style={styles.orderLayoutHeader}
                >
                    <Text
                        style={{
                            fontSize: fonts.font14,
                            color: colors.normalFont
                        }}
                    >
                        {I18n.t('myOrder')}
                    </Text>

                    <Text
                        style={{
                            fontSize: fonts.font12,
                            color: colors.greyFont
                        }}
                    >
                        {I18n.t('viewAll')}
                    </Text>
                </TouchableOpacity>
                <DividerLineH />
                <View style={styles.orderContainer}>
                    <View>
                        <ImageTextView
                            bgStyle={{ marginTop: 10 }}
                            text={I18n.t('toPay')}
                            requireIcon={require('gsresource/img/toPay.png')}
                            textStyle={styles.orderText}
                            onItemClick={() =>
                                this.props.navigation.navigate(
                                    'OrderListScreen',
                                    { id: 1 }
                                )
                            }
                        />
                        {this.renderOrderCount(this.store.billsCount.toPayNum)}
                    </View>
                    <View>
                        <ImageTextView
                            bgStyle={{ marginTop: 10 }}
                            text={I18n.t('toDeliver')}
                            requireIcon={require('gsresource/img/toDeliver.png')}
                            textStyle={styles.orderText}
                            onItemClick={() =>
                                this.props.navigation.navigate(
                                    'OrderListScreen',
                                    { id: 2 }
                                )
                            }
                        />
                        {this.renderOrderCount(
                            this.store.billsCount.toDelivelNum
                        )}
                    </View>
                    <View>
                        <ImageTextView
                            bgStyle={{ marginTop: 10 }}
                            text={I18n.t('toReceive')}
                            requireIcon={require('gsresource/img/toReceive.png')}
                            textStyle={styles.orderText}
                            onItemClick={() =>
                                this.props.navigation.navigate(
                                    'OrderListScreen',
                                    { id: 3 }
                                )
                            }
                        />
                        {this.renderOrderCount(
                            this.store.billsCount.toReceiveNum
                        )}
                    </View>
                    <View>
                        <ImageTextView
                            bgStyle={{ marginTop: 10 }}
                            text={I18n.t('returnOrrefund')}
                            requireIcon={require('gsresource/img/refund.png')}
                            textStyle={styles.orderText}
                            onItemClick={() =>
                                this.props.navigation.navigate(
                                    'AfterSaleScreen',
                                    { id: 5 }
                                )
                            }
                        />
                        {this.renderOrderCount(
                            this.store.billsCount.backingNum
                        )}
                    </View>
                </View>
            </View>
        );
    };

    /**
     * 订单红点提示
     */
    renderOrderCount = count => {
        if (typeof count === 'number' && count > 0) {
            return (
                <View
                    style={{
                        width: 14,
                        height: 14,
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        backgroundColor: colors.activeBtn,
                        borderRadius: 7,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text
                        style={{ fontSize: fonts.font8, color: colors.white }}
                    >
                        {count}
                    </Text>
                </View>
            );
        }
    };

    renderUserName = () => {
        return this.props.userStore.rootStore.isLogin ? (
            <Text style={styles.userNameText} numberOfLines={1}>
                {this.props.userStore.accountInfo.nickName}
            </Text>
        ) : (
            <Text style={styles.userNameText}>未登录</Text>
        );
    };

    loadUserData = isShowRefreshing => {
        if (isShowRefreshing) {
            this.setState({ isRefreshing: true });
        }

        this.props.userStore.queryAccountInfo((res, ext) => {
            setTimeout(() => {
                this.setState({ isRefreshing: false });
            }, 500);
        });
        this.loadStatisticsData();
        this.loadBillsCount();
    };

    loadStatisticsData = () => {
        this.store.fetchMyStatistics((ret, ext) => {});
    };

    loadBillsCount = () => {
        this.store.fetchBillsCount((ret, ext) => {});
    };

    /**
     * 跳转到账户资料界面， 如果未登录 则到登录界面
     */
    goToAccountInfo = () => {
        if (this.props.userStore.rootStore.isLogin) {
            this.props.navigation.navigate('AccountInfoScreen');
        } else {
            this.props.navigation.navigate('LoginWrapScreen');
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    backgroundColor: {
        position: 'absolute',
        zIndex: -1,
        height: 180,
        //backgroundColor: '#ff6699',
        backgroundColor: colors.greyFont,
        width: Dimensions.get('window').width,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
    },

    backgroundImg: {
        position: 'absolute',
        zIndex: -1,
        height: 180,
        width: Dimensions.get('window').width
    },

    topContainer: {
        paddingTop: 10,
        paddingLeft: 14,
        paddingRight: 14,
        paddingBottom: 40,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20
    },

    topOperationContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: isIphoneX() ? 44 : 20,
        marginBottom: 8
    },

    topOperation: {
        marginLeft: 20
    },

    userInfoContaiber: {
        flexDirection: 'row',
        paddingTop: 14,
        paddingBottom: 14,
        alignItems: 'center'
    },

    userImage: {
        width: 50,
        height: 50,
        borderWidth: Platform.OS === 'android' ? 0 : 1,
        borderColor: colors.white,
        borderRadius: Platform.OS === 'android' ? 100 : 25
    },

    userNameText: {
        fontSize: fonts.font18,
        color: colors.white,
        padding: 14,
        flex: 1
    },

    statisticsLayout: {
        height: WIDTH * 0.35,
        justifyContent: 'space-around',
        marginLeft: 8,
        marginRight: 8,
        marginTop: -40,
        borderRadius: 5,
        paddingLeft: 2,
        paddingRight: 2,
        backgroundColor: colors.white
    },

    orderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingBottom: 10
    },

    orderLayout: {
        flexDirection: 'column',
        paddingLeft: 14,
        paddingRight: 14,
        backgroundColor: colors.white,
        marginTop: 10
    },

    orderLayoutHeader: {
        height: 40,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    orderText: {
        fontSize: fonts.font12,
        color: colors.greyFont,
        marginTop: 10
    },

    itemContainer: {
        borderBottomWidth: 1,
        borderColor: colors.bg,
        alignItems: 'center'
    },

    itemText: {
        fontSize: fonts.font14,
        marginLeft: 10,
        color: colors.normalFont,
        borderColor: colors.bg
    }
});
