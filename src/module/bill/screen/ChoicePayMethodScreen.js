/**
 * author: tuhui
 * Date: 2018/8/7
 * Time: 13:57
 * des: 支付方式选择
 */

import React, { Component } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import colors from '../../../gsresource/ui/colors';
import NavigationHeader from '../../../component/NavigationHeader';
import ChoicePayMethodStore from '../store/ChoicePayMethodStore';
import PayMethodCell from './cell/PayMethodCell';
import fonts from '../../../gsresource/ui/fonts';
import DividerLineH from '../../../component/DividerLineH';
import StatusButton from '../../../component/StatusButton';
import RNAlipayModule from '@ecool/react-native-alipay';
import RNWeChatPayModule from '@ecool/react-native-wechatPay';
import moment from 'moment/moment';
import Alert from '../../../component/Alert';
import BillingPayStatusScreen from './BillingPayStatusScreen';
import { Toast } from '@ecool/react-native-ui';

/**
 * 需要参数
 * payMoney 总支付金额
 * orderIds 订单数组ids
 */
export default class ChoicePayMethodScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'选择支付方式'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                    titleItemTextStyle={{
                        color: colors.normalFont,
                        fontSize: fonts.font18
                    }}
                    itemTextStyle={{ color: colors.normalFont }}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.store = new ChoicePayMethodStore();
        this.state = {
            payType: 1
        };
        this.paying = false;
        // 为了保证轮询时只跳转一次支付成功界面
        this.canGoSuccessScreen = true;
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <PayMethodCell
                    name={'微信支付'}
                    icon={require('gsresource/img/weChatPay.png')}
                    describe={'微信安全支付'}
                    checked={this.state.payType === 1}
                    onItemClick={() => {
                        this.setState({
                            payType: 1
                        });
                    }}
                />
                <DividerLineH />
                <PayMethodCell
                    name={'支付宝'}
                    icon={require('gsresource/img/aliPay.png')}
                    describe={'支付宝安全支付'}
                    checked={this.state.payType === 0}
                    onItemClick={() => {
                        this.setState({
                            payType: 0
                        });
                    }}
                />

                <StatusButton
                    onItemClick={this.goPay}
                    style={{
                        height: 40,
                        marginLeft: 16,
                        marginRight: 16,
                        marginTop: 30
                    }}
                    checked={true}
                    text={'去支付'}
                />
            </SafeAreaView>
        );
    }

    goPay = async () => {
        if (this.paying) {
            Toast.show('正在支付,请稍候',2);
            return;
        }
        this.paying = true;

        const payMoney = this.props.navigation.getParam('payMoney');
        const orderIds = this.props.navigation.getParam('orderIds');
        try {
            let result = await this.store.createPay({
                hashKey: moment().valueOf(),
                payMoney: payMoney,
                orderIds: orderIds,
                /**
                 * 支付方式（1、支付宝，2 微信），不传默认支付宝
                 */
                payMethod: this.state.payType === 0 ? 1 : 2
            });

            const orderId = result.payBillId;

            this.payTimeout = setTimeout(() => {
                Toast._dismiss();
                this.paying = false;
            }, 5000);
            if (this.state.payType === 0) {
                RNAlipayModule.pay(
                    result.appParams,
                    'com.ecool.EcoolB2BBuyer',
                    (ret, extra) => {
                        Toast._dismiss();
                        this.paying = false;
                        if (ret) {
                            /**
                             * 支付成功
                             */
                            // this.navigatePaySuccessScreen(orderId, payMoney, '支付宝');
                        } else {
                            /**
                             * 支付失败
                             */
                            if (extra && extra.memo) {
                                Alert.alert('支付失败');
                            }
                        }
                    }
                );
            } else if (this.state.payType === 1) {
                RNWeChatPayModule.pay(result.weChatParams, (result, resp) => {
                    Toast._dismiss();
                    this.paying = false;
                    if (result) {
                        // this.navigatePaySuccessScreen(orderId, payMoney, '微信');
                    } else {
                        if (resp && resp.errStr) {
                            Alert.alert(resp.errStr);
                        }
                    }
                });
            }
            // 开始轮询查询支付状态
            if (!this.checkPayStatusTask && orderIds.length > 0) {
                this.checkPayStatusTask = setInterval(() => {
                    this.store.getPayStatus(orderIds[0], (ret, ext) => {
                        if (ret) {
                            if (this.checkPayStatusTask) {
                                clearInterval(this.checkPayStatusTask);
                            }
                            // 查询到支付状态为成功，跳转到支付成功界面
                            this.navigatePaySuccessScreen(
                                orderId,
                                payMoney,
                                this.state.payType === 0 ? '支付宝' : '微信'
                            );
                        }
                    });
                }, 1000);
            }
        } catch (e) {
            Toast._dismiss();
            this.paying = false;
            Alert.alert(e.message);
        }
    };

    navigatePaySuccessScreen = (orderId, payMoney, payTypeText) => {
        if (this.canGoSuccessScreen) {
            // 不能重复跳转到支付成功页面
            this.canGoSuccessScreen = false;
            this.props.navigation.replace('BillingPayStatusScreen', {
                status: true,
                payResult: {
                    orderId: orderId,
                    money: payMoney,
                    time: moment().format('YYYY-MM-DD HH:mm:ss'),
                    payType: payTypeText
                }
            });
        }
    };

    componentWillUnmount() {
        if (this.payTimeout) {
            clearTimeout(this.payTimeout);
        }
        if (this.checkPayStatusTask) {
            clearInterval(this.checkPayStatusTask);
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});
