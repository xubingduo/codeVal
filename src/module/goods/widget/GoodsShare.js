/**
 *@author xbu
 *@date 2018/11/30
 *@desc  商品详情分享
 *
 */

import React, {Component} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    Dimensions,
    TextInput,
    Keyboard,
    Switch,
    Platform,
    ScrollView,
} from 'react-native';

import {Popup} from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import PropTypes from 'prop-types';
import Image from 'component/Image';
import DocSvc from 'svc/DocSvc';
import {Toast} from '@ecool/react-native-ui';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import NP from 'number-precision';
import GoodsShareStore from '../store/GoodsShareStore';
import Alert from 'component/Alert';
import ChooseRate from './widget/ChooseRate';


const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const priceRate = ['50', '60', '70', '80', '90', '100', '120', '150', '200'];
const salesRate = ['60', '70', '80', '90', '100', '120', '150', '200', '300'];

export default class GoodsShare extends Component {
    static propTypes = {
        // 弹框消失可以执行的方法
        onDismiss: PropTypes.func,
        // 分享参数
        data: PropTypes.object,
        // 二维码参数
        baseImg: PropTypes.string,
        // 点击左边图片
        onClickLeft: PropTypes.func,
        // 点击右边图片
        onClickRight: PropTypes.func,
        unitId: PropTypes.number
    };

    static defaultPropTypes = {
        onValueChanged: () => null,
        goodsPopShow: false,
        data: {},
        onDismiss: () => null,
        chooseItemCallback: () => null,
    };

    constructor(props) {
        super(props);
        this.store = new GoodsShareStore();
        this.state = {
            showType: true,
            shareType: 1,
            // 原价
            originalPrice: '',
            // 促销价格
            defPrice: '',
            // 好店价格
            eCoolPrice: '',
            bar: 3,
            heightTop: HEIGHT * 0.4,
            // 价格
            priceNom: '',
            // 价格加价率
            priceNomRate: '',
            // 原价高
            priceOrg: '',
            // 原价加价率
            priceOrgRate: '',
            // 促销价格
            priceGive: '',
            // 促销价加价率
            priceGiveRate: '',
            // 开关
            value: false,
            showPriceRate: false,
            showPriceRate2: false,
            showPriceRate3: false,
        };
    }

    // TODO
    getParams = async () => {

        let obj = {
            jsonParam: {
                domainKind: 'business',
                ownerKind: 7,
                ownerId: this.props.unitId,
                codes: 'spuShare_promotePriceRate,spuShare_oriPriceRate,spuShare_isNeedPriceRate,spuShare_priceOpt',
            }
        };
        try {
            let {data} = await this.store.fetchConfigParams(obj);
            let bar = 0;
            let value = false;
            let promotePriceRate = '0';
            let oriPriceRate = '0';

            data.rows.forEach(val => {
                console.log(val);
                let code = val.code;
                if (code === 'spuShare_priceOpt') {
                    // 价格选项
                    bar = parseInt(val.val);
                } else if (code === 'spuShare_isNeedPriceRate') {
                    // 是否需要加价率
                    if (val.val === '1') {
                        value = true;
                    } else {
                        value = false;
                    }
                } else if (code === 'spuShare_oriPriceRate') {
                    // 原价加价率
                    oriPriceRate = val.val;
                } else if (code === 'spuShare_promotePriceRate') {
                    // 促销价加价率
                    promotePriceRate = val.val;
                }
            });

            if (bar === 0 && value) {
                this.setState({
                    bar: bar,
                    priceNom: '',
                    // 价格加价率
                    priceNomRate: '',
                    // 原价高
                    priceOrg: '',
                    // 原价加价率
                    priceOrgRate: '',
                    // 促销价格
                    priceGive: '',
                    // 促销价加价率
                    priceGiveRate: '',
                    // 开关
                    value: value,
                });

            } else if (bar === 1) {

                if (value) {
                    let params = this.props.data.price;
                    let rate = NP.plus(1, oriPriceRate);
                    let showPrice = NP.round(NP.times(rate, params), 0).toString();
                    this.setState({
                        bar: bar,
                        defPrice: showPrice,
                        priceNom: showPrice,
                        // 价格加价率
                        priceNomRate: NP.times(oriPriceRate, 100).toString(),
                        // 原价高
                        priceOrg: '',
                        // 原价加价率
                        priceOrgRate: '',
                        // 促销价格
                        priceGive: '',
                        // 促销价加价率
                        priceGiveRate: '',
                        // 开关
                        value: value,
                    });
                } else {
                    this.setState({
                        bar: bar,
                        priceNom: '',
                        // 价格加价率
                        priceNomRate: '',
                        // 原价高
                        priceOrg: '',
                        // 原价加价率
                        priceOrgRate: '',
                        // 促销价格
                        priceGive: '',
                        // 促销价加价率
                        priceGiveRate: '',
                        // 开关
                        value: value,
                    });
                }

            } else if (bar === 2) {
                if (value) {
                    let params = this.props.data.price;
                    let rate = NP.plus(1, oriPriceRate);
                    let rate2 = NP.plus(1, promotePriceRate);
                    let showPrice = NP.round(NP.times(rate, params), 0).toString();
                    let showPrice2 = NP.round(NP.times(rate2, params), 0).toString();

                    this.setState({
                        bar: bar,
                        originalPrice: showPrice,
                        defPrice: showPrice2,
                        priceNom: '',
                        // 价格加价率
                        priceNomRate: '',
                        // 原价高
                        priceOrg: showPrice,
                        // 原价加价率
                        priceOrgRate: NP.times(oriPriceRate, 100).toString(),
                        // 促销价格
                        priceGive: showPrice2,
                        // 促销价加价率
                        priceGiveRate: NP.times(promotePriceRate, 100).toString(),
                        // 开关
                        value: value,
                    });
                } else {
                    this.setState({
                        bar: bar,
                        priceNom: '',
                        // 价格加价率
                        priceNomRate: '',
                        // 原价高
                        priceOrg: '',
                        // 原价加价率
                        priceOrgRate: '',
                        // 促销价格
                        priceGive: '',
                        // 促销价加价率
                        priceGiveRate: '',
                        // 开关
                        value: value,
                    });
                }

            }

            return Promise.resolve(data);
        } catch (e) {
            Alert.alert(e.message);
        }
    };

    // 显示侧滑菜单
    show = async () => {
        await this.getParams().then((data)=>{
            this.popup.dismiss(() => {
                this.popup.show();
            });
        });
    };

    dismiss = () => {
        this.popup.dismiss(() => {
            this.setState({
                showType: true
            });
        });
    };

    // 隐藏的时候的回调
    onDismiss = () => {
        Keyboard.dismiss();
        this.props.onDismiss && this.props.onDismiss();
    };

    // 点击右侧的图片
    clickRightBox = () => {
        let data = this.props.data;
        this.setState({
            showType: false,
            eCoolPrice: data.price + '',
        });
    };

    // 点击左侧图片
    onClickLeftBox = () => {
        this.popup.dismiss(() => {
            this.props.onClickLeft && this.props.onClickLeft();
        });
    };

    // 关闭
    deleteRender = () => {
        this.hideBox();
        this.popup.dismiss(()=>{
            this.setState({
                showType: true,
                originalPrice: '',
                defPrice: '',
                bar: 0,
            });
        });
    };

    clickBar = (index) => {
        Keyboard.dismiss();
        if (index === 0) {
            this.setState({
                bar: index,
                originalPrice: '',
                defPrice: '',
            });
        } else if (index === 1) {
            this.setState({
                bar: index,
                originalPrice: '',
                defPrice: this.state.priceNom,
            });
        } else if (index === 2) {
            this.setState({
                bar: index,
                originalPrice: this.state.priceOrg,
                defPrice: this.state.priceGive,
            });
        }
        this.hideBox();
    };

    // 没有价格
    onPrice = () => {
        this.setState({
            showType: true,
            originalPrice: '',
            defPrice: '',
            bar: 0,
        });
        this.saveDataToCofig();
        this.popup.dismiss(() => {
            this.props.onClickRight && this.props.onClickRight({originalPrice: '', defPrice: '',});
        });
    };

    // 一个价格
    onePrice = () => {
        let originalPrice = this.state.originalPrice;
        let defPrice = this.state.defPrice;
        let params = this.props.data.price;
        if (!defPrice) {
            Toast.show('请填写价格', 2);
            return;
        }

        if (defPrice === '0') {
            Toast.show('亲，填写的不能为0', 2);
            return;
        }

        let reg = /^[0-9]+.?[0-9]*$/;
        if (!reg.test(defPrice)) {
            Toast.show('请输入正确价格', 2);
            return;
        }

        let isNaN = Number(defPrice).toString();
        if (isNaN === 'NaN') {
            Toast.show('请输入正确价格', 2);
            return;
        }

        if (defPrice.indexOf('0') === 0) {
            if (!(defPrice.indexOf('.') === -1 && defPrice.indexOf('.') === 1)) {
                Toast.show('请输入正确价格', 2);
                return;
            }
        }

        if (defPrice < params) {
            Toast.show('输入价格不能比好店价格低哦～', 2);
            return;
        }

        this.setState({
            showType: true,
            originalPrice: '',
            defPrice: '',
            bar: 0,
        });
        this.saveDataToCofig();
        this.popup.dismiss(() => {
            this.props.onClickRight && this.props.onClickRight({
                originalPrice: '',
                defPrice: NP.round(defPrice, 0).toString()
            });
        });
    };

    // 两个价格
    twoPrice = () => {
        let originalPrice = this.state.originalPrice;
        let defPrice = this.state.defPrice;
        let params = this.props.data.price;

        if (originalPrice === '0' || defPrice === '0') {
            Toast.show('亲，填写的不能为0', 2);
            return;
        }

        if (!originalPrice) {
            Toast.show('请填写原价', 2);
            return;
        }
        if (!defPrice) {
            Toast.show('请填写促销价', 2);
            return;
        }


        let reg = /^[0-9]+.?[0-9]*$/;
        if (!reg.test(originalPrice)) {
            Toast.show('请输入正确原价', 2);
            return;
        }


        if (!reg.test(originalPrice)) {
            Toast.show('请输入正确促销价', 2);
            return;
        }


        let isNaN1 = Number(defPrice).toString();
        let isNaN2 = Number(originalPrice).toString();
        if (isNaN1 === 'NaN' || isNaN2 === 'NaN') {
            Toast.show('请输入正确价格', 2);
            return;
        }

        if (defPrice.indexOf('0') === 0) {
            if (!(defPrice.indexOf('.') === -1 && defPrice.indexOf('.') === 1)) {
                Toast.show('请输入正确价格', 2);
                return;
            }
        }

        if (originalPrice.indexOf('0') === 0) {
            if (!(originalPrice.indexOf('.') === -1 && originalPrice.indexOf('.') === 1)) {
                Toast.show('请输入正确价格', 2);
                return;
            }
        }


        if (Number(originalPrice) <= Number(defPrice)) {
            Toast.show('亲，原价要比促销价高哦～', 2);
            return;
        }

        if (defPrice < params) {
            Toast.show('输入促销价不能比好店价格低哦～', 2);
            return;
        }

        this.setState({
            showType: true,
            originalPrice: '',
            defPrice: '',
            bar: 0,
        });
        this.saveDataToCofig();
        this.popup.dismiss(() => {
            this.props.onClickRight && this.props.onClickRight({
                originalPrice: NP.round(originalPrice, 0).toString(),
                defPrice: NP.round(defPrice, 0).toString()
            });
        });
    };

    // 显示价格
    sureBtn = () => {
        this.hideBox();
        let status = this.state.bar;
        if (status === 3) {
            Toast.show('亲，请选择一种类型～');
            return;
        } else if (status === 1) {
            this.onePrice();
        } else if (status === 2) {
            this.twoPrice();
        } else if (status === 0) {
            this.onPrice();
        }
    };

    // 上传参数
    saveDataToCofig = async () => {
        let bar = this.state.bar;
        let value = this.state.value;
        let promotePriceRate = '0';
        let oriPriceRate = '0';

        if (bar === 0 && value) {
            promotePriceRate = '0';
            oriPriceRate = '0';
        } else if (bar === 1 && value) {
            oriPriceRate = NP.divide(this.state.priceNomRate, 100).toString();
            promotePriceRate = '0';
        } else if (bar === 2 && value) {
            oriPriceRate = NP.divide(this.state.priceOrgRate, 100).toString();
            promotePriceRate = NP.divide(this.state.priceGiveRate, 100).toString();
        }

        let parms = {
            domainKind: 'business',
            ownerId: this.props.unitId,
        };

        let data = {
            ownerKind: '7',
            data: [
                {
                    // 促销价加价率
                    code: 'spuShare_promotePriceRate',
                    ...parms,
                    val: promotePriceRate
                },
                {
                    // 原价加价率
                    code: 'spuShare_oriPriceRate',
                    ...parms,
                    val: oriPriceRate
                },
                {
                    //是否需要加价率
                    code: 'spuShare_isNeedPriceRate',
                    ...parms,
                    val: this.state.value ? 1 : 0,
                },
                {
                    //价格选项
                    code: 'spuShare_priceOpt',
                    ...parms,
                    val: this.state.bar
                }
            ]
        };


        try {
            let vals = await this.store.postConfigParams({jsonParam: data});
            console.log(vals);
        } catch (e) {
            this.dismiss();
            Alert.alert(e.message);
        }

    };

    renderStyleOne = () => {
        let obj = this.props.data;
        return (
            <View style={[styles.containerTop, {marginTop: HEIGHT * 0.2}]}>
                <View style={styles.container}>
                    <View style={styles.boxLeft}>
                        <Text style={styles.title}>分享一</Text>
                        <TouchableOpacity
                            style={styles.shareBox}
                            activeOpacity={0.9}
                            onPress={this.onClickLeftBox}
                        >
                            <View style={styles.shareText}>
                                <Image source={require('gsresource/img/shareLogoMin.png')} style={{marginLeft: 6}} />
                                <Image source={require('gsresource/img/shareTitleMin.png')} />
                            </View>
                            <Image
                                style={styles.shareImg}
                                source={{uri: DocSvc.originDocURL(obj.img)}}
                                defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                                resizeMode={'contain'}
                            />
                            <View style={styles.shareFooter}>
                                <View style={styles.leftText}>
                                    <Text numberOfLines={1} style={styles.footerTitle}>{obj.title}</Text>
                                </View>
                                <View>
                                    <Image style={styles.code} source={{uri: this.props.baseImg}} />
                                    <Text style={styles.codeText}>长按查看详情</Text>
                                    <View style={styles.codeBox} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.boxRight}>
                        <Text style={styles.title}>分享二</Text>
                        <TouchableOpacity
                            style={[styles.shareBox, {
                                marginLeft: 10,
                                borderWidth: 1,
                                borderColor: 'red',
                                overflow: 'hidden'
                            }]}
                            activeOpacity={0.9}
                            onPress={this.clickRightBox}
                        >
                            <View style={styles.shareText}>
                                <View style={{marginLeft: 5, marginRight: 10}}>
                                    <Image
                                        style={styles.logo}
                                        defaultSource={require('gsresource/img/sellerDefault42.png')}
                                        source={{uri: obj.shopLogoPic}}
                                    />
                                </View>
                                <Text style={styles.textWidth} numberOfLines={1}>{obj.shopName}</Text>
                            </View>
                            <Image
                                style={styles.shareImg}
                                source={{uri: DocSvc.originDocURL(obj.img)}}
                                defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                                resizeMode={'contain'}
                            />
                            <View style={styles.shareFooter}>
                                <View style={styles.leftText}>
                                    <Text numberOfLines={1} style={styles.footerTitle}>{obj.title}</Text>
                                    <View style={styles.Price}>
                                        <View style={styles.PriceNorm}>
                                            <Text numberOfLines={1} style={styles.PriceSim}>¥</Text>
                                            <Text numberOfLines={1} style={styles.PriceNum}>{obj.price}{' '}</Text>
                                        </View>
                                        {/*<Text numberOfLines={1} style={styles.PriceNone}>¥100</Text>*/}
                                    </View>
                                </View>
                                <View>
                                    <Image style={styles.code} source={{uri: this.props.baseImg}} />
                                    <Text style={styles.codeText}>长按查看详情</Text>
                                    <View style={styles.codeBox} />
                                </View>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                {this.renderCloseBtn()}
            </View>
        );
    };


    showSelectBox = () => {
        this.setState({
            showPriceRate: true,
        });
    };

    showSelectBoxOrg = () => {
        this.setState({
            showPriceRate2: true,
            showPriceRate: false,
            showPriceRate3: false,
        });
    };

    showSelectBoxOrg2 = () => {
        this.setState({
            showPriceRate3: true,
        });
    };

    // 选择Item
    chooseRate = (inputText) => {
        let bar = this.state.bar;
        if (bar === 1) {
            // 计算价格*
            let params = this.props.data.price;
            let rate = NP.plus(1, NP.times(inputText, 0.01));
            let showPrice = NP.round(NP.times(rate, params), 0).toString();
            if (showPrice === 'NaN') {
                showPrice = '0';
            }
            this.setState({
                priceNomRate: inputText,
                defPrice: showPrice,
                priceNom: showPrice,
                showPriceRate: false,
            });
        } else {
            let params = this.props.data.price;
            let rate = NP.plus(1, NP.times(inputText, 0.01));
            let showPrice = NP.round(NP.times(rate, params), 0).toString();
            if (showPrice === 'NaN') {
                showPrice = '0';
            }
            this.setState({
                originalPrice: showPrice,
                priceOrg: showPrice,
                priceOrgRate: inputText,
                showPriceRate2: false,
            });
        }
    };

    // 选择item
    chooseRate2 = (inputText) => {
        let params = this.props.data.price;
        let rate = NP.plus(1, NP.times(inputText, 0.01));
        let showPrice = NP.round(NP.times(rate, params), 0).toString();
        if (showPrice === 'NaN') {
            showPrice = '0';
        }
        this.setState({
            defPrice: showPrice,
            priceGive: showPrice,
            priceGiveRate: inputText,
            showPriceRate3: false,
        });
    };

    //隐藏方法
    onFocus = () => {
        this.hideBox();
    };

    hideBox = () => {
        this.setState({
            showPriceRate: false,
            showPriceRate2: false,
            showPriceRate3: false,
        });
    };

    renderCloseBtn = () => {
        return (
            <TouchableOpacity style={{marginTop: 50}} onPress={this.dismiss}>
                <Image style={styles.code} source={require('gsresource/img/shareClose.png')} />
            </TouchableOpacity>
        );
    };

    renderInputMsg = () => {
        return (

            <KeyboardAwareScrollView
                scrollOffset={10}
                scrollEnabled={false}
                enableOnAndroid={true}
                behavior='padding'
                keyboardShouldPersistTaps={'handled'}
            >
                <View style={{height: this.state.heightTop}} />
                <View style={[styles.priContain]}>
                    <View style={styles.priBox}>
                        <TouchableOpacity style={styles.PriBarBox} onPress={() => this.clickBar(0)}>
                            <View style={styles.PriBar}>
                                <View style={styles.barLeft}>
                                    {
                                        this.state.bar === 0 ?
                                            <Image source={require('gsresource/img/shareCheckTrue.png')} /> :
                                            <Image source={require('gsresource/img/shareCheck.png')} />
                                    }
                                    <Text style={styles.PriBarText}>不放价格</Text>
                                </View>
                                <TouchableOpacity style={styles.deleteBox} onPress={this.deleteRender}>
                                    <Image source={require('gsresource/img/delete.png')} />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.line} />

                        <TouchableOpacity style={styles.PriBarBox} onPress={() => this.clickBar(1)}>
                            <View style={styles.PriBar}>
                                <View style={styles.barLeft}>
                                    {
                                        this.state.bar === 1 ?
                                            <Image source={require('gsresource/img/shareCheckTrue.png')} /> :
                                            <Image source={require('gsresource/img/shareCheck.png')} />
                                    }
                                    <Text style={styles.PriBarText}>放一个价格</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        <View style={styles.line} />

                        <TouchableOpacity style={styles.PriBarBox} onPress={() => this.clickBar(2)}>
                            <View style={styles.PriBar}>
                                <View style={styles.barLeft}>
                                    {
                                        this.state.bar === 2 ?
                                            <Image source={require('gsresource/img/shareCheckTrue.png')} /> :
                                            <Image source={require('gsresource/img/shareCheck.png')} />
                                    }
                                    <Text style={styles.PriBarText}>放两个价格</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                        {/*控制加价率*/}
                        {
                            this.state.bar === 0 || this.state.bar === 3 ? null : (
                                <View style={styles.switchBox}>
                                    <Text style={styles.priBarRightTextleft}>好店价格：{this.state.eCoolPrice}{' '}</Text>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={[styles.priBarRightTextleft, {paddingRight: 10}]}>加价率</Text>
                                        <Switch
                                            value={this.state.value}
                                            onValueChange={(value) => {
                                                this.hideBox();
                                                this.setState({
                                                    value: value,
                                                });
                                            }}
                                        />
                                    </View>
                                </View>
                            )
                        }

                        {/*显示input输入*/}
                        {
                            this.state.bar === 1 ? (
                                <View style={styles.inputBox}>
                                    <View style={styles.inputContainer}>
                                        <Text style={[styles.priBarRightText, {fontSize: fonts.font12}]}>价格</Text>
                                        <TextInput
                                            style={styles.priBarInput}
                                            keyboardType={'numeric'}
                                            onChangeText={(inputText) => {
                                                // 计算加价率
                                                let params = this.props.data.price;
                                                let minus = NP.minus(inputText, params);
                                                let divide = NP.divide(minus, params);
                                                let rate = NP.round(NP.times(divide, 100), 0).toString();
                                                if (rate === 'NaN') {
                                                    rate = '0';
                                                }

                                                this.setState({
                                                    defPrice: inputText,
                                                    priceNom: inputText,
                                                    priceNomRate: rate,
                                                });

                                                if (!inputText) {
                                                    this.setState({
                                                        priceNomRate: '',
                                                    });
                                                }

                                            }}
                                            defaultValue={''}
                                            underlineColorAndroid={'transparent'}
                                            value={this.state.priceNom}
                                            autoFocus={true}
                                        />
                                        {
                                            this.state.value ? (
                                                <View>

                                                    <TouchableOpacity
                                                        style={styles.rateBox}
                                                        onPress={this.showSelectBox}
                                                    >
                                                        <Text
                                                            style={styles.rateBoxText}
                                                        >{this.state.priceNomRate ? this.state.priceNomRate : '加价率'}</Text>
                                                    </TouchableOpacity>
                                                    <Text style={styles.inputSync}>%</Text>
                                                </View>
                                            ) : null
                                        }
                                    </View>
                                </View>
                            ) : null
                        }

                        {
                            this.state.bar === 2 ? (
                                <View>
                                    <View style={styles.inputBox}>
                                        <View style={styles.inputContainer}>
                                            <Text style={[styles.priBarRightText, {
                                                fontSize: fonts.font12,
                                                textDecorationLine: 'line-through'
                                            }]}
                                            >原价(高)</Text>
                                            <TextInput
                                                style={styles.priBarInput}
                                                autoFocus={true}
                                                keyboardType={'numeric'}
                                                onChangeText={(inputText) => {

                                                    // 计算加价率
                                                    let params = this.props.data.price;
                                                    let minus = NP.minus(inputText, params);
                                                    let divide = NP.divide(minus, params);
                                                    let rate = NP.round(NP.times(divide, 100), 0).toString();
                                                    if (rate === 'NaN') {
                                                        rate = '0';
                                                    }
                                                    this.setState({
                                                        originalPrice: inputText,
                                                        priceOrg: inputText,
                                                        priceOrgRate: rate
                                                    });

                                                    if (!inputText) {
                                                        this.setState({
                                                            priceOrgRate: '',
                                                        });
                                                    }
                                                }}
                                                defaultValue={''}
                                                underlineColorAndroid={'transparent'}
                                                value={this.state.priceOrg}
                                                onFocus={this.onFocus}
                                            />
                                            {
                                                this.state.value ? (
                                                    <View>
                                                        <TouchableOpacity
                                                            style={styles.rateBox}
                                                            onPress={this.showSelectBoxOrg}
                                                        >
                                                            <Text
                                                                style={styles.rateBoxText}
                                                            >{this.state.priceOrgRate ? this.state.priceOrgRate : '加价率'}</Text>
                                                        </TouchableOpacity>
                                                        <Text style={styles.inputSync}>%</Text>
                                                    </View>
                                                ) : null
                                            }
                                        </View>
                                    </View>
                                    <View style={styles.inputBox}>
                                        <View style={styles.inputContainer}>
                                            <Text
                                                style={[styles.priBarRightText, {fontSize: fonts.font12}]}
                                            >促销价(低)</Text>
                                            <TextInput
                                                style={styles.priBarInput}
                                                keyboardType={'numeric'}
                                                onChangeText={(inputText) => {
                                                    // 计算加价率
                                                    let params = this.props.data.price;
                                                    let minus = NP.minus(inputText, params);
                                                    let divide = NP.divide(minus, params);
                                                    let rate = NP.round(NP.times(divide, 100), 0).toString();
                                                    if (rate === 'NaN') {
                                                        rate = '0';
                                                    }
                                                    this.setState({
                                                        defPrice: inputText,
                                                        priceGive: inputText,
                                                        priceGiveRate: rate,
                                                    });

                                                    if (!inputText) {
                                                        this.setState({
                                                            priceGiveRate: '',
                                                        });
                                                    }
                                                }}
                                                defaultValue={''}
                                                underlineColorAndroid={'transparent'}
                                                value={this.state.priceGive}
                                                onFocus={this.onFocus}
                                            />

                                            {
                                                this.state.value ? (
                                                    <View>
                                                        <TouchableOpacity
                                                            style={styles.rateBox}
                                                            onPress={this.showSelectBoxOrg2}
                                                        >
                                                            <Text
                                                                style={styles.rateBoxText}
                                                            >{this.state.priceGiveRate ? this.state.priceGiveRate : '加价率'}</Text>
                                                        </TouchableOpacity>
                                                        <Text style={styles.inputSync}>%</Text>
                                                    </View>
                                                ) : null
                                            }
                                        </View>
                                    </View>
                                </View>
                            ) : null
                        }

                        <TouchableOpacity style={styles.sure} onPress={this.sureBtn}>
                            <Text style={{fontSize: 14, color: colors.white}}>确定</Text>
                        </TouchableOpacity>


                        <ChooseRate
                            priceRate={priceRate}
                            isShow={this.state.showPriceRate}
                            onPress={this.chooseRate}
                        />
                        <ChooseRate
                            priceRate={salesRate}
                            isShow={this.state.showPriceRate2}
                            onPress={this.chooseRate}
                        />

                        <ChooseRate
                            style={{top: 240}}
                            priceRate={priceRate}
                            isShow={this.state.showPriceRate3}
                            onPress={this.chooseRate2}
                        />

                    </View>
                </View>
                <View style={{height: WIDTH / 2}} />
            </KeyboardAwareScrollView>
        );
    };

    render() {
        return (
            <Popup
                ref={popup => (this.popup = popup)}
                popupType={'1'}
                backgroundColor={'transparent'}
                width={WIDTH}
                height={HEIGHT}
                contentBackgroundColor={'transparent'}
                onDismiss={this.onDismiss}
            >
                {
                    this.state.showType ? this.renderStyleOne() : this.renderInputMsg()
                }
            </Popup>
        );
    }
}

const styles = StyleSheet.create({
    containerTop: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    container: {
        flexDirection: 'row',
    },

    boxLeft: {
        width: WIDTH / 2,
        justifyContent: 'flex-end',
        alignItems: 'flex-end',
    },

    boxRight: {
        width: WIDTH / 2,
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
    },

    title: {
        color: colors.white,
        textAlign: 'center',
        fontSize: 14,
        width: (WIDTH / 2) - 40,
        marginRight: 10,
        marginBottom: 20,
    },

    shareBox: {
        backgroundColor: colors.white,
        width: (WIDTH / 2) - 40,
        marginRight: 10,
    },

    shareText: {
        height: 36,
        flexDirection: 'row',
        alignItems: 'center',
    },

    shareImg: {
        width: (WIDTH / 2) - 40,
        height: (WIDTH / 2) - 40,
    },

    logo: {
        width: 26,
        height: 26,
        borderRadius: 13,
    },

    textWidth: {
        width: (WIDTH / 2) - 84,
        fontSize: 9,
        color: colors.normalFont,
    },

    shareFooter: {
        flexDirection: 'row',
        height: 50,
        paddingTop: 5,
    },

    leftText: {
        width: (WIDTH / 2) - 84,
        paddingLeft: 5,
        paddingRight: 5,
    },

    footerTitle: {
        fontSize: 9,
        color: colors.normalFont,
        marginBottom: 5
    },

    code: {
        width: 35,
        height: 35,
    },

    codeBox: {
        borderWidth: 1,
        borderColor: '#FF6699',
        opacity: 0.51,
        width: 35,
        height: 35,
        position: 'absolute',
        top: 0,
    },

    codeText: {
        marginTop: 2,
        fontSize: 6,
        color: '#8C8C8C'
    },

    Price: {
        flexDirection: 'row',
        alignItems: 'flex-end'
    },

    PriceNorm: {
        flexDirection: 'row',
        alignItems: 'flex-end',

    },

    PriceSim: {
        fontSize: fonts.font12,
        color: colors.activeFont,
        paddingBottom: 1,
    },

    PriceNum: {
        fontSize: fonts.font14,
        color: colors.activeFont,
    },


    // style2
    priContain: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    priBox: {
        width: WIDTH - 80,
        backgroundColor: colors.white,
        borderRadius: 8,
        paddingLeft: 15,
        paddingRight: 15,
    },

    PriBar: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 40,
        justifyContent: 'space-between',
    },

    PriBarText: {
        fontSize: fonts.font15,
        paddingLeft: 5,
    },

    line: {
        height: 1,
        backgroundColor: '#f1f1f1',
        marginLeft: 23,
    },

    barLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    priBarRightTextleft: {
        fontSize: fonts.font12,
        color: colors.greyFont,
        paddingRight: 20,
    },

    priBarRightText: {
        fontSize: fonts.font12,
        color: colors.greyFont,
        paddingRight: 20,
        width: 80,
    },

    priBarInput: {
        borderWidth: 1,
        borderColor: '#e8e8e8',
        flex: 1,
        height: 30,
        padding: 0,
        paddingLeft: 8,
        borderRadius: 5,
        color: colors.greyFont,
        fontSize: 14,
    },

    // priBarInputs: {
    //     width: WIDTH*0.22,
    //     marginLeft: 10,
    // },

    rateBox: {
        width: WIDTH * 0.22,
        marginLeft: 10,
        borderWidth: 1,
        borderColor: '#e8e8e8',
        height: 30,
        padding: 0,
        paddingLeft: 8,
        borderRadius: 5,
        justifyContent: 'center',
    },

    rateBoxText: {
        color: colors.greyFont,
        fontSize: 12,
    },


    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },

    sure: {
        height: 40,
        backgroundColor: colors.activeBtn,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },

    deleteBox: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    inputSync: {
        position: 'absolute',
        right: 10,
        top: 7,
        fontSize: 14,
        color: '#D4D4D4'
    },

    switchBox: {
        borderTopColor: '#f1f1f1',
        borderBottomColor: '#f1f1f1',
        borderTopWidth: 1,
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 5,
        paddingBottom: 5,
        marginBottom: 7,
        height: 40,
    },


});
