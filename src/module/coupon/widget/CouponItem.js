/**
 *@author xbu
 *@date 2018/10/12
 *@desc 优惠券通用配置
 */


import React, {PureComponent} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions
} from 'react-native';
import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';
import PropTypes from 'prop-types';

const screenW = Dimensions.get('window').width;

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


export default class CouponItem extends PureComponent {

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
        // 按钮点击事件
        onClickBtn: PropTypes.func,
        // 点击查看详情
        onClickLookDetails: PropTypes.func,
        // 数据
        data: PropTypes.object,
        //不可用优惠券原因
        unAvlReason: PropTypes.string,
        //选择模式
        isChecked: PropTypes.bool
    };

    /**
     * data : {
     *  color: '',         // 优惠券颜色
     *  userGetFlag:  '',  // 是否领取 （可以有可无，领券中心需要）
     *  execNum: '',       // 优惠券面额
     *  fulfilValue: '',   // 优惠券满额
     *  shopName:'',          // 标题
     *  endDateStr: '',       // 过期时间
     *  dims: []           // 使用范围
     *  cardType:          // 优惠券类型
     *  execOther: []      // 兑换的物品
     *   }
     *
     */


    // 默认属性
    static defaultProps = {
        couponType: CouponType.myCoupon,
        showType: ShowRightType.showNo,
        titleColor: colors.greyFont,
        showTitleIcon: false,
        isCheckMode: false,
        onClickBtn: () => null,
        onClickLookDetails: () => null,
    };

    // 按钮
    showBtn = () => {
        // 优惠券颜色
        let mainColor = this.props.color ? this.props.color : this.props.data.color;
        return (
            <TouchableOpacity
                style={[styles.fixedBtn, {borderColor: mainColor}]}
                onPress={this.clickShowBtn}
            >
                <Text
                    style={[styles.btn, {color: mainColor}]}
                >{this.props.couponType === CouponType.myCoupon ? '立即使用' : '立即领取'}</Text>
            </TouchableOpacity>
        );
    };

    // 禁止按钮
    showForbidBtn = (text) => {
        // 优惠券颜色
        return (
            <View
                style={[styles.fixedBtn, {backgroundColor: colors.border1, borderColor: colors.border1}]}
            >
                <Text style={[styles.btn, {color: colors.white}]}>{text}</Text>
            </View>
        );
    };

    // 显示图片
    showImg = () => {
        let img = this.props.couponType === CouponType.couponCenter ? require('gsresource/img/hasGetCoupons.png') : require('gsresource/img/hasUseCoupons.png');
        return (
            <View style={styles.imgBox}>
                <Image source={img} />
            </View>
        );
    };


    // 我的优惠券
    myCoupon = () => {
        let elment = null;
        switch (this.props.showType) {
        // 未使用
        case ShowRightType.showBtn:
            elment = this.showBtn();
            break;
            //已使用
        case ShowRightType.showImg:
            elment = this.showImg();
            break;
            // 已过期
        default:
            break;
        }
        return elment;
    };

    // 优惠券中心
    couponCenter = () => {
        let elment = null;
        if (this.props.data.userGetFlag !== undefined) {
            if (this.props.data.userGetFlag === 1) {
                elment = this.showImg();
            } else if (this.props.data.userGetFlag === 2) {
                elment = this.showForbidBtn('已领完');
            } else {
                elment = this.showBtn();
            }
        }

        return elment;
    };

    // 领取门店优惠券
    couponStore = () => {
        let elment = null;
        if (this.props.data.userGetFlag !== undefined) {
            if (this.props.data.userGetFlag === 1) {
                elment = this.showForbidBtn('已领取');
            } else if (this.props.data.userGetFlag === 2) {
                elment = this.showForbidBtn('已领完');
            } else {
                elment = this.showBtn();
            }
        }

        return elment;
    };

    // 最终显示主色调按钮的样式
    showChangeItems = () => {
        let elment = null;
        switch (this.props.couponType) {
        // 我的优惠券
        case CouponType.myCoupon:
            elment = this.myCoupon();
            break;
            // 领券中心
        case CouponType.couponCenter:
            elment = this.couponCenter();
            break;
            // 门店优惠券
        case CouponType.storeCoupon:
            elment = this.couponStore();
            break;
            // 新人券
        default:
            break;
        }

        return elment;
    };


    onCouponClick = () => {
        const {data, onClickLookDetails} = this.props;
        onClickLookDetails && onClickLookDetails(data);
    };

    render() {
        // 优惠券颜色
        let mainColor = this.props.color ? this.props.color : this.props.data.color;
        let {unAvlReason, isChecked} = this.props;
        // let dis = this.props.data.dims && this.props.data.dims.length ? '适用' : '' + this.getUseRange();
        return (
            <TouchableOpacity
                style={styles.couponBox}
                onPress={this.onCouponClick}
            >

                <View style={styles.couponLeft}>
                    {
                        this.props.data.cardType === 2 ? (
                            <Text style={[styles.couponNumber, {color: mainColor, fontSize: fonts.font20}]}
                                numberOfLines={1}
                            >{this.getGifeGoods()}</Text>
                        ) : (
                            <View
                                style={{flexDirection: 'row', alignItems: 'flex-end', marginLeft: 10, marginRight: 10}}
                            >
                                <Text style={[styles.couponIcon, {
                                    marginBottom: this.changeFontIcon(),
                                    color: mainColor
                                }]}
                                >¥</Text>
                                <Text style={{fontSize: this.changeFontSize(), color: mainColor}}
                                    numberOfLines={1}
                                >{this.props.data.execNum}</Text>
                            </View>
                        )
                    }
                    {
                        this.props.data.cardType === 2 ? (
                            <Text style={[styles.couponDesc, {color: mainColor, marginLeft: 20, marginRight: 20}]}
                                numberOfLines={1}
                            > 可兑换</Text>
                        ) : (
                            <Text style={[styles.couponDesc, {color: mainColor}]}
                                numberOfLines={1}
                            >满{this.props.data.fulfilValue}可用</Text>
                        )
                    }

                </View>
                <Image source={require('gsresource/img/couponsBg.png')} />
                <View style={styles.couponRight}>
                    <View style={{flexDirection: 'row'}}>
                        {
                            this.props.showTitleIcon ? (
                                <View style={[styles.couponNames, {backgroundColor: mainColor}]}>
                                    <Text style={styles.names}>{this.couponTypeName()}</Text>
                                </View>
                            ) : null
                        }
                        <Text
                            style={[styles.couponTitle, {color: this.props.titleColor}]}
                            numberOfLines={1}
                        >{this.props.data.shopName}</Text>
                    </View>

                    {
                        <Text
                            style={[styles.couponNormalText, {width: 100}]}
                            numberOfLines={1}
                        >
                            {this.getUseRange()}
                        </Text>
                    }

                    <Text
                        style={styles.couponNormalText}
                        numberOfLines={1}
                    >{`${this.props.data.beginDateStr} 到 ${this.props.data.endDateStr}`}</Text>
                </View>
                {this.showChangeItems()}

                {
                    isChecked &&
                    <Image
                        style={{position: 'absolute', right: 0, top: 0}}
                        source={require('gsresource/img/checked.png')}
                    />
                }
            </TouchableOpacity>
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
    getUseRange() {
        let dimsArray = this.props.data.dims;

        let dimShop = '';
        let dimSpu = '';
        let dimName = '';
        if (dimsArray) {
            if (dimsArray.length) {

                for (let i = 0; i < dimsArray.length; i++) {
                    let item = dimsArray[i];
                    switch (item.dimLevel) {
                    case 'level_shop':
                        dimShop = item.dimValueCaption;
                        break;
                    case 'level_cat':
                        dimSpu = item.dimValueCaption;
                        break;
                    case 'level_spu':
                        dimName = item.dimValueCaption;
                        break;
                    }
                }
            } else {
                return '全场通用';
            }
        }
        // let str = dimShop + dimSpu + dimName;
        // return str.length > 8 ? '适用'+ str.substr(0, 8) + '...' : '适用'+str;
        return '适用' + dimShop + dimSpu + dimName;
    }

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

    //按钮事件
    clickShowBtn = () => {
        this.props.onClickBtn && this.props.onClickBtn(this.props.data);
    };

    // 字体大小调整
    changeFontSize = () => {
        let fontSize = this.props.data.execNum.toString();
        let nub = fontSize.length;
        switch (nub) {
        case 5:
            return 28;
        case 6:
            return 18;
        case 7:
            return 18;
        default:
            return 32;
        }
    };

    // 高度
    changeFontIcon = () => {
        let fontSize = this.props.data.execNum.toString();
        let nub = fontSize.length;
        switch (nub) {
        case 5:
            return 6;
        case 6:
            return 0;
        case 7:
            return 0;
        default:
            return 6;
        }
    };


}


const styles = StyleSheet.create({
    couponBox: {
        marginTop: 10,
        marginLeft: 17,
        marginRight: 17,
        flexDirection: 'row'
    },

    couponLeft: {
        width: 100,
        height: 95,
        backgroundColor: colors.white,
        borderBottomLeftRadius: 8,
        borderTopLeftRadius: 8,
        alignItems: 'center',
        justifyContent: 'center'
    },

    couponRight: {
        flex: 1,
        backgroundColor: colors.white,
        borderBottomRightRadius: 8,
        borderTopRightRadius: 8,
        justifyContent: 'center',
        paddingLeft: screenW <= 320 ? 0 : 20
    },

    couponIcon: {
        fontSize: fonts.font14,
        marginRight: 4,
    },


    couponDesc: {
        fontSize: fonts.font12
    },

    couponTitle: {
        fontSize: fonts.font14
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
        fontSize: fonts.font12,
        color: colors.greyFont,
        marginTop: 10,
    },

    fixedBtn: {
        position: 'absolute',
        top: 40,
        right: screenW <= 320 ? 0 : 10,
        height: 20,
        width: 70,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        zIndex: 5,
    },

    btn: {
        fontSize: fonts.font12,
    },

    imgBox: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 5,
    }


});