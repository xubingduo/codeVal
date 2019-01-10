/**
 * author: tuhui
 * Date: 2018/8/2
 * Time: 16:08
 * des:订单确认界面
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView, View, Text,
    SectionList,
    Dimensions,
    ScrollView,
    TouchableOpacity,
    DeviceEventEmitter,
    FlatList,
    Switch,
} from 'react-native';
import NavigationHeader from '../../../component/NavigationHeader';
import colors from '../../../gsresource/ui/colors';
import Image from '../../../component/Image';
import fonts from '../../../gsresource/ui/fonts';
import BillingConfirmStore from '../store/BillingConfirmStore';
import {observer, inject} from 'mobx-react';
import {toJS,runInAction} from 'mobx';
import BillingGoodsCell from './cell/BillingGoodsCell';
import ImageTextWithArrowView from '../../../component/ImageTextWithArrowView';
import DividerLineH from '../../../component/DividerLineH';
import StatusButton from '../../../component/StatusButton';
import Alert from '../../../component/Alert';
import {Toast} from '@ecool/react-native-ui';
import {KeyboardAwareScrollView, KeyboardAwareSectionList} from 'react-native-keyboard-aware-scroll-view';
import ConfirmAlert from 'component/ConfirmAlert';
import TextButton from '../../../component/TextButton';
import SingleLineInputDlg from '../../../component/SingleLineInputDlg';
import NP from 'number-precision';
import UserActionSvc from '../../../svc/UserActionSvc';
import {transformSkusToGroup} from '../utl/billUtl';
import BillConfirmOrderCell from './cell/BillConfirmOrderCell';
import ListViewTextArrowCell from 'component/ListViewTextArrowCell';
import CouponModel,{CouponType} from 'module/model/CouponModel';

/**
 * 当是直接购买时跳转到此界面需要传递的参数
 * fromShoppingCart : 是否是从购物车跳转,是传true 否传false
 * skuArray: Array<SKUType>
 * spu: SPUType
 * shop: ShopType
 */
const propTypes = {
    // fromShoppingCart: PropTypes.bool,
    // skuArray: PropTypes.array,
    // spu: PropTypes.Object,
    // shop: PropTypes.Object,
    // orderFinishCallBack:PropTypes.func, //下单成功之后在页面关闭的时候回调 刷新购物车
};
const WIDTH = Dimensions.get('window').width;

const GROUP_CHILD = 2; // 童装批量

@inject('shoppingCartStore','billingConfirmStore')
@observer
class BillingConfirmScreen extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'确定订单'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                    titleItemTextStyle={{color: colors.normalFont, fontSize: fonts.font18}}
                    itemTextStyle={{color: colors.normalFont}}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.store = this.props.billingConfirmStore;
        this.store.configure();
        this.fromShoppingCart = true;
        /**
         * 判断是否下单成功
         * @type {boolean}
         */
        this.orderSuccess = false;

        this.state = {
            orderEnable: false,
        };

        this.canOrdering = true;
    }

    componentDidMount() {
        if (this.props.navigation.getParam('fromShoppingCart')) {
            this.fromShoppingCart = true;
            this.store.setGoodsArr(this.props.shoppingCartStore.goodsArrOrderConfirmShow);
        } else {
            this.fromShoppingCart = false;
            const skuArray = this.props.navigation.getParam('skuArray');
            const spu = this.props.navigation.getParam('spu');
            const shop = this.props.navigation.getParam('shop');
            this.store.setGoodArrDirect(skuArray, spu, shop);
        }
        this.store.requestDefaultRecAddress();

        Toast.loading();
        this.store.getSkusInfoInBatch((ret, msg) => {
            Toast._dismiss();
            if (ret) {
                this.setState({
                    orderEnable: true,
                });
            } else {
                this.setState({
                    orderEnable: false,
                });
                Alert.alert(msg);
            }
        });
    }

    componentWillUnmount() {
        if (this.fromShoppingCart) {
            let callBack = this.props.navigation.getParam('orderFinishCallBack');
            callBack && callBack();
            /**
             * 如果下单成功了刷新购物车
             */
            if (this.orderSuccess) {
                this.props.shoppingCartStore.requestShoppingCart(() => {
                });
            }
        }

        let params = this.props.navigation.state.params;
        params && params.backHandler && params.backHandler();
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>

                <KeyboardAwareScrollView
                    enableOnAndroid={true}
                >
                    {
                        this.renderAddress()
                    }
                    <View style={{backgroundColor: colors.bg, height: 10}} />
                    {
                        this.renderList()
                    }

                    {
                        this.renderPayInfo()
                    }
                </KeyboardAwareScrollView>

                {
                    this.renderBottom()
                }
            </SafeAreaView>
        );
    }

    renderAddress = () => {

        let recInfo, address;
        if (this.store.acceptInfo) {
            recInfo = this.store.acceptInfo.recInfo;
            address = this.store.acceptInfo.address;
        }

        return (
            <TouchableOpacity
                style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',
                    minHeight: 90,
                    alignItems: 'center',
                    backgroundColor: colors.white,
                    paddingRight: 16
                }}
                onPress={() => {
                    this.props.navigation.navigate('AddressListManagerScreen', {
                        screenMode: 2,
                        selectedId: this.store.acceptInfo ? this.store.acceptInfo.recInfo.id : -1,
                        onSelectCallback: this.onSelectAddressResult,
                        onSelectAddrDeleteCallback: this.onSelectAddressDelete
                    });
                }}
            >
                {
                    this.store.hasAddress ?
                        <View style={{marginLeft: 22, marginRight: 24}}>

                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Text
                                    numberOfLines={1}
                                    ellipsizeMode={'tail'}
                                    style={{fontSize: fonts.font18, color: colors.normalFont, maxWidth: 160}}
                                >
                                    {recInfo && recInfo.linkMan}
                                </Text>

                                <Text style={{fontSize: fonts.font14, color: colors.normalFont, marginLeft: 15}}>
                                    {` ${recInfo && recInfo.telephone}`}
                                </Text>
                            </View>

                            <Text style={{
                                fontSize: fonts.font12,
                                color: colors.normalFont,
                                marginTop: 6,
                                marginBottom: 6
                            }}
                            >
                                {`${address && address.ecCaption.provinceCode} ${address && address.ecCaption.cityCode} ${address && address.ecCaption.countyCode}`}
                            </Text>

                            <Text numberOfLines={2}
                                ellipsizeMode={'tail'}
                                style={{fontSize: fonts.font12, color: colors.normalFont}}
                            >
                                {address && address.detailAddr}
                            </Text>

                        </View>
                        :
                        <Text style={{color: colors.normalFont, fontSize: fonts.font14, marginLeft: 22}}>
                            请选择收货地址
                        </Text>
                }

                <Image style={{right: 15, position: 'absolute'}} source={require('gsresource/img/arrowRight.png')} />
            </TouchableOpacity>
        );
    };

    renderList = () => {
        return (
            <FlatList
                // style={{paddingTop:5}}
                data={toJS(this.store.goodsArrShow)}
                renderItem={this.renderCell}
                keyboardDismissMode={'on-drag'}
                keyExtractor={(item, index) => {
                    return index.toString();
                }}
            />
        );

        // return (
        //     <SectionList
        //         keyExtractor={(item, index) => {
        //             return index.toString();
        //         }}
        //         renderItem={this.renderCell}
        //         renderSectionHeader={this.renderSectionHeader}
        //         renderSectionFooter={this.renderSectionFooter}
        //         stickySectionHeadersEnabled={true}
        //         sections={toJS(this.store.goodsArrShow)}
        //         keyboardDismissMode={'on-drag'}
        //     />
        // );
    };

    renderSectionHeader = ({section}) => {
        return null;
        // return (
        //     <View style={{
        //         flexDirection: 'row',
        //         backgroundColor: colors.white,
        //         alignItems: 'center',
        //         height: 34,
        //         paddingLeft: 14,
        //         paddingRight: 20,
        //     }}
        //     >
        //         <Image style={{}}
        //             source={require('gsresource/img/shop.png')}
        //         />
        //         <Text style={{
        //             marginLeft: 10,
        //             color: colors.normalFont,
        //             fontSize: fonts.font14
        //         }}
        //         numberOfLines={2}
        //         ellipsizeMode={'tail'}
        //         >{section.traderName}</Text>
        //
        //     </View>
        // );
    };

    renderCell = (info) => {

        return <BillConfirmOrderCell data={info.item} store={this.store} />;

        // let item = info.item;
        //
        // let sections = [];
        // if (item.spu[0].salesWayId === GROUP_CHILD) {
        //     sections = transformSkusToGroup(item);
        // } else {
        //     sections = toJS(item.spu);
        // }
        // return (
        //     <BillingGoodsCell
        //         item={sections}
        //     />
        // );
    };

    renderSectionFooter = ({section}) => {
        return null;
        // return (
        //     <View>
        //         <View style={{height: 1, backgroundColor: colors.bg}} />
        //         <ImageTextWithArrowView
        //             textName={'运费'}
        //             editMode={false}
        //             textValue={section.shipFeeMoney === 0 ? '包邮' : ` ¥${section.shipFeeMoney}`}
        //             text1Style={{fontSize: fonts.font14}}
        //             mustItem={false}
        //             arrowShow={false}
        //             arrowShowOnly={false}
        //         />
        //
        //
        //         {/*<DividerLineH/>*/}
        //         {/*<ImageTextWithArrowView*/}
        //         {/*onArrowClick={() => {*/}
        //         {/*this.props.navigation.navigate('SelectCoupon', {shop: section, isPlat: false});*/}
        //         {/*}}*/}
        //         {/*textName={'店铺优惠'}*/}
        //         {/*editMode={true}*/}
        //         {/*withOutTouchView={section.couponsCount <= 0}*/}
        //         {/*textValue={section.coupons ? `${section.coupons}` : section.couponsCount > 0 ?*/}
        //         {/*`当前有${section.couponsCount}张优惠券可用` : '当前没有可用优惠券'}*/}
        //         {/*text1Style={[{fontSize: fonts.font14, marginLeft: 20}]}*/}
        //         {/*text2Style={[section.couponsCount <= 0 ? {color: colors.fontHint} : {}]}*/}
        //         {/*mustItem={false}*/}
        //         {/*arrowShow={section.couponsCount > 0}*/}
        //         {/*arrowShowOnly={false}*/}
        //         {/*/>*/}
        //
        //         <DividerLineH />
        //
        //
        //         <View style={{
        //             flexDirection: 'row',
        //             height: 46,
        //             alignItems: 'center',
        //             justifyContent: 'space-between',
        //             backgroundColor: colors.white
        //         }}
        //         >
        //
        //             <Text style={{fontSize: fonts.font14, color: colors.normalFont, marginLeft: 24}}>
        //                 留言
        //             </Text>
        //
        //             <TextButton
        //                 numberOfLines={2}
        //                 style={{width: WIDTH - 54, justifyContent: 'flex-end', alignItems: 'flex-end'}}
        //                 textStyle={[{
        //                     color: colors.normalFont,
        //                     textAlign: 'right'
        //                 }, section.buyerRem ? {} : {color: colors.fontHint}]}
        //                 text={section.buyerRem ? section.buyerRem : '可以告诉卖家特殊需求'} onPress={() => {
        //
        //                     SingleLineInputDlg.show({
        //                         title: '留言',
        //                         hint: '可以告诉卖家特殊需求',
        //                         keyboardType: 'default',
        //                         defaultText: section.buyerRem,
        //                         maxLength: 150,
        //                         ...this.props.inputProps,
        //                         onConfirm: (value) => {
        //                             this.store.updateShopRem(section.tenantId, value);
        //                         },
        //                     });
        //                 }}
        //             />
        //         </View>
        //
        //         <View style={{height: 10, backgroundColor: colors.bg}} />
        //     </View>
        // );
    };

    /**
     * 点击选择卡券
     * @param cardType 1/3
     * @param selectedCoupon 当前选中卡券
     */
    onSelectCouponClick = (cardType,selectedCoupon)=>{
        if (!this.store.hasAddress) {
            this.canOrdering = true;
            Toast.show('请选择收货地址');
            return;
        }

        this.props.navigation.navigate('SelectCoupon', {
            goods: this.store.goodsArr,
            isPlat: true,
            cardType: cardType,
            resultCallBack: (coupon)=>{
                this.store.setPlatCoupon(coupon,cardType);
            },
            selectedCoupon: selectedCoupon ? [selectedCoupon] : null,
        });
    }

    onCombinativeTipClick = ()=>{
        Alert.alert('合包服务说明',
            '合包服务是商陆好店为节省买家运费而提供的贴心服务。'
        + '系统将自动识别支持合包服务的卖家，派遣专业的收货员前往取货，通过多包裹合包节省运费，'
        + '将合包送到买家的手中。若您对合包服务有任何疑问，可通过联系好店客服进行咨询。',[{text:'我知道了'}]);
    }

    onSingleFogsTipClick = ()=>{
        Alert.alert('一件代发服务',
            '一件代发服务是商陆好店为节省买家运费而提供的贴心服务。'
            + '系统将自动识别支持一件代发服务的卖家，派遣专业的收货员前往取货，节省买家运费。'
            + '若您有任何疑问，可通过联系好店客服进行咨询。',[{text:'我知道了'}]);
    }


    renderPayInfo = () => {
        //let showPlatSelectItem = !!this.store.platCouponsCount && this.store.platCouponsCount !== 0;
        // let platFeeCoupoinItem = this.store.platCoupons.find((item)=>{
        //     return item.cardType === 3;
        // });
        // if(platFeeCoupoinItem){
        //
        // }

        let feeCoupon = this.store.platCoupons.find((item)=>{
            return item.cardType === 3;
        });
        let favorCoupon = this.store.platCoupons.find((item)=>{
            return item.cardType === 1;
        });
        let favorCouponDesc = favorCoupon
            ? `-¥${this.store.platFavorCouponMoneyTotal}` : this.store.platFavorCouponAvlCount === 0
                ? '当前没有优惠券可用' : `当前有${this.store.platFavorCouponAvlCount}张优惠券可用`;
        let feeCouponDesc = feeCoupon
            ? `-¥${this.store.platFeeCouponMoneyTotal}` : this.store.platFeeCouponAvlCount === 0
                ? '当前没有运费券可用' : `当前有${this.store.platFeeCouponAvlCount}张运费券可用`;
        //  合包/一件代发运费减免金额
        let combinatives_singleLogFeeFavor = NP.round(this.store.feeFavor,2);
        return (
            <View style={{backgroundColor: colors.white}}>
                {

                    <View>
                        {this.store.feeData.isCombinative && (
                            <View>
                                <ListViewTextArrowCell
                                    title={'合包服务'}
                                    tapEnable={false}
                                    subTitle={(
                                        <TouchableOpacity
                                            style={{paddingRight:20}}
                                            hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                                            onPress={this.onCombinativeTipClick}
                                        >
                                            <Image source={require('gsresource/img/tip_red.png')} />
                                        </TouchableOpacity>
                                    )}
                                    accessaryView={(
                                        <Switch
                                            value={this.store.isOpenCombinative}
                                            onValueChange={(value) => {
                                                runInAction(()=>{
                                                    this.store.isOpenCombinative = value;
                                                    // 清空平台运费券
                                                    this.store.setPlatCoupon(null,CouponType.Fee);
                                                    // 清空被合包店铺运费券
                                                    this.store.removeShopSelectFeeCoupon(1);
                                                });
                                            }}
                                        />
                                    )}
                                />
                                <View style={{height: 1, backgroundColor: colors.borderE}} />
                            </View>
                        )}
                        {this.store.feeData.isSingleFog && (
                            <View>
                                <ListViewTextArrowCell
                                    tapEnable={false}
                                    title={'一件代发'}
                                    subTitle={(
                                        <TouchableOpacity
                                            style={{paddingRight:20}}
                                            hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                                            onPress={this.onSingleFogsTipClick}
                                        >
                                            <Image source={require('gsresource/img/tip_red.png')} />
                                        </TouchableOpacity>
                                    )}
                                    accessaryView={(
                                        <Switch
                                            value={this.store.isOpenSingleFogs}
                                            onValueChange={(value) => {
                                                runInAction(()=>{
                                                    this.store.isOpenSingleFogs = value;
                                                    // 清空平台运费券
                                                    this.store.setPlatCoupon(null,CouponType.Fee);
                                                    // 清空被一件代发的店铺运费券
                                                    this.store.removeShopSelectFeeCoupon(2);
                                                });
                                            }}
                                        />
                                    )}
                                />
                                <View style={{height: 1, backgroundColor: colors.borderE}} />
                            </View>
                        )}
                        {(this.store.feeData.isSingleFog || this.store.feeData.isCombinative) && (
                            <View>
                                <View style={styles.feeFavorTipView}>
                                    <Text style={styles.feeFavorText}>
                                        {(this.store.isOpenCombinative || this.store.isOpenSingleFogs) ? ('已为您运费优惠¥:' + combinatives_singleLogFeeFavor) : ('发起后预计运费最多可优惠¥:' + combinatives_singleLogFeeFavor)}
                                    </Text>
                                </View>
                                <View style={{height: 10, backgroundColor: colors.bg}} />
                            </View>
                        )}
                        {this.store.platfromFeeChooseEnable && (
                            <View>
                                <ListViewTextArrowCell
                                    title={'运费优惠'}
                                    subTitleHidden={true}
                                    value={feeCouponDesc}
                                    tapHandler={()=>{
                                        if(!feeCoupon && this.store.platFeeCouponAvlCount <= 0){
                                            Toast.show('当前没有可用平台运费券');
                                            return;
                                        }
                                        this.onSelectCouponClick(3,feeCoupon);
                                    }}
                                    valueTextStyle={this.store.platFeeCouponAvlCount > 0 || feeCoupon ? {color: colors.activeFont} : {color:colors.greyFont}}
                                />
                                <View style={{height: 1, backgroundColor: colors.borderE}} />
                            </View>
                        )}
                        <ListViewTextArrowCell
                            title={'现金优惠'}
                            subTitleHidden={true}
                            value={favorCouponDesc}
                            tapHandler={()=>{
                                if(!favorCoupon && this.store.platFavorCouponAvlCount <= 0){
                                    Toast.show('当前没有可用平台优惠券');
                                    return;
                                }
                                this.onSelectCouponClick(1,favorCoupon);
                            }}
                            valueTextStyle={this.store.platFavorCouponAvlCount > 0 || favorCoupon ? {color: colors.activeFont} : {color:colors.greyFont}}
                        />
                    </View>
                }

                <View style={{height: 10, backgroundColor: colors.bg}} />

                <View>
                    <ListViewTextArrowCell
                        title={'货款总计:'}
                        subTitleHidden={true}
                        arrowHidden={true}
                        accessaryView={(<Text style={styles.moneyTotalText}>{'¥' + this.store.totalCheckMoney}</Text>)}
                    />
                    <ListViewTextArrowCell
                        title={'运费总计:'}
                        subTitleHidden={true}
                        arrowHidden={true}
                        accessaryView={<Text style={styles.moneyTotalText}>{'¥' + this.store.shipFeeMoneyTotal}</Text>}
                    />
                    <ListViewTextArrowCell
                        title={'优惠合计:'}
                        subTitleHidden={true}
                        arrowHidden={true}
                        accessaryView={<Text style={styles.moneyTotalText}>{'-¥' + this.store.activityFavorFinal}</Text>}
                    />
                    <View style={{flexDirection:'row-reverse'}}>
                        <View style={{marginRight:14}}>
                            <Text style={{fontSize:12, color:colors.greyFont}}>{'店铺优惠: -¥' + this.store.sellerFavorTotal}</Text>
                            <Text style={{fontSize:12, color:colors.greyFont,marginTop:7,marginBottom:12}}>{'平台优惠: -¥' + this.store.platFavorTotal}</Text>
                        </View>
                    </View>
                </View>
                <View style={{height: 10, backgroundColor: colors.bg}} />
            </View>
        );
    };

    renderBottom = () => {

        return (
            <View style={{backgroundColor: colors.white}}>

                <DividerLineH />

                <View style={{flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', height: 50}}>
                    <Text style={{color: colors.normalFont, fontSize: fonts.font14}}>
                        应付总额(含运费)
                        <Text style={{color: colors.activeFont, fontSize: fonts.font14}}>
                            {` ¥${this.store.computedFinalPayMoney}`}
                        </Text>
                    </Text>

                    <StatusButton
                        onItemClick={() => {
                            if (this.canOrdering) {
                                if (this.store.canOrderBtnEnable) {
                                    this.checkOrdering();
                                } else {
                                    Alert.alert(this.store.orderBtnunEnableMsg);
                                }
                            }
                        }}
                        style={{width: 80, height: 38, marginRight: 10, marginLeft: 14}}
                        checked={this.state.orderEnable}
                        text={'提交订单'}
                    />

                </View>

            </View>
        );
    };

    /**
     * 删除已经下单了的 item
     * @param data
     */
    deleteShoppingCartItem(data) {
        if (data && data.rows) {
            let sellerIds = [];
            for (let i = 0; i < data.rows.length; i++) {
                let resultItem = data.rows[i];
                /**
                 * 删除购物车store的已下单的记录
                 */
                this.props.shoppingCartStore.deleteShop(resultItem.sellerId);
                sellerIds.push(resultItem.sellerId);
            }

            this.props.shoppingCartStore.deleteGoodsBatchToShoppingCart(sellerIds, (ret, msg) => {
                if (!ret) {
                    Alert.alert(msg);
                }
            });
        }
    }

    onSelectAddressResult = (address, isAddAddress) => {
        this.store.setAcceptInfo(address);
        // 判断是否需要弹出设置默认地址
        if (address && isAddAddress) {
            this.store.hasDefaultRecAddress(address.recInfo.id, (result, ext) => {
                if (!result) {
                    ConfirmAlert.alert('是否设为默认地址?', '', () => {
                        this.store.saveDefaultRecAddrress(ext, (ret, ext) => {
                            if (ret) {
                                Toast.show('设置默认地址成功');
                            } else {
                                Toast.show(ext);
                            }
                        });
                    });
                }
            });
        }
    };

    /**
     * 选择优惠券的回调
     * @param coupon
     * @param cardType
     */
    couponsCallBack = (coupon,cardType) => {
        this.store.setPlatCoupon(coupon,cardType);
    };

    /**
     * 选择地址时，当前选择的地址被删除
     * @param isDeleted
     */
    onSelectAddressDelete = (isDeleted) => {
        if (isDeleted) {
            this.store.setAcceptInfo(null);
        }
    };

    checkOrdering = async () => {
        this.canOrdering = false;
        //提交订单
        if (!this.store.hasAddress) {
            this.canOrdering = true;
            Alert.alert('请选择收货地址');
        } else {
            try {
                this.canOrdering = false;
                Toast.loading();
                let shopItem = this.store.checkSkuCountOutOfRang();
                if (shopItem) {
                    Toast._dismiss();
                    this.canOrdering = true;
                    Alert.alert(`店铺${shopItem.traderName}款式种类超过200个,请分多个订单下单`);
                    return;
                }

                await this.store.requestFreight();
                this.store.correctOrderSkuNumbers(async (msg) => {
                    /**
                     * 如果msg有提示信息 表示有提示
                     * 但是能继续进行下单
                     */
                    if (msg) {
                        //删除了部分商品之后要重新请求运费
                        await this.store.requestFreight();

                        Alert.alert('提示', '有以下商品库存不足' + '\n' + msg + '\n' +
                            '已修改商品数量为最大库存数,是否继续下单购买现有库存商品', [
                            {
                                text: '取消', onPress: () => {
                                    Toast._dismiss();
                                    this.canOrdering = true;
                                    //this.props.navigation.goBack();
                                }
                            },
                            {
                                text: '继续下单', onPress: () => {
                                    this.keepOrdering();
                                }
                            }
                        ],
                        {cancelable: false}
                        );
                    } else {
                        this.keepOrdering();
                    }
                });

            } catch (e) {
                this.canOrdering = true;
                Toast.dismiss();
                Alert.alert(e.message);
            }
        }
    };

    keepOrdering = async () => {
        try {
            let data = await this.store.ordering();
            let failedMsg = this.getFailBillingArrMsg(data.rows);

            let orderIds = this.getSuccessBIllIdsArr(data.rows);
            if (orderIds.length === 0) {
                this.canOrdering = true;
                Toast.dismiss();
                Alert.alert(`订单下单失败,失败原因:\n${failedMsg}`);
                return;
            }
            if (this.fromShoppingCart) {
                /**
                 * 删除购物车在服务端删除,客户端在完成操作之后刷新购物车
                 */
                //this.deleteShoppingCartItem(data);
            }
            Toast.dismiss();
            this.canOrdering = true;
            this.orderSuccess = true;
            /**
             * 部分订单成功提示
             */
            if (orderIds.length !== this.store.orders.length) {

                Alert.alert('支付提示',
                    `部分订单成功,是否继续支付已经成功的订单?\n失败订单原因:\n${failedMsg}`,
                    [
                        {
                            text: '取消',
                            onPress: () => {
                                this.props.navigation.goBack();
                            },
                        },
                        {
                            text: '支付',
                            onPress: () => {
                                // this.props.navigation.replace('ChoicePayMethodScreen', {
                                //     payMoney: data.totalMoney,
                                //     orderIds: orderIds
                                // });
                                this.willGotoPayScreen(data.totalMoney, orderIds);
                            }
                        },
                    ],
                    {
                        cancelable: false,
                    });
            } else {
                // this.props.navigation.replace('ChoicePayMethodScreen', {
                //     payMoney: data.totalMoney,
                //     orderIds: orderIds
                // });
                this.willGotoPayScreen(data.totalMoney, orderIds);
            }

        } catch (e) {
            this.canOrdering = true;
            Toast.dismiss();
            Alert.alert(e.message);
        }
    };

    /**
     * 即将跳转支付
     */
    willGotoPayScreen = (payMoney, orderIds) => {
        let param = {
            payMoney: payMoney,
            orderIds: orderIds
        };
        DeviceEventEmitter.emit('NEW_BILL', param);
        this.props.navigation.replace('ChoicePayMethodScreen', param);
    };

    /**
     * 获取下单失败的订单提示
     * @param rows
     * @returns {Array}
     */

    getFailBillingArrMsg(rows) {
        let msg = '';
        for (let i = 0; i < rows.length; i++) {
            let item = rows[i];
            if (item.isSuccess !== 1) {
                msg += item.failedMsg + '\n';
            }
        }
        return msg;
    }

    /**
     * 获取下单成功的订单的ids
     * @param rows
     * @returns {Array}
     */
    getSuccessBIllIdsArr(rows) {
        let arr = [];
        for (let i = 0; i < rows.length; i++) {
            let item = rows[i];
            if (item.isSuccess === 1) {
                arr.push(item.billId);
            }
        }
        return arr;
    }
}

BillingConfirmScreen.propTypes = propTypes;
export default BillingConfirmScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },
    feeFavorTipView:{
        height:25,
        backgroundColor:colors.orderColor,
        justifyContent:'center'
    },
    feeFavorText:{
        fontSize:12,
        color:colors.white,
        marginLeft:22
    },
    moneyTotalText:{
        color: colors.activeBtn,
        fontSize: fonts.font14,
        fontWeight:'bold'
    }
});