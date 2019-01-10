/**
 * author: tuhui
 * Date: 2017/11/28
 * Time: 下午4:09
 */

import I18n from 'react-native-i18n';

import sc from 'gsresource/string/language/zh-Hans';
import tc from 'gsresource/string/language/zh-Hant';

I18n.fallbacks = true;
I18n.defaultLocale = 'zh';
I18n.translations = {
    zh: sc,
    'zh-TW': tc,
    'zh-HK': tc
};

export default I18n;
