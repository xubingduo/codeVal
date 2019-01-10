/**
 * author: tuhui
 * Date: 2018/8/7
 * Time: 14:41
 * des:支付成功失败展示cell
 */

import React, {Component} from 'react';
import {
    StyleSheet, Text,
    View,
    Dimensions
} from 'react-native';
import Image from '../../../../component/Image';
import PropTypes from 'prop-types';
import fonts from '../../../../gsresource/ui/fonts';
import colors from '../../../../gsresource/ui/colors';

const WIDTH = Dimensions.get('window').width;
export default class PayResultCell extends Component {

    static propTypes = {
        status: PropTypes.bool,
        amount: PropTypes.number,
    };

    render() {
        return (
            <View style={styles.container}>
                <View style={{justifyContent: 'center', alignItems: 'center', height: 90, flexDirection: 'row'}}>
                    {
                        this.props.status &&
                        <Image
                            source={require('gsresource/img/paySuccess.png')}
                        />
                    }

                    <Text style={styles.text}>
                        {this.props.status ? '已支付成功' : '订单支付失败，请重新支付'}
                    </Text>
                </View>

                <View style={{height: 1, width: WIDTH, backgroundColor: colors.bg}} />

                <View style={{
                    height: 45,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
                >

                    <Text style={{
                        color: colors.greyFont,
                        fontSize: fonts.font10,
                    }}
                    >
                        支付金额:
                        <Text style={{color: colors.activeFont, fontSize: fonts.font18}}>
                            {` ¥${this.props.amount}`}
                        </Text>

                    </Text>
                </View>

            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        height: 135,
        backgroundColor: colors.white,
        alignItems: 'center'
    },
    text: {
        fontSize: fonts.font18,
        color: colors.normalFont,
        marginLeft: 8
    }
});