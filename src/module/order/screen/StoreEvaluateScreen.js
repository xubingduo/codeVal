/**
 *@author xbu
 *@date 2018/08/09
 *@desc 店铺评价
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    DeviceEventEmitter,
    TextInput,
    ScrollView
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';

import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import fonts from 'gsresource/ui/fonts';
import NavigationHeader from 'component/NavigationHeader';
import Alert from 'component/Alert';
import Image from 'component/Image';
import StoreEvaluateStore from '../store/StoreEvaluateStore';
import {Toast} from '@ecool/react-native-ui';
import DocSvc from 'svc/DocSvc';
import {observer} from 'mobx-react';

@observer
export default class StoreEvaluateScreen extends Component {
    constructor(props){
        super(props);
        this.store = new StoreEvaluateStore();
        this.state={
            isFlower: 0,
            name: '',
            flag: 0,
            logoPic: '',
            inputText: '',
            logisticsScore: 0,
            goodsScore: 0,
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('evaluate')}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };


    render() {
        let imgFlower = this.state.isFlower === 0 ? require('gsresource/img/flowerDefault.png') : require('gsresource/img/flower.png');
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView>
                    <KeyboardAwareScrollView
                        scrollOffset = {50}
                        scrollEnabled={false}
                        enableOnAndroid={true}
                        behavior='padding'
                        keyboardShouldPersistTaps={'handled'}
                    >
                        <View style={styles.evaluateBox}>
                            <View style={styles.justifyContent}>
                                <View style={{marginTop: 15, marginBottom: 10}}>
                                    <Image style={styles.evaluateImg}
                                        defaultSource={require('gsresource/img/sellerDefault42.png')}
                                        source={{uri: DocSvc.docURLS(this.state.logoPic)}}
                                    />
                                </View>
                                <Text style={styles.evaluateTittle}>{this.state.name}</Text>
                            </View>
                            <View style={styles.lineBox}>
                                <View style={styles.line} />
                                <Text style={styles.lineText}>{I18n.t('evaluateStore')}</Text>
                                <View style={styles.line} />
                            </View>

                            <View style={[styles.justifyContent,{paddingTop: 36,}]}>
                                <TouchableOpacity
                                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                                    onPress={this.clickActive}
                                >
                                    <Image source={imgFlower} />
                                </TouchableOpacity>
                                <Text style={{fontSize: fonts.font12,color: colors.fontHint,paddingTop: 30}}>{I18n.t('evaluateDesc')}</Text>
                            </View>
                        </View>
                        <View style={styles.inputBox}>
                            {
                                this.state.flag === 9 ? (
                                    <View style={styles.input}>
                                        <ScrollView>
                                            <Text style={{fontSize: fonts.font12,color: colors.normalFont}}>{this.state.inputText}</Text>
                                        </ScrollView>
                                    </View>
                                ) : (
                                    <TextInput
                                        style={[styles.input,{fontSize: fonts.font12,}]}
                                        multiline = {true}
                                        numberOfLines = {6}
                                        placeholder={'对商品是否满意？说一说你优点与缺点吧'}
                                        placeholderTextColor={colors.greyFont}
                                        onChangeText={(inputText) => {
                                            if(inputText.length >= 300){
                                                Toast.show('亲，最多只可以输入300字哦！',2);
                                                return;
                                            }
                                            this.setState({inputText});
                                        }}
                                        underlineColorAndroid='transparent'
                                        autoFocus={false}
                                        returnKeyType={'done'}
                                        blurOnSubmit={true}
                                        maxLength={300}
                                    />
                                )
                            }

                        </View>
                        <View style={styles.evaluateStarBox}>
                            <View style={styles.evaluateStar}>
                                <Text style={styles.evaluateStarText}>物流评分</Text>
                                {
                                    this.store.logisticsScore.map( (item,index) => {
                                        let img = item ? require('gsresource/img/evaluateActive.png') : require('gsresource/img/evaluateGray.png');
                                        return (
                                            <TouchableOpacity
                                                style={styles.star}
                                                key={index + '3'}
                                                hitSlop={{left: 10, right: 0, top: 5, bottom: 5}}
                                                onPress={() => this.onClickLogistics(index)}
                                            >
                                                <Image source={img} />
                                            </TouchableOpacity>
                                        );
                                    })
                                }
                                <Text style={[styles.evaluateStarText,styles.star]}>{this.showGrade(this.state.logisticsScore)}</Text>
                            </View>
                            <View style={styles.evaluateStar}>
                                <Text style={styles.evaluateStarText}>商品评分</Text>
                                {
                                    this.store.goodsCompute.map( (item,index) => {
                                        let img = item ? require('gsresource/img/evaluateActive.png') : require('gsresource/img/evaluateGray.png');
                                        return (
                                            <TouchableOpacity
                                                style={styles.star}
                                                key={index}
                                                hitSlop={{left: 10, right: 0, top: 5, bottom: 5}}
                                                onPress={() => this.onClickGoods(index)}
                                            >
                                                <Image source={img} />
                                            </TouchableOpacity>
                                        );
                                    })
                                }
                                <Text style={[styles.evaluateStarText,styles.star]}>{this.showGrade(this.state.goodsScore)}</Text>
                            </View>
                        </View>
                    </KeyboardAwareScrollView>
                </ScrollView>

                {
                    this.state.flag === 9 ? null : (
                        <TouchableOpacity style={styles.returnBtn} onPress={this.updateStoreEvaluate}>
                            <Text style={{color: colors.white, fontSize: fonts.font14}}>{I18n.t('submit')}</Text>
                        </TouchableOpacity>
                    )
                }

            </SafeAreaView>
        );
    }

    componentDidMount() {
        const { params } = this.props.navigation.state;
        this.setState({
            name: params.tenantName,
            isFlower: params.flag === 9 ? 1 : 0,
            flag: params.flag,
            logoPic: params.logoPic
        });
        if(params.flag === 9){
            this.lookEvalData(params.id);
        }
    }

    // 点击评价店铺
    clickActive = () => {
        this.state.isFlower === 1 ? this.setState({isFlower : 0}) : this.setState({isFlower: 1});
    };

    // 点击物流评价
    onClickLogistics = (index) => {
        const { params } = this.props.navigation.state;
        if(params.flag !== 9){
            this.store.actionLogistics(index);
            this.setState({logisticsScore: index+1});
        }

    };

    // 点击商品评分
    onClickGoods = (index) => {
        const { params } = this.props.navigation.state;
        if(params.flag !== 9){
            this.store.actionGoodsScore(index);
            this.setState({goodsScore: index+1});
        }
    };

    // 显示评价等级
    showGrade = (type) => {
        let names = '';
        switch (type) {
        case 0:
            names = '';
            break;
        case 1:
            names = '很差';
            break;
        case 2:
            names = '差';
            break;
        case 3:
            names = '一般';
            break;
        case 4:
            names = '好';
            break;
        case 5:
            names = '非常好';
            break;
        }
        return names;
    };

    // 查看评价
    lookEvalData = (id) => {
        this.store.lookEvaluate({billId: id}).then(val => {
            let {data} = val;
            this.setState({
                inputText: data.rem,
                goodsScore: data.val,
                logisticsScore: data.logisScore,
            });
            this.store.actionLogistics(data.logisScore-1);
            this.store.actionGoodsScore(data.val-1);
        }).catch(e => {
            Alert.alert(e.message);
        });
    };


    // 发起评价请求
    updateRequest = () => {
        const { params } = this.props.navigation.state;
        let pageData = this.state;
        let requestData = {
            jsonParam:{
                id: params.id,
                rem: pageData.inputText,
                val: pageData.goodsScore,
                logisScore: pageData.logisticsScore,
                sendFlowerIs: pageData.isFlower
            }
        };
        this.store.requestUpdateData(requestData).then((data) =>{
            Toast.show('评价成功',2);
            if(params.flagName === 'orderList'){
                DeviceEventEmitter.emit('Evaluate_FLAG', {id: params.id});
            } else{
                DeviceEventEmitter.emit('REFRESH_ORDER_DETIALS_DATA');
                DeviceEventEmitter.emit('Evaluate_FLAG', {id: params.id});
            }
            setTimeout(()=>{
                this.props.navigation.goBack();
            },500);
        }).catch((e)=>{
            Alert.alert(e.message);
        });
    };

    // 提交评价
    updateStoreEvaluate =()=>{
        let data = this.state;
        if(!data.logisticsScore){
            Toast.show('亲，请对物流评分～',2);
            return;
        }
        if(!data.goodsScore){
            Toast.show('亲，请对商品评分～',2);
            return;
        }
        this.updateRequest();
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    justifyContent: {
        alignItems: 'center',
    },

    evaluateBox: {
        height: 290,
        backgroundColor: colors.white,
    },

    evaluateImg: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },

    evaluateTittle: {
        fontSize: fonts.font18,
        color: colors.normalFont,
        fontWeight: '600',
        marginBottom: 18,
    },

    lineBox: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
    },

    lineText: {
        fontSize: fonts.font14,
        color: colors.border1,
        paddingLeft: 5,
        paddingRight: 5,
    },

    line: {
        flex: 1,
        width: 1,
        backgroundColor: colors.bg,
        height: 1,
    },

    returnBtn: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.activeBtn,
    },

    inputBox: {
        backgroundColor: colors.white,
        marginTop: 10,
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },

    input: {
        backgroundColor: colors.bg,
        height: 80,
        padding: 10,
        textAlignVertical: 'top'
    },

    evaluateStarBox: {
        height: 100,
        backgroundColor: colors.white,
        marginTop: 10,
        justifyContent: 'center',
    },

    evaluateStar: {
        flexDirection: 'row',
        height: 30,
        alignItems: 'center',
        paddingLeft: 15,
    },

    evaluateStarText: {
        fontSize: fonts.font14,
        color: colors.normalFont,
    },

    star: {
        marginLeft: 10,
    }

});