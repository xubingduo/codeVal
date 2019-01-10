/**
 * Created by tuhui on 2018/7/24.
 *
 * 只设置状态栏颜色
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    StyleSheet,
    Dimensions,
    Platform,
    StatusBar
} from 'react-native';

import DeviceInfo from 'react-native-device-info';
import LinearGradient from 'react-native-linear-gradient';
import colors from '../gsresource/ui/colors';
import isIphoneX from 'utl/PhoneUtl';

export default class ColorOnlyNavigationHeader extends Component {
    static propTypes = {
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
        // 状态栏的 主题
        statusBarStyle: PropTypes.oneOf([
            'default',
            'light-content',
            'dark-content'
        ]),
        // 主题 （主要是为了设置返回按钮的颜色）
        themeStyle: PropTypes.oneOf(['default', 'light-content']),
        // 容器的样式
        style: PropTypes.oneOfType([PropTypes.number, PropTypes.object])
    };

    static defaultProps = {
        statusBarStyle: 'dark-content',
        themeStyle: 'light-content',
        style: {},
        titleItemTextStyle: {
            color: '#4a4a4a',
            fontSize: 18
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

    render() {
        const { backgroundColor, statusBarStyle, style } = this.props;
        // 判断是否是过渡色
        let isSingleColor = typeof backgroundColor === 'string';
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
                            isAndroidBelowM
                                ? {
                                    backgroundColor:
                                          colors.halfTransparentBlack
                                }
                                : {}
                        ]}
                    />
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
                    />
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
                    ? 44
                    : 20
                : StatusBar.currentHeight,
        flexDirection: 'row'
    },

    contentWrap: {
        height: 0,
        width: Dimensions.get('window').width,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignSelf: 'flex-end',
        alignItems: 'center'
    }
});
