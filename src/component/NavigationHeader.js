/**
 * Created by yjj on 2017/12/11.
 *
 * React Navigation Header 的拓展 可以设置 过渡色 和 自定义的TitleView
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    Platform,
    TouchableOpacity,
    Image,
    StatusBar
} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../gsresource/ui/colors';
import fonts from '../gsresource/ui/fonts';
import isIphoneX from 'utl/PhoneUtl';

export default class NavigationHeader extends Component {
    static propTypes = {
        // 标题
        navigationTitleItem: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.string
        ]),
        // Left
        navigationLeftItem: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.string
        ]),
        // Right
        navigationRightItem: PropTypes.oneOfType([
            PropTypes.element,
            PropTypes.string
        ]),
        // 设置背景颜色
        backgroundColor: PropTypes.oneOfType([
            // 直接设置颜色
            PropTypes.string,
            // 或者设置过渡色
            PropTypes.shape({
                // 开始 和 结束颜色
                colors: PropTypes.arrayOf(PropTypes.string),
                // 开始色变的位置
                start: PropTypes.shape({
                    x: PropTypes.number,
                    y: PropTypes.number
                }),
                // 结束色变的位置
                end: PropTypes.shape({
                    x: PropTypes.number,
                    y: PropTypes.number
                })
            })
        ]).isRequired,
        // 点击左侧Item的回调 默认返回上一页
        onLeftClickHandler: PropTypes.func,
        // 右侧Item的回掉
        onRightClickHandler: PropTypes.func,
        // 导航栏的信息
        navigation: PropTypes.object.isRequired,
        // 状态栏的 主题
        statusBarStyle: PropTypes.oneOf([
            'default',
            'light-content',
            'dark-content'
        ]),
        // 标题的颜色
        titleItemTextStyle: PropTypes.object,
        // 左右标题的样式
        itemTextStyle: PropTypes.object,
        // 主题 （主要是为了设置返回按钮的颜色）
        themeStyle: PropTypes.oneOf(['default', 'light-content']),
        // 右边标题的颜色
        rightTitleStyle: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.object
        ]),
        // 容器的样式
        style: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
    };

    static defaultProps = {
        statusBarStyle: 'dark-content',
        themeStyle: 'light-content',
        style: {},
        titleItemTextStyle: {
            color: '#4a4a4a',
            fontSize: fonts.font18
        },
        backgroundColor: 'white',
        itemTextStyle: {
            color: '#4a4a4a'
        }
    };

    /**
     * 点击左侧按钮的默认处理事件
     */
    onLeftClickHandler = () => {
        this.props.navigation.goBack();
    };

    renderTitle = () => {
        const {
            navigationTitleItem,
            titleItemTextStyle,
            themeStyle
        } = this.props;
        let titleItemText =
            themeStyle === 'default'
                ? styles.titleItemText
                : styles.lightContentTitleItemText;

        return (
            <View style={styles.titleItemWrap}>
                {React.isValidElement(navigationTitleItem) ? (
                    navigationTitleItem
                ) : (
                    <Text
                        style={[
                            this.itemTextStyle,
                            titleItemText,
                            titleItemTextStyle
                        ]}
                    >
                        {navigationTitleItem}
                    </Text>
                )}
            </View>
        );
    };

    renderLeftItem = () => {
        const {
            navigationLeftItem,
            onLeftClickHandler,
            itemTextStyle,
            themeStyle
        } = this.props;
        // 处理点击事件的handler
        let handler = onLeftClickHandler
            ? onLeftClickHandler
            : this.onLeftClickHandler;
        let icon =
            themeStyle === 'default'
                ? require('gsresource/img/backBlack.png')
                : require('gsresource/img/backBlack.png');
        let itemText =
            themeStyle === 'default'
                ? styles.itemText
                : styles.lightContentItemText;
        if (React.isValidElement(navigationLeftItem)) {
            return (
                <View style={styles.leftItemWrap}>{navigationLeftItem}</View>
            );
        }

        if (navigationLeftItem || typeof navigationLeftItem === 'undefined') {
            return (
                <TouchableOpacity
                    hitSlop={{ top: 16, left: 16, bottom: 16, right: 16 }}
                    onPress={handler}
                >
                    <View style={styles.leftItemWrap}>
                        <View style={{ flexDirection: 'row' }}>
                            <Image source={icon} />
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } else {
            return <View />;
        }
    };

    renderRightItem = () => {
        const {
            navigationRightItem,
            onRightClickHandler,
            itemTextStyle,
            rightTitleStyle,
            themeStyle
        } = this.props;
        let itemText =
            themeStyle === 'default'
                ? styles.itemText
                : styles.lightContentItemText;
        if (React.isValidElement(navigationRightItem)) {
            return (
                <TouchableOpacity
                    hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                    onPress={onRightClickHandler}
                >
                    <View style={styles.rightItemWrap}>
                        {navigationRightItem}
                    </View>
                </TouchableOpacity>
            );
        }

        return (
            <TouchableOpacity
                hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
                onPress={onRightClickHandler}
            >
                <View style={styles.rightItemWrap}>
                    <Text style={[itemText, itemTextStyle, rightTitleStyle]}>
                        {navigationRightItem}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    render() {
        const { backgroundColor, statusBarStyle, style } = this.props;
        // 判断是否是过渡色
        let isSingleColor = typeof backgroundColor === 'string' ? true : false;
        //是否低于23的安卓机器
        let isAndroidBelowM =
            Platform.OS === 'android' && DeviceInfo.getAPILevel() < 23;

        return (
            <View
                style={[
                    styles.containerWrap,
                    isSingleColor ? { backgroundColor: backgroundColor } : {},
                    style,
                    isAndroidBelowM
                        ? { backgroundColor: colors.halfTransparentBlack }
                        : {}
                ]}
            >
                <StatusBar
                    translucent={true}
                    backgroundColor='transparent'
                    barStyle={statusBarStyle}
                />

                {isSingleColor ? (
                    <View
                        style={[
                            styles.contentWrap,
                            { backgroundColor: backgroundColor }
                        ]}
                    >
                        {this.renderTitle()}
                        {this.renderLeftItem()}
                        {this.renderRightItem()}
                    </View>
                ) : (
                    <LinearGradient
                        colors={backgroundColor.colors}
                        start={{
                            x: backgroundColor.start.x,
                            y: backgroundColor.start.y
                        }}
                        end={{
                            x: backgroundColor.end.x,
                            y: backgroundColor.end.y
                        }}
                        style={{ flex: 1, flexDirection: 'row' }}
                    >
                        <View style={styles.contentWrap}>
                            {this.renderTitle()}
                            {this.renderLeftItem()}
                            {this.renderRightItem()}
                        </View>
                    </LinearGradient>
                )}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    containerWrap: {
        width: Dimensions.get('window').width,
        height:
            Platform.OS === 'ios'
                ? isIphoneX()
                    ? 88
                    : 64
                : StatusBar.currentHeight + 44,
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#d8d8d8'
    },

    contentWrap: {
        height: 44,
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'flex-end',
        alignItems: 'center'
    },

    titleItemWrap: {
        width: Dimensions.get('window').width,
        position: 'absolute',
        alignSelf: 'center',
        justifyContent: 'center',
        flexDirection: 'row'
    },

    leftItemWrap: {
        paddingLeft: 12
    },

    rightItemWrap: {
        paddingRight: 12
    },

    titleItemText: {
        fontSize: fonts.font18,
        color: '#3d4245',
        backgroundColor: 'transparent'
    },

    lightContentTitleItemText: {
        fontSize: fonts.font18,
        color: '#fff',
        backgroundColor: 'transparent'
    },

    itemText: {
        fontSize: fonts.font16,
        color: '#3d4245',
        alignSelf: 'center',
        paddingLeft: 2,
        backgroundColor: 'transparent'
    },

    lightContentItemText: {
        fontSize: fonts.font16,
        color: '#fff',
        alignSelf: 'center',
        paddingLeft: 2,
        backgroundColor: 'transparent'
    }
});
