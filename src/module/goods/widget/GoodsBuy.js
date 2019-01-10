/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品详情组件-购买弹出窗
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-21 11:56:34
 * 对外暴露 .goodsBuyShow(el.detailUrl);方法，传入detailUrl
 */
import React, {Component} from 'react';
import {observer, inject, Observer} from 'mobx-react';
import PropTypes from 'prop-types';
import DocSvc from 'svc/DocSvc';
import {
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    View,
    Text,
    Platform,
    SafeAreaView,
    ScrollView,
    DeviceEventEmitter,
    NativeModules,
    NativeEventEmitter,
    InteractionManager,
} from 'react-native';

import {DLFlatList, Toast} from '@ecool/react-native-ui';
import NavigationSvc from 'svc/NavigationSvc';
import Image from 'component/Image';
import Alert from 'component/Alert';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import Modal from 'component/AnimalModal';
import DLFetch from '@ecool/react-native-dlfetch';
import NumberEditView from 'component/NumberEditView';

import isIphoneX from 'utl/PhoneUtl';
import * as _ from 'lodash';
import GoodsBuyStore from '../store/GoodsBuyStore';
import {addShoppingCart, getColorSizeNum} from '../util/GoodsBuyUtil';
import {parseUrl} from 'utl/ParseUrl';
import {wFactor} from 'gsresource/ui/ui';
import ImageViewer from '../../../component/ImageViewer';
import Communications from 'react-native-communications';
import rootStore from 'store/RootStore';
import ImageTextView from '../../../component/ImageTextView';
import IMService from '../../../svc/IMService';
import {SYS_CONFIG_PARAMS} from '../../../store/ConfigStore';
import PhoneUtl from '../../../utl/PhoneUtl';

// import goodsDefaultImg from 'gsresource/img/dressDefaultPic90.png';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const GOOD_SHOP_GUARANTEE_VIEW_H = 33;
const SERVICE_GUARUNTEE_VIEW_H = 33;

// 销售模式，普通，童装普通，童装批发
const NORMAL = 0;
const CHILD_NORMAL = 1;
const CHILD_GROUP = 2;

@inject('shoppingCartStore', 'userStore', 'configStore')
@observer
export default class GoodsBuy extends Component {
    static propTypes = {
        shopMsg: PropTypes.object, // 店铺信息
        couldModalOpen: PropTypes.bool, // modal是否允许被打开
        // buyNow: PropTypes.func// 立即购买的事件
        sourceFrom: PropTypes.number, // 1来自凑单商品列表 0默认
        confirmHandler: PropTypes.func,
    };
    static defaultProps = {
        couldModalOpen: false
    };

    constructor(props) {
        super(props);
        this.GoodsBuyStore = new GoodsBuyStore(); // 引入store
        this.toBillingConfirmScreen = false;
        this.toGoodShopGuaranteeScreen = false;
        this.toServiceGuaranteeScreen = false;
        // 传入id
        this.state = {
            containerHeight:
            500 + GOOD_SHOP_GUARANTEE_VIEW_H + SERVICE_GUARUNTEE_VIEW_H
        };
        this.isAlertNow = false; // 当前是否有alert存在
        this.salesWayId = NORMAL;
        this.confirmHandler = this.props.confirmHandler;
    }

    componentDidMount() {
        this.props.onRef(this);
        IMService.checkIMLoginStatus();

    }

    componentWillUnmount() {
        this.navigateTimeOut && clearTimeout(this.navigateTimeOut);
    }

    componentWillReceiveProps(nextProps) {
        this.confirmHandler = nextProps.confirmHandler;
        let shopMsg = nextProps.shopMsg;
        let trueKeyList = ['clusterCode', 'tenantId', 'tenantName', 'unitId'];
        if (Object.keys(shopMsg).length > 0) {
            trueKeyList.forEach(element => {
                if (shopMsg.hasOwnProperty(element)) {
                    if (shopMsg[element] === '') {
                        console.log(`value,key=${element}需有值`);
                    }
                } else {
                    console.log(`key${element}需存在`);
                }
            });
        }
    }

    static getDocIdsFromDocContent(docContent) {
        let docIds = [];
        let maxPicCount = 9;
        if (docContent) {
            for (let i = 0; i < docContent.length; i++) {
                let item = docContent[i];
                if (item.typeId !== 1) {
                    maxPicCount = 8;
                }
            }

            for (let i = 0; i < docContent.length; i++) {
                let item = docContent[i];
                if (item.typeId === 1 && docIds.length < maxPicCount) {
                    docIds.push(item.docId);
                }
            }
        }

        return docIds;
    }

    render() {
        let goods = this.GoodsBuyStore.goodsDetail;

        if (!goods || !goods.docHeader) {
            return null;
        }
        if (goods.docHeader.length === 0) {
            return null;
        }

        // console.log(DocSvc.docURLS(goods.docHeader[0].docId))
        return (
            <Modal
                ref={(ref) => {
                    this.goodsBuyModal = ref;
                }}
                position='bottom'
                swipeToClose={false}
                coverScreen={true}
                animationDuration={200}
                backButtonClose={true}
                style={{
                    height: this.state.containerHeight,
                    alignItems: 'flex-end'
                }}
                onClosed={() => {
                    if (this.toBillingConfirmScreen) {
                        let {skuList, spu, shop} = addShoppingCart(
                            this.GoodsBuyStore.goodsDetail,
                            this.props.shopMsg
                        );
                        this.navigateTimeOut = setTimeout(() => {
                            NavigationSvc.push('BillingConfirmScreen', {
                                skuArray: skuList,
                                spu: spu,
                                shop: shop,
                                backHandler: () => {
                                    this.toGoodShopGuaranteeScreen = false;
                                    this.toServiceGuaranteeScreen = false;
                                    this.toBillingConfirmScreen = false;
                                }
                            });
                        }, 150);
                    } else if (this.toGoodShopGuaranteeScreen) {
                        NavigationSvc.navigate('GoodShopGuaranteeScreen', {
                            backHandler: () => {
                                if (this.goodBuyResponse) {
                                    this.toGoodShopGuaranteeScreen = false;
                                    this.toServiceGuaranteeScreen = false;
                                    this.toBillingConfirmScreen = false;
                                    this.displayModalContent(
                                        this.goodBuyResponse
                                    );
                                }
                            }
                        });
                    } else if (this.toServiceGuaranteeScreen) {
                        NavigationSvc.navigate('ServiceGuaranteeScreen', {
                            backHandler: () => {
                                if (this.goodBuyResponse) {
                                    this.toGoodShopGuaranteeScreen = false;
                                    this.toServiceGuaranteeScreen = false;
                                    this.toBillingConfirmScreen = false;
                                    this.displayModalContent(
                                        this.goodBuyResponse
                                    );
                                }
                            }
                        });
                    }

                    this.toBillingConfirmScreen = false;
                }}
            >
                <SafeAreaView style={styles.container}>
                    <View>
                        {/*头部信息*/}
                        {this.renderHeader(goods)}
                        {/*好店担保*/}
                        {this.renderGoodShopGuaranteeView()}
                        {/*颜色选择部分*/}
                        {this.renderGoodColorChoose(goods)}
                        {/*好店服务*/}
                        {this.renderServiceGuaranteeView()}
                        {/*尺寸选择部分*/}
                        {this.salesWayId === CHILD_GROUP
                            ? this.renderKidGoodsSizeChoose(goods)
                            : this.renderGoodSizeChoose(goods)
                        }
                    </View>

                    <View style={{marginBottom: isIphoneX() ? 34 : 0}}>
                        {/*总价&&总件数*/}
                        {this.renderGoodTotal(goods)}
                        {/*按钮*/}
                        {this.renderGoodBuyBtn(goods)}
                    </View>
                </SafeAreaView>
            </Modal>
        );
    }

    // 商品头部信息
    renderHeader = (goods) => {
        let isSaleOut = goods.hasOwnProperty('stockNum') && goods.stockNum <= 0;
        return (
            <View style={styles.baseMsgBox}>
                <ImageViewer
                    source={{uri: DocSvc.docURLL(goods.coverUrl)}}
                    defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                    style={{width: 90, height: 90, borderRadius: 2}}
                    docIDs={GoodsBuy.getDocIdsFromDocContent(goods.docContent)}
                    index={0}
                />
                <View style={styles.goodsNamePriceBox}>
                    <Text
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                        style={[
                            styles.goodsName,
                            goods.hasOwnProperty('stockNum') &&
                            goods.stockNum <= 0
                                ? styles.sellOutOpacity
                                : {}
                        ]}
                    >
                        {goods.title}
                    </Text>
                    <Text
                        style={[
                            styles.goodsPrice,
                            goods.hasOwnProperty('stockNum') &&
                            goods.stockNum <= 0
                                ? styles.sellOutOpacity
                                : {}
                        ]}
                    >
                        {/*todo 后期需要改动算法*/}
                        {/*实际价位*/}
                        {/*折扣价*/}
                        ¥{goods.price}
                    </Text>
                </View>
                {isSaleOut && (
                    <Image
                        style={styles.sellOut}
                        source={require('gsresource/img/sellOutBig.png')}
                    />
                )}
                {/*<TouchableOpacity*/}
                {/*style={styles.phone}*/}
                {/*onPress={this.callPhone.bind(this)}*/}
                {/*hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}*/}
                {/*>*/}
                {/*<View style={styles.phoneImg}>*/}
                {/*<Image source={require('gsresource/img/phone.png')}/>*/}
                {/*</View>*/}
                {/*<Text style={styles.phoneText}>联系客服</Text>*/}
                {/*</TouchableOpacity>*/}
            </View>
        );
    };

    // 好店担保View
    renderGoodShopGuaranteeView = () => {
        return (
            <TouchableOpacity
                style={{
                    flexDirection: 'row',
                    height: GOOD_SHOP_GUARANTEE_VIEW_H,
                    alignItems: 'center',
                    backgroundColor: '#7ed321'
                }}
                onPress={() => {
                    this.toGoodShopGuaranteeScreen = true;
                    this.closeModal();
                    // NavigationSvc.navigate('GoodShopGuaranteeScreen', {
                    //     backHandler: () => {
                    //         if (this.goodBuyResponse) {
                    //             this.displayModalContent(this.goodBuyResponse);
                    //         }
                    //     }
                    // });
                }}
            >
                <View style={{marginLeft: 16, marginRight: 10}}>
                    <Image
                        source={require('gsresource/img/guaruntee_small.png')}
                    />
                </View>
                <Text style={{marginRight: 10, fontSize: 12, color: 'white'}}>
                    商陆好店担保
                </Text>
                <Text style={{fontSize: 10, color: 'white'}}>
                    全程护航，购物无忧
                </Text>
            </TouchableOpacity>
        );
    };

    // 商品颜色选择View
    renderGoodColorChoose(goods) {
        return (
            <View style={styles.colorBox}>
                <View style={styles.colorTitleBox}>
                    <Text style={styles.colorTitle}>颜色</Text>
                </View>
                <ScrollView style={{maxHeight: 34 * 3}}>
                    <View style={styles.colorDetailList}>
                        {goods.skuList.map((element, index) => {
                            return (
                                <View key={index} style={styles.colorDetailBox}>
                                    <TouchableOpacity
                                        style={[
                                            styles.colorBtn,
                                            element.active === true &&
                                            !(
                                                goods.hasOwnProperty(
                                                    'stockNum'
                                                ) && goods.stockNum <= 0
                                            )
                                                ? styles.colorBtnActive
                                                : {}
                                        ]}
                                        onPress={() => {
                                            this.colorClick(element);
                                        }}
                                    >
                                        <Text
                                            style={[
                                                styles.colorText,
                                                element.active === true &&
                                                !(
                                                    goods.hasOwnProperty(
                                                        'stockNum'
                                                    ) && goods.stockNum <= 0
                                                )
                                                    ? styles.colorTextActive
                                                    : {}
                                            ]}
                                        >
                                            {element.caption}
                                        </Text>
                                    </TouchableOpacity>
                                    {element.buyNum > 0 && (
                                        <View
                                            style={[
                                                styles.colorBadgeBtn,
                                                styles.colorBadgeBtnActive
                                                // element.active === true
                                                //     ? styles.colorBadgeBtnActive
                                                //     : {}
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.colorBadgeText,
                                                    styles.colorBadgeTextActive
                                                    // element.active ===
                                                    // true
                                                    //     ? styles.colorBadgeTextActive
                                                    //     : {}
                                                ]}
                                            >
                                                {element.buyNum}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                </ScrollView>
            </View>
        );
    }

    // 服务保障View
    renderServiceGuaranteeView = () => {
        let myWfactor = wFactor >= 1 ? 1 : wFactor;
        return (
            <Observer>
                {() => (
                    <TouchableOpacity
                        style={{
                            flexDirection: 'row',
                            height: GOOD_SHOP_GUARANTEE_VIEW_H,
                            alignItems: 'center',
                            borderTopWidth: 1,
                            borderTopColor: '#eeeeee'
                        }}
                        onPress={() => {
                            this.toServiceGuaranteeScreen = true;
                            this.closeModal();
                        }}
                    >
                        <View
                            style={{
                                flex: 1,
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginLeft: 20
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 12 * myWfactor,
                                    color: colors.title,
                                    marginRight: 12 * myWfactor
                                }}
                            >
                                服务:
                            </Text>
                            {rootStore.configStore &&
                            rootStore.configStore.serviceGuaranteeItems
                                .slice(0, 3)
                                .map((item, index) => {
                                    return (
                                        <View
                                            key={index}
                                            style={{
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                marginRight: 12 * myWfactor,
                                                maxWidth: 83 * wFactor
                                            }}
                                        >
                                            <Image
                                                source={require('gsresource/img/check_pink.png')}
                                            />
                                            <Text
                                                style={{
                                                    fontSize:
                                                    12 * myWfactor,
                                                    color: colors.title,
                                                    marginLeft: 5,
                                                }}
                                                numberOfLines={1}
                                            >
                                                {item.name}
                                            </Text>
                                        </View>
                                    );
                                })}
                        </View>
                        <View style={{marginRight: 14, paddingLeft: 4}}>
                            <Image
                                source={require('gsresource/img/arrowRight.png')}
                            />
                        </View>
                    </TouchableOpacity>
                )}
            </Observer>
        );
    };

    // 商品尺寸选择View
    renderGoodSizeChoose(goods) {
        return goods.skuList.map((element, index) => {
            return (
                <View style={styles.buySize} key={index}>
                    {element.active && (
                        <View style={[styles.buySizeTr, styles.buySizeTheader]}>
                            <View style={[styles.buySizeTd, styles.size]}>
                                <Text style={styles.buyText}>尺码</Text>
                            </View>
                            <View style={[styles.buySizeTd, styles.buy]}>
                                <Text
                                    style={[
                                        styles.buyText,
                                        {marginRight: 55}
                                    ]}
                                >
                                    数量
                                </Text>
                            </View>
                        </View>
                    )}
                    {element.active && (
                        <ScrollView
                            style={{
                                maxHeight: 47 * 3,
                                borderBottomColor: colors.borderE,
                                borderBottomWidth: 1,
                                borderTopColor: colors.borderE,
                                borderTopWidth: 1
                            }}
                        >
                            {element.sizeList.map((elem, idx) => {
                                const groupNum = elem.groupNum
                                    ? elem.groupNum
                                    : 1;

                                return (
                                    <View key={idx} style={styles.buySizeTr}>
                                        <View
                                            style={[
                                                styles.buySizeTd,
                                                styles.size
                                            ]}
                                        >
                                            <Text
                                                numberOfLines={1}
                                                ellipsizeMode={'tail'}
                                                style={[
                                                    styles.buyText,
                                                    goods.hasOwnProperty(
                                                        'stockNum'
                                                    ) && goods.stockNum <= 0
                                                        ? styles.sellOutOpacity
                                                        : {}
                                                ]}
                                            >
                                                {elem.caption}
                                                {/*库={elem.num}*/}
                                            </Text>
                                            {!(
                                                goods.hasOwnProperty(
                                                    'stockNum'
                                                ) && goods.stockNum <= 0
                                            ) &&
                                            elem.hasOwnProperty('num') &&
                                            elem.num < groupNum && (
                                                <Image
                                                    style={
                                                        styles.sellOutMin
                                                    }
                                                    source={require('gsresource/img/sellOutMin.png')}
                                                />
                                            )}
                                        </View>
                                        <View
                                            style={[
                                                styles.buySizeTd,
                                                styles.buy
                                            ]}
                                        >
                                            <NumberEditView
                                                minNum={0}
                                                maxNum={elem.num}
                                                inputDirect={true}
                                                maxLenegth={4}
                                                defaultText={elem.buyNum}
                                                editable={
                                                    !(
                                                        (goods.hasOwnProperty(
                                                            'stockNum') &&
                                                            goods.stockNum <=
                                                            0) ||
                                                        (elem.hasOwnProperty(
                                                            'num') &&
                                                            elem.num < groupNum)
                                                    )
                                                }
                                                onTextChange={value => {
                                                    this.GoodsBuyStore.goodsColorSizeMinusAdd(
                                                        element,
                                                        elem,
                                                        value
                                                    );
                                                }}
                                                style={[{marginTop: 3}]}
                                                onceChange={groupNum}
                                            />
                                        </View>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    )}
                </View>
            );
        });
    }

    /**
     * 童装批量模式
     * @param {*} goods
     */
    renderKidGoodsSizeChoose(goods) {
        return goods.skuList.map((element, index) => {
            const maxNum = this.GoodsBuyStore.getMaxNumInGroup(element);
            const saleOutStyle = maxNum < 1 ? {opacity: 0.3} : {};
            return (
                <View style={styles.buySize} key={index}>
                    {element.active && (
                        <React.Fragment>
                            <View style={[styles.buySizeTr, styles.buySizeTheader]}>
                                <View style={[styles.buySizeTd, styles.size]}>
                                    <Text style={styles.buyText}>尺码</Text>
                                </View>
                            </View>
                            <View style={[styles.sizeGroup, saleOutStyle]}>
                                <ScrollView
                                    horizontal={true}
                                    bounces={false}
                                >
                                    {element.sizeList.map((item, index) => {
                                        return <Text key={index} style={styles.sizeGroupText}>{item.caption}</Text>;
                                    })}
                                </ScrollView>
                            </View>
                            <View style={[styles.buySizeTr, styles.buySizeTheader]}>
                                <View style={[styles.buySizeTd, styles.size, styles.numContainer]}>
                                    <Text style={styles.buyText}>组数</Text>
                                </View>
                            </View>
                            <View style={[styles.btnContainer]}>
                                {
                                    maxNum < 1 &&
                                    <Image
                                        style={[styles.sellOutMin, {left: 60}]}
                                        source={require('gsresource/img/sellOutMin.png')}
                                    />

                                }
                                <NumberEditView
                                    minNum={0}
                                    maxNum={maxNum}
                                    inputDirect={true}
                                    maxLength={4}
                                    defaultText={element.sizeList[0].buyNum}
                                    editable={!(maxNum <= 0 && goods.hasOwnProperty(
                                        'stockNum') &&
                                        goods.stockNum <=
                                        0)}
                                    onTextChange={value => {
                                        this.GoodsBuyStore.kidGoodsColorSizeMinusAdd(
                                            element,
                                            value
                                        );
                                    }}
                                    style={[saleOutStyle, {
                                        marginTop: 3,
                                        justifyContent: 'space-between',
                                        width: '100%'
                                    }]}
                                    textPosition={'left'}
                                    unit={'组'}
                                />
                            </View>
                        </React.Fragment>
                    )}
                </View>
            );
        });
    }

    // 总价&&总件数View
    renderGoodTotal(goods) {
        return (
            <View
                style={{
                    borderBottomWidth: 1,
                    borderBottomColor: colors.borderE
                }}
            >
                <Text
                    style={{
                        paddingTop: 10,
                        paddingRight: 10,
                        paddingBottom: 10,
                        textAlign: 'right',
                        fontSize: 12,
                        color: colors.normalFont
                    }}
                >
                    共
                    {
                        this.salesWayId === CHILD_GROUP &&
                        <React.Fragment>
                            <Text style={{color: colors.activeFont}}>
                                {this.GoodsBuyStore.totalGroupNum}
                            </Text>
                            组
                        </React.Fragment>
                    }
                    <Text style={{color: colors.activeFont}}>
                        {goods.buyNum}
                    </Text>
                    件，
                    <Text style={{color: colors.activeFont}}>
                        ¥{goods.buyPay}
                    </Text>
                </Text>
            </View>
        );
    }

    // 立即购买按钮
    renderGoodBuyBtn(goods) {
        // 获取系统参数配置 是否显示IM
        return (
            <View style={styles.buyBtnList}>
                {this.props.configStore.isShowIm() && (
                    <View
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <ImageTextView
                            ref={imServiceButton =>
                                (this.imServiceButton = imServiceButton)
                            }
                            text={'联系卖家'}
                            requireIcon={require('gsresource/img/msgDisable.png')}
                            onItemClick={this.goToIMWithGoodsInfo}
                            textStyle={styles.linkBtn}
                        />
                    </View>
                )}
                <View
                    style={{alignItems: 'center', justifyContent: 'center'}}
                >
                    <ImageTextView
                        text={'联系客服'}
                        requireIcon={require('gsresource/img/goodsbuyContactSeller.png')}
                        onItemClick={this.callPhone}
                        textStyle={styles.linkBtn}
                    />
                </View>
                {this.props.sourceFrom === 1 && (
                    <TouchableOpacity
                        style={[
                            styles.buyBtn,
                            goods.hasOwnProperty('stockNum') && goods.stockNum <= 0
                                ? {backgroundColor: '#9b9b9b'}
                                : {}
                        ]}
                        onPress={() => {
                            this.onAddToOrderClick();
                        }}
                    >
                        <Text style={styles.buyBtnText}>加入订单</Text>
                    </TouchableOpacity>
                )}
                {this.props.sourceFrom !== 1 && (
                    <View style={{flex:1,flexDirection:'row'}}>
                        <TouchableOpacity
                            style={[
                                styles.buyBtn,
                                goods.hasOwnProperty('stockNum') && goods.stockNum <= 0
                                    ? {backgroundColor: '#d4d4d4'}
                                    : {backgroundColor: '#ffdfe9'}
                            ]}
                            onPress={() => {
                                this.addShoppingCart();
                            }}
                        >
                            <Text
                                style={[
                                    styles.buyBtnText,
                                    goods.hasOwnProperty('stockNum') &&
                                    goods.stockNum <= 0
                                        ? {color: '#fff'}
                                        : {color: '#ff6699'}
                                ]}
                            >
                                加入进货车
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.buyBtn,
                                goods.hasOwnProperty('stockNum') && goods.stockNum <= 0
                                    ? {backgroundColor: '#9b9b9b'}
                                    : {}
                            ]}
                            onPress={() => {
                                this.buyNow();
                            }}
                        >
                            <Text style={styles.buyBtnText}>立即购买</Text>
                        </TouchableOpacity>
                    </View>
                )}

            </View>
        );
    }

    /**
     * 携带商品信息到IM聊天界面
     * @returns {Promise<void>}
     */
    goToIMWithGoodsInfo = async () => {
        if (!this.imServiceButton.clickDisabled) {
            this.imServiceButton.clickDisabled = true;
            try {
                // Toast.loading();
                let unitId = this.props.shopMsg.unitId;
                let data = await IMService.fetchSellerIMTeamId(
                    this.props.userStore.user.userId,
                    unitId
                );
                // Toast.dismiss();
                if (this.GoodsBuyStore.goodsDetailMsg) {
                    // 构建商品提示信息所需对象
                    let goodsMsg = IMService.createGoodsTipMsg(
                        this.GoodsBuyStore.goodsDetailMsg.id + '',
                        this.GoodsBuyStore.goodsDetailMsg.title,
                        this.GoodsBuyStore.goodsDetailMsg.price + '',
                        DocSvc.docURLM(this.GoodsBuyStore.goodsDetailMsg.coverUrl)
                    );
                    IMService.showIMScreenWithGoodsInfo(data.tid, goodsMsg);
                } else {
                    IMService.showIMScreen(data.tid);
                }
                this.imServiceButton.clickDisabled = false;
            } catch (error) {
                Toast.dismiss();
                Alert.alert(error.message);
                this.imServiceButton.clickDisabled = false;
            }
        }
    };

    // 对外暴露方法
    goodsBuyShow(detailUrl) {
        let baseUrl = DLFetch.getBaseUrl();
        // console.log(detailUrl);
        if (detailUrl) {
            Toast.loading();
            let fullUrl = '';
            if (detailUrl.indexOf('http') === 0) {
                fullUrl = `${detailUrl}`;
            } else {
                fullUrl = `${baseUrl}${detailUrl}`;
            }
            try {
                this.GoodsBuyStore.getGoodsDetail(fullUrl)
                    .then(res => {
                        Toast.dismiss();
                        // 记录当前返回结果
                        this.goodBuyResponse = res;
                        // let spu = res.spu;
                        // let docHeader = spu.docHeader;
                        if (res['skus'].length > 0) {
                            this.displayModalContent(res);
                            // this.goodsBuyModal.open();
                        } else {
                            Alert.alert(
                                '该商品不存在颜色或款号，无法购买！',
                                []
                            );
                        }
                    })
                    .catch(err => {
                        Toast.dismiss();
                        Alert.alert(err['message']);
                    });
            } catch (e) {
                Toast.dismiss();
                Alert.alert('url参数错误！');
            }
        } else {
            Alert.alert('url参数错误！');
        }
        this.getShopPhone();
    }

    goodsBuyAgain(detailUrl, orderDetailUrl) {
        let baseUrl = DLFetch.getBaseUrl();
        // console.log(detailUrl);
        if (detailUrl) {
            Toast.loading();
            let fullUrl = '';
            let orderFullUrl = '';
            if (detailUrl.indexOf('http') === 0) {
                fullUrl = `${detailUrl}`;
                orderFullUrl = `${orderDetailUrl}`;
            } else {
                fullUrl = `${baseUrl}${detailUrl}`;
                orderFullUrl = `${baseUrl}${orderDetailUrl}`;
            }
            try {
                this.GoodsBuyStore.getGoodsDetailAgain(fullUrl, orderFullUrl)
                    .then(res => {
                        Toast.dismiss();
                        // 记录当前返回结果
                        this.goodBuyResponse = res;
                        // let spu = res.spu;
                        // let docHeader = spu.docHeader;
                        if (res['skus'].length > 0) {
                            this.displayModalContent(res);
                            // this.goodsBuyModal.open();
                        } else {
                            Alert.alert(
                                '该商品不存在颜色或款号，无法购买！',
                                []
                            );
                        }
                    })
                    .catch(err => {
                        Toast.dismiss();
                        Alert.alert(err['message']);
                    });
            } catch (e) {
                Toast.dismiss();
                Alert.alert('url参数错误！');
            }
        } else {
            Alert.alert('url参数错误！');
        }
        this.getShopPhone();
    }

    // 关闭
    closeModal = () => {
        if (!this.isAlertNow) {
            if (this.goodsBuyModal) {
                this.toBillingConfirmScreen = false;
                this.goodsBuyModal.close();
            }
        }
    };
    // 计算高度的函数
    displayModalContent = res => {
        let {colorNum, sizeNum} = getColorSizeNum(res['skus']);
        this.salesWayId = res.spu.salesWayId;
        let containerHeight = SERVICE_GUARUNTEE_VIEW_H +
            GOOD_SHOP_GUARANTEE_VIEW_H +
            (90 + 15 * 2) +
            1 +
            (10 * 2 + 24 + Math.min(Math.ceil(colorNum / 4), 3) * 34) +
            (46 + 46 * 3 + 40) +
            40 +
            (isIphoneX() ? 34 : 0);
        if (this.salesWayId === CHILD_GROUP) {
            containerHeight = containerHeight - 46 * 3 + 50 * 2 + 47.5;
        }
        this.setState(
            {
                containerHeight
            },
            () => {
                this.goodsBuyModal.open();
            }
        );
    };

    // 获取电话
    getShopPhone() {
        let tenantId = this.props.shopMsg.tenantId;
        this.GoodsBuyStore.getShopPhone(tenantId);
    }

    // 拨打电话
    callPhone = () => {
        let {
            customPhoneType,
            customNo: phoneNum
        } = this.GoodsBuyStore.phoneMsg;
        let userMobile = rootStore.userStore.user.mobile;

        if (customPhoneType === 3) {
            if (userMobile.toString() === phoneNum.toString()) {
                Alert.alert('买家电话和卖家不能使用同一个号码');
            } else {
                Toast.loading();
                this.GoodsBuyStore.bindDummyPhone({
                    callerNum: userMobile,
                    calleeNum: phoneNum
                })
                    .then(res => {
                        Toast.dismiss(() => {
                            this.isAlertNow = true;
                            Alert.alert(
                                '好店提示',
                                `您可以使用手机号 ${userMobile} ，联系对方(对方使用虚拟号码  ${
                                    this.GoodsBuyStore.dummyPhone.relationNum} )！`,
                                [
                                    {
                                        text: '拨打电话',
                                        onPress: () => {
                                            // 新增电话挂断监听
                                            let callManagerEmitter = new NativeEventEmitter(
                                                NativeModules.DLCallCenterManager
                                            );
                                            NativeModules.DLCallCenterManager.registerCallStateListener();
                                            this.deEmitterPhone = callManagerEmitter.addListener(
                                                'phoneCallStateChange',
                                                result => {
                                                    if (result === 4) {
                                                        this.GoodsBuyStore.unBindDummyPhone()
                                                            .then(res => {
                                                                console.log(
                                                                    res
                                                                );
                                                            })
                                                            .catch(err => {
                                                                console.log(
                                                                    err
                                                                );
                                                            });
                                                    }
                                                }
                                            );
                                            this.isAlertNow = false;
                                            Communications.phonecall(
                                                this.GoodsBuyStore.dummyPhone
                                                    .relationNum,
                                                true
                                            );
                                        }
                                    },
                                    {
                                        text: '关闭',
                                        onPress: () => {
                                            this.isAlertNow = false;
                                        },
                                        style: 'cancel'
                                    }
                                ],
                                {cancelable: false}
                            );
                        });
                    })
                    .catch(err => {
                        Toast.show('虚拟号码无法获取，请联系客服处理！');
                    });
            }
        } else if (customPhoneType === 1) {
            if (phoneNum) {
                Toast.show('该商家未开通客服电话，将由好店客服为您服务！');
                Communications.phonecall(phoneNum, true);
            } else {
                Toast.show('号码无法获取，请联系客服处理！');
            }
        } else {
            if (phoneNum) {
                Communications.phonecall(phoneNum, true);
            } else {
                Toast.show('号码无法获取，请联系客服处理！');
            }
        }
    };

    // 点击选择某个颜色
    colorClick(color) {
        this.GoodsBuyStore.colorClick(color);
    }

    // 加入购物车
    addShoppingCart() {
        let goods = this.GoodsBuyStore.goodsDetail;
        if (goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) {
            Toast.show('该商品已经售罄');
        } else {
            try {
                let {skuList, spu, shop} = addShoppingCart(
                    this.GoodsBuyStore.goodsDetail,
                    this.props.shopMsg
                );
                if (skuList.length) {
                    // Toast.loading();
                    this.toBillingConfirmScreen = false;
                    this.toGoodShopGuaranteeScreen = false;
                    this.goodsBuyModal.close();
                    InteractionManager.runAfterInteractions(() => {
                        this.props.shoppingCartStore.addSkuArray(
                            skuList,
                            spu,
                            shop,
                            (ret, msg) => {
                                Toast._dismiss();
                                if (!ret) {
                                    Toast.show(msg, 3);
                                } else {
                                    Toast.show('加入进货车成功');
                                }
                            },
                            false
                        );
                    });

                    // console.log('加入进货车方法需要优化！');
                    // this.goodsBuyModal.close();
                } else {
                    // Alert.alert('请先选择商品！');
                    this.isAlertNow = true;
                    Alert.alert(
                        '提示',
                        '请先选择商品！',
                        [
                            {
                                text: '确定',
                                onPress: () => {
                                    this.isAlertNow = false;
                                }
                            }
                        ],
                        {cancelable: false}
                    );
                }
            } catch (e) {
                Toast._dismiss();
                Toast.show('本商品存在问题，无法加入购物车');
            }
        }
    }

    onAddToOrderClick = ()=>{
        let goods = this.GoodsBuyStore.goodsDetail;
        if (goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) {
            Toast.show('该商品已经售罄');
        } else {
            try {
                let {skuList, spu, shop} = addShoppingCart(
                    this.GoodsBuyStore.goodsDetail,
                    this.props.shopMsg
                );
                if (skuList.length) {
                    this.goodsBuyModal.close();
                    if(this.confirmHandler){
                        this.confirmHandler({
                            skuList:skuList,
                            spu:spu,
                            shop:shop,
                        });
                    }
                } else {
                    Toast.show('请先选择商品！');
                }
            } catch (e) {
                Toast.show('本商品存在问题，无法购买');
            }
        }
    }

    // 立即购买
    buyNow() {
        let goods = this.GoodsBuyStore.goodsDetail;
        if (goods.hasOwnProperty('stockNum') && goods.stockNum <= 0) {
            Toast.show('该商品已经售罄');
        } else {
            try {
                let {skuList, spu, shop} = addShoppingCart(
                    this.GoodsBuyStore.goodsDetail,
                    this.props.shopMsg
                );
                if (skuList.length) {
                    this.toBillingConfirmScreen = true;
                    this.toGoodShopGuaranteeScreen = false;
                    this.goodsBuyModal.close();
                } else {
                    Toast.show('请先选择商品！');
                }
            } catch (e) {
                Toast.show('本商品存在问题，无法购买');
            }
        }
    }
}

const mainLayout = {
    container: {
        height: '100%',
        width: WIDTH,
        backgroundColor: '#fff',
        justifyContent: 'space-between'
    },
    baseMsgBox: {
        flexDirection: 'row',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        justifyContent: 'flex-start',
        position: 'relative'
    },
    colorBox: {
        padding: 10
    }
};
const baseMsgBox = {
    goodsImgBox: {
        width: 90,
        height: 90
    },
    goodsImg: {
        width: 90,
        height: 90
    },
    goodsNamePriceBox: {
        height: 90,
        paddingLeft: 20,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    },
    goodsName: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.normalFont
    },
    goodsPrice: {
        fontSize: 18,
        height: 24,
        color: colors.activeFont
    },
    sellOut: {
        position: 'absolute',
        right: 30,
        top: 30
    },
    phone: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        zIndex: 2,
        justifyContent: 'center',
        flex: 1
    },
    phoneImg: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    phoneText: {
        color: colors.activeFont,
        fontSize: 10,
        lineHeight: 16,
        height: 16,
        flex: 1
    },
    sizeGroup: {
        paddingLeft: 7,
        // height: 50,
        backgroundColor: colors.white,
        flexDirection: 'row'
    },
    sizeGroupText: {
        fontSize: 16,
        paddingLeft: 23,
        lineHeight: 50
    },
    numContainer: {
        justifyContent: 'space-between',
        flexDirection: 'row',
        paddingRight: 20,
    },
    btnContainer: {
        height: 50,
        paddingHorizontal: 20,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: colors.borderE,
        borderBottomWidth: 1
    }
};
const buyColor = {
    colorTitleBox: {
        height: 24,
        paddingTop: 5,
        paddingLeft: 20
    },
    colorTitle: {
        fontSize: 14,
        color: colors.normalFont
    },
    colorDetailList: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    colorDetailBox: {
        width: (WIDTH - 20) / 4,
        padding: 5,
        position: 'relative'
    },
    colorBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.borderE
    },
    colorBtnActive: {
        backgroundColor: colors.activeBtn
    },
    colorText: {
        fontSize: 12,
        color: colors.greyFont,
        textAlign: 'center'
    },
    colorTextActive: {
        color: colors.white
    },
    colorBadgeBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 10,
        height: 14,
        borderRadius: 7,
        paddingLeft: 3,
        paddingRight: 3,
        backgroundColor: colors.borderE,
        position: 'absolute',
        right: 0,
        top: 0,
        zIndex: 1,
        overflow: 'hidden'
    },
    colorBadgeBtnActive: {
        backgroundColor: colors.activeBtn
    },
    colorBadgeText: {
        fontSize: 12,
        color: colors.greyFont
    },
    colorBadgeTextActive: {
        color: colors.white
    }
};
const buySize = {
    buySize: {
        position: 'relative'
        // flex: 1,
        // height: 46 * 5,
        // maxHeight: 46 * 5
    },
    buySizeTheader: {
        backgroundColor: colors.borderE
    },
    buySizeTr: {
        flexDirection: 'row',
        borderBottomColor: colors.borderE,
        borderBottomWidth: 1
    },
    buySizeTd: {
        paddingTop: 8,
        paddingBottom: 8
    },
    size: {
        flex: 1,
        paddingLeft: 30
    },
    buy: {
        width: 150,
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingRight: 20
    },
    buyNum: {
        paddingLeft: 30,
        paddingRight: 30
    },
    buyText: {
        paddingTop: 8,
        paddingBottom: 8,
        fontSize: 14,
        lineHeight: 14
    },
    sellOutMin: {
        position: 'absolute',
        right: 20,
        top: 5
    },
    buySizeTfooter: {
        paddingTop: 8,
        paddingBottom: 8
    }
};
const buyBtn = {
    buyBtnList: {
        height: 40,
        flexDirection: 'row'
    },
    buyBtn: {
        //width: WIDTH / 2,
        flex: 1,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ff6699'
    },
    buyBtnText: {
        fontSize: 14,
        color: '#fff'
    },
    linkBtn: {
        fontSize: 8,
        color: colors.greyFont
    }
};
const styles = StyleSheet.create({
    ...mainLayout,
    ...baseMsgBox,
    ...buyColor,
    ...buySize,
    ...buyBtn,
    sellOutOpacity: {
        opacity: 0.5
    }
});
