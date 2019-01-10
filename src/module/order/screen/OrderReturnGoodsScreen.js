/**
 *@author xbu
 *@date 2018/08/09
 *@desc  退货退款 bar
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    Image,
    Text,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import fonts from 'gsresource/ui/fonts';
import NavigationHeader from 'component/NavigationHeader';
import RouteUtil from 'utl/RouteUtil';
import moment from 'moment';
import OverTimeStore from '../store/OverTimeStore';
import {Toast} from '@ecool/react-native-ui';
import Alert from 'component/Alert';


const TIMES = 48;
export default class OrderReturnGoodsScreen extends Component {
    constructor(props) {
        super(props);
        this.store = new OverTimeStore();
        this.state = {
            isShow: true,
            overTime: false,
            canRefreshPrePage: false,
        };
    }

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('returnOrrefund')}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {
                    this.state.overTime ? (
                        <TouchableOpacity style={styles.returnBox} onPress={this.onClickOverTime}>
                            <Text style={styles.returnText}>{'48小时未发货'}</Text>
                            <Image source={require('gsresource/img/channalRight.png')} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={styles.returnBox} onPress={this.onClickGoToReturnGoods}>
                            <Text style={styles.returnText}>{I18n.t('onlyReturnMoney')}</Text>
                            <Image source={require('gsresource/img/channalRight.png')} />
                        </TouchableOpacity>
                    )
                }
                {
                    this.state.isShow ? (
                        <TouchableOpacity style={styles.returnBox} onPress={this.onClickGoToReturnLogs}>
                            <Text style={styles.returnText}>{I18n.t('returnMoneyGoods')}</Text>
                            <Image source={require('gsresource/img/channalRight.png')} />
                        </TouchableOpacity>) : null
                }


            </SafeAreaView>
        );
    }

    componentDidMount() {
        const {params} = this.props.navigation.state;
        if (params.status === 2) {
            this.isCanReturnGoods();
            this.setState({
                isShow: false,
            });
        }
    }

    // 当前页面刷新
    componentWillReceiveProps(nextProps) {
        let {params} = nextProps.navigation.state;
        if (params.status !== 2) {
            this.setState({
                isShow: true,
                canRefreshPrePage: true
            });
        }
    }

    // 页面销毁之前
    componentWillUnmount() {
        const {params} = this.props.navigation.state;
        if (this.state.canRefreshPrePage) {
            DeviceEventEmitter.emit('REFRESH_ORDER_LIST_DATA');
        }
    }


    // 仅退款
    onClickGoToReturnGoods = () => {
        const {params} = this.props.navigation.state;
        let paramsObj = {
            purBillId: params.id,
            typeId: 0,
            from: params.from,
            money: params.money,
            status: params.status
        };
        let obj = Object.assign({}, paramsObj, {...RouteUtil.put(this.props.navigation)});
        this.props.navigation.navigate('ReturnGoodsSubmitApplyScreen', obj);
    };

    // 退货退款
    onClickGoToReturnLogs = () => {
        const {params} = this.props.navigation.state;
        let paramsObj = {
            purBillId: params.id,
            typeId: 1,
            from: params.from
        };
        let obj = Object.assign({}, paramsObj, {...RouteUtil.put(this.props.navigation)});
        this.props.navigation.navigate('ReturnGoodsSubmitApplyScreen', obj);
    };


    // 获取时间
    getTimes = (date) => {
        if (date) {
            let timeStr = moment(date).format('X') * 1000 + (TIMES * 60 * 60 * 1000);
            let timestamp = (new Date()).getTime();
            if (timestamp <= timeStr) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    // 48小时退货
    onClickOverTime = () => {
        const {params} = this.props.navigation.state;
        let obj = Object.assign({}, params, {...RouteUtil.put(this.props.navigation)});
        this.props.navigation.navigate('OverTimeReturnGoodsScreen', obj);
    };

    // 是否可以48小时退货
    isCanReturnGoods = async () => {
        let {params} = this.props.navigation.state;
        try {
            Toast.loading();
            await this.store.returnGoods({id: params.id}).then(val => {
                Toast.dismiss();
                let {data} = val;
                this.setState({
                    overTime: data.val
                });
            });
        } catch (e) {
            Toast.dismiss();
            Alert.alert(e.message);
        }
    };

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    returnBox: {
        height: 45,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 15,
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
    },

    returnText: {
        fontSize: fonts.font14,
        color: colors.normalFont,
    }

});