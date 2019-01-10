/**
 * @author GaoYuJian
 * @create date 2017/12/23
 * @desc 全局UI配置信息，包括颜色、字体、统一间距、和标准屏幕的宽高比例(iPhone 6为标准屏幕)
 */

import {Dimensions, Platform} from 'react-native';
import colors from './colors';

export const Screen = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
};

/**
 * 当前屏幕和iPhone6屏幕的宽高比例
 * @type {number}
 */
export const wFactor = Screen.width / 375.0;
export const hFactor = Screen.height / 667.0;

export {colors};

export const listShadow = Platform.select({
    ios: {
        shadowColor: colors.cellShadow,
        shadowOffset: {width: 0, height: 0},
        shadowRadius: 2.5,
        shadowOpacity: 1,
    },
    android: {
        borderWidth: 1,
        borderColor: '#ffe0de',
        borderRadius: 8
    }
});

