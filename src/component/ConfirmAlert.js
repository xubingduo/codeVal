/**
 * @author GaoYuJian
 * @create date 2018/1/16
 * @desc
 * @flow
 */

import {Alert} from 'react-native';
import I18n from 'gsresource/string/i18n';

function alert(title: string, message: string, confirm: (void) => void, cancel: ?(void) => void) {
    if (!title) {
        title = I18n.t('hint');
    }
    Alert.alert(title, message, [
        {text: I18n.t('cancel'), onPress: () => cancel && cancel()},
        {text: I18n.t('confirm'), onPress: () => confirm && confirm()},
    ]);
}

export default {
    alert
};