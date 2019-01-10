/**
 * author: tuhui
 * Date: 2017/12/7
 * Time: 下午1:48
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    Text,
    Image,
    Animated,
    Easing,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';

/**
 * 上面图片 下面文字的控件
 */
export default class ImageTextView extends Component {
    static propTypes = {
        //图片资源
        requireIcon: PropTypes.any,
        //文字
        text: PropTypes.string.isRequired,
        //背景样式
        bgStyle: PropTypes.any,
        //文字样式
        textStyle: PropTypes.any,
        //图片样式
        imgStyle: PropTypes.any,
        //是否展示动画 默认否
        showAnimal: PropTypes.bool,
        //动画延时
        animalDelay: PropTypes.number,
        //点击事件
        onItemClick: PropTypes.func,
        //能否点击
        clickDisabled: PropTypes.bool
    };

    static defaultProps = {
        showAnimal: false,
        animalDelay: 0,
        clickDisabled: false
    };

    constructor(props) {
        super(props);

        this.state = {
            margin: this.props.showAnimal ? new Animated.Value(-50) : 0
        };
    }

    componentDidMount() {
        if (this.props.showAnimal) {
            Animated.timing(this.state.margin, {
                toValue: 70,
                easing: Easing.bounce,
                delay: this.props.animalDelay,
                duration: 800
            }).start();
        }
    }

    playCloseAnimal = () => {
        if (this.props.showAnimal) {
            Animated.timing(this.state.margin, {
                toValue: -150,
                easing: Easing.bounce,
                delay: this.props.animalDelay,
                duration: 400
            }).start();
        }
    };

    render() {
        return (
            <Animated.View style={{ marginBottom: this.state.margin }}>
                <TouchableOpacity
                    style={[styles.container, this.props.bgStyle]}
                    onPress={this.props.onItemClick}
                    disabled={this.props.clickDisabled}
                >
                    <Image
                        source={this.props.requireIcon}
                        style={this.props.imgStyle}
                    />
                    <Text style={[styles.text, this.props.textStyle]}>
                        {this.props.text}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 54
    },
    text: {
        color: colors.normalFont,
        fontSize: fonts.font12,
        marginTop: 4
    }
});
