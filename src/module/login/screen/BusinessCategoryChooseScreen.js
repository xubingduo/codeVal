/**
 * Created by sml2 on 2018/10/31.
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    TouchableWithoutFeedback,
    ScrollView,
    BackHandler
} from 'react-native';
import PropTypes from 'prop-types';
import NavigationHeader from 'component/NavigationHeader';
import colors from 'gsresource/ui/colors';
import Image from 'component/Image';
import ShopApiManager, { getConfigListDict } from 'apiManager/ShopApiManager';
import { Toast } from '@ecool/react-native-ui';
import Alert from 'component/Alert';
import configStore from 'store/ConfigStore';
import ConfirmAlert from 'component/ConfirmAlert';
import { runInAction } from 'mobx';
import { updateShopMessage } from 'apiManager/ShopApiManager';
import NavigationSvc from 'svc/NavigationSvc';

export default class BusinessCategoryChooseScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param completeHandler
         * @param mode number 0正常选择，带出回调 || 1直接选择然后发请求 || 2编辑
         */
        navigation: PropTypes.object
    };

    static navigationOptions = ({ navigation }) => {
        let params = navigation.state.params;
        let backGesturesEnabled = params && params.mode !== 1;
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{ color: colors.normalFont }}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'主营类目选择'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                    navigationRightItem={
                        <TouchableWithoutFeedback>
                            <View>
                                <Text style={{ color: colors.title }}>
                                    最多选一个
                                </Text>
                            </View>
                        </TouchableWithoutFeedback>
                    }
                    navigationLeftItem={
                        backGesturesEnabled ? (
                            <TouchableOpacity
                                hitSlop={{
                                    top: 8,
                                    left: 8,
                                    bottom: 8,
                                    right: 8
                                }}
                                onPress={() => {
                                    navigation.goBack();
                                }}
                            >
                                <Image
                                    style={{ marginLeft: 10 }}
                                    source={require('gsresource/img/arrowLeftGrey.png')}
                                />
                            </TouchableOpacity>
                        ) : (
                            ''
                        )
                    }
                />
            ),
            gesturesEnabled: backGesturesEnabled
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            items: []
        };
        let params = this.props.navigation.state.params;
        this.backGesturesEnabled = params && params.mode !== 1;
        if (!params || !params.hasOwnProperty('mode')) {
            dlconsole.log('BusinessCategoryChooseScreen:mode参数必传');
        }
    }

    componentDidMount() {
        !this.backGesturesEnabled &&
            BackHandler.addEventListener(
                'hardwareBackPress',
                this.handleBackPress
            );

        Toast.loading();
        getConfigListDict()
            .then(result => {
                Toast.dismiss();
                let items = [];
                let rows =
                    result.data && result.data.rows ? result.data.rows : [];
                let params = this.props.navigation.state.params;
                for (let i = 0; i < rows.length; i++) {
                    let item = {};
                    let row = rows[i];
                    item.title = row.codeName;
                    item.key = row.id + '';
                    item.selected = false;
                    item.codeValue = row.codeValue;
                    item.row = row;
                    items.push(item);
                    if (params && params.hasOwnProperty('id')) {
                        item.selected = params.id === item.codeValue;
                    }
                }
                this.setState({
                    items: items
                });
            })
            .catch(error => {
                Toast.dismiss();
                Alert.alert(error.message);
            });
    }

    componentWillUnmount() {
        !this.backGesturesEnabled &&
            BackHandler.removeEventListener(
                'hardwareBackPress',
                this.handleBackPress
            );
    }

    handleBackPress = () => {
        // 不做处理
    };

    render() {
        let params = this.props.navigation.state.params;
        return (
            <SafeAreaView style={styles.container}>
                <ScrollView style={{ flex: 1, paddingTop: 10 }}>
                    {this.state.items.map(item => {
                        return this.renderCell(item);
                    })}
                </ScrollView>
                <TouchableOpacity
                    onPress={() => {
                        let businessCategary = null;
                        for (let i = 0; i < this.state.items.length; i++) {
                            let item = this.state.items[i];
                            if (item.selected) {
                                businessCategary = item.row;
                            }
                        }
                        if (!businessCategary) {
                            Toast.show('请选择主营类目', 2);
                            return;
                        }

                        if (params && params.mode === 0) {
                            runInAction(() => {
                                configStore.setBusinessCategary(
                                    businessCategary
                                );
                            });
                            this.props.navigation.goBack();
                            params.completeHandler && params.completeHandler();
                            return;
                        }

                        ConfirmAlert.alert(
                            '确认设置' +
                                '主营类目:' +
                                businessCategary.codeName +
                                '?',
                            '',
                            () => {
                                Toast.loading();
                                updateShopMessage({
                                    jsonParam: {
                                        // priceRange:JSON.stringify([{price1:this.state.startPrice,price2:this.state.endPrice}]),
                                        masterClassId:
                                            businessCategary.codeValue
                                    }
                                })
                                    .then(result => {
                                        let params = this.props.navigation.state
                                            .params;
                                        params &&
                                            params.completeHandler &&
                                            params.completeHandler();
                                        Toast.success('设置成功', 2);
                                        NavigationSvc.pop();
                                        runInAction(() => {
                                            configStore.setBusinessCategary(
                                                businessCategary
                                            );
                                        });
                                    })
                                    .catch(error => {
                                        Toast.dismiss();
                                        Alert.alert(error.message);
                                    });
                            }
                        );
                    }}
                    style={{
                        backgroundColor: colors.title,
                        height: 44,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Text style={{ fontSize: 14, color: colors.white }}>
                        {'确定'}
                    </Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    renderCell = item => {
        return (
            <View key={item.key}>
                <TouchableOpacity
                    style={{
                        height: 44,
                        backgroundColor: 'white',
                        alignItems: 'center',
                        flexDirection: 'row',
                        paddingLeft: 20,
                        paddingRight: 20
                    }}
                    onPress={() => {
                        let items = this.state.items;
                        items.forEach((row, index) => {
                            row.selected = false;
                        });
                        item.selected = true;
                        this.setState({
                            items: items
                        });
                    }}
                >
                    <View style={{ flex: 1 }}>
                        <Text
                            style={{ fontSize: 14, color: colors.normalFont }}
                        >
                            {item.title}
                        </Text>
                    </View>
                    <Image
                        source={
                            item.selected
                                ? require('gsresource/img/check.png')
                                : require('gsresource/img/unCheck.png')
                        }
                    />
                </TouchableOpacity>
                <View style={{ height: 1, backgroundColor: colors.borderE }} />
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});
