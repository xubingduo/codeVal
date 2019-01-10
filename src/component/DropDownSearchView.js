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
    View,
    Keyboard, Text
} from 'react-native';
import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import ModalDropdown from 'react-native-modal-dropdown';


/**
 * 左边带下拉的搜索框  如首页货品搜索
 */
export default class DropDownSearchView extends Component {
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
        //下拉list的数据
        dropDownData: PropTypes.array,
        //下拉选中的itemIndex
        onSelectIndex: PropTypes.func,
        //下拉默认选中itemIndex
        defaultIndex:PropTypes.number,
        //显示内容
        showText:PropTypes.string,
    };

    static defaultProps = {
        showScan: false,
        onScanClick: null,
        autoFocus: false,
        onSubmitEditing: null,
        searchGoods: false,
        isTextInput: true,
        defaultIndex:0,
        showText:'',
    };

    constructor(props) {
        super(props);
        this.state = {text: ''};
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
        }, 600);

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

            <View
                onPress={() => {
                    this.props.onClick && this.props.onClick();
                }}
                style={[styles.container, this.props.style]}
            >

                {
                    this.renderDropDown()
                }

                {
                    this.renderInput()
                }

                {this.renderScan()}

                <Image style={{marginRight: 20}} source={require('gsresource/img/search.png')} />

            </View>
        );
    }

    renderDropDown = () => {
        return (
            <View style={styles.modalWrap}>
                <ModalDropdown
                    dropdownStyle={[styles.dropdownStyle, {height: 70}]}
                    dropdownTextStyle={styles.dropdownTextStyle}
                    options={this.props.dropDownData}
                    onSelect={(index) => {
                        this.props.onSelectIndex && this.props.onSelectIndex(parseInt(index));
                    }}
                    defaultIndex={this.props.defaultIndex}
                >
                    <View style={styles.textWrap}>
                        <Text
                            style={{}}
                            numberOfLines={1}
                        >
                            {this.props.showText}
                        </Text>
                    </View>
                </ModalDropdown>
                <Image
                    source={require('gsresource/img/arrowDown.png')}
                />
            </View>
        );
    };

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
                    <Image style={styles.img_right} source={require('gsresource/img/scan.png')} />
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
                <TextInput
                    style={styles.ti}
                    autoFocus={this.props.autoFocus}
                    onChangeText={(text) => {
                        this.setState({text});
                        this.returnResult(text);
                    }}
                    maxLength={20}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={colors.normalFont}
                    autoCorrect={false}
                    multiline={false}
                    value={this.state.text}
                    placeholder={this.props.hint}
                    returnKeyType={'search'}
                    onSubmitEditing={this.props.onSubmitEditing}
                    ref={(input) => {
                        this.input = input;
                    }}
                />
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
        borderRadius: 4,
        justifyContent: 'space-between'
    },

    img_right: {
        marginRight: 10
    },
    ti: {
        flex: 1,
        marginLeft: 9,
        fontSize: 12,
        color: colors.normalFont,
        padding: 0,
    },
    dropdownStyle: {
        backgroundColor: 'rgba(74,74,74,0.9)',
        width: 50,
        height: 40,
    },
    dropdownTextStyle: {
        backgroundColor: 'rgba(74,74,74,0.9)',
        fontSize: 14,
        color: '#fff',
    },
    textWrap: {
        height: 26,
        marginLeft: 5,
        marginRight: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    modalWrap: {
        flexDirection: 'row',
        alignItems: 'center'
    }

});