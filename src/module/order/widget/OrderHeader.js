/**
 *@author xbu
 *@date 2018/07/28
 *@desc 订单头部 （倒计时 和 订单状态）
 * 1. 待付款,2. 待发货, 3. 待收货, 4. 交易完成, 5. 交易已关闭, 6. 处理中
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Image,
    TouchableOpacity
} from 'react-native';
import fonts from '/gsresource/ui/fonts';
import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import Navigations from '/svc/NavigationSvc';
import CountDown from 'component/CountDown';

export default class OrderHeader extends Component {

    static propTypes = {
        shopId: PropTypes.number,
        name: PropTypes.string,
        statusName: PropTypes.string,
        countDownHiiden: PropTypes.bool,
        countDownTime: PropTypes.number,
        countDownHandler: PropTypes.func,
    };

    static defaultProps = {
        countDownHiiden: true,
        countDownTime: 0,
    }

    render() {
        return (
            <TouchableOpacity
                style={styles.orderTitleBox}
                onPress={()=>{
                    Navigations.navigate('ShopIndexScreen', {
                        tenantId: this.props.shopId,
                        tenantName: this.props.name
                    });
                }}
            >
                <View style={styles.common}>
                    <Image source={require('gsresource/img/orderHome.png')} style={{marginRight: 10}} />
                    <Text style={styles.orderTitle} numberOfLines={1}>{this.props.name}</Text>
                    <Image source={require('gsresource/img/arrowRight.png')} />
                </View>
                {this.props.countDownHiiden && <Text style={{color: colors.activeFont,fontSize: fonts.font14}}>{this.props.statusName}</Text>}
                {!this.props.countDownHiiden && (
                    <CountDown
                        numberStyle={{backgroundColor:colors.transparent}}
                        textStyle={{colors:colors.greyFont}}
                        digitTxtColor={colors.activeFont}
                        style={{height:30}}
                        until={this.props.countDownTime}
                        timeToShow={['H','M','S']}
                        onFinish={() => {
                            this.props.countDownHandler && this.props.countDownHandler();
                        }}
                        onPress={() => {}}
                        size={12}
                    />
                )}
            </TouchableOpacity>
        );
    }
}


const styles = StyleSheet.create({
    common: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    orderTitleBox: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        backgroundColor: colors.white,
        paddingLeft: 15,
        paddingRight: 15,
    },

    orderTitle: {
        fontSize: fonts.font14,
        color: colors.normalFont,
        paddingRight: 10,
        maxWidth: 200,
    },

});