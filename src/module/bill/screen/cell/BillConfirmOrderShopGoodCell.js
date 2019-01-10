/**
 * @author sml2
 * @date 2018/11/27
 * @desc 店铺cell
 * @flow
 */
import React, { Component } from 'react';
import { View, Text, FlatList,TouchableOpacity,StyleSheet } from 'react-native';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import Image from 'component/Image';
import ListViewTextArrowCell from 'component/ListViewTextArrowCell';
import BillConfirmOrderGoodContentCell from './BillConfirmOrderGoodContentCell';
import NavigationSvc from 'svc/NavigationSvc';
import SingleLineInputDlg from 'component/SingleLineInputDlg';
import {runInAction} from 'mobx';
import {Observer,observer} from 'mobx-react';
import type {BillConfirmOrderShopGoodsCellItemType,BillConfirmOrderGoodsSpuType} from '../../model/BillConfirmCellItemType';
import BillingConfirmStore from '../../store/BillingConfirmStore';
import NP from 'number-precision';
import {Toast} from '@ecool/react-native-ui';
import CouponModel, {CouponType} from 'module/model/CouponModel';
import Alert from 'component/Alert';
import ShopApiManager from 'apiManager/ShopApiManager';

type Props = {
    data: BillConfirmOrderShopGoodsCellItemType,
    store: BillingConfirmStore,
    // 0普通模式 1合包 2一件代发
    orderMode: number,
    // 运费比例(用于合包跟一件代发模式下,其他情况都等于1)
    feeZoom: number,
    // 凑合包
    onGatherMoreGoodClick: Function,
    tenantIds: string,
}

@observer
export default class BillConfirmOrderShopGoodCell extends Component<Props> {

    constructor(props: Props){
        super(props);
    }
    /**
     * 选择卡券
     * @param cardType number
     */
    onSelectCouponClick = (cardType: number)=> {
        let props = this.props;
        if (!props.store.hasAddress) {
            Toast.show('请选择收货地址');
            return;
        }
        const {couponInfo} = props.data;
        let selectedCoupon;
        // 匹配上次选择券类型
        if(couponInfo){
            if(cardType === CouponType.Fee){
                selectedCoupon = couponInfo.feeCoupon;
            } else {
                selectedCoupon = couponInfo.favorCoupon;
            }
        }
        // 设置检验标志checkFlag
        runInAction(()=>{
            props.store.goodsArr.forEach((item)=>{
                item.checkFlag = props.data.tenantId === item.tenantId;
            });
        });
        this.goToSelectCouponScreen(cardType,selectedCoupon);
    }

    /**
     * 跳转选择卡券
     * @param cardType
     * @param selectedCoupon
     */
    goToSelectCouponScreen = (cardType: number,selectedCoupon: ?CouponModel)=>{
        // 跳转选择券
        NavigationSvc.navigate('SelectCoupon', {
            goods: this.props.store.goodsArr,
            isPlat: false,
            cardType:cardType,
            resultCallBack: (coupon)=>{
                let item = coupon && coupon.length > 0 ? coupon[0] : null;
                this.props.store.setShopCoupon(this.props.data.tenantId,item,cardType);
            },
            selectedCoupon: selectedCoupon ? [selectedCoupon] : null,
            platCouponParam: this.props.store.configPlatCoupons(),
        });
    }

    onUnionOrderClick = ()=>{
        Toast.loading();
        ShopApiManager.fetchShopMarketId({tenantId:this.props.data.tenantId}).then((result)=>{
            Toast.dismiss();
            NavigationSvc.navigate('GoodsListScreen',{
                queryType:0,
                sourceFrom:1,
                marketId:result.data && result.data.marketIds ? result.data.marketIds.join(',') : '',
                title:'合包推荐商品',
                didRecievedData:(data)=>{
                    Toast.show('已加入到订单');
                    this.props.store.setGoodArrDirect(data.skuList,data.spu,data.shop);
                    this.props.store.getSkusInfoInBatch((ok,message)=>{
                        if(!ok){
                            Alert.alert(message);
                        }
                    });
                }
            });
        }).catch((error)=>{
            Toast.dismiss();
            Alert.alert(error.message);
        });
    }

    renderShopTitleView = ()=>{
        let props = this.props;
        let orderMode = this.props.orderMode;
        const {traderName = '',tenantId = ''} = props.data;
        return (
            <TouchableOpacity
                style={[styles.shopTitleTouch]}
                onPress={()=>{
                    NavigationSvc.push('ShopIndexScreen', {
                        tenantId: tenantId,
                        tenantName: traderName
                    });
                }}
            >
                <Image source={require('gsresource/img/shop.png')} />
                <Text
                    style={[styles.shopTitle]}
                    numberOfLines={1}
                    ellipsizeMode={'tail'}
                >
                    {traderName}
                </Text>
                {orderMode > 0 && (
                    <TouchableOpacity
                        style={styles.gatherMoreTouch}
                        onPress={this.onUnionOrderClick}
                    >
                        <Text style={styles.gatherMoreText}>{'凑合包'}</Text>
                        <Image source={require('gsresource/img/arrow_right_pink.png')} />
                    </TouchableOpacity>
                )}
            </TouchableOpacity>
        );
    }

    renderItem = (info: Object)=>{
        if(!info.item.spu || info.item.spu.length <= 0){
            return null;
        }
        return (
            <View>
                <BillConfirmOrderGoodContentCell spu={info.item.spu[0]} />
                <View style={{height:1,backgroundColor:colors.borderE}} />
            </View>
        );
    }

    renderShopFeeView = ()=>{
        let props = this.props;
        let {feeZoom,orderMode,data} = props;
        // 运费券模型
        let feeCouponItem = data.couponInfo ? data.couponInfo.feeCoupon : null;
        // 计算运费
        let shipFeeMoney = data.shipFeeMoney;
        if(feeCouponItem && orderMode === 0 && shipFeeMoney >= feeCouponItem.avlExecNum){
            // 运费在普通模式（orderMode === 0）下才需要减去运费优惠券
            shipFeeMoney = NP.minus(shipFeeMoney,feeCouponItem.avlExecNum);
        }
        // 店铺运费券可用数量
        let feeCouponAvlCount = data.couponInfo ? data.couponInfo.feeCouponAvlCount : 0;
        // 是否隐藏运费可用卡券数量提示
        let hiddenFeeCouponCount = feeCouponAvlCount <= 0 || feeCouponItem;
        return (
            <View>
                <ListViewTextArrowCell
                    title={'店铺运费'}
                    subTitleHidden={true}
                    tapEnable={orderMode === 0}
                    arrowHidden={orderMode > 0}
                    tapHandler={()=>{
                        if(!feeCouponItem && feeCouponAvlCount <= 0){
                            Toast.show('当前没有可用运费券');
                            return;
                        }
                        this.onSelectCouponClick(CouponType.Fee);
                    }}
                    accessaryView={
                        <View style={{flexDirection:'row',alignItems:'center'}}>
                            {(!hiddenFeeCouponCount) && (
                                <Text style={{fontSize:14, color:colors.activeBtn,marginRight:12}}>{'当前有' + feeCouponAvlCount +'张运费券可用'}</Text>
                            )}
                            <Text style={{fontSize:14, color:colors.normalFont}}>{'¥' + (NP.round(NP.times(shipFeeMoney,feeZoom),2))}</Text>
                            <Image style={{marginLeft:8,marginRight:1}} source={require('gsresource/img/arrowRight.png')} />
                        </View>
                    }
                />
                <View style={{height:1,backgroundColor:colors.borderE}} />
            </View>
        );
    }

    renderShopFavorView = ()=>{
        let {data} = this.props;
        // 优惠券模型
        let favorCouponItem = data.couponInfo ? data.couponInfo.favorCoupon : null;
        // 店铺优惠券可用数量
        let favorCouponAvlCount = data.couponInfo ? data.couponInfo.favorCouponAvlCount : 0;
        // 优惠金额
        let favorMoney = favorCouponItem ? favorCouponItem.avlExecNum : 0;
        return (
            <ListViewTextArrowCell
                title={'活动优惠'}
                subTitleHidden={true}
                valueTextStyle={(favorMoney > 0 || favorCouponAvlCount) ? {color:colors.activeBtn} : {color:colors.greyFont}}
                value={favorMoney ? `-¥${favorMoney}` : favorCouponAvlCount ?
                    `当前有${favorCouponAvlCount}张优惠券可用` : '当前没有可用优惠券'}
                tapHandler={()=>{
                    if(!favorCouponItem && favorCouponAvlCount <= 0){
                        Toast.show('当前没有可用优惠券');
                        return;
                    }
                    this.onSelectCouponClick(CouponType.Favor);
                }}
            />
        );
    }


    render(){
        let props = this.props;
        let {orderMode,data} = props;
        let items = data.data;
        // 购物车删除可能会携带空数据，兼容过滤一下
        items = items.filter((sub)=>{
            return sub.spu && sub.spu.length > 0;
        });
        return (
            <View style={styles.container}>
                <View style={{height:1,backgroundColor:colors.borderE}} />
                {this.renderShopTitleView()}
                <View style={{height:1,backgroundColor:colors.borderE}} />
                <FlatList
                    data={items}
                    renderItem={this.renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => 'BillConfirmOrderShopGoodCell' + index}
                />
                {orderMode === 0 && this.renderShopFeeView()}
                {this.renderShopFavorView()}
                <View style={{height:1,backgroundColor:colors.borderE}} />
                <Observer>
                    {() => (
                        <ListViewTextArrowCell
                            title={'备注'}
                            subTitleHidden={true}
                            value={props.data.buyerRem && props.data.buyerRem.length > 0 ? props.data.buyerRem : '可以告诉卖家特殊需求'}
                            valueNumberOfLines={2}
                            tapHandler={()=>{
                                SingleLineInputDlg.show({
                                    title: '留言',
                                    hint: '可以告诉卖家特殊需求',
                                    keyboardType: 'default',
                                    defaultText: props.data.buyerRem,
                                    maxLength: 150,
                                    onConfirm: (value) => {
                                        props.store.updateShopRem(props.data.tenantId, value);
                                    },
                                });
                            }}
                        />
                    )}
                </Observer>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex:1,
    },
    shopTitleTouch:{
        flexDirection: 'row',
        backgroundColor: colors.white,
        alignItems: 'center',
        height: 34,
        paddingLeft: 21,
    },
    shopTitle:{
        marginLeft: 10,
        color: colors.normalFont,
        fontSize: fonts.font14,
        maxWidth:'80%',
        flex:1,
        marginRight:20
    },
    gatherMoreTouch:{
        paddingRight:14,
        flexDirection:'row',
        alignItems:'center',
        height:'100%'
    },
    gatherMoreText:{
        fontSize:12,
        color:colors.activeBtn,
        marginRight:4,
        paddingLeft:20,
    },
});
