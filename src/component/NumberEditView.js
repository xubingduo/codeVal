/**
 * author: tuhui
 * Date: 2018/7/18
 * Time: 11:32
 * des: 商品数量加减和输入 数量控件
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Platform,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import Image from './Image';
import TextButton from './TextButton';
import colors from '../gsresource/ui/colors';
import SingleLineInputDlg from './SingleLineInputDlg';
import {Toast} from '@ecool/react-native-ui';
import I18n from 'gsresource/string/i18n';
import NumberUtl from '../utl/NumberUtl';
import {Alert as RNAlertIOS} from '@ecool/react-native-ui';
import _ from 'lodash';
import DialogAndroid from 'react-native-dialogs';


export default class NumberEditView extends Component {

    static propTypes = {
        //数量变化回调
        onTextChange: PropTypes.func,
        //默认数量
        defaultText: PropTypes.number,
        //整体style
        style: PropTypes.any,
        //输入框最大长度
        maxLength: PropTypes.number,
        //输入框属性
        inputProps: PropTypes.object,
        //最小数量限制
        minNum: PropTypes.number,
        //小数位数
        decimalNum: PropTypes.number,
        //是否可编辑
        editable: PropTypes.bool,
        //最大数量
        maxNum: PropTypes.number,
        // 提示改变
        tips: PropTypes.string,
        // IOS支持输入框dialog
        onShowInputDlg: PropTypes.bool,
        //显示下划线表示能点击
        showBottomLine: PropTypes.bool,
        //是否超出最大数量 人工进行设置数量
        isAutoChange: PropTypes.bool,
        // 文本显示位置
        textPosition: PropTypes.oneOf(['left', 'center', 'right']),
        // 一次点击加减的数量
        onceChange: PropTypes.number,
        // 提示文字的单位
        unit: PropTypes.string
    };

    static defaultProps = {
        maxLength: 4,
        inputProps: {
            keyboardType: 'numeric'
        },
        minNum: 1,
        decimalNum: 0,
        editable: true,
        maxNum: Number.MAX_VALUE,
        tips: '拿货',
        showBottomLine: false,
        isAutoChange: false,
        textPosition: 'center',
        onceChange: 1,
        unit: '件'
    };

    constructor(props) {
        super(props);
        this.state = ({
            text: 0,
            isAutoChange: props.isAutoChange,
        });
    }

    componentWillReceiveProps(props) {
        if (props.hasOwnProperty('defaultText')) {
            this.setState({
                text: props.defaultText,
            });
        }
    }

    componentDidMount() {
        const defaultText = this.props.defaultText;
        if (defaultText) {
            this.setState({
                text: defaultText,
                value: defaultText,
            });
        }
    }

    renderText = () => {
        return (
            <TextButton
                textStyle={{
                    color: this.state.isAutoChange ? colors.activeFont : colors.normalFont,
                    maxWidth: 100,
                    minWidth: 30
                }}
                textWrapStyle={this.props.showBottomLine ? {
                    borderBottomColor: colors.border2,
                    borderBottomWidth: 0.5
                } : {}}
                style={{minWidth: 50}}
                text={this.state.text.toString()}
                onPress={() => {
                    if (!this.props.editable) {
                        return;
                    }

                    // this.showInputDlg();
                    // this.props.onShowInputDlg && this.props.onShowInputDlg();

                    if (Platform.OS === 'ios') {
                        RNAlertIOS.alertInput({
                            title: '数量',
                            message: `最多${this.props.maxNum}${this.props.unit}${this.props.onceChange > 1 ? `,且必须为${this.props.onceChange}的倍数` : ''}`,
                            itemHighlightColor: colors.title,
                            placeholder: this.state.text + '',
                            confirmHandler: (value) => {
                                if (value - 0 == value) {
                                    if (value <= 0) {
                                        Toast.show(I18n.t('please_enter_positive_number'), 2);
                                    } else {
                                        value = Math.floor(value / this.props.onceChange) * this.props.onceChange;
                                        this.updateText(NumberUtl.toFixed(value, this.props.decimalNum));
                                    }
                                } else {
                                    Toast.show(I18n.t('please_enter_number'), 2);
                                }
                            },
                        });
                    } else {
                        this.timeOut = setTimeout(() => {

                            // let subTitle = `最多${this.props.maxNum}${this.props.unit}${this.props.onceChange > 1 ? `,且必须为${this.props.onceChange}的倍数` : ''}`;
                            // let {action,text} = await DialogAndroid.prompt('数量', subTitle,{
                            //     cancelable:true,
                            //     negativeText:'取消',
                            //     positiveText:'确定'
                            // });
                            //
                            // if (action === DialogAndroid.actionPositive) {
                            //     __DEV__&&console.warn(text);
                            //     if (text - 0 == text) {
                            //         if (text <= 0) {
                            //             Toast.show(I18n.t('please_enter_positive_number'), 2);
                            //         } else {
                            //             text = Math.floor(text / this.props.onceChange) * this.props.onceChange;
                            //             this.updateText(NumberUtl.toFixed(text, this.props.decimalNum));
                            //         }
                            //     } else {
                            //         Toast.show(I18n.t('please_enter_number'), 2);
                            //     }
                            // }

                            SingleLineInputDlg.show({
                                title: '数量',
                                hint: '请输入商品数量',
                                keyboardType: 'numeric',
                                defaultText: this.state.text,
                                maxLength: this.props.maxLength,
                                ...this.props.inputProps,
                                subTitle: `最多${this.props.maxNum}${this.props.unit}${this.props.onceChange > 1 ? `,且必须为${this.props.onceChange}的倍数` : ''}`,
                                onConfirm: (value) => {
                                    if (value - 0 == value) {
                                        if (value <= 0) {
                                            Toast.show(I18n.t('please_enter_positive_number'), 2);
                                        } else {
                                            value = Math.floor(value / this.props.onceChange) * this.props.onceChange;
                                            this.updateText(NumberUtl.toFixed(value, this.props.decimalNum));
                                        }
                                    } else {
                                        Toast.show(I18n.t('please_enter_number'), 2);
                                    }
                                },
                            });
                        }, 10);
                    }

                }}
            />
        );
    };

    render() {

        return (
            <View style={[styles.container, this.props.style]}>
                {this.props.textPosition === 'left' && this.renderText()}
                <View style={styles.container}>
                    <TouchableOpacity
                        onPress={() => {
                            if (!this.props.editable) {
                                return;
                            }
                            this.updateText(this.state.text - this.props.onceChange);
                            this.setState({isAutoChange: false});
                        }}
                    >
                        <Image source={require('gsresource/img/minus.png')} />
                    </TouchableOpacity>
                    {this.props.textPosition === 'center'
                        ? this.renderText()
                        : <View style={{width: 30}} />
                    }
                    <TouchableOpacity
                        onPress={() => {
                            if (!this.props.editable) {
                                return;
                            }
                            this.updateText(this.state.text + this.props.onceChange);
                        }}
                    >
                        <Image source={require('gsresource/img/add.png')} />
                    </TouchableOpacity>
                </View>
                {this.props.textPosition === 'right' && this.renderText()}
            </View>
        );
    }

    componentWillUnmount() {
        if (this.timeOut) {
            clearTimeout(this.timeOut);
        }
        Toast.dismiss();
    }

    onChangeText = (value) => {
        if (value - 0 == value) {
            if (value <= 0) {
                Toast.show(I18n.t('please_enter_positive_number'), 2);
            } else {
                this.setState({
                    value: value,
                });
                this.updateText(NumberUtl.toFixed(value, 2));
            }
        } else {
            Toast.show(I18n.t('please_enter_number'), 2);
        }
    };

    updateText = (text) => {
        if (text < this.props.minNum) {
            return this.showMinNumTip();
        }

        if (text > this.props.maxNum) {
            return this.showMaxNumTip();
        }

        this.setState({
            text: text,
        });

        this.props.onTextChange && this.props.onTextChange(text);
    };

    showMaxNumTip = _.debounce(() => {
        Toast.show(`最多${this.props.tips}${this.props.maxNum}${this.props.unit}`);
    }, 200);

    showMinNumTip = _.debounce(() => {
        Toast.show(`最低${this.props.tips}${this.props.minNum}${this.props.unit}`);
    }, 200);

    showInputDlg() {
        //todo IOS集成 alert
        // Alert.alert(
        //     'Alert Title',
        //     'alertMessage',
        //     [
        //         {text: 'Ok1', onPress: (text) => console.log('Ok Pressed!' + text)},
        //         {text: 'Ok2', onPress: (text) => console.log('Ok Pressed!' + text), style: 'cancel'},
        //         {text: 'Ok3', onPress: (text) => console.log('Ok Pressed!' + text)},
        //     ],
        //     'plain-text',
        //     '',
        //     2
        // );
    }
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 30
    },
});