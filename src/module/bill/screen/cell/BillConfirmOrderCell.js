/**
 * @author sml2
 * @date 2018/11/26
 * @desc 订单cell
 * @flow
 */
import React, { Component } from 'react';
import { View, Text,TouchableOpacity,StyleSheet,FlatList } from 'react-native';
import colors from 'gsresource/ui/colors';
import BillConfirmOrderShopGoodCell from './BillConfirmOrderShopGoodCell';
import {Observer,observer} from 'mobx-react';
import BillingConfirmStore from '../../store/BillingConfirmStore';
import {BillConfirmOrderCellModel} from '../../model/BillConfirmCellItemType';
import NP from 'number-precision';
import NavigationSvc from 'svc/NavigationSvc';

type Props = {
    data: BillConfirmOrderCellModel,
    store: BillingConfirmStore,
}

function BillConfirmOrderCell(props: Props) {

    function didGatherMoreGood(item) {
        props.store && props.store.setGoodArrDirect(...item);
    }

    /**
     * 凑合包，跳转商品推荐
     */
    function gotoGatherMoreGood() {
        NavigationSvc.navigate('GoodsListScreen',{
            queryType:0,
            title:'合包推荐商品',
            didRecievedData:didGatherMoreGood,
        });
    }

    function renderItem(info) {
        const {feeMoneyNow,feeMoneyOrigin,orderMode = 0} = props.data;
        let feeZoom = 1;
        if(orderMode > 0 && feeMoneyOrigin > 0 && feeMoneyNow <= feeMoneyOrigin){
            feeZoom = NP.divide(feeMoneyNow,feeMoneyOrigin);
        }
        return (
            <BillConfirmOrderShopGoodCell
                data={info.item}
                store={props.store}
                orderMode={orderMode}
                feeZoom={feeZoom}
                onGatherMoreGoodClick={gotoGatherMoreGood}
            />
        );
    }
    return (
        <View style={styles.container}>
            {props.data.orderMode > 0 && (
                <View style={styles.titleView}>
                    <View style={{width:3,height:14,backgroundColor:colors.activeBtn,marginRight:8}} />
                    <Text style={styles.titleText}>
                        {props.data.orderMode === 1 ? '合包订单' : '一件代发订单'}
                    </Text>
                </View>
            )}
            <FlatList
                data={props.data.shopOrders}
                renderItem={renderItem}
                showsVerticalScrollIndicator={false}
                keyExtractor={(item, index) => 'BillConfirmOrderCell' + index}
            />
            <View style={{height:10}} />
        </View>
    );
}

export default observer(BillConfirmOrderCell);

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
    titleView:{
        height:45,
        backgroundColor:'white',
        alignItems:'center',
        flexDirection:'row',
        paddingLeft:22,
    },
    titleText:{
        fontSize:14,
        color:colors.activeBtn,
        fontWeight:'bold'
    }
});
