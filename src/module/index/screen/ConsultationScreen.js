/**
 * @author [lyq]
 * @email
 * @create date 2018-08-22 04:36:24
 * @modify date 2018-08-22 04:36:24
 * @desc [首页入口咨询页面]
 */

import React, { Component } from 'react';
import {
    SafeAreaView,
    View,
    StyleSheet,
    Text,
    TouchableWithoutFeedback,
    Image,
    NativeModules,
    Platform
} from 'react-native';
import { Toast } from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import NavigationHeader from 'component/NavigationHeader';
import { inject, observer } from 'mobx-react';
import rootStore from 'store/RootStore';
import fonts from 'gsresource/ui/fonts';
import CustomerServiceSvc from 'svc/CustomerServiceSvc';

import { DLIMManagerLib, DLSessionListView } from '@ecool/react-native-dlimlib';
import UserActionSvc from '../../../svc/UserActionSvc';
import UserApiManager from '../../../../src/apiManager/UserApiManager';
import IMService from '../../../svc/IMService';
import Alert from '../../../component/Alert';

@inject('configStore')
@observer
export default class ConsultationScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    navigationTitleItem={'消息中心'}
                />
            )
        };
    };

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('咨询页面');
        }
    }

    componentWillUnmount() {
        this.deEmitter && this.deEmitter.remove();
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('咨询页面');
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.renderMessageCenterCell()}
                <View style={styles.hLine} />
                {this.renderActivityNotifyCell()}
                <View style={styles.hLine} />
                {this.renderCustomerServiceCell()}
                <View style={styles.hLine} />
                {this.renderIM()}
            </View>
        );
    }

    //物流交易
    renderMessageCenterCell = () => {
        return this.renderCell(
            require('gsresource/img/logistics.png'),
            rootStore.messageCenterStore.logisticsUnreadMessageCount > 0
                ? rootStore.messageCenterStore.logisticsUnreadMessageCount
                : 0,
            '物流交易',
            this.jumpToMessageCenter
        );
    };

    //活动通知
    renderActivityNotifyCell = () => {
        return this.renderCell(
            require('gsresource/img/bigMessageCenter.png'),
            rootStore.messageCenterStore.activityNofifyUnreadMessageCount > 0
                ? rootStore.messageCenterStore.activityNofifyUnreadMessageCount
                : 0,
            '活动通知',
            this.jumpToActivityNotify
        );
    };

    //智齿客服
    renderCustomerServiceCell = () => {
        return this.renderCell(
            require('gsresource/img/bigCustomerService.png'),
            rootStore.messageCenterStore.sobotUnreadMessageCount > 0
                ? rootStore.messageCenterStore.sobotUnreadMessageCount
                : 0,
            '商陆好店客服',
            this.jumpToCustomerService
        );
    };

    renderIM = () => {
        // 获取系统参数配置 是否显示IM
        if (this.props.configStore.isShowIm()) {
            return (
                <DLSessionListView
                    isCustomer={true}
                    style={{ flex: 1, backgroundColor: colors.white }}
                    onCellDidSelectEvent={event => {
                        if (event) {
                            this.restartIMChat(
                                event.cid,
                                event.tid,
                                event.salesUnitId,
                                event.sessionId
                            );
                        } else {
                            Alert.alert('该会话记录已失效，请重新联系卖家');
                        }
                    }}
                />
            );
        }
    };

    restartIMChat = async (cid, tid, salesUnitId, teamId) => {
        try {
            Toast.loading();
            let { code } = await UserApiManager.reStartIMConv(cid, tid, {
                salesUnitId: salesUnitId,
                teamId: teamId
            });
            Toast.dismiss();
            if (code === 0) {
                // 成功
                IMService.showIMScreen(teamId);
            } else {
                Alert.alert('该会话记录已失效，请重新联系卖家');
            }
        } catch (e) {
            Toast.dismiss();
            Alert.alert('该会话记录已失效，请重新联系卖家');
        }
    };

    renderCell = (
        icon,
        redCount,
        title,
        onPressEvent,
        desc?,
        descColor?,
        time?
    ) => {
        return (
            <TouchableWithoutFeedback onPress={onPressEvent}>
                <View style={styles.cellContainer}>
                    <View style={styles.cellLeft}>
                        <View>
                            <Image style={styles.icon} source={icon} />
                            {redCount > 0 && (
                                <View style={styles.redPointBack}>
                                    <Text style={styles.redPoint}>
                                        {redCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View style={styles.textContainer}>
                            <Text
                                style={styles.title}
                                textAlignVertical='center'
                            >
                                {title}
                            </Text>
                            {/* <Text style={styles.subTitle}>{''}</Text> */}
                        </View>
                    </View>

                    <Text style={styles.cellRight}>{''}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    //跳转到物流交易
    jumpToMessageCenter = () => {
        this.props.navigation.navigate('MsgScreen', { notifyType: 1 });
    };

    //跳转到活动通知
    jumpToActivityNotify = () => {
        this.props.navigation.navigate('MsgScreen', { notifyType: 2 });
    };

    //跳转到客服
    jumpToCustomerService = () => {
        UserActionSvc.track('MSG_CENTER_CUSTOMER_SERVICE');
        CustomerServiceSvc.showChatScreen();
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },
    hLine: {
        height: 1,
        width: '100%',
        backgroundColor: colors.divide
    },
    cellContainer: {
        height: 60,
        width: '100%',
        backgroundColor: 'white',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    cellLeft: {
        height: '100%',
        maxWidth: '50%',
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 14
    },
    cellRight: {
        paddingRight: 14,
        fontSize: fonts.font10,
        color: colors.greyFont
    },
    icon: {
        borderRadius: 21
    },
    textContainer: {
        height: '100%',
        paddingVertical: 10,
        justifyContent: 'center',
        marginLeft: 9
    },
    title: {
        fontSize: fonts.font14,
        color: colors.normalFont
    },
    redPointBack: {
        position: 'absolute',
        right: 0,
        top: 0,
        width: 15,
        height: 15,
        borderRadius: 7.5,
        overflow: 'hidden',
        backgroundColor: '#ff5500',
        justifyContent: 'center',
        alignItems: 'center'
    },
    redPoint: {
        color: 'white',
        fontSize: 10
    }
});
