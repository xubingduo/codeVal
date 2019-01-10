/**
 *@author xbu
 *@date 2018/07/28
 *@desc   订单价格 物品转身
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
        sort: PropTypes.number,
        totalMoney: PropTypes.number,
        transformMoney: PropTypes.number,
        favorMoney: PropTypes.number,
        totalNum: PropTypes.number
    };

    render() {
        return (
            <View style={{backgroundColor: colors.white}}>
                <View style={styles.orderListAllBox}>
                    <View style={[styles.box,{alignItems:'center'}]}>
                        {/*<Text style={[styles.orderListBarTitle,styles.orderAllText]}>{this.props.sort}种货品</Text>*/}
                        <Text style={[styles.orderListBarTitle,styles.orderAllText]}>共{this.props.totalNum}件</Text>
                        {this.props.favorMoney > 0 ? (<Text style={styles.orderListBarTitle}>优惠金额：</Text> ) : null}
                        {this.props.favorMoney > 0 ? (<Text style={[styles.orderListBarTitle,styles.orderAllNumber]}>¥{this.props.favorMoney} </Text>) : null}
                        <Text style={styles.orderListBarTitle}>{I18n.t('totalMoney')}：</Text>
                        <Text style={styles.orderListBarTitle}>({I18n.t('have') + I18n.t('transformPrice') + I18n.t('moneySymbol')} {this.props.transformMoney})</Text>
                        <Text style={[styles.orderListBarTitle,styles.orderAllNumber]}> ¥{this.props.totalMoney}</Text>
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

    orderAllNumber: {
        color: colors.activeFont,
    },


});