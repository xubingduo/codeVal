/**
 * Created by sml2 on 2018/10/31.
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import PropTypes from 'prop-types';
import NavigationHeader from 'component/NavigationHeader';
import colors from 'gsresource/ui/colors';
import { Screen } from 'gsresource/ui/ui';
import Image from 'component/Image';
import SingleLineInputDlg from 'component/SingleLineInputDlg';
import { Toast } from '@ecool/react-native-ui';
import NumberUtl from 'utl/NumberUtl';
import NavigationSvc from 'svc/NavigationSvc';
import ConfirmAlert from 'component/ConfirmAlert';
import { updateShopMessage } from 'apiManager/ShopApiManager';
import configStore from 'store/ConfigStore';
import Alert from 'component/Alert';
import { runInAction } from 'mobx';

export default class PriceRangeScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param completeHandler (priceData: Object)=>{}
         * @param confirmBackEnable bool
         */
        navigation: PropTypes.object
    };

    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{ color: colors.normalFont }}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'价格区间'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            quickItems: [
                {
                    title: '0-100',
                    selected: false,
                    paramValue1: '0',
                    paramValue2: '100'
                },
                {
                    title: '100-200',
                    selected: false,
                    paramValue1: '100',
                    paramValue2: '200'
                },
                {
                    title: '200-300',
                    selected: false,
                    paramValue1: '200',
                    paramValue2: '300'
                },
                {
                    title: '300-500',
                    selected: false,
                    paramValue1: '300',
                    paramValue2: '500'
                },
                {
                    title: '500-800',
                    selected: false,
                    paramValue1: '500',
                    paramValue2: '800'
                },
                {
                    title: '800-1000',
                    selected: false,
                    paramValue1: '800',
                    paramValue2: '1000'
                },
                {
                    title: '所有价格',
                    selected: true,
                    disableMatch: true,
                    paramValue1: '',
                    paramValue2: ''
                }
            ],
            startPrice: '',
            endPrice: ''
        };
    }

    componentDidMount() {
        this.matchQuickItem(
            configStore.rangePrice1,
            configStore.rangePrice2,
            this.state.quickItems
        );
        this.forceUpdate();
    }

    /**
     * 确认输入起始价
     * @param value startPrice
     */
    confirmInputStartPrice = value => {
        let items = this.cancelQuickItems();
        this.matchQuickItem(value, this.state.endPrice, items);
        this.setState({
            startPrice: value,
            quickItems: items
        });
    };

    /**
     * 确认输入结束价
     * @param value endPrice
     */
    confirmInputEndPrice = value => {
        let items = this.cancelQuickItems();
        this.matchQuickItem(this.state.startPrice, value, items);
        this.setState({
            endPrice: value,
            quickItems: items
        });
    };

    /**
     * 根起始价，结束价 匹配快速选择quickItems
     * @param price1
     * @param price2
     * @param quickItems
     */
    matchQuickItem = (price1, price2, quickItems) => {
        if (!quickItems || quickItems.length <= 0) {
            return;
        }
        quickItems.forEach(row => {
            row.selected =
                parseFloat(row.paramValue1) === parseFloat(price1) &&
                parseFloat(row.paramValue2) === parseFloat(price2);
            if (
                row.disableMatch &&
                price1 === price2 &&
                price1 === '' &&
                row.paramValue2 === row.paramValue1 &&
                row.paramValue2 === price1
            ) {
                row.selected = true;
            }
        });
    };

    /**
     * 取消选择所有人的快速item 并返回items
     */
    cancelQuickItems = () => {
        this.state.quickItems.forEach(row => {
            row.selected = false;
        });
        return this.state.quickItems;
    };

    /**
     * 点击确定
     */
    confirm = () => {
        // configStore.rangePrice1 = NumberUtl.toFixed(this.state.startPrice,2);
        // configStore.rangePrice2 = NumberUtl.toFixed(this.state.endPrice,2);
        // let params = this.props.navigation.state.params;
        // params && params.completeHandler && params.completeHandler();
        // NavigationSvc.popToTop();
        // return;
        if (
            parseFloat(this.state.startPrice) >= 0 &&
            this.state.startPrice === this.state.endPrice
        ) {
            Toast.show('价格区间设置不正确', 2);
            return;
        }

        if (
            this.state.startPrice !== this.state.endPrice &&
            (this.state.startPrice === '' || this.state.endPrice === '')
        ) {
            Toast.show('价格区间设置不正确', 2);
            return;
        }
        if (
            parseFloat(this.state.startPrice) >= parseFloat(this.state.endPrice)
        ) {
            Toast.show('价格区间设置不正确', 2);
            return;
        }

        let params = this.props.navigation.state.params;
        if (params && params.confirmBackEnable) {
            runInAction(() => {
                configStore.rangePrice1 = this.state.startPrice;
                configStore.rangePrice2 = this.state.endPrice;
            });
            this.props.navigation.goBack();
            params.completeHandler && params.completeHandler();
            return;
        }
        let title =
            this.state.startPrice === '' && this.state.endPrice === ''
                ? '所有价格'
                : this.state.startPrice + '-' + this.state.endPrice;
        ConfirmAlert.alert(
            '确认设置\n价格区间:' +
                title +
                '\n主营类目:' +
                configStore.localBusinessCategary
                ? configStore.localBusinessCategary.codeName
                : '' + '\n是否继续?',
            '',
            () => {
                Toast.loading();
                updateShopMessage({
                    jsonParam: {
                        priceRange: JSON.stringify([
                            {
                                price1: this.state.startPrice,
                                price2: this.state.endPrice
                            }
                        ]),
                        masterClassId: configStore.localBusinessCategary
                            ? configStore.localBusinessCategary.codeValue
                            : 0
                    }
                })
                    .then(result => {
                        let params = this.props.navigation.state.params;
                        params &&
                            params.completeHandler &&
                            params.completeHandler();
                        runInAction(() => {
                            configStore.rangePrice1 = NumberUtl.toFixed(
                                this.state.startPrice,
                                2
                            );
                            configStore.rangePrice2 = NumberUtl.toFixed(
                                this.state.endPrice,
                                2
                            );
                        });
                        Toast.success('设置成功', 2);
                        NavigationSvc.popToTop();
                    })
                    .catch(error => {
                        Toast.dismiss();
                        Alert.alert(error.message);
                    });
            }
        );
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={{ flex: 1, backgroundColor: colors.white }}>
                    {this.renderQuickChooseView()}
                    {this.renderCustomInputView()}
                </View>
                <TouchableOpacity
                    onPress={() => {
                        this.confirm();
                    }}
                    style={{
                        backgroundColor: colors.title,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{ fontSize: 14, color: colors.white }}>
                        确定
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    renderCustomInputView = () => {
        return (
            <View style={{ marginTop: 17 }}>
                <Text
                    style={{
                        fontSize: 14,
                        color: colors.normalFont,
                        marginLeft: 17
                    }}
                >
                    自定义价格
                </Text>
                <View
                    style={{
                        flexDirection: 'row',
                        marginTop: 17,
                        alignItems: 'center'
                    }}
                >
                    <TouchableOpacity
                        style={[
                            styles.customInputTextContainer,
                            { marginLeft: 17 }
                        ]}
                        onPress={() => {
                            SingleLineInputDlg.show({
                                title: '起始价格',
                                maxLength: 20,
                                keyboardType: 'numeric',
                                allowNegative: false,
                                hint: this.state.startPrice,
                                onConfirm: value => {
                                    if (
                                        !value ||
                                        value.length <= 0 ||
                                        !NumberUtl.isNumber(value)
                                    ) {
                                        Toast.show('请输入数值', 2);
                                    } else {
                                        this.confirmInputStartPrice(
                                            NumberUtl.toFixed(value, 2) + ''
                                        );
                                    }
                                }
                            });
                        }}
                    >
                        <Text style={{ fontSize: 14, color: colors.greyFont }}>
                            {this.state.startPrice}
                        </Text>
                    </TouchableOpacity>
                    <Text
                        style={{
                            fontSize: 14,
                            color: colors.greyFont,
                            marginLeft: 8,
                            marginRight: 8
                        }}
                    >
                        ——
                    </Text>

                    <TouchableOpacity
                        style={[
                            styles.customInputTextContainer,
                            { marginRight: 17 }
                        ]}
                        onPress={() => {
                            SingleLineInputDlg.show({
                                title: '结束价格',
                                allowNegative: false,
                                keyboardType: 'numeric',
                                maxLength: 20,
                                hint: this.state.endPrice,
                                onConfirm: value => {
                                    if (
                                        !value ||
                                        value.length <= 0 ||
                                        !NumberUtl.isNumber(value)
                                    ) {
                                        Toast.show('请输入数值', 2);
                                    } else {
                                        this.confirmInputEndPrice(
                                            NumberUtl.toFixed(value, 2) + ''
                                        );
                                    }
                                }
                            });
                        }}
                    >
                        <Text style={{ fontSize: 14, color: colors.greyFont }}>
                            {this.state.endPrice}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    renderQuickChooseView = () => {
        let gap1 = 14;
        let numberOfcols = 3;
        let itemW = (Screen.width - (numberOfcols + 1) * gap1) / 3;
        return (
            <View style={{ marginTop: 20 }}>
                <Text
                    style={{
                        marginLeft: gap1,
                        marginBottom: 9,
                        fontSize: 14,
                        color: colors.normalFont
                    }}
                >
                    快速选择
                </Text>
                <View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                        {this.state.quickItems.map((item, index) => {
                            let color = item.selected
                                ? colors.title
                                : colors.greyFont;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.quickTextContainer,
                                        {
                                            marginLeft: gap1,
                                            width: itemW,
                                            borderColor: color
                                        }
                                    ]}
                                    key={index}
                                    onPress={() => {
                                        let items = this.cancelQuickItems();
                                        item.selected = true;
                                        // let prices = item.title.split('-');
                                        // __DEV__ && console.warn( prices );
                                        this.setState({
                                            quickItems: items,
                                            startPrice: item.paramValue1,
                                            endPrice: item.paramValue2
                                        });
                                    }}
                                >
                                    {item.selected && (
                                        <View
                                            style={{
                                                position: 'absolute',
                                                top: 0,
                                                right: 0
                                            }}
                                        >
                                            <Image
                                                source={require('gsresource/img/choosed_pink.png')}
                                            />
                                        </View>
                                    )}
                                    <Text
                                        style={{ fontSize: 14, color: color }}
                                    >
                                        {item.title}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                <View
                    style={{
                        height: 1,
                        marginTop: 17,
                        backgroundColor: colors.greyFont,
                        marginLeft: gap1,
                        marginRight: gap1
                    }}
                />
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },
    customInputTextContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 26,
        borderRadius: 4,
        borderColor: colors.greyFont,
        borderWidth: 1
    },
    quickTextContainer: {
        marginTop: 8,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
        borderColor: colors.greyFont,
        borderWidth: 1
    }
});
