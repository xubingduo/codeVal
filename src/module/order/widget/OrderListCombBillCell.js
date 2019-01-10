/**
 * @author sml2
 * @date 2018/12/7.
 * @desc 订单列表合包cell
 * @flow
 */
import React, { Component } from 'react';
import { View, Text, FlatList,TouchableOpacity,StyleSheet,DeviceEventEmitter } from 'react-native';
import PropTypes from 'prop-types';
import OrderListCombBillModel,{OrderListBillModel} from '../model/OrderListCombBillModel';
import OrderHeader from './OrderHeader';
import OrderNav from './OrderNva';
import OrderBody from './OrderBody';
import OrderFooter from './OrderFooter';
import {Screen} from 'gsresource/ui/ui';
import colors from 'gsresource/ui/colors';
import NP from'number-precision';
import moment from 'moment';
import OrderListStore from '../store/OrderListStore';
import rootStore from 'store/RootStore';
import {Toast} from '@ecool/react-native-ui';
import OrderCommonUtl from '../servers/OrderCommonUtl';
import Alert from 'component/Alert';
import ConfirmAlert from 'component/ConfirmAlert';

const DAY_TIME_STAMP = 60*60*24*1000;

type Props = {
    store: OrderListStore,
    item: OrderListCombBillModel;
    onClickBtnLeft: Function,
    onClickBtnRight: Function,
    onClickBtnCenter: Function,
    goToUrl: Function,
    onClickPlat: Function,
    onClickDelayGetGoods: Function,
}

type State = {

}

export default class OrderListCombBillCell extends Component<Props,State> {
    listItems: Array<OrderListBillModel>;

    constructor(props: Props) {
        super(props);
    }

    removeOrder = ()=>{
        let ids = this.listItems.map((item)=>{
            return item.bill.id;
        }).join(',');
        this.props.store.deleteOrderListPayGoods(ids);
    }

    /**
     * 修改订单-退还购物车
     */
    onEditOrderClick = async ()=>{
        let ids = this.listItems.map((item)=>{
            return item.bill.id;
        }).join(',');
        Toast.loading();
        try {
            await OrderCommonUtl.cancelOrderMsg(ids,'',13,true);
            Toast.dismiss();
            DeviceEventEmitter.emit('CANCEL_ORDER',{ id : ids});
            rootStore.shoppingCartStore.requestShoppingCart(()=>{
                Toast.show('已为您将该订单货品放回到购物车,请查看',2);
                // 选择购物车sku
                let skuIds = [];
                for(let i = 0;i < this.listItems.length;i++){
                    let model = this.listItems[i];
                    let modelSkuIds = model.skus.map((sub)=>{
                        return sub.skuId;
                    });
                    skuIds.push(...modelSkuIds);
                }
                skuIds.forEach((id)=>{
                    rootStore.shoppingCartStore.checkSKU(true,id,false);
                });
            });
        } catch (error){
            Toast.dismiss();
            Alert.alert(error.message);
        }
    }

    renderContentCell = (listData: OrderListBillModel,index: number)=>{
        let orderBody = listData.skus.slice().map((val,i) =>{
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
        let nowTime = moment().valueOf();
        let billProTime = moment(listData.bill.proTime).valueOf();
        // 剩余时间
        let restTime = (DAY_TIME_STAMP - (nowTime - billProTime)) * 0.001;
        return (
            <View key={listData.trader.tenantId}>
                <OrderHeader
                    shopId={listData.trader.tenantId}
                    name={listData.trader.tenantName}
                    statusName={index === 0 ? listData.bill.frontFlagName : ''}
                    countDownHiiden={!(listData.bill.frontFlag === 1 && listData.bill.procFlag === 0)}
                    countDownTime={restTime ? restTime : 0}
                />

                <TouchableOpacity
                    activeOpacity={1}
                    onPress={()=>{
                        if(this.props.goToUrl){
                            this.props.goToUrl(listData.bill.id);
                        }
                    }}
                >
                    {orderBody}
                </TouchableOpacity>
            </View>
        );
    }

    render(){
        let {item} = this.props;
        let {combBillList,...others} = item;
        let listData = others;
        let listItems = [];
        listItems.push(JSON.parse(JSON.stringify(others)));
        if(combBillList){
            listItems.push(...combBillList);
        }
        this.listItems = listItems;
        // 1.OrderNav
        let totalNum = 0;
        let totalMoney = 0;
        let transformMoney = 0;
        let favorMoney = 0;
        // 2.OrderFooter
        let confirmTime = listData.bill.confirmTime;
        let backFlag = listData.bill.backFlag;
        let btnFlag = listData.bill.flag;
        let btnStatus = listData.bill.frontFlag;
        let backMoney = 0;

        for(let i = 0;i < listItems.length;i++){
            let info = listItems[i];
            let bill = info.bill;
            totalNum = NP.plus(totalNum,bill.totalNum);
            totalMoney = NP.plus(totalMoney,bill.totalMoney);
            transformMoney = NP.plus(transformMoney,(info.combBill ? info.combBill.combineFee : bill.shipFeeMoney));
            favorMoney = NP.plus(favorMoney,bill.shopCoupsMoney);
            backMoney = NP.plus(backMoney,bill.backMoney);
        }

        return(
            <View style={{width:Screen.width}}>
                {listItems && listItems.length > 0 && listItems.map((model: OrderListBillModel,index)=>{
                    return this.renderContentCell(model,index);
                })}
                <OrderNav
                    totalNum={NP.round(totalNum,2)}
                    totalMoney={NP.round(totalMoney,2)}
                    transformMoney={NP.round(transformMoney,2)}
                    favorMoney={NP.round(favorMoney,2)}
                />
                <OrderFooter
                    backTime={confirmTime}
                    backFlag={backFlag}
                    btnFlag={btnFlag}
                    btnStatus={btnStatus}
                    backMoney={NP.round(backMoney,2)}
                    totalMoney={NP.round(totalMoney,2)}
                    onClickBtnLeft={this.props.onClickBtnLeft}
                    onClickBtnCenter={this.props.onClickBtnCenter}
                    onClickBtnRight={this.props.onClickBtnRight}
                    onClickPlat={this.props.onClickPlat}
                    onClickDelayGetGoods={this.props.onClickDelayGetGoods}
                    onEditOrderClick={()=>{
                        ConfirmAlert.alert('修改订单','即将为您把订单货品放回至购物车,是否继续?',()=>{
                            this.onEditOrderClick();
                        });
                    }}
                />
                <View style={{height:10,backgroundColor:colors.bg}} />
            </View>
        );
    }

}


const styles = StyleSheet.create({

});
