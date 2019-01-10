/**
 *@author xbu
 *@date 2018/08/09
 *@desc  提交具体退货退款
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    TextInput, DeviceEventEmitter,
} from 'react-native';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import fonts from 'gsresource/ui/fonts';
import NavigationHeader from 'component/NavigationHeader';
import CancelOrderComponent from '../widget/OrderCancelComponent';
import ReturnGoodsMsg from '../store/ReturnGoodsMsgStore';
import ReturnGoods from '../store/ReturnGoodsStore';
import {Toast} from '@ecool/react-native-ui';
import {observer} from 'mobx-react';
import SingleLineInputDlg from 'component/SingleLineInputDlg';
import ReturnChooseGoodsListScreen from './ReturnChooseGoodsListScreen';
import Alert from 'component/Alert';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import RouteUtil from 'utl/RouteUtil';
import CombFeeCell from '../widget/CombFeeCell';


@observer
export default class ReturnGoodsSubmitApplyScreen extends Component {
    constructor(props) {
        super(props);
        this.returnStore = new ReturnGoodsMsg();
        this.store = new ReturnGoods();
        this.state = {
            isShow: true,
            chooseGoods: 0,
            choose: null,
            chooseId: null,
            text: '100',
            inputValue: null,
            inputText: '',
            returnNub: 0,
            detailsSpu: [],
            passData: null,
            footData: null,
            combFee: null,
            isCanReturnFee: false,
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('submitApply')}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <CancelOrderComponent
                    ref={(ref) => {
                        this.cancelOrderRef = ref;
                    }}
                    confirmOrder={this.cancelOrderMsg}
                    data={this.returnStore.returnMsgList}
                    names={this.state.isShow ? '退货' : '退款'}
                />


                <KeyboardAwareScrollView
                    scrollOffset={50}
                    scrollEnabled={false}
                    enableOnAndroid={true}
                    behavior='padding'
                    keyboardShouldPersistTaps={'handled'}
                >
                    {
                        this.state.isShow ? (
                            <TouchableOpacity style={styles.returnBox} onPress={this.onClickChooseGoods}>
                                <Text style={styles.returnText}>选择货品</Text>
                                <View style={styles.returnRightBox}>
                                    <Text style={{
                                        paddingRight: 10,
                                        color: this.state.chooseGoods ? colors.normalFont : colors.unEnable
                                    }}
                                    >{this.state.chooseGoods ? '选择完成' : '请选择退货商品'}</Text>
                                    <Image source={require('gsresource/img/channalRight.png')} />
                                </View>
                            </TouchableOpacity>) : null
                    }


                    <TouchableOpacity style={styles.returnBox} onPress={this.onClickReturnGoods}>
                        <Text style={styles.returnText}>{this.state.isShow ? '退货' : '退款'}原因</Text>
                        <View style={styles.returnRightBox}>
                            <Text style={{
                                paddingRight: 10,
                                color: this.state.choose ? colors.normalFont : colors.unEnable
                            }}
                            >{this.state.choose ? this.state.choose : this.state.isShow ? '请选择退货原因' : '请选择退款原因'}</Text>
                            <Image source={require('gsresource/img/channalRight.png')} />
                        </View>
                    </TouchableOpacity>

                    {
                        this.state.combfee &&
                        <CombFeeCell
                            value={this.state.combfee}
                        />
                    }

                    <TouchableOpacity style={styles.returnBox} onPress={this.onClickReturnMoney}>
                        <Text style={styles.returnText}>{'实际退款金额'}</Text>
                        <View style={styles.returnRightBox}>
                            <Text style={[{
                                color: this.state.inputValue ? colors.normalFont : colors.unEnable,
                                paddingRight: 10
                            }, {}]}
                            >
                                {this.state.inputValue ? this.state.isCanReturnFee ?
                                    this.state.inputValue + this.state.combFee : this.state.inputValue : '请输入退款金额'}</Text>
                            <Image source={require('gsresource/img/channalRight.png')} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.inputBox}>
                        <Text style={styles.returnTitle}>{I18n.t('refunds')}</Text>
                        <TextInput
                            style={styles.input}
                            multiline={true}
                            numberOfLines={4}
                            placeholder={I18n.t('returnPlaceholder')}
                            onChangeText={(inputText) => {
                                if (inputText.length >= 150) {
                                    Toast.show('亲，最多只可以输入150字哦！', 2);
                                    return;
                                }
                                this.setState({inputText});
                            }}
                            underlineColorAndroid='transparent'
                            autoFocus={false}
                            returnKeyType={'done'}
                            blurOnSubmit={true}
                            maxLength={150}
                        />
                    </View>
                </KeyboardAwareScrollView>

                <TouchableOpacity style={styles.returnBtn} onPress={this.saveReturnBill}>
                    <Text style={{color: colors.white, fontSize: fonts.font14}}>{I18n.t('apply')}</Text>
                </TouchableOpacity>

            </SafeAreaView>
        );
    }

    componentDidMount() {
        this.LoadReturnGoodMsg();

        // 退货
        this.deEmitter = DeviceEventEmitter.addListener('RETUN_GOODS_ARRAY', (data, passData, footData) => {
            this.setState({
                detailsSpu: data.obj,
                chooseGoods: 1,
                returnNub: data.nub,
                inputValue: data.totalMoney,
                passData: passData,
                footData: footData
            });
        });
        const {params} = this.props.navigation.state;
        if (params.typeId === 0) {
            this.setState({isShow: false});
        }

        this.getReturnGoodsPrice();
    }

    componentWillUnmount() {
        this.deEmitter.remove();
        const {params} = this.props.navigation.state;
        //防止乱刷新
        if (params.from === 'details') {
            DeviceEventEmitter.emit('APPLay_ORDER_DETAILS');
        }

    }

    //请求退货原因
    async LoadReturnGoodMsg() {
        const {params} = this.props.navigation.state;
        let id = 2005;
        if (params.typeId === 0) {
            id = 2012;
        }
        try {
            this.returnStore.configListDictApiManager(id);
        } catch (e) {
            Alert.alert(e.message);
        }
    }

    // 获取可退金额
    getReturnGoodsPrice = async () => {
        const {params} = this.props.navigation.state;
        try {
            let {data} = await this.returnStore.getReturnGoodsPrice(params.purBillId);
            if (data.combBill) {
                this.setState({combfee: data.combBill.combineFee});
                this.setState({isCanReturnFee: data.bill.combineBackFlag === 1});
            }

            this.setState({inputValue: data.bill.totalMoney});
        } catch (e) {
            Alert.alert(e.message);
        }
    };

    // 选择货品
    onClickChooseGoods = () => {
        const {params} = this.props.navigation.state;
        let passData = {
            id: params.purBillId,
            goodsData: this.state.detailsSpu,
            goodsNub: this.state.returnNub,
            goodsPrice: this.state.inputValue,
            passData: this.state.passData,
            footData: this.state.footData
        };
        this.props.navigation.navigate('ReturnChooseGoodsListScreen', passData);
    };

    //点击退货
    onClickReturnGoods = () => {
        this.cancelOrderRef.show();
    };

    //设置退货原因
    cancelOrderMsg = (id, obj) => {
        if (obj) {
            this.setState({
                choose: obj.codeName,
                chooseId: obj.codeValue,
            }, () => {
                this.cancelOrderRef.cancle();
            });
        } else {
            let tips = this.state.isShow ? '退货' : '退款';
            Toast.show('请选择' + tips + '原因', 2);
        }
    };


    //退款
    onClickReturnMoney = () => {
        const {params} = this.props.navigation.state;
        if (params.status === 2) {
            return;
        }
        SingleLineInputDlg.show({
            keyboardType: 'numeric',
            title: '退款金额',
            hint: '请输入退款金额',
            defaultText: this.state.inputValue === null ? '' : this.state.inputValue,
            onConfirm: (value) => {
                if (value) {
                    this.setState({
                        inputValue: value,
                    });
                }
            }
        });
    };

    // 创建退款退货单
    saveReturnBill = () => {
        const {params} = this.props.navigation.state;
        let returnReason = this.state.chooseId;
        let returnMoney = this.state.inputValue;
        let rem = this.state.inputText;
        let returnNub = this.state.returnNub;
        let detailsSpu = this.state.detailsSpu;
        let chooseGoods = this.state.chooseGoods;

        if (chooseGoods === 0 && this.state.isShow) {
            Toast.show('请选择货品', 2);
            return;
        }

        if (returnReason === null) {
            Toast.show('请选择退货原因', 2);
            return;
        }
        if (returnMoney === null) {
            Toast.show('请输入退款金额', 2);
            return;
        }

        let numberData = returnMoney.toString().trim();
        var reg = /^[0-9]+.?[0-9]*$/;
        if (!reg.test(numberData)) {
            Toast.show('请输入正确退款金额', 2);
            return false;
        }

        let index = numberData.indexOf('.');
        if (numberData.indexOf('.') === 0 || numberData === '') {
            Toast.show('退款金额请输入数字', 2);
            return;
        } else {
            if (index !== -1) {
                let strLength = numberData.substr(index + 1);
                if (strLength.length >= 3) {
                    Toast.show('请精确到小数点后两位', 2);
                    return;
                }
            }
        }

        let returnObj = Object.assign({}, {
            totalNum: returnNub,
            totalMoney: returnMoney,
            returnReason: returnReason,
            rem: rem,
            hashKey: (new Date()).getTime(),
        }, params);

        let obj = {
            jsonParam: {
                main: returnObj,
                details: detailsSpu
            }
        };
        this.createReturnBill(obj);
    };

    createReturnBill = (obj) => {
        Toast.loading();
        this.store.createReturnBill(obj).then((data) => {
            Toast.dismiss();
            Toast.show('申请成功', 2);

            this.changeApplay();
            this.backLocation();

        }).catch((e) => {
            Toast.dismiss();
            Alert.alert(e.message);
        });
    };

    //改变父状态
    changeApplay = () => {
        const {params} = this.props.navigation.state;
        let typeId = null;
        if (params.typeId === 0) {
            typeId = 10;
        } else {
            typeId = 11;
        }
        DeviceEventEmitter.emit('APPLay_ORDER', {id: params.purBillId, type: typeId});
    };

    // 两秒之后退回原来的地方
    backLocation = () => {
        setTimeout(() => {
            let routerObj = this.props.navigation;
            let routerArray = routerObj.state.params.RouteKeys;
            let routerName = routerArray[routerArray.length - 1].routeName;
            RouteUtil.goBackFrom(routerName, routerObj);
        }, 2000);
    };

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    returnBox: {
        height: 45,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 15,
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
    },

    returnText: {
        fontSize: fonts.font14,
        color: colors.normalFont,
    },

    returnRightBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    inputBox: {
        height: 157,
        backgroundColor: colors.white,
        marginTop: 10,
        padding: 15,
    },

    returnTitle: {
        fontSize: fonts.font14,
        color: colors.normalFont,
        paddingBottom: 5,
    },

    input: {
        flex: 1,
        backgroundColor: colors.bg,
        padding: 5,
        borderRadius: 5,
        textAlignVertical: 'top'
    },

    returnBtn: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.activeBtn,
    }

});