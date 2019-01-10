/**
 *@author xbu
 *@date 2018/08/09
 *@desc  填写物流信息
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
    TextInput,
    DeviceEventEmitter,
} from 'react-native';
import colors from '/gsresource/ui/colors';
import I18n from '/gsresource/string/i18n';
import fonts from '/gsresource/ui/fonts';
import NavigationHeader from '../../../component/NavigationHeader';
import OrderCancelComponent from '../widget/OrderCancelComponent';
import {observer} from 'mobx-react';
import {Toast} from '@ecool/react-native-ui/index';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Alert from '../../../component/Alert';
import LogisticsStore from '../store/LogisticsStore';

@observer
export default class ReturnGoodsTransportScreen extends Component {
    constructor(props) {
        super(props);
        this.store = new LogisticsStore();
        this.state = {
            transOrder: null,
            text: null,
            inputText: null,
            transId: null,
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
                <KeyboardAwareScrollView
                    scrollOffset = {50}
                    scrollEnabled={false}
                    enableOnAndroid={true}
                    behavior='padding'
                    keyboardShouldPersistTaps={'handled'}
                >
                    <TouchableOpacity style={styles.returnBox} onPress={this.chooseTransportScreen}>
                        <Text style={styles.returnText}>物流公司</Text>
                        <View style={styles.returnRightBox}>
                            <Text style={{color: this.state.transOrder ? colors.normalFont : colors.greyFont}}>{this.state.transOrder ? this.state.transOrder : '请选择物流'}</Text>
                            <Image source={require('gsresource/img/channalRight.png')} />
                        </View>
                    </TouchableOpacity>

                    <View style={styles.returnBox}>
                        <Text style={styles.returnText}>物流单号</Text>
                        <View style={styles.returnRightBox}>
                            <TextInput
                                style={{height: 40,width:250,textAlign: 'right',paddingRight: 10}}
                                onChangeText={(text) => {this.setState({text});}}
                                underlineColorAndroid='transparent'
                                placeholder={'请输入物流单号'}
                                returnKeyType={'done'}
                            />
                            <Image source={require('gsresource/img/channalRight.png')} />
                        </View>
                    </View>

                    <View style={styles.inputBox}>
                        <Text style={styles.returnTitle}>退货说明</Text>
                        <TextInput
                            style={styles.input}
                            multiline = {true}
                            numberOfLines = {4}
                            placeholder={'请输入退款说明'}
                            onChangeText={(inputText) => {
                                if(inputText.length >= 150){
                                    Toast.show('亲，最多只可以输入150字哦！',2);
                                    return;
                                }
                                this.setState({inputText});
                            }}
                            underlineColorAndroid='transparent'
                            returnKeyType={'done'}
                            blurOnSubmit={true}
                            maxLength={150}
                        />
                    </View>
                    <View style={{flex: 1}} />
                </KeyboardAwareScrollView>
                <TouchableOpacity style={styles.returnBtn} onPress={this.sureBtn}>
                    <Text style={{color: colors.white, fontSize: fonts.font14}}>确定</Text>
                </TouchableOpacity>

            </SafeAreaView>
        );
    }


    // 方法区
    componentDidMount() {
        //监控 状态变化
        this.deEmitter = DeviceEventEmitter.addListener('CHOOSE_TRANSPORT', (obj) => {
            this.getTransList(obj);
        });
    }

    componentWillUnmount() {
        this.deEmitter.remove();
    }
    //取消订单
    chooseTransportScreen =()=> {
        this.props.navigation.navigate('ChooseTransportScreen');
    };

    getTransList =(data)=>{
        this.setState({
            transOrder: data.names,
            transId: data.id,
        },()=>{
            this.setState({
                transOrder: data.names,
                transId: data.id,
            });
        });
    };

    //
    sureBtn =()=>{
        let transId = this.state.transId;
        let transOrder = this.state.transOrder;
        let billNo = this.state.text;
        let {params} = this.props.navigation.state;

        if(!transId){
            Toast.show('请选择物流',2);
            return;
        }

        if(!billNo){
            Toast.show('请填写物流单号',2);
            return;
        } else {
            billNo = billNo.trim();
        }
        var reg = /^[0-9a-zA-Z]+$/;
        if(!reg.test(billNo)){
            Toast.show('物流单号只能是数字或者英文',2);
            return;
        }

        let obj={
            jsonParam:{
                id: params.id,
                logisCompId: transId,
                logisCompName: transOrder,
                waybillNo: billNo,
                deliverRem: this.state.inputText
            }
        };

        Toast.loading();
        this.store.sureBtnTrans(obj).then( data =>{
            Toast.dismiss();
            setTimeout(()=>{
                Toast.show('信息已提交，等待卖家收货',2);
            },2000);
            DeviceEventEmitter.emit('Refresh_ReturnGoodsLogs_Screen');
            setTimeout(()=>{
                this.props.navigation.goBack();
            },3000);
        }).catch( err =>{
            Toast.dismiss();
            Alert.alert(err.message);
        });
    }


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