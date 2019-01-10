/**
 * author: wwj
 * Date: 2018/8/8
 * Time: 下午5:02
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet, SafeAreaView, View,
    ScrollView, TouchableOpacity, Text,
    TextInput, Image, Platform, NativeModules
} from 'react-native';
import colors from '../../../../gsresource/ui/colors';
import I18n from '../../../../gsresource/string/i18n';
import NavigationHeader from '../../../../component/NavigationHeader';
import {Toast} from '@ecool/react-native-ui';
import {inject, observer} from 'mobx-react';
import {observable, action, runInAction} from 'mobx';
import Alert from '../../../../component/Alert';
import ChangePhoneStore from '../../store/setting/ChangePhoneStore';
import fonts from '../../../../gsresource/ui/fonts';
import UserActionSvc from 'svc/UserActionSvc';

@inject('authStore', 'userStore')
@observer
export default class ChangePhoneScreen extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'修改手机号'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    constructor(props) {
        super(props);

        this.store = new ChangePhoneStore();
        this.state = {
            verifyCodeButtonEnable: false,
            canEditVerifyCode: false,
            canSubmit: false,
            canEditMobile: true,
            verifyCodeBtnText: I18n.t('fetchVerifyCode')
        };
    }

    componentDidMount() {
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageStart('修改手机号');
        }
    }

    componentWillUnmount() {
        this.countDownInterval && clearInterval(this.countDownInterval);
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageEnd('修改手机号');
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1,backgroundColor:colors.bg}}>
                <ScrollView style={{flex: 1}} keyboardShouldPersistTaps={'handled'}>
                    <View
                        style={styles.inputPhoneContainer}
                    >
                        <View style={{flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 10}}>
                            <TextInput
                                style={styles.inputPhone}
                                maxLength={11}
                                returnKeyType={'done'}
                                placeholder={'输入手机号码'}
                                placeholderTextColor={colors.greyFont}
                                underlineColorAndroid='transparent'
                                keyboardType={'numeric'}
                                value={this.store.phone}
                                editable={this.state.canEditMobile}
                                onChangeText={(text) => {
                                    this.onPhoneChange(text);
                                }}
                            />
                            {this.store.phone && this.state.canEditMobile ?
                                <TouchableOpacity
                                    onPress={() => {
                                        this.onPhoneChange('');
                                    }}
                                >
                                    <Image
                                        source={require('gsresource/img/delete.png')}
                                    />
                                </TouchableOpacity>
                                :
                                <View />
                            }
                        </View>
                        <View
                            style={{width: 2, height: 20, backgroundColor: '#d8d8d8'}}
                        />

                        <TouchableOpacity
                            style={styles.sendCodeContainer}
                            disabled={!this.state.verifyCodeButtonEnable}
                            onPress={this.fetchVerifyCodeClick}
                        >
                            <Text
                                style={this.state.verifyCodeButtonEnable ? {color: colors.activeBtn}
                                    : {color: colors.greyFont}}
                            >
                                {this.state.verifyCodeBtnText}
                            </Text>
                        </TouchableOpacity>

                    </View>
                    <View
                        style={styles.codeInput}
                    >
                        <TextInput
                            style={{flex: 1}}
                            value={this.store.verifyCode}
                            placeholder={'填写验证码'}
                            keyboardType={'numeric'}
                            returnKeyType={'done'}
                            underlineColorAndroid='transparent'
                            placeholderTextColor={colors.greyFont}
                            editable={this.state.canEditVerifyCode}
                            onChangeText={(text) => {
                                this.onVerfyCodeChanged(text);
                            }}
                        />
                        {this.store.verifyCode ?
                            <TouchableOpacity
                                onPress={() => {
                                    this.onVerfyCodeChanged('');
                                }}
                            >
                                <Image
                                    source={require('gsresource/img/delete.png')}
                                />
                            </TouchableOpacity>
                            :
                            <View />
                        }
                    </View>

                </ScrollView>
                <TouchableOpacity
                    style={this.state.canSubmit ? styles.bottomBtnActive
                        : styles.bottomBtnUnEnable}
                    disabled={!this.state.canSubmit}
                    onPress={this.changeUserMobile}
                >
                    <Text style={{color: colors.white, fontSize: fonts.font14}}>{I18n.t('done')}</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    // 填写手机号码
    onPhoneChange = (text) => {
        let canFetchVerifyCode = this.store.setPhone(text);
        if (canFetchVerifyCode !== this.state.verifyCodeButtonEnable) {
            this.setState({verifyCodeButtonEnable: canFetchVerifyCode});
            if (!canFetchVerifyCode) {
                this.setState({
                    canSubmit: false,
                    canEditVerifyCode: false
                });
            }
        }
    };

    // 填写验证码
    onVerfyCodeChanged = (text) => {
        let canSubmit = this.store.setVerifyCode(text);
        if (canSubmit !== this.state.canSubmit) {
            this.setState({canSubmit: canSubmit});
        }
    };

    fetchVerifyCodeClick = () => {
        Toast.loading();
        this.store.fetchVerifyCode()
            .then(() => {
                Toast.dismiss();
                this.setState({
                    verifyCodeButtonEnable: false,
                    canEditVerifyCode: true,
                    canEditMobile: false,
                });

                let countDown = 60;
                this.countDownInterval = setInterval(
                    action(() => {
                        if (countDown === 0) {
                            clearInterval(this.countDownInterval);
                            this.setState({
                                verifyCodeButtonEnable: true,
                                canEditMobile: true,
                                verifyCodeBtnText: I18n.t('fetchVerifyCode')
                            });
                        } else {
                            this.setState({
                                verifyCodeBtnText: `${countDown}s后重试`
                            });
                        }
                        countDown--;
                    }),
                    1000
                );
            })
            .catch(error => {
                Toast.dismiss();
                Alert.alert(I18n.t('alertNoticeTitle'), error.message);
            });
    };

    changeUserMobile = () => {
        UserActionSvc.track('USER_EDIT_PHONE');
        Toast.loading();
        this.store.changeUserMobile(this.store.verifyCode, (ret, ext) => {
            Toast.dismiss();
            if (ret) {
                Toast.show('修改成功');
                this.props.userStore.queryAccountInfo((updateResult, msg) => {
                    this.props.navigation.goBack();
                });
            } else {
                Alert.alert(ext);
            }
        });
    };
}

const styles = StyleSheet.create({

    inputPhoneContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 45,
        backgroundColor: colors.white,
        paddingLeft: 18,
    },

    inputPhone: {
        padding: 0,
        fontSize: fonts.font14,
        flex: 1,
    },

    sendCodeContainer: {
        width: 110,
        height: 20,
        alignItems: 'center',
        justifyContent: 'center',

    },

    codeInput: {
        height: 45,
        flexDirection: 'row',
        backgroundColor: colors.white,
        alignItems: 'center',
        paddingLeft: 18,
        paddingRight: 18,
        marginTop: 10,
    },

    bottomBtnActive: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.activeBtn,
        height: 45,
    },

    bottomBtnUnEnable: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.unEnable,
        height: 45,
    }
});