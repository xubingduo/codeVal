/**
 * author: liyanqin
 * Date: 2018/7/26
 * Time: 10:52
 * des:
 */

import React, { Component } from 'react';
import {
    TouchableWithoutFeedback,
    KeyboardAvoidingView,
    Image,
    Button,
    TouchableOpacity,
    Text,
    TextInput,
    StyleSheet,
    View,
    Dimensions,
    Platform
} from 'react-native';
import { observer, inject } from 'mobx-react';
import dismissKeyboard from 'react-native/Libraries/Utilities/dismissKeyboard';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import I18n from 'gsresource/string/i18n';
import PropTypes from 'prop-types';
import { Toast } from '@ecool/react-native-ui';
import Alert from 'component/Alert';
import { runInAction } from 'mobx';
import isIphoneX from 'utl/PhoneUtl';
import { ActionSheet } from '@ecool/react-native-ui';
import ConfigureChangeView from 'config/ConfigureChangeView';

const { width, height } = Dimensions.get('window');

@inject('authStore')
@observer
export default class LoginScreen extends Component {
    static propTypes = {
        navigation: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {
            verifyCodeButtonEnable: false,
            canEditVerifyCode: false,
            canLogin: false,
            canEditMobile: true,
            verifyCodeBtnText: I18n.t('fetchVerifyCode')
        };
    }

    componentDidMount() {
        this.props.authStore.initLastAccount(result => {
            this.setState({ verifyCodeButtonEnable: result });
        });
    }

    componentWillUnmount() {
        this.interval && clearInterval(this.interval);
    }

    //用户设置手机号
    onAccountChanged = text => {
        let canFetchVerifyCode = this.props.authStore.setAccount(text);
        if (canFetchVerifyCode !== this.state.verifyCodeButtonEnable) {
            this.setState({
                verifyCodeButtonEnable: canFetchVerifyCode
            });
            if (!canFetchVerifyCode) {
                this.setState({
                    canEditVerifyCode: false,
                    canLogin: false
                });
            }
        }
    };

    //用户设置验证码
    onVerfyCodeChanged = text => {
        let canLogin = this.props.authStore.setVerifyCode(text);
        if (canLogin !== this.state.canLogin) {
            this.setState({ canLogin: canLogin });
        }
    };

    //用户设置邀请码
    // onInviteCodeChanged = text => {
    //     this.props.authStore.setInviteCode(text);
    // };

    //点击获取验证码
    fetchVerifyCodeClick = () => {
        if (!this.props.authStore.account) {
            Toast.show('请输入手机号');
            return;
        }

        Toast.loading();
        this.props.authStore
            .fetchVerifyCode()
            .then(() => {
                Toast.show('验证码已发送');
                this.setState({
                    verifyCodeButtonEnable: false,
                    canEditVerifyCode: true,
                    canEditMobile: false
                });

                // 验证码获取成功 更新倒计时 将按钮设置为不可点击
                let countDown = 60;
                this.interval = setInterval(() => {
                    if (countDown === 0) {
                        clearInterval(this.interval);
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
                }, 1000);
            })
            .catch(error => {
                Alert.alert(I18n.t('alertNoticeTitle'), error.message);
                Toast.dismiss();
            });
    };

    //登录
    loginButtonClick = async () => {
        Toast.loading();
        try {
            await this.props.authStore.login();
            runInAction(() => (this.props.authStore.rootStore.isLogin = true));
            Toast.dismiss();
        } catch (error) {
            Alert.alert(I18n.t('alertNoticeTitle'), error.message);
            Toast.dismiss();
        }
    };

    /**
     * 上传日志
     */
    onUploadLogClick = () => {
        dlconsole.allLogFileMessages((err, result) => {
            if (result.length === 0) {
                Toast.show('当前没有日志信息', 2);
            } else {
                // 手动排序,系统sort()在安卓上有bug
                for (let i = 0, len = result.length; i < len; i++) {
                    for (let j = 0; j < result.length; j++) {
                        let obj1 = JSON.parse(JSON.stringify(result[i]));
                        let obj2 = JSON.parse(JSON.stringify(result[j]));
                        let name1 = parseFloat(
                            obj1.fileName
                                .replace(obj1.type, '')
                                .replace(/-/g, '')
                        );
                        let name2 = parseFloat(
                            obj2.fileName
                                .replace(obj2.type, '')
                                .replace(/-/g, '')
                        );
                        if (name1 < name2) {
                            result[j] = obj1;
                            result[i] = obj2;
                        }
                    }
                }
                let options = [];
                for (let i = 0; i < result.length; i++) {
                    let row = result[i];
                    if (
                        row.fileName.indexOf('log') === -1 &&
                        row.fileName.indexOf('zip') === -1
                    )
                        continue;
                    Object.assign(row, { id: i });
                    options.push(row.fileName.split('.')[0]);
                }
                options.push('取消');
                ActionSheet.showActionSheetWithOptions(
                    {
                        title: '选择日志上传',
                        options: options,
                        cancelButtonIndex: options.length - 1
                    },
                    index => {
                        if (index < options.length - 1) {
                            this.uploadLogFile(result[index]);
                        }
                    }
                );
            }
        });
    };

    uploadLogFile(item) {
        setTimeout(() => {
            Toast.loading();
            dlconsole.uploadLogFileForDate(
                item.fileName.split('.')[0],
                (error, result) => {
                    if (result) {
                        Toast.success('上传成功', 2);
                    } else {
                        Toast.fail('上传失败', 2);
                    }
                }
            );
        }, 300);
    }

    render() {
        return (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
                <View style={styles.container}>
                    <Image
                        style={styles.bg}
                        source={
                            isIphoneX()
                                ? require('/gsresource/img/loginBgX.png')
                                : require('/gsresource/img/loginBg.png')
                        }
                    />
                    <View style={styles.topOperationContainer}>
                        <TouchableOpacity
                            hitSlop={{
                                left: 16,
                                right: 16,
                                bottom: 16,
                                top: 16
                            }}
                            onPress={this.onUploadLogClick}
                            source={require('gsresource/img/setting.png')}
                        >
                            <Text
                                style={{
                                    color: colors.white,
                                    fontSize: fonts.font12
                                }}
                            >
                                {'上传日志'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    {Platform.OS === 'ios' ? (
                        <KeyboardAvoidingView
                            behavior={'padding'}
                            style={styles.contentContainer}
                        >
                            {this.renderContent()}
                        </KeyboardAvoidingView>
                    ) : (
                        <KeyboardAvoidingView style={styles.contentContainer}>
                            {this.renderContent()}
                        </KeyboardAvoidingView>
                    )}

                    <ConfigureChangeView />
                </View>
            </TouchableWithoutFeedback>
        );
    }

    //渲染内容
    renderContent = () => {
        return (
            // <View style={{ flex: 1 }}>
            <View style={styles.topContainer}>
                <Image
                    style={styles.logo}
                    source={require('/gsresource/img/logo.png')}
                />

                <View style={styles.inputContainer}>
                    <View style={styles.inputView}>
                        {this.renderAccountInputItem()}
                        {this.renderVerifycodeInputItem()}
                        {/* {this.renderInvitecodeInputItem()} */}
                        <TouchableOpacity
                            style={[
                                styles.loginButton,
                                this.state.canLogin
                                    ? { backgroundColor: '#ff6699' }
                                    : { backgroundColor: '#d4d4d4' }
                            ]}
                            onPress={this.loginButtonClick}
                            disabled={!this.state.canLogin}
                        >
                            <Text style={styles.submitText}>
                                {I18n.t('login')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View
                    style={{
                        width: width,
                        height: 1,
                        marginTop: 0.1 * height,
                        backgroundColor: 'transparent'
                    }}
                />
            </View>
            // {/* 第三方登录视图 */}
            // {/* <View style={styles.bottomContainer}>
            //     <View style={styles.thirdLogin}>
            //         <View style={styles.hLine}/>
            //         <Text style={{ color: colors.greyFont, fontSize: 14 }}>
            //             {I18n.t('thirdLogin')}
            //         </Text>
            //         <View style={styles.hLine}/>
            //     </View>
            //     <Image
            //         style={styles.weixin}
            //         source={require('gsresource/img/weixin.png')}
            //     />
            // </View> */}
            // </View>
        );
    };

    //渲染手机号输入框
    renderAccountInputItem = () => {
        return (
            <View style={styles.inputItem}>
                <Image source={require('/gsresource/img/account.png')} />
                <TextInput
                    style={styles.textInput}
                    placeholder={I18n.t('inputAccount')}
                    onChangeText={this.onAccountChanged}
                    value={this.props.authStore.account}
                    editable={this.state.canEditMobile}
                    keyboardType='numeric'
                    underlineColorAndroid='transparent'
                />
                {this.props.authStore.account && this.state.canEditMobile ? (
                    <TouchableOpacity
                        style={{ marginRight: 16 }}
                        hitSlop={{ left: 10, right: 10, bottom: 10, top: 10 }}
                        onPress={() => {
                            this.onAccountChanged('');
                        }}
                    >
                        <Image source={require('gsresource/img/delete.png')} />
                    </TouchableOpacity>
                ) : (
                    <View />
                )}
                <TouchableOpacity
                    style={styles.verifyCodeView}
                    disabled={!this.state.verifyCodeButtonEnable}
                    onPress={this.fetchVerifyCodeClick}
                >
                    <Text
                        style={[
                            styles.verifyCodeText,
                            this.state.verifyCodeButtonEnable
                                ? { color: '#ff6699' }
                                : { color: '#d4d4d4' }
                        ]}
                    >
                        {this.state.verifyCodeBtnText}
                    </Text>
                </TouchableOpacity>
            </View>
        );
    };

    //渲染验证码输入框
    renderVerifycodeInputItem = () => {
        return (
            <View style={styles.inputItem}>
                <Image source={require('/gsresource/img/password.png')} />
                <TextInput
                    style={styles.textInput}
                    placeholder={I18n.t('inputVerifyCode')}
                    onChangeText={this.onVerfyCodeChanged}
                    value={this.props.authStore.verifyCode}
                    editable={this.state.canEditVerifyCode}
                    keyboardType='numeric'
                    underlineColorAndroid='transparent'
                />
                {this.props.authStore.verifyCode ? (
                    <TouchableOpacity
                        hitSlop={{ left: 10, right: 10, bottom: 10, top: 10 }}
                        onPress={() => {
                            this.onVerfyCodeChanged('');
                        }}
                    >
                        <Image source={require('gsresource/img/delete.png')} />
                    </TouchableOpacity>
                ) : (
                    <View />
                )}
            </View>
        );
    };

    //渲染邀请码输入框
    // renderInvitecodeInputItem = () => {
    //     return (
    //         <View style={styles.inputItem}>
    //             <Image source={require('/gsresource/img/inviteIcon.png')} />
    //             <TextInput
    //                 style={styles.textInput}
    //                 placeholder={'请输入邀请码（非必填）'}
    //                 onChangeText={this.onInviteCodeChanged}
    //                 value={this.props.authStore.inviteCode}
    //                 underlineColorAndroid='transparent'
    //             />
    //             {this.props.authStore.verifyCode ? (
    //                 <TouchableOpacity
    //                     hitSlop={{ left: 10, right: 10, bottom: 10, top: 10 }}
    //                     onPress={() => {
    //                         this.onInviteCodeChanged('');
    //                     }}
    //                 >
    //                     <Image source={require('gsresource/img/delete.png')} />
    //                 </TouchableOpacity>
    //             ) : (
    //                 <View />
    //             )}
    //         </View>
    //     );
    // };
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    bg: {
        position: 'absolute',
        width: width,
        height: height,
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingTop: 0
    },
    topContainer: {
        width: width,
        justifyContent: 'flex-start',
        alignItems: 'center'
        // backgroundColor: 'yellow'
    },
    topOperationContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginTop: isIphoneX() ? 44 : 30,
        marginBottom: 8,
        marginRight: 16
    },
    logo: {
        marginBottom: 34
    },
    inputContainer: {
        height: 192,
        width: '100%',
        paddingLeft: 25,
        paddingRight: 25
    },
    inputView: {
        flex: 1,
        borderRadius: 4,
        backgroundColor: 'white',
        justifyContent: 'space-between'
    },
    inputItem: {
        flex: 1,
        height: 56,
        marginLeft: 23,
        marginRight: 23,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderBottomColor: colors.divide,
        borderBottomWidth: 1
    },
    textInput: {
        flex: 1,
        paddingLeft: 15,
        alignSelf: 'stretch',
        fontSize: 14
    },
    verifyCodeView: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    verifyCodeText: {
        color: '#ff6699',
        fontSize: 12
    },
    loginButton: {
        marginTop: 37,
        backgroundColor: '#d4d4d4',
        height: 45,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitText: {
        color: 'white',
        fontSize: 16
    }
});
