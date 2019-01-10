/**
 *@author xbu
 *@date 2018/07/28
 *@desc
 * 
 *   1. 待付款
     2. 待发货
     3. 待收货
     4. 交易完成
     5. 交易已关闭
     6. 处理中
 *
 */

import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import colors from '/gsresource/ui/colors';
import I18n from '/gsresource/string/i18n';
import PropTypes from 'prop-types';
import OrderBtn from './OrderBtn';
import ConfirmAlert from 'component/ConfirmAlert';

const BACK_TIME = 1;
let back = null;
export default class OrderFooter extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShowBtn: true
        };
    }

    static propTypes = {
        backTime: PropTypes.any,
        backFlag: PropTypes.number,
        backMoney: PropTypes.number,
        totalMoney: PropTypes.number,
        btnFlag: PropTypes.number,
        btnStatus: PropTypes.number,
        onClickBtnLeft: PropTypes.func,
        onClickBtnRight: PropTypes.func,
        onClickBtnCenter: PropTypes.func,
        onClickPlat: PropTypes.func,
        onClickDelayGetGoods: PropTypes.func,
        onEditOrderClick: PropTypes.func
    };

    btnRenderLeft = ({ ...data },onClick) => {
        return (
            <OrderBtn
                btnStatus={this.props.btnStatus}
                onClickBtn={onClick ? onClick : this.props.onClickBtnLeft}
                {...data}
            />
        );
    };

    //申请退换货
    btnRenderCenter = ({ ...data }) => {
        return (
            <OrderBtn
                btnStatus={this.props.btnStatus}
                onClickBtn={this.props.onClickBtnCenter}
                {...data}
            />
        );
    };

    btnRenderRight = ({ ...data }) => {
        return (
            <OrderBtn
                btnStatus={this.props.btnStatus}
                onClickBtn={this.props.onClickBtnRight}
                {...data}
            />
        );
    };

    // 平台申述
    btnRenderLeftTop = ({ ...data }) => {
        return <OrderBtn onClickBtn={this.props.onClickPlat} {...data} />;
    };

    // 延长待收货
    btnDelayGetGoods = ({ ...data }) => {
        return (
            <OrderBtn onClickBtn={this.props.onClickDelayGetGoods} {...data} />
        );
    };

    /**
     * 待付款修改订单
     */
    onEditOrderClick = ()=>{
        if(this.props.onEditOrderClick){
            this.props.onEditOrderClick();
        }
    }

    render() {
        let btnLeft = null;
        let btnCenter = null;
        let btnRight = null;
        let plat = null;
        let delay = null;
        switch (this.props.btnStatus) {
        //待付款
        case 1:
            btnLeft = this.btnRenderLeft({ name: '修改订单' },this.onEditOrderClick);
            btnCenter = this.btnRenderLeft({ name: I18n.t('cancelOrder') });
            btnRight = this.btnRenderRight({
                name: I18n.t('immediatePayment'),
                btnColor: colors.activeFont
            });
            break;
            //待发货
        case 2:
            plat = this.platBtn();
            btnCenter = this.isBackFlag();
            btnRight = this.btnRenderRight({
                name: I18n.t('sendOutGoods')
            });
            break;
            //待收货
        case 3:
            delay = this.btnDelayGetGoods({ name: '延长收货' });
            plat = this.platBtn();
            btnLeft = this.btnRenderLeft({
                name: I18n.t('lookUpTransport')
            });
            btnCenter = this.isBackFlag();
            btnRight = this.btnRenderRight({
                name: I18n.t('confirmGoods'),
                btnColor: colors.activeFont
            });
            break;
            // 交易完成
        case 4:
            plat = this.platBtn();
            btnLeft = this.btnRenderLeft({
                name: I18n.t('lookUpTransport')
            });
            {
                if (this.isSevenDay()) {
                    btnCenter = this.isBackFlag();
                }
            }
            btnRight = this.isEvaluate();
            break;
            //交易已关闭
        case 5:
            btnLeft = this.btnRenderLeft({
                name: I18n.t('contactService')
            });
            break;
            //处理中
        case 6:
            btnLeft = this.btnRenderLeft({ name: I18n.t('cancelOrder') });
            btnRight = this.btnRenderRight({
                name: I18n.t('immediatePayment'),
                btnColor: colors.activeFont
            });
            break;
        }

        return (
            <View style={styles.btnGroup}>
                {delay}
                {plat}
                {btnLeft}
                {btnCenter}
                {btnRight}
            </View>
        );
    }

    // 根据退款状态显示不同按钮
    isBackFlag = () => {
        let isTrue = false;
        let btn = null;
        switch (this.props.backFlag) {
        case 0:
        case 2:
        case 12:
            isTrue = true;
            break;
        case 3:
            if (this.props.backMoney && this.props.totalMoney) {
                if (this.props.backMoney > this.props.totalMoney) {
                    isTrue = true;
                }
            }
            break;
        default:
            isTrue = false;
            break;
        }

        // 退款只能退一次
        if (
            this.props.backFlag === 1 ||
            this.props.backFlag === 2 ||
            this.props.backFlag === 3
        ) {
            return btn;
        } else {
            if (isTrue) {
                btn = this.btnRenderCenter({
                    name: I18n.t('applyForAfterSale')
                });
            } else {
                btn = this.btnRenderCenter({ name: I18n.t('lookLoading') });
            }
        }

        return btn;
    };

    // 根据订单状态判断 是否评价已评价
    isEvaluate = () => {
        let btn = null;
        if (this.props.btnFlag === 9) {
            // btn = this.btnRenderRight({name: I18n.t('hasEvaluate')});
            btn = null;
        } else {
            btn = this.btnRenderRight({
                name: I18n.t('evaluate'),
                btnColor: colors.activeFont
            });
        }
        return btn;
    };

    //判断时间是否到了七天了
    isSevenDay = () => {
        let startTime = this.props.backTime;
        if (startTime === undefined) {
            return true;
        } else {
            startTime = startTime.replace(new RegExp('-', 'gm'), '/');
            let startTimeHaoM = new Date(startTime).getTime() / 1000; //得到毫秒数
            let lastTime = BACK_TIME * 24 * 60 * 60 + startTimeHaoM;
            let currentTime = new Date().getTime();
            let currentM = currentTime / 1000;
            if (lastTime > currentM) {
                return true;
            } else {
                return false;
            }
        }
    };

    //平台申述
    platBtn = () => {
        let el = null;
        if (this.props.backFlag === 12) {
            el = this.btnRenderLeftTop({
                name: '平台申诉',
                btnColor: colors.activeFont
            });
        }
        return el;
    };
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
