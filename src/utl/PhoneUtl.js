/*
 * @Author: wengdongyang
 * @Date:   2018-08-07 09:02:44
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-07 09:04:19
 */
import { Dimensions, Platform } from 'react-native';

export let screenW = Dimensions.get('window').width;
export let screenH = Dimensions.get('window').height;
// iPhoneX iPhoneXS
const X_WIDTH = 375;
const X_HEIGHT = 812;

// iPhoneXR
const XR_WIDTH = 414;
const XR_HEIGHT = 896;

// // iPhoneXS MAX
const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

/**
 * 判断是否为iphoneX
 * @returns {boolean}
 */
export default function isIphoneX() {
    return (
        Platform.OS === 'ios' &&
        ((screenH === X_HEIGHT && screenW === X_WIDTH) ||
            (screenH === X_WIDTH && screenW === X_HEIGHT) ||
            (screenH === XR_HEIGHT && screenW === XR_WIDTH) ||
            (screenH === XR_WIDTH && screenW === XR_HEIGHT) ||
            (screenH === XSMAX_HEIGHT && screenW === XSMAX_WIDTH) ||
            (screenH === XSMAX_WIDTH && screenW === XSMAX_HEIGHT))
    );
}
