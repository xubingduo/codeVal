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
    if(Platform.OS === 'ios'){
        if(screenH === X_HEIGHT && screenW === X_WIDTH){
            return 1;
        } else if(screenH === XR_HEIGHT && screenW === XR_WIDTH){
            return 2;
        } else {
            return 0;
        }
    } else {
        return 0;
    }

}
