/**
 *@author xbu
 *@date 2018/07/30
 *@desc 按钮状态
 *
 */


import React, {Component} from 'react';
import { View } from 'react-native';
import OrderBtn from './OrderBtn';
import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';

export default class OrderStatusBtnGroup extends Component {
    static propTypes = {
        btnStatus: PropTypes.number,
        onClickBtnLeft: PropTypes.func,
        onClickBtnCenter: PropTypes.func,
        onClickBtnRight: PropTypes.func,
    };

    render() {

        let btnLeft = null;
        let btnCenter = null;
        let btnRight = null;
        switch (this.props.btnStatus){
        //交易关闭
        case 0:
            btnLeft = (
                <OrderBtn
                    onClickBtn={() => {
                        if(this.props.onClickBtnLeft) {
                            this.props.onClickBtnLeft();
                        }
                    }}
                />
            );
            break;
            //待付款
        case 1:
            btnLeft = (
                <OrderBtn
                    name={'取消订单'}
                    onClickBtn={() => {
                        if(this.props.onClickBtnLeft) {
                            this.props.onClickBtnLeft();
                        }
                    }}
                />
            );
            btnRight = (
                <OrderBtn
                    name={'立即支付'}
                    btnColor={colors.activeFont}
                    onClickBtn={() => {
                        if(this.props.onClickBtnRight) {
                            this.props.onClickBtnRight();
                        }
                    }}
                />
            );
            break;
            //待发货
        case 2:
            btnLeft = (
                <OrderBtn
                    name={'催单'}
                    onClickBtn={() => {
                        if(this.props.onClickBtnLeft) {
                            this.props.onClickBtnLeft();
                        }
                    }}
                />
            );
            btnRight = (
                <OrderBtn
                    name={'取消订单'}
                    onClickBtn={() => {
                        if(this.props.onClickBtnRight) {
                            this.props.onClickBtnRight();
                        }
                    }}
                />
            );
            break;
            //待收货
        case 3:
            btnLeft = (
                <OrderBtn
                    name={'查看物流'}
                    onClickBtn={() => {
                        if(this.props.onClickBtnLeft) {
                            this.props.onClickBtnLeft();
                        }
                    }}
                />
            );

            btnRight = (
                <OrderBtn
                    name={'确认收货'}
                    btnColor={colors.activeFont}
                    onClickBtn={() => {
                        if(this.props.onClickBtnRight) {
                            this.props.onClickBtnRight();
                        }
                    }}
                />
            );
            break;
            //待评价
        case 4:
            btnLeft = (
                <OrderBtn
                    name={'去评价'}
                    btnColor={colors.activeFont}
                    onClickBtn={() => {
                        if(this.props.onClickBtnLeft) {
                            this.props.onClickBtnLeft();
                        }
                    }}
                />
            );
            break;
        }

        return (
            <View style={{flexDirection:'row'}}>
                {btnLeft}
                {btnCenter}
                {btnRight}
            </View>
        );
    }
}

