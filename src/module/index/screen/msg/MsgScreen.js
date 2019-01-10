/**
 * author: tuhui
 * Date: 2018/7/24
 * Time: 14:56
 * des:消息中心
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    SafeAreaView,
    Text,
    View,
    Dimensions,
    Platform,
    NativeModules
} from 'react-native';
import I18n from 'gsresource/string/i18n';
import colors from 'gsresource/ui/colors';
import NavigationHeader from 'component/NavigationHeader';
import { DLFlatList, RefreshState, Toast } from '@ecool/react-native-ui';
import MsgCell from './cell/MsgCell';
import fonts from 'gsresource/ui/fonts';
import Alert from 'component/Alert';
import MessageSvc from 'svc/MessageSvc';
import { observer } from 'mobx-react';
import rootStore from 'store/RootStore';
import EmptyView from 'component/EmptyView';
import ShowChatScreen from 'svc/CustomerServiceSvc';
import PropTypes from 'prop-types';
import MessageCenterStore, { NotifyType } from 'store/MessageCenterStore';
import BannerActivitySvc from 'svc/BannerActivitySvc';
import MessageActivitySvc from '../../../../svc/MessageActivitySvc';
import IndexStore from '../../store/IndexStore';

const WIDTH = Dimensions.get('window').width;

@observer
export default class MsgScreen extends Component {
    static propTypes = {
        notifyType: PropTypes.number
    };
    static navigationOptions = ({ navigation }) => {
        const { params } = navigation.state;
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{ color: colors.normalFont }}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={
                        params.notifyType === NotifyType.LOGISTICS
                            ? '物流交易'
                            : '活动通知'
                    }
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                    navigationRightItem={'全部已读'}
                    onRightClickHandler={() =>
                        navigation.state.params.updateAllMessageState()
                    }
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            listFreshState: RefreshState.Idle
        };
        this.indexStore = new IndexStore();
    }

    componentDidMount() {
        this.onHeadFresh();
        this.props.navigation.setParams({
            updateAllMessageState: this.updateAllMessageState
        });
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('消息中心');
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('消息中心');
        }
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderUnreadView()}
                <DLFlatList
                    style={{ marginLeft: 14, marginRight: 14, marginTop: 10 }}
                    keyExtractor={(item, index) => item.id.toString()}
                    data={rootStore.messageCenterStore.dataSource}
                    renderItem={({ item }) => this.renderItem(item)}
                    refreshState={this.state.listFreshState}
                    onFooterRefresh={this.onLoadMore}
                    onHeaderRefresh={this.onHeadFresh}
                    ListEmptyComponent={<EmptyView emptyViewType={'NODATA'} />}
                    ItemSeparatorComponent={this.renderDividerView}
                />
            </SafeAreaView>
        );
    }

    renderUnreadView = () => {
        const { params } = this.props.navigation.state;
        if (params.notifyType === NotifyType.LOGISTICS) {
            return (
                rootStore.messageCenterStore.logisticsUnreadMessageCount >
                    0 && (
                    <View
                        style={{
                            backgroundColor: '#ffd000',
                            width: WIDTH,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 14 }}>
                            {'您有' +
                                rootStore.messageCenterStore
                                    .logisticsUnreadMessageCount +
                                '条未读消息'}
                        </Text>
                    </View>
                )
            );
        } else {
            return (
                rootStore.messageCenterStore.activityNofifyUnreadMessageCount >
                    0 && (
                    <View
                        style={{
                            backgroundColor: '#ffd000',
                            width: WIDTH,
                            height: 24,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{ color: 'white', fontSize: 14 }}>
                            {'您有' +
                                rootStore.messageCenterStore
                                    .activityNofifyUnreadMessageCount +
                                '条未读消息'}
                        </Text>
                    </View>
                )
            );
        }
    };

    renderItem = message => {
        return (
            <MsgCell
                item={message}
                cellClick={message => this.gotoDetail(message)}
                customerServiceClick={message =>
                    this.gotoCustomerService(message)
                }
                showDetailButton={false}
            />
        );
    };

    renderDividerView = () => {
        return <View style={{ height: 10 }} />;
    };

    /**
     * 跳转到客服页面
     * message 消息内容
     */
    gotoCustomerService = message => {
        let body = message.body;
        ShowChatScreen.showChatScreen({
            orderId: body.billId,
            returnOrderId: body.returnBillId
        });
    };

    /**
     * 跳转到消息详情页
     * message 消息内容
     */
    gotoDetail = async message => {
        const { params } = this.props.navigation.state;
        try {
            Toast.loading();
            if (
                message.tagOne === '91' ||
                message.tagOne === '99' ||
                message.tagOne === '100'
            ) {
                //发货通知90，卖家不同意退款91，同意并发货91，退款成功91，金额变动94
                this.props.navigation.navigate('OrderDetailsScreen', {
                    id: message.body.billId,
                    returnFlag: 0
                });
            } else if (message.tagOne === '90' || message.tagOne === '94') {
                //发货通知90，卖家不同意退款91，同意并发货91，退款成功91，金额变动94
                this.props.navigation.navigate('OrderDetailsScreen', {
                    id: message.body.billId,
                    returnFlag: 1
                });
            } else if (
                message.tagOne === '300' ||
                message.tagOne === '301' ||
                message.tagOne === '302'
            ) {
                let navTitle = '';
                if (message.tagOne === '300') {
                    navTitle = '优惠领取';
                } else if (message.tagOne === '301') {
                    navTitle = '活动提醒';
                } else if (message.tagOne === '302') {
                    navTitle = '消息通知';
                }
                //平台消息,分内链和外链
                let item = message.body;
                // 兼容新老消息列表
                if (item && item.linkType) {
                    if (item.linkType === '1' && item.jumpLink && item.jumpLink.param) {
                        // 远程链接
                        BannerActivitySvc.actRemote(item.jumpLink.param.url, item.jumpLink.param);
                    } else if(item.linkType === '2' && item.jumpLink && item.jumpLink.param && item.jumpLink.contentType){
                        // 本地页面
                        BannerActivitySvc.actLocal(item.jumpLink.contentType, item.jumpLink.param);
                    }
                } else if(item && item.inFlag) {
                    if (item && item.inFlag === '1') {
                        // 本地页面
                        if (item.inUrlType !== '0') {
                            MessageActivitySvc.actLocal(
                                item.inUrlType,
                                item.inParam
                            );
                        }
                    } else if (item) {
                        // 远程链接
                        MessageActivitySvc.actRemote(item.detailOutUrl);
                    }
                }
                dlconsole.log(item.inFlag);
            }

            //更新未读状态
            await rootStore.messageCenterStore.updateUnreadMessageState(
                message.id,
                params.notifyType
            );
            await rootStore.messageCenterStore.syncMessageList(
                true,
                params.notifyType
            );

            Toast.dismiss();
        } catch (error) {
            Toast.dismiss();
            Alert.alert(error.message);
        }
    };

    onLoadMore = async () => {
        const { params } = this.props.navigation.state;
        this.setState({ listFreshState: RefreshState.FooterRefreshing });
        try {
            await rootStore.messageCenterStore.syncMessageList(
                false,
                params.notifyType
            );
        } catch (error) {
            Alert.alert(error.message);
        }

        if (rootStore.messageCenterStore.isNoMoreData === true) {
            this.setState({
                listFreshState: RefreshState.NoMoreData
            });
        } else {
            this.setState({
                listFreshState: RefreshState.Idle
            });
        }
    };

    onHeadFresh = async () => {
        const { params } = this.props.navigation.state;
        this.setState({ listFreshState: RefreshState.HeaderRefreshing });
        try {
            await rootStore.messageCenterStore.syncMessageList(
                true,
                params.notifyType
            );
        } catch (error) {
            Alert.alert(error.message);
        }

        this.setState({
            listFreshState: RefreshState.Idle
        });
        if (rootStore.messageCenterStore.isNoMoreData === true) {
            this.setState({
                listFreshState: RefreshState.NoMoreData
            });
        }
    };

    updateAllMessageState = async () => {
        const { params } = this.props.navigation.state;
        Toast.loading();
        try {
            await rootStore.messageCenterStore.updateAllState(
                params.notifyType
            );
            Toast.dismiss();
        } catch (error) {
            Toast.dismiss();
            Alert.alert(error.message);
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});
