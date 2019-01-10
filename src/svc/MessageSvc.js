/**
 * @author YiJunJie liyanqin
 * @email eric.hz.jj@gmail.com
 * @create date 2018-02-01 11:43:44
 * @desc [消息服务 接收 个推消息 cid ...]
 * @flow
 */

import {
    NativeAppEventEmitter,
    NativeModules,
    Platform,
    PushNotificationIOS
} from 'react-native';
import MessageApiManager from 'apiManager/MessageApiManager';
import DLMessageCenter from '@ecool/react-native-message';
import rootStore from 'store/RootStore';
import { NotifyType } from 'store/MessageCenterStore';

let BadgeModule = NativeModules.BadgeModule;

class MessageSvc {
    resigsteClientIdSub: Object;
    receiveRemoteNotificationSub: Object;
    clickRemoteNotificationSub: Object;

    // 绑定个推ClientId 返回的用户信息
    userEmbGuid: number = 0;

    // 个推ID
    clientId: string;

    /**
     * 开启消息服务
     */
    start = () => {
        this.stop();

        // 如果当前Cid 存在 就上传Cid
        this.clientId && this.uploadClientId(this.clientId);

        //订阅消息通知
        this.resigsteClientIdSub = NativeAppEventEmitter.addListener(
            'registeClientId',
            clientId => {
                this.uploadClientId(clientId);
                this.clientId = clientId;
            }
        );

        this.receiveRemoteNotificationSub = NativeAppEventEmitter.addListener(
            'receiveRemoteNotification',

            notification => {
                //消息类型分为 APNs 和 payload 透传消息，具体的消息体格式会有差异
                switch (notification.type) {
                case 'cid':
                    this.uploadClientId(notification.cid);
                    this.clientId = notification.cid;
                    break;
                case 'apns':
                    this.handleMessage(notification);
                    break;
                case 'payload':
                    this.handleMessage(notification);
                    break;
                default:
                }
            }
        );

        this.clickRemoteNotificationSub = NativeAppEventEmitter.addListener(
            'clickRemoteNotification',
            notification => {
                dlconsole.log('点击通知', JSON.stringify(notification));
            }
        );
    };

    /**
     * 停止消息服务
     */
    stop = () => {
        this.receiveRemoteNotificationSub &&
            this.receiveRemoteNotificationSub.remove();
        this.clickRemoteNotificationSub &&
            this.clickRemoteNotificationSub.remove();
        this.resigsteClientIdSub && this.resigsteClientIdSub.remove();
        DLMessageCenter.destroy();
    };

    /**
     * 上传个推用户ID
     */
    uploadClientId = async (clientId: string) => {
        try {
            let { data } = await MessageApiManager.uploadCid({
                jsonParam: {
                    machineCode: clientId,
                    productType: 10
                }
            });
            this.userEmbGuid = data.val;

            global.dlconsole.log(
                `cid 同步成功:${data.val ? JSON.stringify(data.val) : ''}`
            );
            // 同步未读消息数
            rootStore.messageCenterStore.syncUnreadMessageCount(
                NotifyType.LOGISTICS
            );
            rootStore.messageCenterStore.syncUnreadMessageCount(
                NotifyType.ACTIVITY
            );
        } catch (error) {
            // CID 提交失败
            global.dlconsole.log('cid 同步失败');
        }
    };

    /**
     * 处理消息
     */
    handleMessage = (notification: Object) => {
        console.log(
            `收到消息${notification ? JSON.stringify(notification) : ''}`
        );
        try {
            let message = null;
            if (Platform.OS === 'android') {
                NativeModules.DLConfigManager.showNotification(notification.payload);
                message = JSON.parse(notification.payload);
            } else {
                message = JSON.parse(notification.userInfo.payloadMsg);
            }

            // 1. 过滤不需要的消息
            let guid = message.to.guid;
            if (guid && this.userEmbGuid && guid === this.userEmbGuid) {
                console.log('---------开始记录消息日志-----------');
                console.log(JSON.stringify(message));
                console.log('---------结束记录消息日志-----------');
                // 2. 将消息传给消息处理中心处理
                DLMessageCenter.handleMessage(message);
            }
        } catch (error) {
            console.log('---------开始记录消息解析错误-----------');
            console.log(JSON.stringify(notification));
            console.log(error.message);
            console.log('---------结束记录消息解析错误-----------');
        }
    };

    /**
     * 设置应用图标上的维度消息
     */
    setupBadgeCount = (count: number = 0) => {
        if (Platform.OS === 'ios') {
            PushNotificationIOS.setApplicationIconBadgeNumber(count);
        }
    };
}

export default new MessageSvc();
