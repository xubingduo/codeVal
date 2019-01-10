/**
 *@author xbu
 *@date 2018/11/05
 *@desc  48小时退换货
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    DeviceEventEmitter,
} from 'react-native';

import colors from '/gsresource/ui/colors';
import I18n from '/gsresource/string/i18n';
import fonts from '/gsresource/ui/fonts';
import {DLFlatList, RefreshState, Toast} from '@ecool/react-native-ui';
import NavigationHeader from 'component/NavigationHeader';
import DocSvc from 'svc/DocSvc';
import Image from 'component/Image';
import OverTimeStore from '../store/OverTimeStore';
import Alert from 'component/Alert';
import util from 'utl/NumberUtl';
import RouteUtil from 'utl/RouteUtil';
import CombFeeCell from '../widget/CombFeeCell';

export default class OverTimeReturnGoodsScreen extends Component {
    constructor(props) {
        super(props);
        this.store = new OverTimeStore();
        this.state = ({
            listFreshState: RefreshState.Idle,
        });
    }

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'急速退款'}
                    themeStyle={'default'}
                    statusBarStyle={'dark-content'}
                />
            ),
        };
    };

    renderSectionHeader = () => {
        let data = this.store.trader;
        if (!data) {
            return null;
        }
        return (
            <View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.white,
                    paddingLeft: 16,
                    height: 40
                }}
                >
                    <Text style={{
                        fontSize: fonts.font14,
                        color: colors.normalFont,
                    }}
                    >{data.tenantName}</Text>
                </View>
                <View style={{backgroundColor: colors.divide, height: 1}} />
            </View>
        );
    };

    renderCell = ({item}) => {
        return (
            <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                height: 106,
                borderBottomColor: colors.bg,
                borderBottomWidth: 1,
            }]}
            >
                <View style={{paddingLeft: 16}}>
                    <Image
                        defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                        style={{width: 90, height: 90, borderRadius: 2}}
                        source={{uri: DocSvc.docURLS(this.getImg(item.spuDocId))}}
                    />
                </View>
                <View style={{flex: 1, justifyContent: 'space-between', height: 90}}>
                    <Text
                        style={{
                            color: colors.normalFont,
                            fontSize: fonts.font14,
                            marginLeft: 6,
                            marginRight: 10
                        }}
                        numberOfLines={2}
                    >{item.spuTitle}</Text>
                    <View>
                        <Text style={styles.goodsTitle}>退款数量：{item.skuNum}件</Text>
                        <Text style={styles.goodsTitle}>退款金额：¥{util.toFixed(item.originalPrice * item.skuNum, 2)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    renderSectionFooter = () => {
        let data = this.store.bill;
        if (!data) {
            return null;
        }

        let isCombFee = !!data.combBill;
        return (
            <View style={{backgroundColor: colors.white, marginTop: 10}}>
                <View style={styles.boxBar}>
                    <Text style={styles.barTitle}>退货原因</Text>
                    <Text style={styles.barTitle}>48小时未发货</Text>
                </View>

                {
                    !isCombFee &&
                    <View style={styles.boxBar}>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.barTitle}>退货金额</Text>
                            <Text style={{
                                fontSize: fonts.font12,
                                color: colors.greyFont
                            }}
                            >(包含运费:¥{data.shipFeeMoney})</Text>
                        </View>
                        <Text style={[styles.barTitle, {color: colors.activeFont}]}>¥{data.totalMoney}</Text>
                    </View>
                }

                {
                    isCombFee &&
                    <View>
                        <View style={styles.boxBar}>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={styles.barTitle}>商品总额</Text>
                            </View>
                            <Text style={[styles.barTitle, {color: colors.activeFont}]}>¥{data.totalMoney}</Text>
                        </View>

                        <CombFeeCell
                            value={data.combBill.combineFee}
                        />

                        <View style={styles.boxBar}>
                            <View style={{flexDirection: 'row'}}>
                                <Text style={styles.barTitle}>实际退货金额</Text>
                            </View>
                            <Text style={[styles.barTitle, {color: colors.activeFont}]}>
                                ¥{data.bill.combineBackFlag === 1 ? data.combBill.combineFee + data.totalMoney : data.totalMoney}
                            </Text>
                        </View>
                    </View>
                }
            </View>
        );
    };

    renderFooter = () => {
        return (
            <TouchableOpacity
                style={{height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.activeBtn}}
                onPress={this.onClickReturnGoods}
            >
                <Text style={{fontSize: fonts.font14, color: colors.white}}>退款</Text>
            </TouchableOpacity>
        );
    };

    listEmptyView = () => {
        return (
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('gsresource/img/noOrder.png')} />
                <Text style={{color: colors.normalFont}}>暂无数据</Text>
            </View>
        );
    };


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <DLFlatList
                    keyExtractor={(item, index) => {
                        return item.toString() + index;
                    }}
                    renderItem={this.renderCell}
                    renderSectionHeader={this.renderSectionHeader}
                    renderSectionFooter={this.renderSectionFooter}
                    mode={'SectionList'}
                    refreshState={this.state.listFreshState}
                    sections={this.store.orderReturnGoodsSkus}
                    onFooterRefresh={this.onLoadMore}
                    onHeaderRefresh={this.onHeadFresh}
                    ListEmptyComponent={this.listEmptyView}
                    stickySectionHeadersEnabled={true}
                />
                {this.renderFooter()}
            </SafeAreaView>
        );
    }

    componentDidMount() {
        this.loadData();
    }

    onLoadMore = () => {
        this.loadData();
    };

    onHeadFresh = () => {
        console.log('没数据了');
    };

    loadData = async () => {
        try {
            let {params} = this.props.navigation.state;
            this.updateFreshState(RefreshState.HeaderRefreshing);
            await this.store.requestData(params.id).then(data => {
                setTimeout(() => {
                    this.updateFreshState(RefreshState.Idle);
                }, 500);
            });
        } catch (e) {
            Alert.alert(e.message);
        }
    };

    // 改状态
    updateFreshState = (state) => {
        this.setState({
            listFreshState: state,
        });
    };

    // 获取图片
    getImg = (spuDocId) => {
        if (spuDocId) {
            let arrayImg = spuDocId.split(',');
            return arrayImg[0];
        }
        return spuDocId;
    };


    onClickReturnGoods = async () => {
        let {params} = this.props.navigation.state;
        let obj = {
            jsonParam: {
                main: {
                    typeId: 2,
                    purBillId: params.id,
                    hashKey: (new Date()).getTime(),
                },
                details: []
            }
        };

        try {
            Toast.loading();
            await this.store.returnGoodsList(obj).then(val => {
                Toast.dismiss();
                Toast.show('急速退款信息提交，请等待审核', 2);
                this.backLocation();
            });
        } catch (e) {
            Toast.dismiss();
            Alert.alert(e.message);
        }
    };

    // 返回
    backLocation = () => {
        setTimeout(() => {
            let routerObj = this.props.navigation;
            let routerArray = routerObj.state.params.RouteKeys;
            let routerName = routerArray[routerArray.length - 1].routeName;
            RouteUtil.goBackFrom(routerName, routerObj);
        }, 2000);
    };

    // 刷新数据
    // refreshData = () => {
    //     let {params} = this.props.navigation.state;
    //     if(params.from === 'list') {
    //         DeviceEventEmitter.emit('REFRESH_ORDER_LIST_DATA');
    //     } else {
    //         DeviceEventEmitter.emit('REFRESH_ORDER_LIST_DATA');
    //         DeviceEventEmitter.emit('REFRESH_ORDER_DETIALS_DATA');
    //     }
    // }

    componentWillUnmount() {
        //刷新订单页面
        DeviceEventEmitter.emit('REFRESH_ORDER_LIST_DATA');
        DeviceEventEmitter.emit('REFRESH_ORDER_DETIALS_DATA');
    }


}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    boxBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 15,
        marginRight: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
        height: 45,
    },

    barTitle: {
        fontSize: fonts.font14,
        color: colors.normalFont
    },

    goodsTitle: {
        fontSize: fonts.font12,
        color: colors.greyFont,
        marginLeft: 6,
    }
});