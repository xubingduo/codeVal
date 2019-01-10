/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   下拉筛选组件
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-02 13:42:43
 */
import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {runInAction} from 'mobx';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform,
    Modal,
    ScrollView,
    TouchableWithoutFeedback,
    NativeModules,
    SafeAreaView,
    TextInput,
} from 'react-native';

import font from 'gsresource/ui/fonts';
import colors from 'gsresource/ui/colors';
import {Toast} from '@ecool/react-native-ui';
import fonts from '../../../gsresource/ui/fonts';
import NumberUtl from '../../../utl/NumberUtl';
// import {Toast} from '@ecool/react-native-ui';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

@observer
export default class NewestFocusOn extends Component {
    static propTypes = {
        focusOnVisiable: PropTypes.bool, // 是否可见
        closeFocusOnVisiable: PropTypes.func, // 关闭-回调
        toggleFocusOnHasChanged: PropTypes.func, // 改变对应的haschange
        resetFocusOnTypresetFocusOnTypeListeList: PropTypes.func, // 改变对应的haschange
        store: PropTypes.object // store
    };

    constructor(props) {
        super(props);
        this.hasChanged = false;
        // this.state = {
        //     lowPrice: '',
        //     heightPrice: ''
        // };
    }

    onLowPriceChanged = (text, isFreshData) => {
        if (!NumberUtl.isNumber(text)) {
            return;
        }
        let {focusOnTypeList} = this.props.store;
        for (let i = 0; i < focusOnTypeList.length; i++) {
            if (focusOnTypeList[i].id === 7) {
                runInAction(() => {
                    if (!text) {
                        focusOnTypeList[i].pubPriceStart = '';
                    } else {
                        focusOnTypeList[i].pubPriceStart = text;
                    }
                });
                if (isFreshData) {
                    this.chooseCurrentFocusOnType(focusOnTypeList[i]);
                }
            }
        }
    };

    onHeightPriceChanged = (text, isFreshData) => {
        if (!NumberUtl.isNumber(text)) {
            return;
        }
        let {focusOnTypeList} = this.props.store;
        for (let i = 0; i < focusOnTypeList.length; i++) {
            if (focusOnTypeList[i].id === 7) {
                runInAction(() => {
                    if (!text) {
                        focusOnTypeList[i].pubPriceEnd = '';
                    } else {
                        focusOnTypeList[i].pubPriceEnd = text;
                    }
                });
                if (isFreshData) {
                    this.chooseCurrentFocusOnType(focusOnTypeList[i]);
                }
            }
        }
    };

    canModalDismiss = () => {
        let canDismiss = true;
        let message = '';
        let {focusOnTypeList} = this.props.store;
        for (let i = 0; i < focusOnTypeList.length; i++) {
            let focusOnType = focusOnTypeList[i];
            if (focusOnType.id === 7 && focusOnType.pubPriceStart !== '' && focusOnType.pubPriceEnd !== '') {
                if (parseFloat(focusOnType.pubPriceEnd) < parseFloat(focusOnType.pubPriceStart)) {
                    canDismiss = false;
                    message = '最高价不能小于最低价';
                }
            }
        }
        return {
            canDismiss: canDismiss,
            message: message
        };
    };

    renderPriceInput = (focusOnType) => {
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputWrap}
                    placeholder={'最低价'}
                    placeholderTextColor={colors.unEnable}
                    keyboardType='numeric'
                    underlineColorAndroid='transparent'
                    value={focusOnType.pubPriceStart}
                    onChangeText={(text) => {
                        this.onLowPriceChanged(text, true);
                    }}
                />
                <Text style={{textAlign: 'center'}}>{'—'}</Text>
                <TextInput
                    style={styles.inputWrap}
                    placeholder={'最高价'}
                    placeholderTextColor={colors.unEnable}
                    keyboardType='numeric'
                    underlineColorAndroid='transparent'
                    value={focusOnType.pubPriceEnd}
                    onChangeText={(text) => {
                        this.onHeightPriceChanged(text, true);
                    }}
                />
            </View>
        );
    };

    renderPricePickView = (focusOnType) => {
        return (
            <View style={styles.pricePickType}>
                {focusOnType['detailList'].map((elem, idx) => {
                    return (
                        <TouchableWithoutFeedback
                            key={idx}
                            onPress={() => {
                                this.onLowPriceChanged('', false);
                                this.onHeightPriceChanged('', false);
                                this.chooseCurrentFocusOnType(
                                    elem
                                );
                            }}
                        >
                            <View
                                style={
                                    styles.priceBtn
                                }
                            >
                                <Text
                                    numberOfLines={
                                        1
                                    }
                                    ellipsizeMode={
                                        'tail'
                                    }
                                    style={[
                                        styles.btnText,
                                        elem.checked ===
                                        true
                                            ? {
                                                color:
                                                colors.activeFont
                                            }
                                            : {}
                                    ]}
                                >
                                    {
                                        elem.codeName
                                    }
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    );
                })}
            </View>
        );
    };

    renderPriceView = (focusOnType, index) => {
        return (
            <View key={index}>
                <Text
                    style={styles.typeDes}
                >
                    {'价格'}
                </Text>
                {this.renderPricePickView(focusOnType)}
                {this.renderPriceInput(focusOnType)}
            </View>
        );
    };

    render() {
        let focusOnTypeList = this.props.store.focusOnTypeList;
        if (!this.props.focusOnVisiable) {
            return null;
        }
        return (
            <Modal
                visible={this.props.focusOnVisiable}
                animationType={'none'}
                transparent={true}
                onRequestClose={() => {
                }}
            >
                <SafeAreaView>
                    <TouchableOpacity
                        activeOpacity={1}
                        style={styles.bgTransparent}
                        onPress={() => {
                            let {canDismiss, message} = this.canModalDismiss();
                            if (!canDismiss) {
                                Toast.show(message);
                                return;
                            }
                            this.props.closeFocusOnVisiable();
                        }}
                    >
                        <View style={styles.bgMask}>
                            <ScrollView
                                style={{maxHeight: 350, position: 'relative'}}
                            >
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={styles.container}
                                >
                                    <View style={styles.main}>
                                        {focusOnTypeList.map(
                                            (focusOnType, index) => {
                                                if (focusOnType.id === 7) {
                                                    return this.renderPriceView(focusOnType, index);
                                                }
                                                return focusOnType['detailList'].length > 0 ? (
                                                    <View
                                                        style={styles.types}
                                                        key={index}
                                                    >
                                                        <Text
                                                            style={styles.typeDes}
                                                        >
                                                            {focusOnType.des}
                                                        </Text>
                                                        <View style={styles.type}>
                                                            {focusOnType['detailList'].map((elem, idx) => {
                                                                return (
                                                                    <TouchableWithoutFeedback
                                                                        key={idx}
                                                                        onPress={() => {
                                                                            this.chooseCurrentFocusOnType(
                                                                                elem
                                                                            );
                                                                        }}
                                                                        // hitSlop={{
                                                                        //     top: 16,
                                                                        //     left: 16,
                                                                        //     bottom: 16,
                                                                        //     right: 16
                                                                        // }}
                                                                    >
                                                                        <View
                                                                            style={
                                                                                styles.btn
                                                                            }
                                                                        >
                                                                            <Text
                                                                                numberOfLines={
                                                                                    1
                                                                                }
                                                                                ellipsizeMode={
                                                                                    'tail'
                                                                                }
                                                                                style={[
                                                                                    styles.btnText,
                                                                                    elem.checked ===
                                                                                    true
                                                                                        ? {
                                                                                            color:
                                                                                            colors.activeFont
                                                                                        }
                                                                                        : {}
                                                                                ]}
                                                                            >
                                                                                {
                                                                                    elem.codeName
                                                                                }
                                                                            </Text>
                                                                        </View>
                                                                    </TouchableWithoutFeedback>
                                                                );
                                                            })}
                                                        </View>
                                                    </View>
                                                ) : (
                                                    <View
                                                        key={index}
                                                    />
                                                );
                                            }
                                        )}
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    activeOpacity={1}
                                    style={{
                                        position: 'absolute',
                                        right: 10,
                                        top: 10
                                    }}
                                    hitSlop={{
                                        top: 8,
                                        left: 8,
                                        bottom: 8,
                                        right: 8
                                    }}
                                    onPress={() => {
                                        this.props.toggleFocusOnHasChanged(true);
                                        this.props.resetFocusOnTypeList();
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: colors.activeFont,
                                            fontSize: font.font12
                                        }}
                                    >
                                        重置
                                    </Text>
                                </TouchableOpacity>
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </SafeAreaView>
            </Modal>
        );
    }

    chooseCurrentFocusOnType(smallClass) {
        this.props.store.chooseCurrentFocusOnType(smallClass);
        this.props.toggleFocusOnHasChanged(true);
    }
}
const styles = StyleSheet.create({
    bgTransparent: {
        width: WIDTH,
        height: HEIGHT,
        backgroundColor: 'transparent',
    },
    bgMask: {
        marginTop: (Platform.OS === 'ios' && parseInt(Platform.Version) < 11) ? 44 + 20 : 44,
        height: (Platform.OS === 'ios' && parseInt(Platform.Version) < 11) ? HEIGHT - 44 - 20 : HEIGHT - 44,
        backgroundColor: 'rgba(0,0,0,0.3)'
    },
    container: {
        backgroundColor: '#fff',
        paddingBottom: 10
    },
    typeDes: {
        padding: 7,
        fontSize: 12,
        color: colors.greyFont
    },
    type: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    pricePickType: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 10,
        marginRight: 10,
    },
    btn: {
        width: WIDTH * 0.2,
        marginLeft: WIDTH * 0.025,
        marginRight: WIDTH * 0.025,
        backgroundColor: '#fafafa',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 5,
        height: 26,
        paddingTop: 5,
        paddingBottom: 5
    },
    priceBtn: {
        width: WIDTH * 0.3,
        backgroundColor: '#fafafa',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
        marginBottom: 5,
        height: 26,
        paddingTop: 5,
        paddingBottom: 5
    },
    btnText: {
        textAlign: 'center',
        color: colors.normalFont,
        fontSize: 12
    },
    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginTop: 10,
    },
    inputWrap: {
        paddingTop: 3,
        paddingBottom: 3,
        width: 150,
        backgroundColor: '#fafafa',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'center',
        fontSize: fonts.font12,
    },
});
