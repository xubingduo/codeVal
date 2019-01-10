/**
 *@author xbu
 *@date 2018/10/12
 *@desc 优惠券通用配置
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
} from 'react-native';
import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';
import PropTypes from 'prop-types';
import ScreenWidth from 'utl/ScreenWidth';
import Image from 'component/Image';
//  优惠券类型
export const CouponType = {
    // 新人券
    newPeopleCoupon: 'newPeopleCoupon',
    // 门店优惠券
    storeCoupon: 'storeCoupon',
    // 我的优惠券:
    myCoupon: 'myCoupon',
    // 领券中心
    couponCenter: 'center'
};

//  优惠券颜色
export const CouponColorType = {
    // 优惠券
    coupon: 1,
    // 礼品券
    gift: 2,
    // 运费券
    freight: 3,
    // 默认
    default: 4
};

// 展示优惠券右边按钮的那些
export const ShowRightType = {
    showBtn: 'btn',
    showImg: 'img',
    showNo: 'default',
    forbidBtn: 'forbidBtn'
};


export default class CouponItem extends Component {

    static propTypes = {
        // 优惠券类型(大类，如新人券 ，门店优惠券, 个人优惠券等,默认优惠券);
        couponType: PropTypes.string,
        // 优惠券主色调(默认显示优惠券色调)
        color: PropTypes.string,
        // 展示类型(如显示右边 按钮,图片,什么都不显示，默认什么都不显示)
        showType: PropTypes.string,
        // 展示是否显示title icon (默认不显示)
        showTitleIcon: PropTypes.bool,
        // title颜色
        titleColor: PropTypes.string,
        // 优惠券
        data: PropTypes.object,
    };

    // 默认属性
    static defaultProps = {
        couponType: CouponType.myCoupon,
        showType: ShowRightType.showNo,
        titleColor: colors.greyFont,
        showTitleIcon: false,
    };


    render() {
        // 优惠券颜色
        let mainColor = this.props.color ? this.props.color : this.props.data.color;
        return (
            <View style={{position: 'relative', alignItems: 'center', marginTop: 17}}>
                <Image
                    source={require('gsresource/img/newCouponBox.png')}
                    style={styles.imgBg}
                />
                <View style={styles.couponBox}>
                    <View style={styles.couponLeft}>
                        {
                            this.props.data.cardType === 2 ? (
                                <Text style={[styles.couponIcon, {color: mainColor, marginLeft: 20, marginRight: 5}]}
                                    numberOfLines={1}
                                >{this.getGifeGoods()}</Text>
                            ) : (
                                <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
                                    <Text style={[styles.couponIcon, {
                                        marginBottom: this.changeFontIcon(),
                                        color: mainColor
                                    }]}
                                    >¥</Text>
                                    <Text style={{fontSize: this.changeFontSize(), color: mainColor}}
                                        numberOfLines={1}
                                    >
                                        {this.props.data.execNum}
                                    </Text>
                                </View>
                            )
                        }
                        {
                            this.props.data.cardType === 2 ? (
                                <Text style={[styles.couponDesc, {color: mainColor}]} numberOfLines={1}> 可兑换</Text>
                            ) : (
                                <Text style={[styles.couponDesc, {color: mainColor}]}
                                    numberOfLines={1}
                                >满{this.props.data.fulfilValue}可用</Text>
                            )
                        }
                    </View>
                    <View style={styles.couponRight}>
                        <View style={{flexDirection: 'row'}}>
                            {
                                this.props.showTitleIcon ? (
                                    <View style={[styles.couponNames, {backgroundColor: mainColor}]}>
                                        <Text style={styles.names}>{this.couponTypeName()}</Text>
                                    </View>
                                ) : null
                            }
                            <Text style={[styles.couponTitle, {color: this.props.titleColor}]}
                                numberOfLines={1}
                            >{this.props.data.shopName}</Text>
                        </View>
                        <Text style={styles.couponNormalText}
                            numberOfLines={1}
                        >{`${this.props.data.effectiveDateStr} 到 ${this.props.data.expiresDateStr}`}</Text>
                        <Text style={styles.couponNormalText}
                            numberOfLines={1}
                        >{this.props.data.dims && this.props.data.dims.length ? '适用' : ''}{this.getUseRange()}</Text>
                    </View>
                </View>
            </View>

        );
    }

    // 判断优惠券类型
    couponTypeName = () => {
        let type = this.props.data.cardType;
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

    // 翻译优惠券使用范围
    getUseRange = () => {
        let dimsArray = this.props.data.dims;
        let dimShop = '';
        let dimSpu = '';
        let dimName = '';
        if (dimsArray) {
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
        }
        let str = dimShop + dimSpu + dimName;
        return str.length > 8 ? '适用'+ str.substr(0, 8) + '...' : '适用'+str;
    };


    // 翻译显示礼品
    getGifeGoods = () => {
        let dimsArray = this.props.data.execOther;
        let goods = '';
        if (dimsArray) {
            dimsArray.forEach(data => {
                goods += data.caption + ' ';
            });
        }
        return goods;
    };

    // 字体大小调整
    changeFontSize = () => {
        let fontSize = this.props.data.execNum.toString();
        let nub = fontSize.length;
        switch (nub) {
        case 5:
            return 20;
        case 6:
            return 12;
        default:
            return 24;
        }
    };

    // 高度
    changeFontIcon = () => {
        let fontSize = this.props.data.execNum.toString();
        let nub = fontSize.length;
        switch (nub) {
        case 5:
            return 4;
        case 6:
            return 0;
        default:
            return 6;
        }
    };


}


const styles = StyleSheet.create({
    couponBox: {
        flexDirection: 'row',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: ScreenWidth.scaleSize(290 * 2),
    },

    couponLeft: {
        width: ScreenWidth.scaleSize(200),
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    couponRight: {
        flex: 1,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
        justifyContent: 'center',
        paddingLeft: 12
    },

    couponIcon: {
        fontSize: fonts.font14,
        marginRight: 4,
    },

    couponDesc: {
        fontSize: fonts.font10
    },

    couponTitle: {
        fontSize: fonts.font11
    },

    couponNames: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 5,
        borderRadius: 8,
    },

    names: {
        fontSize: 10,
        color: colors.white,
        marginRight: 5,
        marginLeft: 5,
    },

    couponNormalText: {
        fontSize: fonts.font10,
        color: colors.greyFont,
        marginTop: 6,
    },

    imgBg: {
        width: ScreenWidth.scaleSize(290 * 2),
        height: ScreenWidth.scaleSize(81 * 2),
    }


});