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
import AfterNva from './AfterNva';
import AfterFooter from './AfterFooter';
import PropTypes from 'prop-types';

const WIDTH = Dimensions.get('window').width;
export default class AfterSaleComponent extends Component {

    static propTypes = {
        listData: PropTypes.object,
        onClickBtn: PropTypes.func,
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

                <AfterNva
                    totalNum={listData.bill.totalNum}
                    totalMoney={listData.bill.requestBackMoney}
                />

                <AfterFooter
                    backFlag={listData.bill.backFlag}
                    onClickBtn={this.props.onClickBtn}
                    onClickPlat={this.props.onClickPlat}
                />

            </View>
        );
    }
}

