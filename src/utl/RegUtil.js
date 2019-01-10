/**
 * Created by yjj on 2017/12/8.
 * @flow
 */

/**
 * 验证是否是手机号码
 * @param phoneNumber 手机号码
 * @returns {boolean}
 */
const isPhoneNumber = (phoneNumber: string): boolean => {
    const reg = /^1[0-9]{10}$/;
    return reg.test(phoneNumber);
};

const isNumberOrChar = (str: string): boolean => {
    const reg = /^[A-Za-z0-9]+$/;
    return reg.test(str);
};

/**
 * 验证纯数字
 */
const isPureNumber= (str: string): boolean => {
    const reg = /^[0-9]*$/;
    return reg.test(str);
};

/**
 * 是否为空:null,空串,全空格
 */
const isEmpty = (str: string)=>{
    return !str || typeof str === 'undefined' || str.length <= 0 || !str.trim();
};

/**
 * 判断是否包含emoji表情
 * @param substring
 * @returns {boolean}
 */
const hasEmoji = (substring: string) => {
    if(substring){
        let reg = new RegExp('[~#^$@%&¥¥!?%*]', 'g');
        if (substring.match(reg)) {
            return true;
        }
        for ( let i = 0; i < substring.length; i++) {
            let hs = substring.charCodeAt(i);
            if (0xd800 <= hs && hs <= 0xdbff) {
                if (substring.length > 1) {
                    let ls = substring.charCodeAt(i + 1);
                    let uc = ((hs - 0xd800) * 0x400) + (ls - 0xdc00) + 0x10000;
                    if (0x1d000 <= uc && uc <= 0x1f77f) {
                        return true;
                    }
                }
            } else if (substring.length > 1) {
                let ls = substring.charCodeAt(i + 1);
                if (ls == 0x20e3) {
                    return true;
                }
            } else {
                if (0x2100 <= hs && hs <= 0x27ff) {
                    return true;
                } else if (0x2B05 <= hs && hs <= 0x2b07) {
                    return true;
                } else if (0x2934 <= hs && hs <= 0x2935) {
                    return true;
                } else if (0x3297 <= hs && hs <= 0x3299) {
                    return true;
                } else if (hs == 0xa9 || hs == 0xae || hs == 0x303d || hs == 0x3030
                    || hs == 0x2b55 || hs == 0x2b1c || hs == 0x2b1b
                    || hs == 0x2b50) {
                    return true;
                }
            }
        }
    }else {
        return false;
    }
};

const isPhoneValid = (str: string): boolean => {
    return isPhoneNumber(getRealPhone(str));
};

const getRealPhone = (str: string): string => {
    // 替换中划线和空格
    let phone = str.replace(/-/g,'').replace(/\s/g,'');
    if(phone && phone.length > 11 && phone.indexOf('+') === 0){
        phone = phone.substr(phone.length - 11,11);
    }
    return phone;
};

export default {
    isPhoneNumber: isPhoneNumber,
    isNumberOrChar: isNumberOrChar,
    isPhoneValid: isPhoneValid,
    getRealPhone: getRealPhone,
    isPureNumber: isPureNumber,
    isEmpty: isEmpty,
    hasEmoji: hasEmoji,
};