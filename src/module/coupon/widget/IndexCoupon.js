/**
 *@author xbu
 *@date 2018/10/16
 *@desc  新人优惠券的领取
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    ScrollView
} from 'react-native';

import { Popup } from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import PropTypes from 'prop-types';
import NewCouponItem,{CouponColorType, CouponType, ShowRightType} from './NewCouponItem';
import ScreenWidth from 'utl/ScreenWidth';
import Image from 'component/Image';

const WIDTH = Dimensions.get('window').width;
export default class PopCoupon extends Component {

    static propTypes = {
        // 优惠券数据
        allMoney: PropTypes.number,
        data: PropTypes.array,
        onDismiss: PropTypes.func,
    };

    static defaultProps = {
        onDismiss: ()=> null
    };

    /**
     * 显示侧滑菜单
     */
    show = () => {
        this.popup.show();
    };

    dismiss = () => {
        this.popup.dismiss();
    };

    /**
     * 确定
     */
    confirm = () => {
        this.popup.dismiss(() => {
            this.props.onDismiss && this.props.onDismiss();
        });
    };

    /**
     * 隐藏的时候的回调
     */
    onDismiss = () => {
        this.props.onDismiss && this.props.onDismiss();
    };

    /**
     * 渲染视图
     */

    // 优惠券
    renderCell =(item,key)=>{
        return(
            <NewCouponItem
                key={key}
                couponType={CouponType.newPeopleCoupon}
                showType={ShowRightType.showBtn}
                showTitleIcon={true}
                titleColor={colors.normalFont}
                onClickBtn={this.onclick}
                data={item}
            />
        );
    };


    render() {
        return (
            <Popup
                ref={popup => (this.popup = popup)}
                popupType={'4'}
                enableAnim={false}
                width={WIDTH}
                height={ScreenWidth.scaleSize(520*2)}
                contentBackgroundColor={colors.transparent}
                onDismiss={this.onDismiss}
            >
                <View style={styles.container}>
                    <View style={styles.NewBox}>
                        <TouchableOpacity style={{alignItems: 'flex-end'}} onPress={this.confirm}>
                            <Image source={require('gsresource/img/newCouponsClose.png')} />
                        </TouchableOpacity>
                        <Image
                            source={require('gsresource/img/newCoupons.png')}
                            style={styles.imgBg}
                        />
                        <View style={styles.indexCouponBox}>
                            <Text style={[styles.text,{fontSize:fonts.font32}]}>新人专属礼包</Text>
                            <Text style={[styles.text,{marginTop: 8}]}>{this.props.allMoney}元优惠礼包已发送到您账户</Text>
                            <View style={styles.box}>
                                <ScrollView>
                                    {
                                        this.props.data.map( (data,key) => {
                                            return this.renderCell(data,key);
                                        })
                                    }
                                </ScrollView>
                            </View>
                        </View>
                    </View>
                </View>

            </Popup>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    NewBox: {
        position: 'relative',
        height: ScreenWidth.scaleSize(520*2)
    },


    indexCouponBox: {
        position: 'absolute',
        top: 70,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',

    },

    imgBg: {
        width: ScreenWidth.scaleSize(347*2),
        height: ScreenWidth.scaleSize(461*2),
    },

    text: {
        fontSize: fonts.font18,
        color: colors.white,
    },

    box: {
        width: ScreenWidth.scaleSize(313*2),
        height: ScreenWidth.scaleSize(306*2),
        backgroundColor: colors.white,
        borderRadius: 8,
        marginTop: 20,
        alignItems:'center',
    }


});
