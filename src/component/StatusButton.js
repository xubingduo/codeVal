/**
 * author: tuhui
 * Date: 2018/8/2
 * Time: 08:51
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableWithoutFeedback,
    Text,
    View
} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../gsresource/ui/colors';
import fonts from '../gsresource/ui/fonts';

export default class StatusButton extends Component {

    static propTypes = {
        text: PropTypes.string,
        style: PropTypes.object,
        textStyle: PropTypes.object,
        checked: PropTypes.bool,
        checkedBg: PropTypes.string,
        checkedTextColor: PropTypes.string,
        unCheckedBg: PropTypes.string,
        unCheckedTextColor: PropTypes.string,
        onItemClick: PropTypes.func,
    };

    static defaultProps = {
        text: '按钮文字',
        style: {},
        textStyle: {},
        checked: false,
        checkedBg: colors.activeBtn,
        checkedTextColor: colors.white,
        unCheckedBg: colors.unEnable,
        unCheckedTextColor: colors.white
    };

    render() {
        return (
            <TouchableWithoutFeedback
                onPress={()=>{
                    if (this.props.checked){
                        this.props.onItemClick();
                    }
                }}
            >
                <View
                    style={[styles.container, this.props.style, this.props.checked ?
                        {backgroundColor: this.props.checkedBg} : {backgroundColor: this.props.unCheckedBg}]}
                >
                    <Text
                        style={[styles.text, this.props.checked ? {color: this.props.checkedTextColor} : {color: this.props.unCheckedTextColor}]}
                    >
                        {this.props.text}
                    </Text>
                </View>

            </TouchableWithoutFeedback>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.unEnable,
    },
    text: {
        color: colors.white,
        fontSize: fonts.font14
    }
});