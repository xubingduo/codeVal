/**
 * @author GaoYuJian
 * @create date 2017/12/27
 * @desc  可以点击的Text
 */

import React from 'react';
import {Text, TouchableOpacity, StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';

const propsTypes = {
    text: PropTypes.string.isRequired,
    onPress: PropTypes.func.isRequired,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    textStyle: PropTypes.any,
    numberOfLines: PropTypes.number,
    textWrapStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
};

const TextButton = (props) => {
    const {text, onPress, style, textStyle, hitSlop, numberOfLines, textWrapStyle} = props;
    return (
        <TouchableOpacity
            hitSlop={hitSlop}
            onPress={onPress}
            style={[styles.container, style]}
        >
            <View style={textWrapStyle}>
                <Text
                    numberOfLines={numberOfLines ? numberOfLines : 1}
                    ellipsizeMode={'tail'}
                    style={[styles.text, textStyle]}
                >
                    {text}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

TextButton.propTypes = propsTypes;

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: 8,
        paddingRight: 8,
    },
    text: {

        color: 'white',
        textAlign: 'center'
    }
});

export default TextButton;