/**
 *@author xbu
 *@date 2018/10/17
 *@flow
 *@desc  获取屏幕大小
 *
 */

/**
     PixelRatio.get() === 1
     mdpi Android 设备 (160 dpi)
     PixelRatio.get() === 1.5
     hdpi Android 设备 (240 dpi)
     PixelRatio.get() === 2
     iPhone 4, 4S
     iPhone 5, 5c, 5s
     iPhone 6
     xhdpi Android 设备 (320 dpi)
     PixelRatio.get() === 3
     iPhone 6 plus
     xxhdpi Android 设备 (480 dpi)
     PixelRatio.get() === 3.5
     Nexus 6
 */
import {
    Dimensions,
    PixelRatio,
} from 'react-native';


export const deviceWidth = Dimensions.get('window').width;
export const deviceHeight = Dimensions.get('window').height;
let fontScale = PixelRatio.getFontScale();

let pixelRatio = PixelRatio.get();
const defaultPixel = 2;
//px转换成dp
const w2 = 750 / defaultPixel;
const h2 = 1334 / defaultPixel;
const scale = Math.min(deviceHeight / h2, deviceWidth / w2);
/**
 * 设置text为sp
 * @param size sp
 * return number dp
 */
function setSpText(size: number) {
    size = Math.round((size * scale) * pixelRatio / fontScale);
    return size / defaultPixel;
}

function scaleSize(size: number) {

    size = Math.round(size * scale + 0.5);
    return size / defaultPixel;
}

export default{
    setSpText,
    scaleSize,
};