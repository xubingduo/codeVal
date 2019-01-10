/*
 * @Author: wengdongyang
 * @Date:   2018-08-01 13:41:26
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-01 13:45:01
 */
import React, {Component} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Platform} from 'react-native';
import Image from 'component/Image';
import PropTypes from 'prop-types';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import NewestFocusOn from './NewestFocusOn';
// import customerServiceImg from 'gsresource/img/customerService.png';
// import scanningImg from 'gsresource/img/scanning.png';
// import searchImg from 'gsresource/img/searchBig.png';
// import focusOnDropImg from 'gsresource/img/selectDrop.png';
export default class NewestHeader extends Component {
    static propTypes = {
        store: PropTypes.object,// store
        queryType: PropTypes.string,// 0 普通搜索，1 关注上新，2 推荐上新，3 爆款。默认为0
        focusOnVisiable: PropTypes.bool,// 是否打开modal
        // focusOnHasChanged: PropTypes.bool,// FocusOn是否已经改变
        toggleFocusOnHasChanged: PropTypes.func,// 用于改变FocusOn的值
        closeFocusOnVisiable: PropTypes.func,// 点击关闭modal
        resetFocusOnTypeList: PropTypes.func,// 点击重置
        customerServiceClick: PropTypes.func,// 点击客服
        recommendedClick: PropTypes.func,// 推荐点击事件
        focusOnClick: PropTypes.func,// 关注点击事件
        scanClick: PropTypes.func,// 点击搜索跳转
        searchClick: PropTypes.func// 点击搜索跳转
    };
    static defaultProps = {
        queryType: '1'
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View>
                <View style={styles.header}>
                    <View style={styles.leftComponent}>
                        <TouchableOpacity
                            style={styles.customerServiceBox}
                            hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                            onPress={this.props.customerServiceClick}
                        >
                            <Image source={require('gsresource/img/customerService.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.centerComponent}>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.focusOnBox}
                            onPress={this.props.focusOnClick}
                            hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                        >
                            <View
                                style={this.props.queryType === '1' ? styles.focusOnTextBoxActive : styles.focusOnTextBox}
                            >
                                <Text
                                    style={this.props.queryType === '1' ? styles.focusOnTextActive : styles.focusOnText}
                                >
                                    关注
                                </Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.recommendedBox}
                            onPress={this.props.recommendedClick}
                        >
                            <View
                                style={this.props.queryType === '2' ? styles.recommendedTextBoxActive : styles.recommendedTextBox}
                            >
                                <Text
                                    style={this.props.queryType === '2' ? styles.recommendedTextActive : styles.recommendedText}
                                >推荐
                                </Text>
                            </View>
                            {
                                this.props.queryType === '2' &&
                                <View style={styles.focusOnImgBox}>
                                    <Image style={styles.focusOnImg} source={require('gsresource/img/selectDrop.png')}
                                        resizeMode={'stretch'}
                                    />
                                </View>
                            }

                        </TouchableOpacity>
                    </View>
                    <View style={styles.rightComponent}>
                        <TouchableOpacity
                            style={styles.scannerBox}
                            onPress={this.props.scanClick}
                            hitSlop={{top: 8, left: 8, bottom: 8, right: 8}}
                        >
                            <Image style={styles.scannerImg} source={require('gsresource/img/scanning.png')} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            activeOpacity={1}
                            style={styles.searchBox}
                            onPress={this.props.searchClick}
                            hitSlop={{top: 8, left: 8, bottom: 8, right: 8}}
                        >
                            <Image source={require('gsresource/img/searchBig.png')} />
                        </TouchableOpacity>
                    </View>
                </View>
                <NewestFocusOn
                    focusOnVisiable={this.props.focusOnVisiable}
                    // focusOnHasChanged={this.props.focusOnHasChanged}
                    closeFocusOnVisiable={this.props.closeFocusOnVisiable}
                    toggleFocusOnHasChanged={this.props.toggleFocusOnHasChanged}
                    resetFocusOnTypeList={this.props.resetFocusOnTypeList}
                    store={this.props.store}
                />
            </View>
        );
    }
}

const commonStyle = {
    imgBox: {
        width: 20,
        height: 20
    },
    img: {},
    textBox: {
        width: 55,
        paddingTop: 11,
        paddingBottom: 11,
        borderWidth: 2,
        borderColor: 'transparent'
    },
    textBoxActive: {
        borderBottomColor: colors.activeFont
    },
    text: {
        fontSize: fonts.font16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.border1
    },
    textActive: {
        color: colors.normalFont
    }
};
const headerMainStyle = {
    header: {
        flexDirection: 'row',
        height: 44,
        paddingRight: 15,
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        backgroundColor: colors.white,
        justifyContent: 'space-between'
    },
    leftComponent: {
        flexDirection: 'row',
        width: 55,
        marginTop: 12,
        marginBottom: 12,
        justifyContent: 'flex-start'
    },
    centerComponent: {
        flexDirection: 'row',
        flex: 1,
        justifyContent: 'center'
    },
    rightComponent: {
        flexDirection: 'row',
        width: 55,
        marginTop: 12,
        marginBottom: 12,
        justifyContent: 'flex-end'
    }
};
const leftComponentStyle = {
    customerServiceBox: {
        ...commonStyle.imgBox
    },
    customerServiceImg: {
        ...commonStyle.img
    }
};
const RightComponentStyle = {
    scannerBox: {
        ...commonStyle.imgBox,
        marginRight: 15
    },
    scannerImg: {
        ...commonStyle.img
    },
    searchBox: {
        ...commonStyle.imgBox
    },
    searchImg: {
        ...commonStyle.img
    }
};
const centerComponentStyle = {
    recommendedBox: {
        width: 55
    },
    recommendedTextBox: {
        width: 55,
        height: 42,
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    recommendedTextBoxActive: {
        width: 55,
        height: 42,
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: colors.activeFont
    },
    recommendedText: {
        fontSize: fonts.font16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.border1
    },
    recommendedTextActive: {
        fontSize: fonts.font16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.normalFont
    },
    focusOnBox: {
        position: 'relative',
        width: 55
    },
    focusOnTextBox: {
        width: 55,
        height: 42,
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
    },
    focusOnTextBoxActive: {
        width: 55,
        height: 42,
        borderWidth: 2,
        borderColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomColor: colors.activeFont
    },
    focusOnText: {
        fontSize: fonts.font16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.border1
    },
    focusOnTextActive: {
        fontSize: fonts.font16,
        fontWeight: 'bold',
        textAlign: 'center',
        color: colors.normalFont
    },
    focusOnImgBox: {
        position: 'absolute',
        zIndex: 1,
        right: 0,
        top: 20,
        width: 10,
        height: 8
    },
    focusOnImg: {}
};
const styles = StyleSheet.create({
    ...headerMainStyle,
    ...leftComponentStyle,
    ...centerComponentStyle,
    ...RightComponentStyle
});