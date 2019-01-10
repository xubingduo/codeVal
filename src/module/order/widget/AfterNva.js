/**
 *@author xbu
 *@date 2018/07/28
 *@desc
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';
import I18n from '/gsresource/string/i18n';
import PropTypes from 'prop-types';

export default class names extends Component {
    static propTypes = {
        totalMoney: PropTypes.number,
        totalNum: PropTypes.number
    };

    render() {
        return (
            <View style={{backgroundColor: colors.white}}>
                <View style={styles.orderListAllBox}>
                    <View style={styles.box}>
                        <Text style={[styles.orderListBarTitle,styles.orderAllText]}>总数：{this.props.totalNum}</Text>
                        <Text style={styles.orderListBarTitle}>申请退款金额：</Text>
                        <Text style={[styles.orderListBarTitle,styles.orderAllNuber]}>¥{this.props.totalMoney}</Text>
                    </View>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({

    orderListBarTitle: {
        fontSize: fonts.font12,
        color: colors.normalFont,
    },

    orderListAllBox: {
        minHeight: 34,
        maxHeight: 40,
        alignItems: 'center',
        justifyContent: 'flex-end',
        flexDirection: 'row',
        backgroundColor: colors.white,
        marginLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
        paddingRight: 15,
    },

    box:{
        justifyContent: 'flex-end',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },

    orderAllText: {
        paddingRight: 17,
    },

    orderAllNuber: {
        color: colors.activeFont,
    },


});