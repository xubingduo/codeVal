/**
 *@author xbu
 *@date 2018/07/28
 *@desc
 *back_flag
 *   0 未退款退货，1 全部退货，2 部分退货，3 仅退款。10 买家申请退款，11 买家申请退货退款
 *
 */

import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import colors from '/gsresource/ui/colors';
import I18n from '/gsresource/string/i18n';
import PropTypes from 'prop-types';
import OrderBtn from './OrderBtn';

export default class AfterFooter extends Component {
    static propTypes = {
        onClickBtn: PropTypes.func,
        backFlag: PropTypes.number,
        onClickPlat: PropTypes.func
    };

    btnRenderLeft = ({ ...data }) => {
        return (
            <OrderBtn
                btnStatus={this.props.btnStatus}
                onClickBtn={this.props.onClickBtn}
                {...data}
            />
        );
    };

    btnRenderLeftTop = ({ ...data }) => {
        return (
            <OrderBtn
                btnStatus={this.props.btnStatus}
                onClickBtn={this.props.onClickPlat}
                {...data}
            />
        );
    };

    render() {
        let btnLeft = null;
        let btnLeftTop = null;
        // if(this.props.backFlag === 0 || this.props.backFlag === 2){
        //     btnLeft = this.btnRenderLeft({name:I18n.t('applyForAfterSale')});
        // } else {
        btnLeft = this.btnRenderLeft({ name: I18n.t('lookLoading') });
        // }
        if (this.props.backFlag === 12) {
            btnLeftTop = this.btnRenderLeftTop({
                name: '平台申诉',
                btnColor: colors.activeFont
            });
        }

        return (
            <View style={styles.btnGroup}>
                {btnLeftTop}
                {btnLeft}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    btnGroup: {
        flexDirection: 'row',
        height: 40,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: 15
    }
});
