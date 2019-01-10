/**
 * author: wwj
 * Date: 2018/8/3
 * Time: 上午9:13
 * des: 左边为 Text 右边为TextInput 的通用view
 */
import React, {Component} from 'react';
import {StyleSheet, View, Text, TextInput, ScrollView} from 'react-native';
import colors from '../gsresource/ui/colors';
import PropTypes from 'prop-types';
import fonts from '../gsresource/ui/fonts';

export default class TextLeftTextInput extends Component {

    static propTypes = {
        selfContainer: PropTypes.any,
        // 左边文字内容
        leftTitle: PropTypes.string.isRequired,
        // 左边文字style
        leftTextStyle: PropTypes.any,
        // 输入框占位显示内容
        rightPlaceholder: PropTypes.string.isRequired,
        // 输入框的键盘类型
        keyboardType: PropTypes.string.isRequired,
        // 输入框文本内容
        inputText: PropTypes.string,
        // 输入框style
        inputStyle: PropTypes.any,
        // 输入框文字变化回调
        onChangeText: PropTypes.func,
        // 是否必填项
        isMustRequired: PropTypes.bool,

        ...TextInput.propTypes,
    };

    static defaultProps = {
        keyboardType: 'default',
        inputText: '',
        isMustRequired: false,
    };

    constructor(props) {
        super(props);
        this.state = {
            text: '',
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            text: nextProps.inputText,
        });
    }

    componentDidMount() {
        if (this.props.inputText) {
            this.setState({
                text: this.props.inputText,
            });
        }
    }

    render() {
        return (
            <View
                style={[styles.container, this.props.selfContainer]}
            >
                <Text style={[styles.textStyle, this.props.leftTextStyle]}>{this.props.leftTitle}</Text>
                {
                    this.props.isMustRequired &&
                    <Text style={{color: '#ff0000', marginLeft: 3}}>{'*'}</Text>
                }


                <TextInput
                    style={[styles.textInput, this.props.inputStyle]}
                    keyboardType={this.props.keyboardType}
                    placeholder={this.props.rightPlaceholder}
                    placeholderTextColor={colors.greyFont}
                    underlineColorAndroid='transparent'
                    value={this.state.text}
                    onChangeText={(text) => {
                        this.setState({
                            text: text,
                        });
                        this.props.onChangeText && this.props.onChangeText(text);
                    }}
                    {...this.props}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.white,
        paddingLeft: 10,
        paddingRight: 10,
        paddingTop: 12,
        paddingBottom: 12,
    },
    textStyle: {
        fontSize: fonts.font14,
        color: colors.normalFont,
    },
    textInput: {
        padding: 0,
        textAlign: 'right',
        flex: 1,
        marginLeft: 10,
    }
});