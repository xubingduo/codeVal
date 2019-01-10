import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    Image
} from 'react-native';
import PropTypes from 'prop-types';

import { colors } from 'gsresource/ui/ui';

const DEFAULT = 0; // 未选中
const DECREASE = 1; // 降序
const INCREASE = 2; // 升序

export default class Button extends Component {

    _onPress = () => {
        this.props.onPress(this.props.value);
    };

    render() {
        const activeContainerStyle = this.props.active ? styles.activeContainer : {};
        const activeTextStyle = this.props.active ? styles.activeText : {};
        const arrowImg = this.props.sort === DECREASE
            ? require('gsresource/img/sortDown.png')
            : require('gsresource/img/sortUp.png');
        return (
            <TouchableWithoutFeedback onPress={this._onPress}>
                <View style={[styles.container, activeContainerStyle]}>
                    <Text style={[styles.text, activeTextStyle]}>{this.props.text}</Text>
                    {this.props.active && <Image source={arrowImg} />}
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

Button.propTypes = {
    active: PropTypes.bool,
    onPress: PropTypes.func,
    text: PropTypes.string,
    sort: PropTypes.oneOf([DEFAULT, INCREASE, DECREASE])
};

Button.defaultProps = {
    active: false,
    onPress: () => null,
    sort: DEFAULT,
    text: ''
};

const styles = StyleSheet.create({
    container: {
        minWidth: 54,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 2,
        flexDirection: 'row',
    },
    activeContainer: {
        backgroundColor: colors.white,
    },
    text: {
        fontSize: 12,
        color: colors.white,
        marginRight: 2
    },
    activeText: {
        color: colors.activeFont
    }
});