/**
 *@author xbu
 *@date 2018/07/28
 *@desc  订单组合
 *
 */


import React, {Component} from 'react';
import {
    Dimensions,
    View,
    TouchableOpacity,
} from 'react-native';

import OrderHeader from './OrderHeader';
import OrderBody from './OrderBody';
import OrderNav from './OrderNva';
import OrderFooter from './OrderFooter';
import PropTypes from 'prop-types';

const WIDTH = Dimensions.get('window').width;
export default class OrderComponent extends Component {

    static propTypes = {
        listData: PropTypes.object,
        onClickBtnLeft: PropTypes.func,
        onClickBtnRight: PropTypes.func,
        onClickBtnCenter: PropTypes.func,
        goToUrl: PropTypes.func,
        splitData: PropTypes.array,
        nub: PropTypes.number,
        elementData: PropTypes.array,
    };


    render() {
        const {listData} = this.props;
        let orderBody = listData.data.map((val,i) =>{
            return(
                <OrderBody
                    key={i + 'body'}
                    title={val.spuTitle}
                    color={val.spec1Name + val.spec2Name}
                    money={val.originalPrice}
                    rem={listData.bill.buyerRem}
                    number={val.skuNum}
                    url={val.spuDocId}
                    returnStatus={listData.bill.backFlagName}
                />
            );
        });

        return (
            <View style={{width: WIDTH,marginBottom: 10}}>
                <OrderHeader
                    shopId={listData.trader.tenantId}
                    name={listData.trader.tenantName}
                    statusName={listData.bill.frontFlagName}
                />

                <TouchableOpacity
                    onPress={()=>{
                        if(this.props.goToUrl){
                            this.props.goToUrl(listData.bill.id);
                        }
                    }}
                >
                    {orderBody}
                </TouchableOpacity>

                <OrderNav
                    sort={listData.bill.sort}
                    totalNum={listData.bill.totalNum}
                    totalMoney={listData.bill.totalMoney}
                    transformMoney={listData.combBill ? listData.combBill.combineFee : listData.bill.shipFeeMoney}
                    favorMoney={listData.bill.favorMoney}
                />

                <OrderFooter
                    backTime={listData.bill.confirmTime}
                    backFlag={listData.bill.backFlag}
                    btnFlag={listData.bill.flag}
                    btnStatus={listData.bill.frontFlag}
                    backMoney={listData.bill.backMoney}
                    totalMoney={listData.bill.totalMoney}
                    onClickBtnLeft={this.props.onClickBtnLeft}
                    onClickBtnCenter={this.props.onClickBtnCenter}
                    onClickBtnRight={this.props.onClickBtnRight}
                    onClickPlat={this.props.onClickPlat}
                    onClickDelayGetGoods={this.props.onClickDelayGetGoods}
                />


            </View>
        );
    }
}

