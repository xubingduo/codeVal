/**
 * author: tuhui
 * Date: 2018/8/7
 * Time: 14:02
 * des:支付成功页面
 */

import React, {Component} from 'react';
import {
    Dimensions,
    StyleSheet,
    SafeAreaView, View,
    DeviceEventEmitter,
} from 'react-native';
import colors from '../../../gsresource/ui/colors';
import NavigationHeader from '../../../component/NavigationHeader';
import PayResultCell from './cell/PayResultCell';
import ImageTextWithArrowView from '../../../component/ImageTextWithArrowView';
import fonts from '../../../gsresource/ui/fonts';
import PropTypes from 'prop-types';

const WIDTH = Dimensions.get('window').width;
/**
 * status:支付状态true成功 false失败
 * payResult: {
                  orderId: resultObj.alipay_trade_app_pay_response.out_trade_no, //订单编号
                  money: resultObj.alipay_trade_app_pay_response.total_amount,   //支付金额
                  time: resultObj.alipay_trade_app_pay_response.timestamp,       //时间
                  payType: '支付宝'                                               //支付方式
             }
 * extra 额外信息 如:支付金额 订单编号 时间 当前订单状态 支付方式
 */
export default class BillingPayStatusScreen extends Component {

    static propTypes = {
        //订单编号
        orderId: PropTypes.number,
        //支付金额
        money: PropTypes.number,
        //时间
        time: PropTypes.string,
        //支付方式
        payType: PropTypes.string
    };

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'支付成功'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                    titleItemTextStyle={{color: colors.normalFont, fontSize: fonts.font18}}
                    itemTextStyle={{color: colors.normalFont}}
                />
            ),
        };
    };

    render() {
        let status = this.props.navigation.getParam('status');

        return (
            <SafeAreaView style={styles.container}>
                {
                    this.renderStatus()
                }
                {
                    status &&
                    this.renderBillInfo()
                }
            </SafeAreaView>
        );
    }

    renderStatus = () => {
        let status = this.props.navigation.getParam('status');
        let payResult = this.props.navigation.getParam('payResult');
        return (
            <PayResultCell
                status={status}
                amount={payResult.money}
            />
        );
    };

    renderBillInfo = () => {
        let payResult = this.props.navigation.getParam('payResult');

        return (
            <View style={{marginTop: 10}}>
                <ImageTextWithArrowView
                    onArrowClick={() => {
                    }}
                    textName={'交易订单'}
                    editMode={false}
                    textValue={payResult.orderId}
                    mustItem={false}
                    arrowShow={false}
                    arrowShowOnly={false}
                />

                <View style={{height: 1, backgroundColor: colors.bg}} />

                <ImageTextWithArrowView
                    onArrowClick={() => {
                    }}
                    textName={'交易时间'}
                    editMode={false}
                    textValue={payResult.time}
                    mustItem={false}
                    arrowShow={false}
                    arrowShowOnly={false}
                />

                <View style={{height: 1, backgroundColor: colors.bg}} />

                <ImageTextWithArrowView
                    onArrowClick={() => {
                    }}
                    textName={'当前状态'}
                    editMode={false}
                    textValue={'支付完成'}
                    mustItem={false}
                    arrowShow={false}
                    arrowShowOnly={false}
                />

                <View style={{height: 1, backgroundColor: colors.bg}} />

                <ImageTextWithArrowView
                    onArrowClick={() => {
                    }}
                    textName={'支付方式'}
                    editMode={false}
                    textValue={payResult.payType}
                    mustItem={false}
                    arrowShow={false}
                    arrowShowOnly={false}
                />

            </View>
        );
    };

    componentWillUnmount() {
        //刷新订单页面
        DeviceEventEmitter.emit('REFRESH_ORDER_LIST_DATA');
        DeviceEventEmitter.emit('REFRESH_ORDER_DETIALS_DATA');
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});