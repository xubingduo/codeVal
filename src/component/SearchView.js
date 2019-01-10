/**
 * author: tuhui
 * Date: 2017/12/5
 * Time: 下午8:31
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    Image,
    TextInput,
    TouchableOpacity,
    Keyboard, Text, View
} from 'react-native';
import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import fonts from '../gsresource/ui/fonts';

/**
 * 带扫描的搜索框
 */
export default class SearchView extends Component {
    static propTypes = {
        //默认导航不需要导航 不需要传
        navigation: PropTypes.object,
        //是否展示扫码按钮
        showScan: PropTypes.bool,
        //输入框提示信息
        hint: PropTypes.string.isRequired,
        //输入框内容变化回调
        onTextChange: PropTypes.func.isRequired,
        //扫码点击回调
        onScanClick: PropTypes.func,
        //整体样式
        style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        //是否自动获取焦点
        autoFocus: PropTypes.bool,
        //点击键盘 搜索回调
        onSubmitEditing: PropTypes.func,
        //是否需要搜索货品  暂时没用到
        searchGoods: PropTypes.bool,
        //整体点击事件
        onClick: PropTypes.func,
        //是否使用TextInput
        isTextInput: PropTypes.bool,
        //默认内容
        defaultText: PropTypes.string,
        //是否需要搜索 图标
        isNeedSearchIcon: PropTypes.bool,
        //输入框样式
        tiStyle:PropTypes.object,
        // 失焦回调
        onBlur: PropTypes.func,
        // 聚焦回调
        onFocus: PropTypes.func
    };

    static defaultProps = {
        showScan: false,
        onScanClick: null,
        autoFocus: false,
        onSubmitEditing: null,
        searchGoods: false,
        isTextInput: true,
        defaultText: '',
        isNeedSearchIcon: true,
        tiStyle:{},
        onBlur: () => null,
        onFocus: () => null
    };

    constructor(props) {
        super(props);
        this.state = {text: ''};


    }

    componentDidMount() {
        if (this.props.defaultText) {
            this.setText(this.props.defaultText);
        }
    }

    setText = (str) => {
        this.setState({
            text: str,
        });
        this.returnResult(str);
    };

    returnResult = (str) => {
        if (this.searchId) {
            clearTimeout(this.searchId);
        }

        this.searchId = setTimeout(() => {
            this.props.onTextChange(str);
        }, 0);

        // _.debounce(() => {
        //     this.props.onTextChange(str);
        //     console.warn('search token:' + str);
        // }, 2000, {
        //     'leading': true,
        //     'trailing': false
        // });
    };


    render() {
        return (

            <TouchableOpacity
                onPress={() => {
                    this.props.onClick && this.props.onClick();
                }}
                style={[styles.container, this.props.style]}
            >
                {
                    this.props.isNeedSearchIcon &&
                    <Image style={styles.img_left} source={require('gsresource/img/search.png')} />
                }

                {
                    this.renderInput()
                }

                {this.renderScan()}

            </TouchableOpacity>
        );
    }

    dismiss = () => {
        this.input.clear();
        Keyboard.dismiss();
    };

    renderScan() {
        if (this.props.showScan) {
            return (
                <TouchableOpacity onPress={() => {
                    this.props.onScanClick();
                    this.onScanClickThis();
                }}
                >
                    {
                        <Image style={styles.img_right} source={require('gsresource/img/scan.png')} />
                    }
                </TouchableOpacity>
            );
        }
    }

    onScanClickThis = () => {

        this.props.navigation && this.props.navigation.navigate('ScanScreen',
            {
                codeType: 'barCode',
                didRecievedData: (data, callback) => {
                    this.setText(data);
                    callback(true);
                },
                finishAfterResult: true,
            });
    };

    renderInput() {
        if (this.props.isTextInput) {
            return (
                <View style={styles.tiContainer}>
                    <TextInput
                        style={[styles.ti,this.props.tiStyle]}
                        autoFocus={this.props.autoFocus}
                        onChangeText={(text) => {
                            this.setState({text}, () => {
                                this.returnResult(text);
                            });
                        }}
                        maxLength={20}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={colors.greyFont}
                        autoCorrect={false}
                        multiline={false}
                        value={this.state.text}
                        placeholder={this.props.hint}
                        returnKeyType={'search'}
                        onSubmitEditing={this.props.onSubmitEditing}
                        onBlur={this.props.onBlur}
                        onFocus={this.props.onFocus}
                        ref={(input) => {
                            this.input = input;
                        }}
                    />
                    {this.renderInputCloseImg()}
                </View>
            );
        } else {
            return (
                <Text
                    style={[styles.ti]}
                    maxLength={20}
                    multiline={false}
                >
                    {
                        this.props.hint
                    }
                </Text>
            );
        }

    }

    renderInputCloseImg = () => {
        if (this.state.text) {
            return (
                <TouchableOpacity
                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                    onPress={() => {
                        this.setState({text: ''});
                        this.returnResult('');
                    }}
                >
                    <Image
                        style={{marginLeft:10, marginRight: 10}}
                        source={require('gsresource/img/delete.png')}

                    />
                </TouchableOpacity>
            );
        }
    };

    componentWillUnmount(){
        if (this.searchId) {
            clearTimeout(this.searchId);
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: colors.bg,
        alignItems: 'center',
        borderRadius: 100,
        justifyContent: 'space-between'
    },
    img_left: {
        marginLeft: 14
    },
    img_right: {
        marginRight: 10
    },
    tiContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.bg,
        alignItems: 'center',
    },
    ti: {
        flex: 1,
        marginLeft: 9,
        fontSize: fonts.font12,
        color: colors.normalFont,
        padding: 0,
    }

});