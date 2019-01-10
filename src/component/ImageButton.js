/**
 * author: tuhui
 * Date: 2018/8/1
 * Time: 15:36
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Image
} from 'react-native';
import PropTypes from 'prop-types';

export default class ImageButton extends Component {

    static propTypes = {
        imageStyle: PropTypes.object,
        style: PropTypes.object,
        ...Image.propTypes,
        onClick: PropTypes.func,
        hitSlop:PropTypes.any,
    };

    render() {
        return (
            <TouchableOpacity
                hitSlop={this.props.hitSlop}
                onPress={() => {
                    this.props.onClick && this.props.onClick();
                }}
                style={[this.props.style]}
            >
                <Image
                    style={this.props.imageStyle}
                    {...this.props}
                />
            </TouchableOpacity>
        );
    }
}
