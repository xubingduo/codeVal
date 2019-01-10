/**
 * author: tuhui
 * Date: 2017/12/12
 * Time: 下午8:01
 */

import React, {Component} from 'react';
import {
    StyleSheet, Text, TextInput,
    TouchableOpacity,
    View,
    Platform,
    Keyboard,
} from 'react-native';
import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import {Popup, Toast} from '@ecool/react-native-ui';
import {PopupType} from '@ecool/react-native-ui/lib/popup/index';
import topView from 'rn-topview';
import NumberUtl from 'utl/NumberUtl';
import StringUtl from 'utl/StringUtl';
import I18n from 'gsresource/string/i18n';
import Image from './Image';

/**
 * 单行输入弹框
 */
export default class SingleLineInputDlg extends Component {

    static propTypes = {
        title: PropTypes.string.isRequired,
        subTitle: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        cancelText: PropTypes.string,
        confirmText: PropTypes.string,
        maxLength: PropTypes.number,
        hint: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
        onCancel: PropTypes.func,
        onConfirm: PropTypes.func.isRequired,
        keyboardType: PropTypes.string,
        /**
         * 默认文字
         */
        defaultText: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),

        /**
         * 是否允许输入负数，只有输入类型为数字时进行判断
         * 默认允许
         */
        allowNegative: PropTypes.bool,
        /**
         * 限制输入非负数的最小值,只有allowNegative=false时进行判断。默认是-Number.MIN_VALUE
         */
        minimum: PropTypes.number,

        onDismiss: PropTypes.func,
    };

    static defaultProps = {
        cancelText: '取消',
        confirmText: '确定',
        keyboardType: 'default',
        allowNegative: true,
        minimum: -Number.MIN_VALUE,
    };

    static show = async (param) => {
        let inputDlg;
        await topView.set(
            <SingleLineInputDlg
                ref={(ref) => inputDlg = ref}
                {...param}
                onDismiss={() => {
                    topView.remove();
                }}
            />
        );

        inputDlg && inputDlg.show();
    };

    constructor(props) {
        super(props);
        this.state = {
            value: '',
        };
    }

    componentDidMount() {
        if (this.props.defaultText) {
            this.setState({
                value: this.props.defaultText.toString()
            });
        }
    }

    render() {
        if (Platform.OS === 'ios') {
            return this.renderIosStyle();
        } else {
            return this.renderAndroidStyle();
        }
    }

    renderIosStyle = () => {
        return (
            <Popup
                enableAnim={false}
                canDismissOnClickBg={false}
                backgroundColor={colors.transparent}
                contentBackgroundColor={'transparent'}
                ref={(p) => this.modal = p}
                width={300}
                height={this.getHeight()}
                popupType={PopupType.CENTER}
            >
                <View style={[styles.container]}>

                    <Text style={styles.title}>{this.props.title}</Text>

                    {this.renderSubTitle()}

                    <View style={{flexDirection: 'row'}}>
                        <TextInput
                            ref={(text_input) => {
                                this.text_input = text_input;
                            }}
                            style={styles.text_input}
                            maxLength={this.props.maxLength}
                            underlineColorAndroid={'transparent'}
                            onChangeText={this.onChangeText}
                            placeholderTextColor={colors.fontHint}
                            autoCorrect={false}
                            keyboardType={this.props.keyboardType}
                            multiline={false}
                            placeholder={this.props.hint}
                            value={this.state.value}
                            autoFocus={true}
                        />
                    </View>

                    <View style={{height: 0.5, backgroundColor: colors.divide, width: 300, marginTop: 15,}} />
                    <View style={styles.bottom}>
                        <TouchableOpacity onPress={this.onCancel} style={styles.text_wrap_cancel}>
                            <Text style={styles.text_cancel}>{this.props.cancelText}</Text>
                        </TouchableOpacity>

                        <View style={{backgroundColor: colors.divide, width: 0.5, height: 45}} />
                        <TouchableOpacity onPress={this.onConfirm} style={styles.text_wrap_confirm}>
                            <Text style={styles.bg_confirm}>{this.props.confirmText}</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Popup>
        );
    };

    renderAndroidStyle = () => {
        return (
            <Popup
                enableAnim={false}
                onShow={() => {
                    this.text_input && this.text_input.focus();
                }}
                canDismissOnClickBg={false}
                backgroundColor={colors.transparent}
                contentBackgroundColor={colors.transparent}
                ref={(p) => this.modal = p}
                width={340}
                height={this.getHeight()}
                popupType={PopupType.CENTER}
            >
                <View style={[styles.containerAndroid]}>

                    <Text style={[styles.title, {
                        marginLeft: 20,
                        marginTop: 20,
                        fontWeight: 'bold'
                    }]}
                    >
                        {this.props.title}
                    </Text>

                    {this.renderSubTitle()}

                    <View style={{flexDirection: 'row', alignItems: 'center',}}>
                        <TextInput
                            ref={(text_input) => {
                                this.text_input = text_input;
                            }}
                            style={styles.text_input_android}
                            maxLength={this.props.maxLength}
                            underlineColorAndroid={'transparent'}
                            onChangeText={this.onChangeText}
                            placeholderTextColor={colors.fontHint}
                            autoCorrect={false}
                            keyboardType={this.props.keyboardType}
                            multiline={false}
                            placeholder={this.props.hint}
                            value={this.state.value}
                            // autoFocus={true}
                        />
                        {this.renderInputCloseImg()}
                    </View>

                    <View style={styles.bottom_android}>
                        <TouchableOpacity onPress={this.onCancel} style={styles.text_wrap_android}>
                            <Text style={styles.bg_confirm_android}>{this.props.cancelText}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={this.onConfirm} style={styles.text_wrap_android}>
                            <Text style={styles.bg_confirm_android}>{this.props.confirmText}</Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Popup>
        );
    };

    renderInputCloseImg = () => {
        if (this.state.value) {
            return (
                <TouchableOpacity
                    style={{marginTop: 24,}}
                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                    onPress={() => {
                        this.setState({value: ''});
                    }}
                >
                    <Image
                        style={{marginLeft: 10, marginRight: 10}}
                        source={require('gsresource/img/delete.png')}

                    />
                </TouchableOpacity>
            );
        }
    };

    renderSubTitle() {

        if (this.props.subTitle && this.props.subTitle.toString().length > 0) {
            return (
                <Text style={[styles.sub_title, Platform.OS === 'ios' ? {} : {marginLeft: 20}]}>{this.props.subTitle}</Text>
            );
        }
    }

    getHeight() {
        if (this.props.subTitle && this.props.subTitle.toString().length > 0) {

            if (Platform.OS === 'android') {
                return 183;
            } else {
                return 163;
            }
        } else {
            if (Platform.OS === 'android') {
                return 160;
            } else {
                return 140;
            }
        }
    }

    onCancel = () => {
        this.dismiss();
        if (this.props.onCancel) {
            this.props.onCancel();
        }
    };

    onChangeText = (value) => {
        this.setState({value});
    };

    doConfirm() {
        const {allowNegative, onConfirm} = this.props;

        /**
         * 移除中文输入法字符间隔
         * @type {string | void | *}
         */
        const value = StringUtl.filterChineseSpace(this.state.value);
        this.setState({value});

        if (!allowNegative && NumberUtl.isNumber(value) && value < 0) {
            Toast.show(I18n.t('notAllowNegative'));
        } else if (!allowNegative && NumberUtl.isNumber(value) && value < this.props.minimum) {
            Toast.show(this.props.title + '不能小于' + this.props.minimum);
        } else {
            if (onConfirm) {
                onConfirm(value);
            }
        }

        this.dismiss();
    }

    onConfirm = () => {
        Keyboard.dismiss();
        this.doConfirm();
        // if (Platform.OS === 'ios') {
        //     InteractionManager.runAfterInteractions(() => {
        //         this.doConfirm();
        //     });
        // } else {
        //     this.doConfirm();
        // }
    };

    show() {
        this.modal.show();
    }

    dismiss() {
        this.modal.dismiss(() => {
            this.props.onDismiss && this.props.onDismiss();
        });
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: colors.white,
        justifyContent: 'center',
    },
    containerAndroid: {
        flex: 1,
        borderRadius: 8,
        backgroundColor: colors.white,
        justifyContent: 'center',
    },
    text_input: {
        flex: 1,
        marginLeft: 34,
        marginRight: 34,
        borderWidth: 0.5,
        marginTop: 15,
        borderRadius: 4,
        borderColor: colors.border,
        height: 30,
        padding: 0,
        paddingLeft: 4,
        fontSize: 14
    },
    text_input_android: {
        flex: 1,
        marginLeft: 20,
        marginRight: 20,
        borderWidth: 0.5,
        marginTop: 24,
        borderRadius: 1,
        borderColor: colors.border,
        height: 32,
        padding: 0,
        paddingLeft: 4,
        fontSize: 14
    },
    title: {
        marginTop: 13,
        fontSize: 16,
        color: colors.normalFont,
    },
    sub_title: {
        marginTop: 6,
        fontSize: 12,
        color: colors.greyFont,
    },
    text_cancel: {
        textAlign: 'center',
        fontSize: 16,
        color: colors.activeFont,
    },
    bg_confirm: {
        fontSize: 16,
        textAlign: 'center',
        color: colors.activeFont,
    },
    bg_confirm_android: {
        fontSize: 14,
        textAlign: 'center',
        color: colors.activeFont,
    },
    bottom: {
        height: 45,
        flexDirection: 'row',
    },
    bottom_android: {
        paddingRight: 30,
        paddingBottom: 10,
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        height: 60,
        flexDirection: 'row',
    },
    text_wrap_cancel: {
        borderBottomLeftRadius: 8,
        flex: 1,
        justifyContent: 'center',
    },
    text_wrap_confirm: {
        flex: 1,
        borderBottomRightRadius: 8,
        justifyContent: 'center',
    },
    text_wrap_android: {
        height: 40,
        width: 60,
        alignItems: 'flex-end',
        justifyContent: 'center',
    }

});