/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2018-03-08 11:09:38
 * @modify date 2018-03-08 11:09:38
 * @desc [对原生Alert封装便利方法]
 * @flow
 */
import {Alert} from 'react-native';
import type {AlertButtonStyle, AlertType} from 'react-native/Libraries/Alert/AlertIOS';

const MESSAGE_TIP = '提示';
const MESSAGE_OK = '确定';
const MESSAGE_CANCEL = '取消';

var lastMsg = '';
var lastShowTime = 0;

export type Buttons = Array<{
    text?: string,
    onPress?: ?Function,
    style?: AlertButtonStyle,
}>;

type Options = {
    cancelable?: ?boolean,
    onDismiss?: ?Function,
};

/**
 * @param message
 * @param title
 * @param buttons
 * @param options
 * @param type
 */
const alert = (title: ?string,
    message?: ?string,
    buttons?: Buttons,
    options?: Options = {cancelable: false},
    type?: AlertType,) => {

    if (buttons) {
        if (buttons[0]) {
            if (!buttons[0].text) {
                buttons[0].text = MESSAGE_OK;
            }
        }
        if (buttons[1]) {
            if (!buttons[1].text) {
                buttons[1].text = MESSAGE_CANCEL;
            }
        }
    } else {
        buttons = [
            {
                text: MESSAGE_OK, onPress: () => {
                }
            },
        ];
    }


    if (!message) {
        message = title;
        title = MESSAGE_TIP;
    }

    /**
     * 2秒内不重复Alert相同的内容
     */
    var timePass = new Date().getTime() - lastShowTime;
    if (timePass < 2000 && lastMsg === message) {
        return;
    }

    lastMsg = message;
    lastShowTime = new Date().getTime();

    /**
     * 不显示没有message的alert
     */
    if (!message) {
        return;
    }

    Alert.alert(
        title,
        message,
        buttons,
        options,
        type
    );
};

export default {
    alert
};
