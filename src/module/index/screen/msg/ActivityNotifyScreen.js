/**
 * @author [lyq]
 * @email
 * @create date 2018-10-23 18:49:37
 * @modify date 2018-10-23 18:49:37
 * @desc [web页面展示]]
 */

import React, {Component} from 'react';
import {
    StyleSheet, SafeAreaView,
    WebView, Platform, BackHandler,
    Dimensions, Text, View
} from 'react-native';
import NavigationHeader from 'component/NavigationHeader';
import PropTypes from 'prop-types';
import BannerActivitySvc from '../../../../svc/BannerActivitySvc';
import {parseUrl} from 'utl/ParseUrl';
import colors from '../../../../gsresource/ui/colors';
import ImageButton from '../../../../component/ImageButton';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';

const hrefText = 'http://buyer.webdoc.inner.hzecool.com?contentType=3&param={"tenantId":83103}';
const testHtml = '<html><head><meta charset="utf-8"></head>' +
    '<body>' +
    '<div><a href="http://buyer.webdoc.inner.hzecool.com?contentType=3&param={\'tenantId\':83103}">click me</a></div>' +
    '<div><a href="http://www.baidu.com">click me</a></div>' +
    '</body>' +
    '</html>';
// 网页跳转应用内界面协议
const innerNavProtocol = 'http://buyer.webdoc.inner.hzecool.com';

export default class ActivityNotifyScreen extends Component {
    static propsType = {
        url: PropTypes.string,
        title: PropTypes.string
    };

    static navigationOptions = ({navigation}) => {
        let {params} = navigation.state;
        return {
            header: (
                <ColorOnlyNavigationHeader
                    backgroundColor={colors.white}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            backButtonEnabled: false
        };
        this.navigateAppScreen = this.navigateAppScreen.bind(this);
    }

    // 监听原生返回键事件
    componentDidMount() {
        if (Platform.OS === 'android') {
            BackHandler.addEventListener('hardwareBackPress', this.onBack);
        }
    }

    onBack = () => {
        //  官网中描述:backButtonEnabled: false,表示webView中没有返回事件，为true则表示该webView有回退事件
        if (this.state.backButtonEnabled && this.webView) {
            this.webView.goBack();
            return true;
        } else {
            this.props.navigation.goBack();
            return true;
        }
    };

    // 安卓rn中webview没有直接可以拦截url的方法 这里注入一段js来获取
    injectedScript = function () {

        function awaitPostMessage() {
            var isReactNativePostMessageReady = !!window.originalPostMessage;
            var queue = [];
            var currentPostMessageFn = function store(message) {
                if (queue.length > 100) queue.shift();
                queue.push(message);
            };
            if (!isReactNativePostMessageReady) {
                var originalPostMessage = window.postMessage;
                Object.defineProperty(window, 'postMessage', {
                    configurable: true,
                    enumerable: true,
                    get: function () {
                        return currentPostMessageFn;
                    },
                    set: function (fn) {
                        currentPostMessageFn = fn;
                        isReactNativePostMessageReady = true;
                        setTimeout(sendQueue, 0);
                    }
                });
                window.postMessage.toString = function () {
                    return String(originalPostMessage);
                };
            }

            function sendQueue() {
                while (queue.length > 0) window.postMessage(queue.shift());
            }
        }


        awaitPostMessage(); // Call this only once in your Web Code.
        //至此，是为了保证一定会调成功postMessage

        var originalPostMessage = window.postMessage;

        var patchedPostMessage = function (message, targetOrigin, transfer) {
            originalPostMessage(message, targetOrigin, transfer);
        };

        patchedPostMessage.toString = function () {
            return String(Object.hasOwnProperty).replace('hasOwnProperty', 'postMessage');
        };

        window.postMessage = patchedPostMessage;

        let height;
        if (document.documentElement.clientHeight > document.body.clientHeight) {
            height = document.documentElement.clientHeight;
        } else {
            height = document.body.clientHeight;
        }

        // window.postMessage('height=' + height); //这里是把网页内容高度传给rn，以实现自适应高度

        //以下就是找到所有a标签，并将url传给RN处理
        var aNodes = document.getElementsByTagName('a');
        for (var i = 0; i < aNodes.length; i++) {
            aNodes[i].onclick = function (e) {
                if (e.target.href.toString().indexOf('http://buyer.webdoc.inner.hzecool.com') !== -1) {
                    e.preventDefault();//这句话是阻止a标签跳转
                    window.postMessage('url=' + e.target.href);
                }
            };
        }
    };

    /**
     * 接收js端发送的message，来处理请求的url地址
     * @param e
     * @private
     */
    _onMessage(e) {
        let data = e.nativeEvent.data;
        if (data.slice(0, 4) === 'url=') {
            let url = data.substring(4, data.length);
            //处理拦截的a标签事件
            url = decodeURI(url).replace(/'/g, '"');
            let urlParams = parseUrl(url);
            // 是否可以跳转
            // 直接调用 this.navigateAppScreen无法生效
            if (!urlParams) { // 没有参数，终止跳转
                __DEV__ && console.warn('没有urlParams');
                return;
            }
            if (!urlParams.hasOwnProperty('contentType')) {
                __DEV__ && console.warn('没有contentType');
                return;
            }
            let param = {};

            if (urlParams.hasOwnProperty('param')) {
                param = JSON.parse(urlParams.param);
            }
            BannerActivitySvc.actLocal(urlParams.contentType, param);
        }
    }

    /**
     * 根据协议是否拦截加载的网址，仅iOS
     * @param e
     * @returns {boolean}
     */
    overLoadUrlForIOS = (e) => {
        if (e && e.url && e.url.indexOf('http://buyer.webdoc.inner.hzecool.com') !== -1) {
            let urlParams = parseUrl(decodeURI(e.url).replace(/'/g, '"'));
            // 是否可以跳转
            this.navigateAppScreen(urlParams);
            return false;
        }
        return true;
    };

    /**
     * 根据协议跳转到应用内对应界面
     * @param contentType
     * @param paramsStr
     */
    navigateAppScreen = (urlParams) => {
        if (!urlParams) { // 没有参数，终止跳转
            __DEV__ && console.warn('没有urlParams');
            return;
        }
        if (!urlParams.hasOwnProperty('contentType')) {
            __DEV__ && console.warn('没有contentType');
            return;
        }
        let param = {};

        if (urlParams.hasOwnProperty('param')) {
            param = JSON.parse(urlParams.param);
        }
        BannerActivitySvc.actLocal(urlParams.contentType, param);
    };

    // webview回退上一页
    onNavigationStateChange = navState => {
        this.setState({
            backButtonEnabled: navState.canGoBack
        });
    };

    renderNavigation = () => {
        return (
            <View>
                <View style={styles.headerContainer}>
                    <ImageButton
                        hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onClick={() => {
                            this.onBack();
                        }}
                        style={{marginRight: 6}}
                        source={require('gsresource/img/arrowLeftGrey.png')}
                    />
                    <ImageButton
                        hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onClick={() => {
                            this.props.navigation.goBack();
                        }}
                        style={{marginRight: 6}}
                        source={require('gsresource/img/close.png')}
                    />
                </View>
                <View
                    style={styles.titleContainer}
                >
                    <Text
                        style={{maxWidth: 220,}}
                        numberOfLines={1}
                        ellipsizeMode={'tail'}
                    >
                        {this.props.navigation.state.params.title}
                    </Text>
                </View>
            </View>
        );
    };

    render() {
        const {params} = this.props.navigation.state;
        return (
            <SafeAreaView style={styles.container}>
                {this.renderNavigation()}
                <WebView
                    ref={(refWebview) => this.webView = refWebview}
                    injectedJavaScript={'(' + String(this.injectedScript) + ')();'}
                    style={styles.webView}
                    mixedContentMode={'always'}
                    source={{ uri: params.url }}
                    // source={{html: testHtml}}
                    javaScriptEnabled={true}
                    automaticallyAdjustContentInsets={true}
                    onMessage={this._onMessage}
                    onNavigationStateChange={this.onNavigationStateChange}
                    startInLoadingState={true}
                />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    webView: {
        flex: 1
    },

    headerContainer: {
        width: Dimensions.get('window').width,
        height: 40,
        backgroundColor: colors.transparent,
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#d8d8d8',
        alignItems: 'center',
        paddingLeft: 12,
        paddingRight: 12,
    },

    titleContainer: {
        width: Dimensions.get('window').width,
        height: 40,
        position: 'absolute',
        zIndex: -1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white
    }
});
