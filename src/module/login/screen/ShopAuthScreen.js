/**
 * @author [lyq]
 * @email
 * @create date 2018-08-02 01:42:36
 * @modify date 2018-08-02 01:42:36
 * @desc [店铺认证Screen]
 */

import React, { Component } from 'react';
import {
    Text,
    Image,
    View,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Dimensions
} from 'react-native';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import SingleLineInputDlg from 'component/SingleLineInputDlg';
import I18n from 'gsresource/string/i18n';
import ShopStore, { SectionKey } from 'module/login/store/ShopStore';
import { observe, runInAction, toJS } from 'mobx';
import { observer, inject, Observer } from 'mobx-react';
import NavigationHeader from 'component/NavigationHeader';
import rootStore from 'store/RootStore';
import {
    ChooseImageGridView,
    Toast,
    PhotoBrowser
} from '@ecool/react-native-ui';
import Button from 'antd-mobile-rn/lib/button';
import List from 'antd-mobile-rn/lib/list';
import Picker from 'antd-mobile-rn/lib/picker';
import Alert from 'component/Alert';
import StringUtl from 'utl/StringUtl';
import RegUtil from 'utl/RegUtil';
import topView from 'rn-topview';
import DividerLineH from 'component/DividerLineH';
import ActionSheet from '@ecool/react-native-ui/lib/actionsheet/index';
import { getShopBusinessInfo } from 'svc/DataSyncSvc';
import configStore from 'store/ConfigStore';
import DLMessageCenter from '@ecool/react-native-message';
import { DLMessageType } from '@ecool/react-native-message/lib/DLMessageCenter';
import { getStorage, removeStorage, setStorage } from 'svc/StorageSvc';
const { width, height } = Dimensions.get('window');
import ListViewTextArrowCell from 'component/ListViewTextArrowCell';
import { GridView } from '@ecool/react-native-ui';
import PropTypes from 'prop-types';
import ImageViewer from 'component/ImageViewer';
import storage from 'utl/DLStorage';
import NavigationSvc from 'svc/NavigationSvc';

@observer
export default class ShopAuthScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param mode 1没有邀请码 不传/0有邀请码
         */
        navigation: PropTypes.object
    };

    constructor(props) {
        super(props);
        let params = this.props.navigation.state.params;
        this.shopStore = new ShopStore();
        this.state = {
            isTrue: false,
            mode: params && params.mode ? params.mode : 0
        };
    }

    observers = []; // 记录监听消息
    static navigationOptions = ({ navigation }) => {
        let params = navigation.state.params;
        let mode = params && params.mode ? params.mode : 0;
        let canChangeAccount = mode !== 1;
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    navigationTitleItem={I18n.t('shopAuth')}
                    navigationLeftItem={
                        mode === 1 ? (
                            <TouchableOpacity
                                hitSlop={{
                                    top: 8,
                                    left: 8,
                                    bottom: 8,
                                    right: 8
                                }}
                                onPress={() => {
                                    navigation.goBack();
                                }}
                            >
                                <Image
                                    source={require('gsresource/img/arrowLeftGrey.png')}
                                />
                            </TouchableOpacity>
                        ) : null
                    }
                    leftTitleStyle={{ color: colors.normalFont }}
                />
            )
        };
    };

    componentDidMount() {
        global.dlconsole.log('认证页渲染');
        //监听消息中心的消息
        this.observers.push(
            DLMessageCenter.addObserver(data => {
                global.dlconsole.log('认证页面接收消息中心通知：' + data);
                if (data && data.length > 0) {
                    const message = data.pop();
                    let msgBean = message.msgBean;
                    let metas = message.metas;

                    if (metas.tagOne === 201) {
                        global.dlconsole.log('认证页面弹出新人券');
                        setStorage('HAS_NEW_COUPONS', true);
                    }
                }
            }, DLMessageType.DLMessageNewLinkOrder)
        );
        this.props.navigation.setParams({
            ignoreAuth: this.ignoreAuth
        });
        this.fetchShopAuthInfo();
    }

    componentWillUnmount() {
        global.dlconsole.log('认证页销毁');
        this.observers.forEach(item => {
            DLMessageCenter.removeObserver(item);
        });
    }

    fetchShopAuthInfo = async () => {
        try {
            await this.shopStore.fetchShopAuthInfo();
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    /**
     * 跳过认证
     */
    // ignoreAuth = () => {
    //     global.dlconsole.log('点击跳过认证');
    //     runInAction(() => {
    //         rootStore.authStore.inTryUse = true;
    //         rootStore.authStore.canTryUse = true;
    //     });
    //     storage.save({ key: 'INTRYUSE', data: true });
    // };

    /**
     * 输入店铺名称
     */
    inputShopName = () => {
        SingleLineInputDlg.show({
            title: I18n.t('shopName'),
            maxLength: 20,
            hint: I18n.t('input') + I18n.t('shopName'),
            onConfirm: value => {
                if (StringUtl.isEmpty(value) || RegUtil.hasEmoji(value)) {
                    Toast.show('请输入正确的店铺名称', 2);
                } else {
                    runInAction(() => (this.shopStore.shop.shopName = value));
                }
            }
        });
    };

    /**
     * 输入邀请码
     */
    inputInviteCode = () => {
        SingleLineInputDlg.show({
            title: '邀请码',
            maxLength: 20,
            hint: I18n.t('input') + '邀请码',
            onConfirm: value => {
                if (RegUtil.hasEmoji(value)) {
                    Toast.show('请输入正确的邀请码', 2);
                } else {
                    runInAction(() => (this.shopStore.shop.inviteCode = value));
                }
            }
        });
    };

    /**
     * 输入店铺shopAddr
     */
    inputAddress = () => {
        SingleLineInputDlg.show({
            title: '店铺地址',
            defaultText:
                this.shopStore.shop && this.shopStore.shop.shopAddr
                    ? this.shopStore.shop.shopAddr
                    : '',
            maxLength: 50,
            hint: I18n.t('input') + '店铺地址',
            onConfirm: value => {
                if (StringUtl.isEmpty(value) || RegUtil.hasEmoji(value)) {
                    Toast.show('请输入正确的店铺地址', 2);
                } else {
                    runInAction(() => (this.shopStore.shop.shopAddr = value));
                }
            }
        });
    };

    /**
     * 渲染上传图片section
     */
    renderUploadImageSection = (
        title,
        imageDatas,
        renderImageItemFunc,
        selectedChangeFunc,
        docIds
    ) => {
        return (
            <View style={styles.scetionContainer}>
                <Text style={{ color: colors.normalFont, fontSize: 14 }}>
                    {title}
                </Text>

                <ChooseImageGridView
                    imagePickerOption={{
                        maxWidth: 1080,
                        maxHeight: 1920,
                        quality: 0.8
                    }}
                    maxNumberOFImage={3}
                    renderItem={renderImageItemFunc}
                    onSelectedChanged={selectedChangeFunc}
                    initialImages={imageDatas}
                />

                {/* <GridView
                    items={imageDatas}
                    renderItem={(item, infdex) => {
                        return (
                            <ImageViewer
                                style={{
                                    width: 75,
                                    height: 75,
                                    borderRadius: 2
                                }}
                                source={{ uri: item }}
                                defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                                docIDs={docIds.slice()}
                                index={index}
                            />
                        );
                    }}
                /> */}
            </View>
        );
    };

    RealRenderImageItem = (item, index, sectionKey) => {
        return (
            <TouchableOpacity
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: 1,
                    backgroundColor: 'green'
                }}
                onPress={() => {
                    this.onImageItemClick(item, index, sectionKey);
                }}
            >
                <Image
                    style={{ width: '100%', height: '100%' }}
                    source={{ uri: item }}
                />
            </TouchableOpacity>
        );
    };

    /**
     * 渲染自定义照片容器
     */
    renderHeadImgItem = (item, index) => {
        return this.RealRenderImageItem(item, index, 0);
    };
    /**
     * 渲染自定义照片容器
     */
    renderContentImgItem = (item, index) => {
        return this.RealRenderImageItem(item, index, 1);
    };
    /**
     * 渲染自定义照片容器
     */
    renderCerImgItem = (item, index) => {
        return this.RealRenderImageItem(item, index, 2);
    };

    /**
     * 点击图片
     */
    onImageItemClick = (item, index, sectionKey) => {
        let imageDatas = [];
        if (sectionKey === SectionKey.Head) {
            imageDatas = this.shopStore.shop.headPic;
        } else if (sectionKey === SectionKey.Content) {
            imageDatas = this.shopStore.shop.contentPic;
        }
        if (sectionKey === SectionKey.Identity) {
            imageDatas = this.shopStore.shop.certPic;
        }

        let medias = [];
        for (let i = 0, len = imageDatas.length; i < len; i++) {
            if (imageDatas[i].length <= 0) continue;
            medias.push({
                photo: imageDatas[i],
                selected: false
            });
        }

        // topView.set(
        //     <View style={{ width: width, height: height }}>
        //         <SafeAreaView style={{ flex: 1, backgroundColor: 'black' }}>
        //             <PhotoBrowser
        //                 onBack={() => {
        //                     topView.remove();
        //                 }}
        //                 mediaList={medias}
        //                 initialIndex={0}
        //                 displayActionButton={false}
        //                 displaySelectionButtons={false}
        //                 displayTopBar={true}
        //                 onActionButton={() => {}}
        //                 onSelectionChanged={(media, index, isSelected) => {}}
        //             />
        //         </SafeAreaView>
        //     </View>
        // );
    };

    /** 图片发生变化*/
    onHeadImgsChange = imgs => {
        Toast.loading();
        this.shopStore.changeImgs(imgs, SectionKey.Head, (result, response) => {
            Toast.dismiss();
            if (!result) {
                Alert.alert(response.message);
            }
        });
    };

    onContentImgsChange = imgs => {
        Toast.loading();
        this.shopStore.changeImgs(
            imgs,
            SectionKey.Content,
            (result, response) => {
                Toast.dismiss();
                if (!result) {
                    Alert.alert(response.message);
                }
            }
        );
    };

    onCerImgsChange = imgs => {
        Toast.loading();
        this.shopStore.changeImgs(
            imgs,
            SectionKey.Identity,
            (result, response) => {
                Toast.dismiss();
                if (!result) {
                    Alert.alert(response.message);
                }
            }
        );
    };

    /**
     * 地区确定
     */
    onDistrictOk = value => {
        runInAction(() => {
            this.shopStore.address = value;
            [
                this.shopStore.shop.provCode,
                this.shopStore.shop.cityCode,
                this.shopStore.shop.areaCode
            ] = value;
        });
    };

    /**
     * 提交
     */
    onSubmitClick = () => {
        let needCheck = this.state.mode === 1;
        if (needCheck && this.shopStore.shop.shopName.length === 0) {
            Toast.show(I18n.t('PleaseInputShopName'), 2);
            return;
        }

        if (needCheck && !configStore.businessCategary) {
            Toast.show('请设置主营类目', 2);
            return;
        }

        if (needCheck && this.shopStore.address.length === 0) {
            Toast.show(I18n.t('PleaseInputShopAddress'), 2);
            return;
        }

        if (
            needCheck &&
            (StringUtl.isEmpty(this.shopStore.shop.shopAddr) ||
                RegUtil.hasEmoji(this.shopStore.shop.shopAddr))
        ) {
            Toast.show('请输入正确的详细地址', 2);
            return;
        }

        let emptyCount = 0;
        if (this.shopStore.shop.headPic.length === 0) {
            emptyCount++;
        }
        if (this.shopStore.shop.contentPic.length === 0) {
            emptyCount++;
        }
        if (this.shopStore.shop.certPic.length === 0) {
            emptyCount++;
        }
        if (needCheck && emptyCount >= 2) {
            Toast.show(I18n.t('PleaseSelectTowTypePic'), 2);
            return;
        }
        if (!this.state.isTrue) {
            Toast.show('请先同意商陆好店用户注册协议', 2);
            return;
        }

        Toast.loading();
        this.shopStore.authSave(this.state.mode, (result, extra) => {
            if (result) {
                this.saveOK(extra).finally(() => {
                    Toast.dismiss();
                    this.fetchShopAuthInfo();
                });
            } else {
                Toast.dismiss();
                Alert.alert(extra.message);
            }
        });
    };

    saveOK = async data => {
        let isUpdate = this.state.mode === 1;
        try {
            await getShopBusinessInfo();
            Alert.alert('保存成功', '', [
                {
                    text: '确定',
                    onPress: () => {
                        // tenantFlag：2 审核中
                        runInAction(() => {
                            if (isUpdate) {
                                NavigationSvc.pop();
                            } else {
                                let tenantFlag = data.auditFlag;
                                global.dlconsole.log('认证结果： ', tenantFlag);
                                if (tenantFlag === 1) {
                                    rootStore.userStore.updateTenantFlag(
                                        tenantFlag
                                    );
                                    NavigationSvc.pop();
                                } else {
                                    rootStore.userStore.updateTenantFlag(2);
                                    NavigationSvc.pop();
                                }
                            }
                        });
                        //更新本地用户信息
                        rootStore.userStore.queryAccountInfo();
                    }
                }
            ]);
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    renderMasterBusinessCategray = () => {
        return (
            <View>
                <View style={{ height: 1, backgroundColor: colors.borderE }} />
                <Observer>
                    {() => (
                        <ListViewTextArrowCell
                            title={'主营类目'}
                            subTitleHidden={true}
                            value={
                                configStore.businessCategary
                                    ? configStore.businessCategary.codeName
                                    : '请选择主营类目'
                            }
                            tapHandler={() => {
                                this.props.navigation.navigate(
                                    'BusinessCategoryChooseScreen',
                                    {
                                        mode: 0,
                                        id: configStore.businessCategary
                                            ? configStore.businessCategary
                                                .codeValue
                                            : 0
                                    }
                                );
                            }}
                        />
                    )}
                </Observer>
            </View>
        );
    };

    renderRangePriceView = () => {
        return (
            <View>
                <View style={{ height: 1, backgroundColor: colors.borderE }} />
                <Observer>
                    {() => (
                        <TouchableOpacity
                            style={styles.nameContainer}
                            onPress={() => {
                                this.props.navigation.navigate(
                                    'PriceRangeScreen',
                                    { confirmBackEnable: true }
                                );
                            }}
                        >
                            <Text style={styles.title}>{'价格区间'}</Text>
                            <Text style={styles.content}>
                                {configStore.rangePrice1 ||
                                configStore.rangePrice2.length > 0
                                    ? configStore.rangePrice1 +
                                      '-' +
                                      configStore.rangePrice2
                                    : '所有价格'}
                            </Text>
                            <Image
                                source={require('gsresource/img/arrowRight.png')}
                            />
                        </TouchableOpacity>
                    )}
                </Observer>
            </View>
        );
    };

    render() {
        let canEdit = this.state.mode !== 1;
        let name =
            this.shopStore.shop.shopName &&
            this.shopStore.shop.shopName.length > 0
                ? this.shopStore.shop.shopName
                : I18n.t('input') + I18n.t('shopName');
        const PickerSub = props => {
            return (
                <TouchableOpacity onPress={props.onClick}>
                    <ListViewTextArrowCell
                        tapEnable={false}
                        title={I18n.t('shopAddress')}
                        subTitleHidden={true}
                        value={props.extra}
                    />
                </TouchableOpacity>
            );
        };

        return (
            <SafeAreaView style={styles.container}>
                <ScrollView
                    style={styles.scrollView}
                    keyboardDismissMode='on-drag'
                >
                    <ListViewTextArrowCell
                        title={I18n.t('shopName')}
                        subTitleHidden={true}
                        value={name}
                        tapHandler={this.inputShopName}
                    />
                    <DividerLineH />
                    <Picker
                        title='请选择'
                        data={rootStore.configStore.region}
                        cols={3}
                        value={this.shopStore.address.slice()}
                        onOk={this.onDistrictOk}
                        itemStyle={{ fontSize: 12 }}
                    >
                        <PickerSub />
                    </Picker>
                    <DividerLineH />
                    <ListViewTextArrowCell
                        style={{ height: 80 }}
                        title={'详细地址'}
                        subTitleHidden={true}
                        value={
                            this.shopStore.shop.shopAddr
                                ? this.shopStore.shop.shopAddr
                                : ''
                        }
                        tapHandler={this.inputAddress}
                        valueNumberOfLines={3}
                    />
                    {this.renderMasterBusinessCategray()}
                    <DividerLineH />
                    <View style={{ backgroundColor: colors.white }}>
                        {this.renderUploadImageSection(
                            I18n.t('uploadShopHead'),
                            toJS(this.shopStore.shop.headPic),
                            this.renderHeadImgItem,
                            this.onHeadImgsChange,
                            this.shopStore.shop.headPicDocIds
                        )}
                        <DividerLineH />
                        {this.renderUploadImageSection(
                            I18n.t('uploadShopContent'),
                            toJS(this.shopStore.shop.contentPic),
                            this.renderContentImgItem,
                            this.onContentImgsChange,
                            this.shopStore.shop.contentPicDocIds
                        )}
                        <DividerLineH />
                        {this.renderUploadImageSection(
                            I18n.t('uploadIdentity'),
                            toJS(this.shopStore.shop.certPic),
                            this.renderCerImgItem,
                            this.onCerImgsChange,
                            this.shopStore.shop.certPicDocIds
                        )}
                        <Text style={styles.tipText}>
                            {I18n.t('PleaseSelectTowTypePic')}
                        </Text>
                    </View>
                    <DividerLineH />
                    {canEdit && (
                        <ListViewTextArrowCell
                            title={'邀请码(可选)'}
                            subTitleHidden={true}
                            value={
                                this.shopStore.shop.inviteCode &&
                                this.shopStore.shop.inviteCode.length > 0
                                    ? this.shopStore.shop.inviteCode
                                    : I18n.t('input') + '邀请码'
                            }
                            tapHandler={this.inputInviteCode}
                        />
                    )}
                </ScrollView>
                <View>
                    <View
                        style={{
                            height: 44,
                            alignItems: 'center',
                            flexDirection: 'row',
                            paddingLeft: 19
                        }}
                    >
                        <TouchableOpacity
                            onPress={this.changeIsTrue}
                            hitSlop={{
                                top: 16,
                                left: 16,
                                bottom: 16,
                                right: 16
                            }}
                        >
                            {this.state.isTrue ? (
                                <Image
                                    source={require('gsresource/img/check.png')}
                                />
                            ) : (
                                <Image
                                    source={require('gsresource/img/unCheck.png')}
                                />
                            )}
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.goToUserProtocol}>
                            <Text
                                style={{
                                    fontSize: fonts.font12,
                                    color: colors.greyFont,
                                    textDecorationLine: 'underline',
                                    paddingLeft: 5
                                }}
                            >
                                阅读并同意商陆好店用户注册协议
                            </Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        style={styles.submitButton}
                        onPress={this.onSubmitClick}
                    >
                        <Text style={styles.submitText}>
                            {I18n.t('submit')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    changeIsTrue = () => {
        this.setState({
            isTrue: !this.state.isTrue
        });
    };

    goToUserProtocol = () => {
        this.props.navigation.navigate('UserProtocol');
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },
    scrollView: {
        flex: 1
    },
    nameContainer: {
        width: '100%',
        height: 45,
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: 19,
        paddingRight: 19
    },
    title: {
        color: colors.normalFont,
        fontSize: 14,
        maxWidth: 120
    },
    content: {
        color: colors.greyFont,
        fontSize: 14,
        width: 0.7 * width,
        textAlign: 'right'
    },
    scetionContainer: {
        width: '100%',
        backgroundColor: 'white',
        paddingTop: 10,
        paddingLeft: 19,
        paddingRight: 19
    },
    tipText: {
        color: colors.fontHint,
        fontSize: 12,
        marginBottom: 24,
        marginLeft: 19
    },
    submitButton: {
        height: 45,
        width: '100%',
        backgroundColor: colors.activeBtn,
        justifyContent: 'center',
        alignItems: 'center'
    },
    submitText: {
        fontSize: 14,
        color: 'white'
    }
});
