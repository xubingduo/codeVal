/**
 *@author xbu
 *@date 2018/10/16
 *@desc 优惠券详情
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    DeviceEventEmitter
} from 'react-native';

import I18n from 'gsresource/string/i18n';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import ColorOnlyNavigationHeader from 'component/ColorOnlyNavigationHeader';
import SliderShare from '../widget/SliderShare';
import ShareSvc from 'svc/ShareSvc';
import {Toast} from '@ecool/react-native-ui';
import Alert from 'component/Alert';
import CouponStore from '../store/CouponStore';
import {observer, inject} from 'mobx-react';
import {StackActions, NavigationActions} from 'react-navigation';
import moment from 'moment';
import DLFetch from '@ecool/react-native-dlfetch';
import {ShowRightType} from '../widget/CouponItem';

const screenW = Dimensions.get('window').width;
const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({routeName: 'MainContainerScreen'})],
});

@inject('userStore')
@observer
export default class CouponDetails extends Component {
    static navigationOptions = () => {
        return {
            header: (
                <ColorOnlyNavigationHeader
                    backgroundColor={colors.white}
                    statusBarStyle={'dark-content'}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.store = new CouponStore();
        this.state = {
            btnColor: true,
            from: 1,
            startDate: '',
            endDate: '',
        };
    }

    // 头部导航
    renderHeader = (data) => {
        return (
            <View style={{backgroundColor: colors.white, flexDirection: 'row', height: 44, alignItems: 'center'}}>
                <TouchableOpacity
                    style={{marginLeft: 12}}
                    hitSlop={{left: 20, right: 40, top: 20, bottom: 20}}
                    onPress={this.onClickHeaderBack}
                >
                    <Image source={require('gsresource/img/arrowLeftGrey.png')} />
                </TouchableOpacity>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{
                        fontSize: fonts.font18,
                        color: colors.normalFont
                    }}
                    >{this.couponTypeName(data.cardType)}</Text>
                </View>
                {
                    data.shareBits && this.isShowShare(data.expiresDate) ? (
                        <TouchableOpacity
                            style={{alignItems: 'center', justifyContent: 'center', marginRight: 12}}
                            hitSlop={{left: 16, right: 16, top: 16, bottom: 16}}
                            onPress={this.share}
                        >
                            <Text style={{color: data.color, fontSize: fonts.font12}}>分享</Text>
                        </TouchableOpacity>
                    ) : null
                }

            </View>
        );
    };

    // 优惠券类型
    couponTypeName = (type) => {
        let names = null;
        switch (type) {
        case 1:
            names = '优惠券';
            break;
        case 2:
            names = '礼品券';
            break;
        case 3:
            names = '运费券';
            break;
        }
        return names;
    };

    // 翻译显示礼品
    getGifeGoods = (val) => {
        let goods = '';
        if (val) {
            let execOther = typeof (val) === 'string' ? JSON.parse(val) : val;
            execOther.forEach(data => {
                goods += data.caption + ' ';
            });
        }
        return goods;
    };

    renderNav = (data) => {
        return (
            <TouchableOpacity
                onPress={this.onDetailClick}
                style={[styles.couponBg, {backgroundColor: data.color}]}
            >
                <View style={{marginLeft: 26}}>
                    <Text style={styles.title}>{this.couponTypeName(data.cardType)}</Text>
                    <View style={{width: screenW <= 320 ? 100 : 170, overflow: 'hidden'}}>
                        <Image source={require('gsresource/img/couponsDetailsLine.png')} />
                    </View>
                    {
                        data.cardType === 2 ? (
                            <Text style={{
                                fontSize: fonts.font32,
                                color: colors.white,
                                marginTop: 10,
                                width: screenW <= 320 ? 100 : 170
                            }} numberOfLines={1}
                            >{this.getGifeGoods(data.execOther)}</Text>
                        ) : (
                            <View style={{
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                marginTop: 10,
                                width: screenW <= 320 ? 100 : 170
                            }}
                            >
                                <Text style={{fontSize: fonts.font32, color: colors.white}}
                                    numberOfLines={1}
                                >¥{data.execNum}</Text>
                                <Text style={{fontSize: fonts.font12, color: colors.white, marginBottom: 6}}>元</Text>
                            </View>
                        )
                    }

                    <Text style={{
                        fontSize: fonts.font11,
                        color: colors.white,
                        marginTop: 5
                    }}
                    >订单满{data.fulfilValue}可用</Text>
                    <Text style={{
                        fontSize: fonts.font9,
                        color: colors.white,
                        marginTop: 5
                    }}
                    >有效期：{this.state.startDate} 到 {this.state.endDate}</Text>
                </View>

                <View style={{alignItems: 'center', justifyContent: 'center', marginRight: 20}}>
                    <Image source={require('gsresource/img/couponsDetailsHome.png')} />
                </View>
            </TouchableOpacity>
        );
    };

    // 翻译优惠券使用范围
    getUseRange = (arr) => {
        if (arr === undefined) {
            return;
        }
        let dimsArray = typeof (arr) === 'string' ? JSON.parse(arr) : arr;
        let dimShop = '';
        let dimSpu = '';
        let dimName = '';
        if (dimsArray.length) {
            dimsArray.forEach(data => {
                switch (data.dimLevel) {
                case 'level_shop':
                    dimShop = data.dimValueCaption;
                    break;
                case 'level_cat':
                    dimSpu = data.dimValueCaption;
                    break;
                case 'level_spu':
                    dimName = data.dimValueCaption;
                    break;
                }
            });
        } else {
            return '全场通用';
        }
        return dimShop + dimSpu + dimName;
    };

    renderFooter = (data) => {
        return (
            <View style={styles.footerBox}>
                <Text style={styles.footerColor}>使用说明</Text>
                <Text style={styles.footerColor}>1.使用范围：{this.getUseRange(data.dims)}</Text>
                <Text style={styles.footerColor}>2.使用条件：订单须满{data.fulfilValue}元可用</Text>
                <Text style={styles.footerColor}>3.使用时间：{this.state.startDate} 到 {this.state.endDate}</Text>
            </View>
        );
    };

    renderFooterNav = (data) => {
        if ((data.shareBits === 0 || !data.shareNotice) || !(this.isShowShare(data.expiresDate))) {
            return null;
        }
        return (
            <View style={styles.footerBox}>
                <Text style={styles.footerColor}>分享券说明</Text>
                <Text style={styles.footerColor}>{data.shareNotice}</Text>
            </View>
        );
    };

    renderBtn = (data) => {
        let shopId = '';
        if (this.state.from != 1) {
            const {params} = this.props.navigation.state;
            let dims = typeof (data.dims) === 'string' ? JSON.parse(data.dims) : data.dims;
            let showBtn = false;
            if (dims && dims.length) {
                dims.forEach(val => {
                    if (val.dimName === 'dimShop') {
                        showBtn = true;
                        shopId = val.dimValue;
                    }
                });
                if (!showBtn) {
                    return null;
                }

                if (data.flag !== 1) {
                    return null;
                }
                if (params.canShow) {
                    return null;
                }

            } else {
                return null;
            }
        }

        return (
            <TouchableOpacity
                style={[styles.btn, {backgroundColor: this.state.btnColor ? data.color : colors.greyFont}]}
                onPress={() => this.btn(shopId)}
            >
                <Text style={{
                    color: colors.white,
                    fontSize: fonts.font14
                }}
                >{this.state.from === 1 ? '立即领取' : '立即使用'}</Text>
            </TouchableOpacity>
        );
    };

    render() {
        let obj = this.store.couponDetailsObj;
        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeader(obj)}
                {this.renderNav(obj)}
                {this.renderFooter(obj)}
                {this.renderFooterNav(obj)}
                <View style={{flex: 1}} />
                {this.renderBtn(obj)}

                {/*分享*/}
                <SliderShare
                    ref={(ref) => {
                        this.sharePop = ref;
                    }}
                    chooseItemCallback={this.shareItemCallback}
                />
            </SafeAreaView>
        );
    }

    componentDidMount() {
        const {params} = this.props.navigation.state;
        this.setState({
            from: params.from,
            startDate: params.startDate,
            endDate: params.endDate,
        });
        this.loadData({
            jsonParam: {
                couponId: params.couponId
            }
        });
    }

    // 点击头部返回
    onClickHeaderBack = () => {
        this.props.navigation.goBack();
    };

    // 查看优惠券详情
    loadData = async (obj) => {
        try {
            Toast.loading();
            await this.store.lookCouponDetails(obj);
        } catch (e) {
            Alert.alert(e.message);
        }
        Toast.dismiss();
    };

    // 分享显示
    share = () => {
        this.sharePop.show();
    };

    // 优惠券分享请求接口
    shareItemCallback = (val, key) => {
        let data = this.store.couponDetailsObj;
        let obj = {
            jsonParam: {
                hashKey: (new Date().getTime()).toString(),
                couponsShareItemSaveDtos: {
                    cardCouponId: data.id,
                    cardType: data.cardType,
                    title: data.title,
                    subTitle: data.subTitle,
                    logoId: data.logoId,
                    color: data.color,
                    description: data.description,
                    notice: data.notice,
                    shareBits: data.shareBits,
                    couponUnitId: data.unitId,
                    couponShopId: data.shopId,
                }
            }
        };
        try {
            Toast.loading();
            this.store.shareCoupon(obj).then(data => {
                Toast.dismiss();
                this.shareCouponCard(data.val, val);
            }).catch(e => {
                Toast.dismiss();
                Alert.alert(e.message);
            });
        } catch (e) {
            Toast.dismiss();
            Alert.alert(e.message);
        }

    };

    // 分享优惠券功能
    shareCouponCard = (data, val) => {
        let user = this.props.userStore.user;
        let shareExposeId = data;
        let shareUnitId = user.unitId;
        let shareTenantId = user.tenantId;
        let couponIds = '';
        let _cid = user.clusterCode;
        let objUrl = '';
        let url = DLFetch.getBaseUrl();
        // if(url === 'https://spdev.hzecool.com'){ // 测试环境
        //     objUrl = 'goodShopShareTest';
        // } else if(url === 'https://spchk.hzecool.com'){ //审核环境
        //     objUrl = 'goodShopShareCheck';
        // } else if(url === 'http://192.168.0.34'){
        //     objUrl = 'goodShopShareTruck';
        // }else{ // 正式环境
        //     objUrl = 'goodShopShare';
        // }
        //
        // let obj = {
        //     type: val.key,
        //     shareUrlLink: 'https://webdoc.hzecool.com/'+objUrl+'/dist/index.html#/discounts?shareExposeId='+shareExposeId +'&shareUnitId='+shareUnitId+'&shareTenantId='+shareTenantId+'&couponIds='+couponIds+'&_cid='+_cid,
        //     shareThumbUrl: 'https://webdoc.hzecool.com/goodShopShare/dist/static/img/goodShop.jpg',
        //     shareTitle: '免费领商陆好店拿货优惠券，数量有限，抢完即止',
        //     shareDesc: '全新的服装拿货渠道，全国零售老板都在用'
        // };

        if (url === 'https://spdev.hzecool.com') { // 测试环境
            objUrl = 'test';
        } else if (url === 'https://spchk.hzecool.com') { //审核环境
            objUrl = 'check';
        } else if (url === 'http://192.168.0.34') {
            objUrl = 'test';
        } else { // 正式环境
            objUrl = 'dist';
        }

        let obj = {
            type: val.key,
            shareUrlLink: 'https://webdoc.hzecool.com/goodShopShare/' + objUrl + '/index.html#/discounts?shareExposeId=' + shareExposeId + '&shareUnitId=' + shareUnitId + '&shareTenantId=' + shareTenantId + '&couponIds=' + couponIds + '&_cid=' + _cid,
            shareThumbUrl: 'https://webdoc.hzecool.com/goodShopShare/' + objUrl + '/static/img/goodShop.jpg',
            shareTitle: '免费领商陆好店拿货优惠券，数量有限，抢完即止',
            shareDesc: '全新的服装拿货渠道，全国零售老板都在用'
        };

        ShareSvc.shareUrlLink(obj, (isTrue, text) => {
            if (isTrue === false) {
                Toast.show(text, 2);
            }
        });
    };

    // 底部按钮
    btn = (id) => {
        let status = this.state.from;
        let data = this.store.couponDetailsObj;
        if (status === 1) { // 立即领券
            let obj = {
                jsonParam: {
                    coupons: [{
                        couponId: data.id,
                        couponUnitId: data.unitId,
                        hashKey: (new Date().getTime()).toString(),
                        receiveChannelType: 1,
                        receiveFrom: -10,
                    }]
                }
            };
            this.getMyCoupon(obj, data.id);
        } else {
            this.props.navigation.navigate('ShopIndexScreen', {
                tenantId: id,
                tenantName: ''
            });
        }
    };

    onDetailClick = () => {
        try {
            let shopId = '';
            let data = this.store.couponDetailsObj;
            let dims = typeof (data.dims) === 'string' ? JSON.parse(data.dims) : data.dims;
            if (dims && dims.length) {
                dims.forEach(val => {
                    if (val.dimName === 'dimShop') {
                        shopId = val.dimValue;
                    }
                });
                if (shopId) {
                    this.props.navigation.navigate('ShopIndexScreen', {
                        tenantId: shopId,
                        tenantName: ''
                    });
                }
            }
        } catch (e) {
            dlconsole.log('onDetailClick ' + e.message);
        }
    };

    // 获取优惠券
    getMyCoupon = async (obj, couponId) => {
        try {
            if (this.state.btnColor === false) {
                return;
            }

            Toast.loading();
            await this.store.getCoupon(obj).then(val => {
                let {data} = val;
                if (data && data.rows.length <= 0) {
                    return;
                }
                let code = data.rows[0].resultCode;
                let msg = data.rows[0].resultMsg;
                let lastTick = data.rows[0].residueNum;


                if (code === -1 || code === -3 || code === -4) { // 失效
                    Toast.dismiss();
                    Toast.show(msg, 2);
                    this.setState({btnColor: false});
                } else if (code === -2) { // 领完
                    Toast.dismiss();
                    Toast.show(msg, 2);
                    this.store.handlerChangeStore(couponId, 2);
                    this.setState({btnColor: false});
                } else {
                    Toast.show('领券成功', 2);
                    let status = 1;
                    // if(lastTick === 0){
                    //     status = 2;
                    // }
                    DeviceEventEmitter.emit('REFRSH_CONPON', {id: couponId, status: status});
                }
            });
        } catch (e) {
            Alert.alert(e.message);
        }
        Toast.dismiss();
    };

    isShowShare = (date) => {
        // if(date){
        //     let timeStr = moment(date).format('X')*1000;
        //     let timestamp= (new Date()).getTime();
        //     if(timestamp <= timeStr){
        //         return true;
        //     } else{
        //         return false;
        //     }
        // }
        return true;
    };

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    couponBg: {
        height: 173,
        margin: 12,
        borderRadius: 8,
        backgroundColor: '#ff6699',
        flexDirection: 'row',
        justifyContent: 'space-between'

    },

    title: {
        color: colors.white,
        fontSize: fonts.font18,
        marginTop: 20,
        marginBottom: 14,
    },

    footerBox: {
        marginLeft: 12,
        marginRight: 12,
        marginBottom: 12,
        backgroundColor: colors.white,
        borderRadius: 4,
        paddingTop: 10,
        paddingBottom: 14,
        paddingLeft: 20,
        paddingRight: 20,
    },

    footerColor: {
        color: colors.greyFont,
        fontSize: fonts.font11,
        paddingTop: 3,
    },

    btn: {
        height: 44,
        backgroundColor: '#ff6699',
        alignItems: 'center',
        justifyContent: 'center'
    }


});