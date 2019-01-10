import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {runInAction} from 'mobx';
import {
    StyleSheet,
    View, ScrollView,
    SafeAreaView, TouchableOpacity,
    Text, Image,
    TextInput, Switch, Platform, NativeModules,
} from 'react-native';
import colors from '../../../../gsresource/ui/colors';
import fonts from '../../../../gsresource/ui/fonts';
import I18n from '../../../../gsresource/string/i18n';
import NavigationHeader from '../../../../component/NavigationHeader';
import EditAddressStore from '../../store/address/EditAddressStore';
import TextLeftTextInput from '../../../../component/TextLeftTextInput';
import {Toast} from '@ecool/react-native-ui';
import Picker from 'antd-mobile-rn/lib/picker';
import Alert from '../../../../component/Alert';
import rootStore from 'store/RootStore';
import ConfirmAlert from 'component/ConfirmAlert';
import UserActionSvc from 'svc/UserActionSvc';
import * as _ from 'lodash';
import SingleLineInputDlg from '../../../../component/SingleLineInputDlg';

/**
 *                           跳转携带的参数
 *                      id: number = 地址的id 编辑时需要携带
 *                  isAdd: boolean = true: 新建收货地址  false: 编辑收货地址
 *              screenMode: number = 1: 管理地址模式  2: 选择地址模式(新建保存并使用)
 *              saveCallback: func = 保存或修改成功后的回调方法
 *      onDeleteAddrCallback: func = 删除地址成功后的回调方法
 */

@observer
export default class EditAddressScreen extends Component {

    static navigationOptions = ({navigation}) => {
        let isAdd = navigation.getParam('isAdd', false);
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={isAdd ? '新建收货地址' : '编辑收货地址'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.editStore = new EditAddressStore();
        this.state = {
            screenMode: 1,
        };
    }

    beforeMount() {
        this.setState({
            screenMode: this.props.navigation.getParam('screenMode', 1),
        });
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageStart('新建/编辑收货地址');
        }
    }

    componentDidMount() {
        this.beforeMount();
        let {params} = this.props.navigation.state;
        this.editStore.setIsAdd(params.isAdd);
        if (!params.isAdd) {
            Toast.loading();
            this.editStore.queryAddressDetail(params.id, (ret, ext) => {
                Toast.dismiss();
                if (!ret) {
                    Alert.alert(ext);
                }
            });
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageEnd('新建/编辑收货地址');
        }
    }

    render() {

        return (
            <SafeAreaView
                style={styles.container}
            >
                <ScrollView
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                    }}
                    keyboardShouldPersistTaps={'handled'}
                >
                    <View style={{backgroundColor: colors.white}}>
                        {/*<TextLeftTextInput*/}
                        {/*leftTitle={'姓名'}*/}
                        {/*rightPlaceholder={'输入姓名'}*/}
                        {/*returnKeyType={'done'}*/}
                        {/*maxLength={10}*/}
                        {/*keyboardType={'default'}*/}
                        {/*onChangeText={(text) => {*/}
                        {/*this.editStore.setLinkName(text);*/}
                        {/*if (text && text.length >= 10) {*/}
                        {/*Toast.show('姓名最多输入10个字');*/}
                        {/*}*/}
                        {/*}}*/}
                        {/*inputText={this.editStore.linkMan}*/}
                        {/*/>*/}
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: colors.white,
                                paddingLeft: 10,
                                paddingRight: 10,
                                paddingTop: 12,
                                paddingBottom: 12,
                            }}
                            onPress={() => {
                                this.alertEditNameDialog(this.editStore.linkMan);
                            }}
                        >
                            <Text style={{
                                fontSize: fonts.font14,
                                color: colors.normalFont,
                            }}
                            >{'姓名'}</Text>
                            <Text style={{color: '#ff0000', marginLeft: 3}}>{'*'}</Text>
                            <Text
                                style={{
                                    padding: 0,
                                    textAlign: 'right',
                                    flex: 1,
                                    marginLeft: 10,
                                    color: this.editStore.linkMan ? colors.normalFont : colors.greyFont
                                }}
                            >{this.editStore.linkMan ? this.editStore.linkMan : '输入姓名'}</Text>
                        </TouchableOpacity>
                        {this.renderLine()}
                        <TextLeftTextInput
                            leftTitle={'手机'}
                            rightPlaceholder={'输入手机号'}
                            returnKeyType={'done'}
                            keyboardType={'numeric'}
                            onChangeText={(text) => {
                                this.editStore.setTelephone(text);
                            }}
                            inputText={this.editStore.telephone}
                            maxLength={11}
                            isMustRequired={true}
                        />
                        {this.renderLine()}
                        <TextLeftTextInput
                            leftTitle={'邮编'}
                            returnKeyType={'done'}
                            maxLength={6}
                            rightPlaceholder={'输入编码'}
                            keyboardType={'numeric'}
                            inputText={this.editStore.postcode}
                            onChangeText={(text) => {
                                runInAction(() => this.editStore.postcode = text);
                            }}
                        />
                        {this.renderLine()}
                        {this.renderAreaView()}
                        {this.renderLine()}
                        {this.renderDetailInput()}
                    </View>

                    {this.renderSwitchItem()}
                    {this.renderDeleteView()}
                </ScrollView>

                {this.renderBottomBnt()}

            </SafeAreaView>
        );
    }

    renderLine = () => {
        return (
            <View
                style={{
                    marginLeft: 10,
                    height: 1,
                    backgroundColor: colors.bg,
                }}
            />
        );
    };

    renderBottomBnt = () => {
        let btnName = I18n.t('save');
        // 新建地址
        if (this.editStore.isAdd) {
            if (this.state.screenMode === 1) {
                btnName = I18n.t('save');
            } else {
                btnName = I18n.t('addAddrAndUse');
            }
        } else { // 修改地址
            if (this.state.screenMode === 1) {
                btnName = I18n.t('save');
            } else {
                btnName = I18n.t('saveAddrAndUse');
            }
        }
        return (
            <TouchableOpacity
                style={styles.bottomButton}
                onPress={this.state.screenMode === 1 ? this.saveAddress : this.saveAddrAndUse}
            >
                <Text style={{fontSize: fonts.font14, color: colors.white}}>{btnName}</Text>
            </TouchableOpacity>
        );
    };

    renderAreaView = () => {
        const CustomChildren = (props: any) => (
            <TouchableOpacity onPress={props.onClick}>
                <View style={styles.addressContainer}>
                    <View
                        style={styles.commonItemContainer}
                    >
                        <Text style={styles.text}>地区</Text>
                        <Text style={{color: '#ff0000', marginLeft: 3}}>{'*'}</Text>
                        <Text
                            style={styles.areaText}
                        >
                            {props.extra}
                        </Text>
                        <Image
                            source={require('gsresource/img/arrowRight.png')}
                        />
                    </View>
                </View>
            </TouchableOpacity>
        );
        return (
            <Picker
                title='请选择'
                data={rootStore.configStore.region}
                cols={3}
                value={this.editStore.addrAreaCode}
                onChange={this.onDistrictChange}
                onOk={this.onDistrictOk}
                itemStyle={{fontSize: 12}}
            >
                <CustomChildren />
            </Picker>
        );
    };

    alertEditNameDialog = (defaultName) => {
        SingleLineInputDlg.show({
            title: '收货人姓名',
            hint: '请输入收货人姓名(最多六个字)',
            defaultText: defaultName,
            onConfirm: (value) => {
                value = _.trim(value);
                if (value && value.length > 6) {
                    Toast.show('姓名最多设置六个字');
                    value = value.substring(0, 6);
                }
                this.editStore.setLinkName(value);
            }
        });
    };

    onDistrictChange = (value) => {
    };

    /**
     * 地址选择确定回调
     * @param value
     */
    onDistrictOk = (value) => {
        runInAction(() => this.editStore.addrAreaCode = value);
    };

    renderDetailInput = () => {
        return (
            <View
                style={{
                    padding: 10,
                    height: 100,
                }}
            >
                <TextInput
                    style={styles.detailInput}
                    placeholder={'详细地址(必填)'}
                    returnKeyType={'done'}
                    blurOnSubmit={true}
                    multiline={true}
                    value={this.editStore.detailAddr}
                    onChangeText={(text) => {
                        this.editStore.setDetailAddr(text);
                        if (text && text.length >= 50) {
                            Toast.show('详细地址最多输入50个字');
                        }
                    }}
                    underlineColorAndroid='transparent'
                    maxLength={50}
                />

            </View>
        );

    };

    renderSwitchItem = () => {
        return (
            <TouchableOpacity
                style={[styles.commonItemContainer, {justifyContent: 'space-between', marginTop: 10}]}
            >
                <Text style={styles.text}>设为默认</Text>
                <Switch
                    value={this.editStore.getIsDefault}
                    onValueChange={(checked) => {
                        this.editStore.setIsDefault(checked ? 1 : 0);
                    }}
                />
            </TouchableOpacity>
        );
    };

    renderDeleteView = () => {
        if (!this.editStore.isAdd) {
            return (
                <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={this.deleteAddr}
                >
                    <Text
                        style={{
                            fontSize: fonts.font14,
                            color: colors.activeBtn
                        }}
                    >删除收货地址</Text>
                </TouchableOpacity>
            );
        }
    };

    /**
     * 删除地址
     */
    deleteAddr = () => {
        ConfirmAlert.alert('是否删除地址?', '', () => {
            this.editStore.deleteAddr((ret, ext) => {
                if (ret) { // 成功删除 ext为地址id
                    UserActionSvc.track('USER_ADDRESS_DELETE');
                    // 刷新列表
                    if (this.props.navigation.state.params.onDeleteAddrCallback) {
                        this.props.navigation.state.params.onDeleteAddrCallback(ext);
                    }
                    Toast.success('删除成功');
                    this.props.navigation.goBack();
                } else {
                    Toast.show(ext);
                }
            });
        });
    };

    /**
     * 新增或修改地址
     */
    saveAddress = () => {
        Toast.loading();
        _.throttle(() => {
            if (this.editStore.isAdd) {
                UserActionSvc.track('USER_ADDRESS_ADD');
            } else { // 修改地址
                UserActionSvc.track('USER_ADDRESS_EDIT');
            }
            this.editStore.saveAddr((msg) => {
                Toast.dismiss();
                Alert.alert(msg);
            }, (ret, ext) => { // 请求成功 ext为地址id
                Toast.dismiss();
                if (ret) {
                    // 刷新列表
                    if (this.props.navigation.state.params.saveCallback) {
                        this.props.navigation.state.params.saveCallback();
                    }
                    this.props.navigation.goBack();
                } else {
                    Toast.show(ext);
                }
            });
        }, 300)();

    };

    /**
     * 新增或修改地址 并将该地址详情返回给回调函数
     */
    saveAddrAndUse = () => {
        Toast.loading();
        _.throttle(() => {
            this.editStore.saveAddrAndUse((msg) => {
                Toast.dismiss();
                Alert.alert(msg);
            }, (ret, ext) => { // 请求成功 ext为 data中的recInfo对象 包含了收货地址的相关数据
                Toast.dismiss();
                if (ret) {
                    // 将收货地址返回给使用到的界面 如订单确认界面
                    if (this.props.navigation.state.params.saveCallback) {
                        this.props.navigation.state.params.saveCallback(ext);
                    }
                    this.props.navigation.goBack();
                } else {
                    Toast.show(ext);
                }
            });
        }, 300)();

    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    commonItemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 12,
        paddingBottom: 12,
    },
    bottomButton: {
        backgroundColor: colors.activeBtn,
        alignItems: 'center',
        height: 45,
        justifyContent: 'center',
    },
    text: {
        fontSize: fonts.font14,
        color: colors.normalFont,
    },
    areaText: {
        fontSize: fonts.font14,
        color: colors.normalFont,
        textAlign: 'right',
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
    },
    detailInput: {
        fontSize: fonts.font12,
        color: colors.normalFont,
        flex: 1,
    },
    deleteButton: {
        height: 45,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        marginTop: 10,
    }
});