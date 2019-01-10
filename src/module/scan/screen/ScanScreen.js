import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    DeviceEventEmitter,
    View,
    Vibration,
    Platform,
    BackHandler
} from 'react-native';
import I18n from 'gsresource/string/i18n';
import { DLBarCodeView, DLQRCodeView } from '@ecool/react-native-qrscanner';
import { Toast } from '@ecool/react-native-ui';
import NavigationHeader from 'component/NavigationHeader';
import colors from 'gsresource/ui/colors';

export default class ScanScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        const goBackHandler = navigation.getParam('goBackHandler', () =>
            navigation.goBack()
        );
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    backgroundColor={'#fff'}
                    navigationTitleItem={I18n.t('scan')}
                    statusBarStyle={'dark-content'}
                    style={{ borderColor: 'transparent' }}
                    onLeftClickHandler={goBackHandler}
                />
            ),
            gesturesEnabled: false
        };
    };

    static propTypes = {
        /**
         * 导航参数
         * codeType  enum('qrCode', 'barCode') 默认是'qrCode'
         * intervalTime 响应间隔时间s
         * didRecievedData (data: string,finishedCallback: func) => void
         * goBackHandler (options) hook 用户点击返回按钮
         例:navigation.navigate('ScanScreen',{codeType:'barCode',didRecievedData:(data,callback)=>{
            callback(true);
            }});
         */
        navigation: PropTypes.object
    };

    constructor(props) {
        super(props);
        this.state = {};
        this.scanEnable = true;
        this.lastSendReultTime = 0;
    }

    componentDidMount() {
        this.beforeMount();
        BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    }

    beforeMount() {
        this.deEmitter = DeviceEventEmitter.addListener('scanResult', (e) => {
            Toast.dismiss();
            if (e) {
                this.didReceivedData(e.result);
            }
        });
    }

    componentWillUnmount() {
        this.deEmitter.remove();
        BackHandler.removeEventListener(
            'hardwareBackPress',
            this.handleBackPress
        );
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    handleBackPress = () => {
        const goBackHandler = this.props.navigation.getParam(
            'goBackHandler',
            () => this.props.navigation.goBack()
        );
        goBackHandler && goBackHandler();
        return true;
    };

    render() {
        let params = this.props.navigation.state.params;
        let intervalTime =
            params && params.intervalTime ? params.intervalTime : 2;
        let { codeType } = params;
        return (
            <View style={{ flex: 1, backgroundColor: colors.font00 }}>
                {codeType === 'qrCode' && (
                    <DLQRCodeView
                        style={{ flex: 1 }}
                        onRecievedData={e => {
                            let currentTime = new Date().getTime();
                            if (
                                currentTime - this.lastSendReultTime >
                                intervalTime * 1000
                            ) {
                                let result = e.nativeEvent.result;
                                this.didReceivedData(result);
                                this.lastSendReultTime = currentTime;
                            }
                        }}
                        desc={'请扫描商陆花小票二维码'}
                    />
                )}
                {codeType === 'barCode' && (
                    <DLBarCodeView
                        style={{ flex: 1 }}
                        onRecievedData={e => {
                            let currentTime = new Date().getTime();
                            if (
                                currentTime - this.lastSendReultTime >
                                intervalTime * 2000
                            ) {
                                let result = e.nativeEvent.result;
                                this.didReceivedData(result);
                                this.lastSendReultTime = currentTime;
                            }
                        }}
                        desc={'请扫描商陆花小票二维码'}
                    />
                )}
            </View>
        );
    }

    didReceivedData = e => {
        if (this.scanEnable) {
            this.scanEnable = false;
            let didRecievedData = this.props.navigation.state.params
                .didRecievedData;
            let finishAfterResult = this.props.navigation.state.params
                .finishAfterResult;
            if (!didRecievedData) {
                this.props.navigation.goBack();
                return;
            }
            didRecievedData(e, this.reStartScanEnable);
            if (finishAfterResult) {
                this.props.navigation.goBack();
            }
        }
    };

    /**
     * 扫码结果的回调操作 由外界在回调方法中调用
     */
    reStartScanEnable = () => {
        if (Platform.OS === 'ios') {
            this.timeoutId = setTimeout(() => {
                this.scanEnable = true;
            }, 2000);
        } else {
            this.scanEnable = true;
        }
    };
}
