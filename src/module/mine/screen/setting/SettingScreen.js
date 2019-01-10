/**
 * author: wwj
 * Date: 2018/8/8
 * Time: 上午9:24
 * des:
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    ScrollView,
    TouchableOpacity,
    Text,
    Platform,
    Linking,
    NativeModules
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { observer, inject } from 'mobx-react';
import colors from '../../../../gsresource/ui/colors';
import I18n from '../../../../gsresource/string/i18n';
import NavigationHeader from '../../../../component/NavigationHeader';
import ImageTextWithArrowView from '../../../../component/ImageTextWithArrowView';
import DividerLineH from '../../../../component/DividerLineH';
import fonts from '../../../../gsresource/ui/fonts';
import ConfirmAlert from 'component/ConfirmAlert';
import Alert from 'component/Alert';
import { ActionSheet, Toast } from '@ecool/react-native-ui';
import Config, {
    IS_INTERNAL_VERSION,
    IS_STAND_APP
} from '../../../../config/Config';
import { runInAction } from 'mobx';
import SearchHistoryStore from '../../../order/store/SearchHistoryStore';
import configStore from 'store/ConfigStore';

let UpdateModule = NativeModules.UpdateModule;
import IndexApiManager from 'apiManager/IndexApiManager';
import ShareSvc from '../../../../svc/ShareSvc';
import SliderShare from '../../../coupon/widget/SliderShare';
import rootStore from 'store/RootStore';

@inject('authStore', 'userStore', 'searchHistoryStore')
@observer
export default class SettingScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{ color: colors.normalFont }}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('set')}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.storeGoods = this.props.searchHistoryStore;
        this.storeOrder = new SearchHistoryStore();
        this.state = {
            isBindWx: false
        };
        // console.log(rootStore.userStore.user)
        // let user = rootStore.userStore.user;
        // LogFileUpload.setParams(user ? user.deviceNo : '', user ? user.uniCode : '');
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('设置界面');
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('设置界面');
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={styles.contentContainer}>
                    <ImageTextWithArrowView
                        text1Style={styles.itemText}
                        textName={I18n.t('changePhone')}
                        onArrowClick={() => {
                            this.props.navigation.navigate('ChangePhoneScreen');
                        }}
                        textValue={this.encryptMobile(
                            this.props.userStore.accountInfo.mobile
                        )}
                    />
                    <DividerLineH />
                    {/*<ImageTextWithArrowView*/}
                    {/*textName={I18n.t('bindWechat')}*/}
                    {/*onArrowClick={() => {*/}

                    {/*}}*/}
                    {/*textValue={this.state.isBindWx ? '已绑定' : '未绑定'}*/}
                    {/*text2Style={this.state.isBindWx ? {color: colors.greyFont} : {color: colors.activeFont}}*/}
                    {/*/>*/}
                    {/*<DividerLineH/>*/}
                    <ImageTextWithArrowView
                        text1Style={styles.itemText}
                        textName={'主营类目'}
                        textValue={
                            configStore.businessCategary
                                ? configStore.businessCategary.codeName
                                : ''
                        }
                        onArrowClick={() => {
                            this.props.navigation.navigate(
                                'BusinessCategoryChooseScreen',
                                {
                                    mode: 2,
                                    id: configStore.businessCategary
                                        ? configStore.businessCategary.codeValue
                                        : 0,
                                    completeHandler: () => {
                                        // rootStore.shopStore.
                                    }
                                }
                            );
                        }}
                    />
                    <DividerLineH />
                    <ImageTextWithArrowView
                        text1Style={styles.itemText}
                        textName={I18n.t('receiveAddress')}
                        onArrowClick={() => {
                            this.props.navigation.navigate(
                                'AddressListManagerScreen',
                                { screenMode: 1 }
                            );
                        }}
                    />
                    <DividerLineH />
                    <ImageTextWithArrowView
                        text1Style={styles.itemText}
                        itemStyle={{ marginTop: 10 }}
                        textName={I18n.t('shareApp')}
                        onArrowClick={() => {
                            this.openSharePopup();
                        }}
                    />
                    <DividerLineH />
                    <ImageTextWithArrowView
                        text1Style={styles.itemText}
                        textName={I18n.t('aboutUs')}
                        onArrowClick={() => {
                            this.props.navigation.navigate('AboutUsScreen');
                        }}
                    />
                    <DividerLineH />
                    <ImageTextWithArrowView
                        text1Style={styles.itemText}
                        textName={'认证信息'}
                        onArrowClick={() => {
                            this.props.navigation.navigate('ShopAuthScreen', {
                                mode: 1
                            });
                        }}
                    />
                    <DividerLineH />
                    <ImageTextWithArrowView
                        text1Style={styles.itemText}
                        itemStyle={{ paddingRight: 10 }}
                        textName={I18n.t('currentVersion')}
                        textValue={DeviceInfo.getVersion()}
                        onArrowClick={() => {}}
                        arrowShow={false}
                        withOutTouchView={true}
                    />
                    <DividerLineH />

                    {IS_STAND_APP && (
                        <ImageTextWithArrowView
                            text1Style={styles.itemText}
                            itemStyle={{ marginTop: 10, paddingRight: 10 }}
                            textName={'上传日志'}
                            onArrowClick={this.onUploadLogClick}
                            arrowShow={false}
                        />
                    )}

                    {IS_STAND_APP && <DividerLineH />}

                    {IS_STAND_APP && (
                        <ImageTextWithArrowView
                            text1Style={styles.itemText}
                            itemStyle={{ paddingRight: 10 }}
                            textName={'检查更新'}
                            onArrowClick={this.checkUpdate}
                            arrowShow={false}
                        />
                    )}
                    {!IS_INTERNAL_VERSION && <DividerLineH />}
                    {!IS_INTERNAL_VERSION && (
                        <ImageTextWithArrowView
                            text1Style={styles.itemText}
                            itemStyle={{ paddingRight: 10 }}
                            textName={'更多'}
                            onArrowClick={() => {
                                this.props.navigation.navigate('DevScreen');
                            }}
                            arrowShow={false}
                        />
                    )}
                </ScrollView>

                {IS_STAND_APP && (
                    <TouchableOpacity
                        style={styles.bottomBtnView}
                        onPress={this.logout}
                    >
                        <Text
                            style={{
                                color: colors.white,
                                fontSize: fonts.font14
                            }}
                        >
                            {I18n.t('logout')}
                        </Text>
                    </TouchableOpacity>
                )}

                {/*分享*/}
                <SliderShare
                    ref={ref => {
                        this.sharePop = ref;
                    }}
                    chooseItemCallback={this.shareItemCallback}
                />
            </SafeAreaView>
        );
    }

    /**
     * 手机号显示 ***
     */
    encryptMobile = mobile => {
        if (mobile && mobile.length >= 11) {
            return (
                mobile.substring(0, 3) +
                '***' +
                mobile.substring(6, mobile.length)
            );
        } else {
            return '';
        }
    };

    /**
     * 退出登录
     */
    logout = () => {
        global.dlconsole.log('点击退出登录');
        ConfirmAlert.alert('是否需要退出登录?', '', async () => {
            this.storeGoods.clearSearchHistory();
            this.storeOrder.clearSearchHistory();
            try {
                Toast.loading();
                await this.props.authStore.logout();
                runInAction(() => {
                    configStore.setBusinessCategary(null);
                });
                Toast.dismiss();
            } catch (error) {
                Toast.dismiss();
                Alert.alert(error.message);
            }
        });
    };

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

    /**
     * 检查升级提醒
     */
    checkUpdate = () => {
        if (Platform.OS === 'android') {
            this.checkUpdateAndroid();
        } else {
            this.checkUpdateIos();
        }
    };

    checkUpdateIos = async () => {
        let phone = this.props.userStore.user
            ? this.props.userStore.user.deviceNo
            : '';
        let params = {
            deviceno: phone,
            devicetype: Platform.OS === 'ios' ? '18' : '19',
            dlProductCode:
                Platform.OS === 'ios' ? 'slhGoodShopIOS' : 'slhGoodShopAndroid'
        };
        try {
            const data = await IndexApiManager.checkUpdate(params);
            const upgradeFlag = data.upgradeFlag;
            if (upgradeFlag !== '0') {
                // 提醒信息
                const msg = data.upgradeMsg.upgradeMessage;
                // 更新方式 （0:仅通知非升级；1:提醒升级；2.强制升级）
                const noticemethod = data.upgradeMsg.noticemethod;
                if (noticemethod === 0) {
                    !this.state.alreadyNotifyUpdate && Toast.show(msg, 3);
                    this.setState({ alreadyNotifyUpdate: true });
                } else {
                    let options = [];
                    // 取消事件
                    noticemethod === 1 && options.push({ text: '取消' });

                    // 标记位
                    // 处理升级
                    options.push({
                        text: '升级',
                        onPress: () => {
                            Linking.openURL(
                                'itms-apps://itunes.apple.com/app/id1436455359'
                            );
                            if (noticemethod === 2) {
                                this.setState({ alreadyNotifyUpdate: false });
                            }
                        }
                    });
                    Alert.alert('升级提醒', msg, options);
                }
            } else {
                Toast.show('已是最新版本无需升级');
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    checkUpdateAndroid() {
        let baseUrl = Config.entranceServerUrl1;
        let phone = this.props.userStore.user
            ? this.props.userStore.user.mobile
            : '';

        if (!phone || !baseUrl) {
            return;
        }

        let params = {
            deviceno: phone.toString(),
            devicetype: Platform.OS === 'ios' ? '18' : '19',
            sessionId: this.props.userStore.user.sessionId,
            productVersion: DeviceInfo.getVersion().toString(),
            dlProductCode:
                Platform.OS === 'ios' ? 'slhGoodShopIOS' : 'slhGoodShopAndroid'
        };
        UpdateModule.checkUpdate(
            baseUrl + '/spg/checkUpgrade.do',
            params,
            isNeedUpdate => {
                if (!isNeedUpdate) {
                    Toast.show('已是最新版本无需升级');
                }
            }
        );
    }

    /**
     * 打开分享弹框界面
     */
    openSharePopup() {
        if (this.sharePop) {
            this.sharePop.show();
        }
    }

    shareItemCallback = (val, key) => {
        this.shareApp(val);
    };

    /**
     * 分享app到第三方平台
     * @param val
     */
    shareApp(val) {
        let shareUrlLink =
            'https://webdoc.hzecool.com/goodShopShare/dist/index.html?from=singlemessage&isappinstalled=0#/downLoad';
        let obj = {
            type: val.key,
            shareUrlLink: shareUrlLink,
            shareThumbUrl:
                'https://webdoc.hzecool.com/goodShopShare/dist/static/img/goodShop.jpg',
            shareTitle: '四季青爆款秋装，现货，1件起批，批发价，要不要？',
            shareDesc:
                '商陆好店，全新服装拿货渠道，每天2000+现货爆款上新，全国零售老板都在用！'
        };
        ShareSvc.shareUrlLink(obj, (isTrue, text) => {
            // 分享失败原因
            if (!isTrue) {
                Toast.show(text, 2);
            }
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    contentContainer: {
        flex: 1
    },

    bottomBtnView: {
        height: 45,
        backgroundColor: colors.activeBtn,
        justifyContent: 'center',
        alignItems: 'center'
    },

    itemText: {
        fontSize: fonts.font14,
        marginLeft: 10,
        color: colors.normalFont,
        borderColor: colors.bg
    }
});
