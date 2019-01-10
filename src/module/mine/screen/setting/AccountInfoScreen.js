/**
 * author: wwj
 * Date: 2018/8/8
 * Time: 下午1:49
 * des: 账户信息界面
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    ScrollView,
    TouchableOpacity,
    Text,
    Dimensions,
    Platform,
    NativeModules
} from 'react-native';
import Image from '../../../../component/Image';
import colors from '../../../../gsresource/ui/colors';
import I18n from '../../../../gsresource/string/i18n';
import NavigationHeader from '../../../../component/NavigationHeader';
import ImageTextWithArrowView from '../../../../component/ImageTextWithArrowView';
import fonts from '../../../../gsresource/ui/fonts';
import ImagePicker from 'react-native-image-picker';
import SingleLineInputDlg from '../../../../component/SingleLineInputDlg';
import AccountInfoStore from '../../store/setting/AccountInfoStore';
import { Toast, ActionSheet } from '@ecool/react-native-ui';
import Alert from '../../../../component/Alert';
import { observer, inject } from 'mobx-react';
import { runInAction } from 'mobx';
import DocSvc from '../../../../svc/DocSvc';
import Config from '../../../../config/Config';
import Permissions from 'react-native-permissions';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const ACTION_SHEET_OPTIONS = ['拍照', '从相册选择', '取消'];

@inject('userStore')
@observer
export default class AccountInfoScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{ color: colors.normalFont }}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('accountInfo')}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            )
        };
    };

    constructor(props) {
        super(props);

        this.state = {};
        this.store = new AccountInfoStore();
    }

    beforeMount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('账户信息界面');
        }
    }

    componentDidMount() {
        this.beforeMount();
        this.store.queryShopInfo();
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('账户信息界面');
        }
    }

    showImagePicker = () => {
        let options = {
            maxWidth: 300,
            maxHeight: 300,
            quality: 0.8,
        };
        if (Platform.OS === 'ios') {
            this.requestCameraPermissionIOS(options);
        } else {
            this.requestCameraPermissionAndroid(options);
        }
    };

    selectShow = (imagePickerOption, index) => {
        if (index === 0) {
            // 拍照
            ImagePicker.launchCamera(imagePickerOption, response => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePick Error: ', response.error);
                } else if (response.customButton) {
                    //
                } else {
                    this.updateAvatar(response.uri);
                }
            });
        } else if (index === 1) {
            ImagePicker.launchImageLibrary(imagePickerOption, response => {
                if (response.didCancel) {
                    console.log('User cancelled image picker');
                } else if (response.error) {
                    console.log('ImagePick Error: ', response.error);
                } else if (response.customButton) {
                    //
                } else {
                    this.updateAvatar(response.uri);
                }
            });
        }
    };

    requestCameraPermissionAndroid = imagePickerOption => {
        ActionSheet.showActionSheetWithOptions(
            {
                title: '请选择',
                options: ACTION_SHEET_OPTIONS,
                cancelButtonIndex: ACTION_SHEET_OPTIONS.length - 1
            },
            index => {
                if(index < ACTION_SHEET_OPTIONS.length - 1){
                    Permissions.request('camera').then(response => {
                        Permissions.request('photo').then(response => {
                            Permissions.checkMultiple(['camera', 'photo']).then(
                                response => {
                                    if (
                                        response.camera === 'authorized' &&
                                        response.photo === 'authorized'
                                    ) {
                                        this.selectShow(imagePickerOption, index);
                                    } else {
                                        Alert.alert(
                                            '相机或存储空间权限没有授予',
                                            '请前往设备的设置中允许访问'
                                        );
                                    }
                                }
                            );
                        });
                    });
                }
            });
    };

    /**
     * 判断相机照片权限 ios
     */
    requestCameraPermissionIOS = imagePickerOption => {
        ActionSheet.showActionSheetWithOptions(
            {
                title: '请选择',
                options: ACTION_SHEET_OPTIONS,
                cancelButtonIndex: ACTION_SHEET_OPTIONS.length - 1
            },
            index => {
                if (index < ACTION_SHEET_OPTIONS.length - 1) {
                    if (index === 0) {
                        //先检查是否已经同意 拍照
                        Permissions.check('camera').then(response => {
                            // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                            if (response === 'authorized') {
                                this.selectShow(imagePickerOption, index);
                            } else if (response === 'denied') {
                                Alert.alert(
                                    '无法使用相机',
                                    '请前往设备的设置中允许访问相机'
                                );
                            } else {
                                Permissions.request('camera').then(response => {
                                    // Returns once the user has chosen to 'allow' or to 'not allow' access
                                    // Response is one of: 'authorized', 'denied', 'restricted', or 'undetermined'
                                    if (response === 'authorized') {
                                        this.selectShow(
                                            imagePickerOption,
                                            index
                                        );
                                    }
                                });
                            }
                        });
                    } else if (index === 1) {
                        //从相册
                        Permissions.check('photo').then(response => {
                            if (response === 'authorized') {
                                this.selectShow(imagePickerOption, index);
                            } else if (response === 'denied') {
                                Alert.alert(
                                    '无法使用相册',
                                    '请前往设备设置中允许访问照片'
                                );
                            } else {
                                Permissions.request('photo').then(response => {
                                    if (response === 'authorized') {
                                        this.selectShow(
                                            imagePickerOption,
                                            index
                                        );
                                    }
                                });
                            }
                        });
                    }
                }
            }
        );
    };

    /**
     * 选择照片后返回进行上传
     * @param uri
     */
    updateAvatar = (uri) => {
        // 选择照片返回
        Toast.loading();
        this.store.uploadUserAvatar(
            uri,
            Config.DocUpLoadUrl,
            (result, ext) => {
                if (result) {
                    // 上传成功后 保存头像到用户信息
                    this.store.updateUserAvatar(
                        ext,
                        (updateRet, updateExt) => {
                            if (updateRet) {
                                Toast.dismiss();
                                runInAction(() => {
                                    this.props.userStore.accountInfo.avatar = DocSvc.docURLM(
                                        updateExt
                                    );
                                    this.props.userStore.accountInfo.avatarId = updateExt;
                                });
                            } else {
                                Toast.dismiss();
                                Alert.alert(updateExt);
                            }
                        }
                    );
                } else {
                    Toast.dismiss();
                    Alert.alert(ext);
                }
            }
        );
    };

    alertEditNicknameDialog = () => {
        SingleLineInputDlg.show({
            title: '修改昵称',
            hint: '请输入昵称',
            maxLength: 10,
            defaultText: this.props.userStore.accountInfo.nickName
                ? this.props.userStore.accountInfo.nickName
                : '',
            onConfirm: value => {
                if (value) {
                    Toast.loading();
                    // 修改昵称
                    this.store.updateAccountNickName(value, (ret, ext) => {
                        if (ret) {
                            this.props.userStore.queryAccountInfo();
                            Toast.success('昵称修改成功');
                        } else {
                            Toast.show(ext);
                        }
                    });
                } else {
                    Toast.show('昵称不能为空');
                }
            }
        });
    };

    renderUserAvatar = () => {
        if (this.props.userStore.accountInfo.avatar) {
            return (
                <Image
                    style={styles.avatar}
                    defaultSource={require('gsresource/img/userAvatarDefault.png')}
                    source={{
                        uri: this.props.userStore.accountInfo.avatar,
                        width: 60,
                        height: 60,
                        resizeMode: 'contain'
                    }}
                />
            );
        } else {
            return (
                <Image
                    style={styles.avatar}
                    defaultSource={require('gsresource/img/userAvatarDefault.png')}
                />
            );
        }
    };

    render() {
        return (
            <ScrollView style={styles.container}>
                <TouchableOpacity
                    style={styles.avatarContainer}
                    onPress={this.showImagePicker}
                >
                    <Text style={{ flex: 1, color: colors.normalFont }}>
                        头像
                    </Text>

                    {this.renderUserAvatar()}

                    <Image source={require('gsresource/img/arrowRight.png')} />
                </TouchableOpacity>

                <ImageTextWithArrowView
                    itemStyle={{ marginTop: 10 }}
                    textName={'昵称'}
                    textValue={this.props.userStore.accountInfo.nickName}
                    text1Style={{
                        fontSize: fonts.font14,
                        color: colors.normalFont,
                        marginLeft: 18,
                        marginRight: 6
                    }}
                    text2Style={{
                        fontSize: fonts.font14,
                        color: colors.normalFont
                    }}
                    onArrowClick={this.alertEditNicknameDialog}
                />
                <ImageTextWithArrowView
                    itemStyle={{ marginTop: 10, paddingRight: 10 }}
                    textName={'店铺名称'}
                    textValue={this.store.shopName}
                    text1Style={{
                        fontSize: fonts.font14,
                        color: colors.normalFont,
                        marginLeft: 18,
                        marginRight: 6
                    }}
                    text2Style={{
                        fontSize: fonts.font14,
                        color: colors.normalFont
                    }}
                    arrowShow={false}
                    withOutTouchView={true}
                />
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },

    avatarContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        height: 80,
        paddingLeft: 18,
        paddingRight: 18,
        alignItems: 'center',
        marginTop: 10
    },

    avatar: {
        borderRadius: 30,
        backgroundColor: colors.white,
        marginRight: 10
    }
});
