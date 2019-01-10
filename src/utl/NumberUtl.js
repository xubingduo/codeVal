/**
 * @author GaoYuJian
 * @create date 2018/1/11
 * @desc
 * @flow
 */
import NP from 'number-precision';

/**
 * 保留小数位数
 * @param num
 * @param digit 保留小数位数
 */
function toFixed(num: number, digit: number): number {
    return NP.round(num, digit);
}

/**
 * 判断是否为非NaN, Finite的数字
 * @param num
 * @return {boolean}
 */
function isNumber(num: number | string): boolean {
    // 是否包含空格
    if ((num + '').indexOf(' ') >= 0) {
        return false;
    }
    if (typeof num === 'string') {
        num = Number(num);
    }
    return typeof num === 'number' && !Number.isNaN(num) && Number.isFinite(num);
}

/**
 * number > 1000 ? x.x K
 * number > 100000 ? 10w+
 * @param num(string)
 * @returns {number|string}
 * @constructor
 */
function NumberFormat(num: number = 0) {
    let returnNum = 0;
    if (num >= 100000) {
        returnNum = '10W+';
    } else if (num >= 1000 && num < 100000) {
        returnNum = `${(num / 1000).toFixed(1)}k`;
    } else {
        returnNum = num;
    }
    return returnNum;
}

/**
 * 十进制转二进制
 * @param num 数值
 * @param Bits 指定位数
 */
function binary (num: number,Bits: number) {
    if(typeof(num) !== 'number'){
        return '';
    }
    var resArry = [];
    var xresArry = [];
    let i = 0;
    //除2取余
    for (; num > 0;) {
        resArry.push(num % 2);
        num = parseInt(num / 2);
        i++;
    }
    //倒序排列
    for (let j = i - 1; j >= 0; j--) {
        xresArry.push(resArry[j]);
    }
    //报错
    if (Bits < xresArry.length) {
        return '';
    }
    //补0操作
    if (Bits) {
        for (let r = xresArry.length; r < Bits; r++) {
            xresArry.unshift('0');
        }
    }
    return xresArry.join().replace(/,/g, '');
}

export default {
    toFixed,
    isNumber,
    NumberFormat,
    binary,
};