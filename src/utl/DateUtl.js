/**
 * author: tuhui
 * Date: 2017/12/2
 * Time: 上午11:47
 * @flow
 */
import moment from 'moment';
import StringUtl from './StringUtl';

export const kDayFormatter = 'YYYY-MM-DD';
export const kDayFormatterHm = 'YYYY-MM-DD HH:mm';
export const kDayFormatterNoY = 'MM-DD HH:mm';

type Formatter = typeof kDayFormatter | typeof kDayFormatterHm | typeof kDayFormatterNoY;

var DateUtl = {};

/**
 * 比较时间大小
 * @param date1
 * @param date2
 * @returns {boolean}  是否date1>date2
 */
DateUtl.comparerDate = function (date1: string, date2: string) {
    var startTime = new Date(Date.parse(date1));
    var endTime = new Date(Date.parse(date2));
    return (startTime.getTime() > endTime);
};

/**
 * 获取当前年的number
 * @returns {number}  2018
 */
DateUtl.currentTime = function () {
    return moment().format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 获取当前年的number
 * @returns {number}  2018
 */
DateUtl.currentTimeSSS = function () {
    return moment().format('YYYY-MM-DD HH:mm:ss:SSS');
};

DateUtl.currentDate = function () {
    return moment().format('YYYY-MM-DD');
};

DateUtl.dateStr = function (date: string) {
    return moment(date).format('YYYY-MM-DD');
};

DateUtl.dateChStr = function (date: string) {
    return `${DateUtl.recentDateString(date)} ${moment(date).format('HH:mm')}`;
};

DateUtl.dateFromStr = function (dateStr: string) {
    return moment(dateStr).toDate();
};

DateUtl.getYear = function () {
    return new Date().getFullYear();
};

/**
 * 获取当前月的number
 * @returns {number} 4
 */
DateUtl.getMonth = function () {
    return new Date().getMonth();
};

/**
 * 获取当前天
 * @returns {number} 10
 */
DateUtl.getDay = function () {
    return new Date().getDate();
};

/**
 * 获取当前星期几
 * @returns {string} 星期三
 */
DateUtl.getWeek = function () {
    let str = '';
    let week = new Date().getDay();
    if (week === 0) {
        str = '星期日';
    } else if (week === 1) {
        str = '星期一';
    } else if (week === 2) {
        str = '星期二';
    } else if (week === 3) {
        str = '星期三';
    } else if (week === 4) {
        str = '星期四';
    } else if (week === 5) {
        str = '星期五';
    } else if (week === 6) {
        str = '星期六';
    }

    return str;
};

/**
 * 根据 Date 对象获取当前时间 2019-01-11
 * @param date
 * @returns {string}
 */
DateUtl.formatDate = function (date: Date) {
    var myyear = date.getFullYear();
    var mymonth = date.getMonth() + 1;
    var myweekday = date.getDate();
    if (mymonth < 10) {
        mymonth = '0' + mymonth;
    }
    if (myweekday < 10) {
        myweekday = '0' + myweekday;
    }
    return (myyear + '-' + mymonth + '-' + myweekday);
};

/**
 * 从Date对象  获取当前星期几的字符串
 * @param dateString
 * @returns {string}
 */
DateUtl.getWeekFromDate = function (dateString: string) {
    var date;
    if (StringUtl.isNull(dateString)) {
        return '';
    } else {
        var dateArray = dateString.split('-');
        date = new Date(parseInt(dateArray[0]), parseInt(parseInt(dateArray[1]) - 1), parseInt(dateArray[2]));
    }
    return '星期' + '日一二三四五六'.charAt(date.getDay());
};

/**
 * 获取当前年月日星期几的字符串  2019-01-10 星期四
 * @returns {string}
 */
DateUtl.getYMW = function () {
    return moment().format('YYYY-MM-DD') + ' ' + DateUtl.getWeek();
};

/**
 * 获取当前年月日  2010-01-01
 * @returns {string}
 */
DateUtl.getYMD = function () {
    return moment().format('YYYY-MM-DD');
};

/**
 * 获取某个月的最后一天
 * @param year 2010
 * @param month 03
 * @returns {string}
 */
DateUtl.getMonthLastDay = function (year: string, month: string) {
    return moment(`${year}-${month}`, 'YYYY-MM-DD').endOf('month').format('YYYY-MM-DD');
};

/**
 * 获取当前时间 YYYY-MM-DD HH:mm:ss的格式
 * @returns {string}
 */
DateUtl.currentTime = function () {
    return moment().format('YYYY-MM-DD HH:mm:ss');
};

/**
 * 获取当前时间 YYYY-MM-DD 格式
 * @returns {string}
 */
DateUtl.currentTimeYYYYMMDD = function () {
    return moment().format('YYYY-MM-DD');
};

/**
 * 获取当前周 第一天的日期
 * @returns {string}
 */
DateUtl.weekSartDate = function () {
    var weekStartDate = new Date(this.getYear(), this.getMonth(), this.getDay() - new Date().getDay() + 1);
    return this.formatDate(weekStartDate);
};

/**
 * 获取当前周 最后一天的日期
 * @returns {string}
 */
DateUtl.weekEndDate = function () {
    var weekEndDate = new Date(this.getYear(), this.getMonth(), this.getDay() + (6 - new Date().getDay() + 1));
    return this.formatDate(weekEndDate);
};

/**
 * 获取当前月 第一天日期
 * @returns {string}
 */
DateUtl.monthStartDate = function () {
    return moment().startOf('month').format('YYYY-MM-DD');
};

/**
 * 获取当前月 最后一天日期
 * @returns {string}
 */
DateUtl.monthEndDate = function () {
    return moment().endOf('month').format('YYYY-MM-DD');
};

/**
 * 获取当前年 第一天
 * @returns {string}
 */
DateUtl.yearStartDate = function () {
    return moment().startOf('year').format('YYYY-MM-DD');
};

/**
 * 获取当前年最后一天
 * @returns {string}
 */
DateUtl.yearEndDate = function () {
    return moment().endOf('year').format('YYYY-MM-DD');
};

/**
 * 获取时间显示 字符串  今天则返回今天  昨天返回昨天   否则返回MM-DD
 * @param date
 * @returns {string}
 */
DateUtl.recentDateString = function (date: string) {
    if (moment(date, kDayFormatterHm).format(kDayFormatter) == moment().format(kDayFormatter)) {
        return '今天';
    }

    if (moment(date, kDayFormatterHm).format(kDayFormatter,) == moment().subtract(1, 'days').format(kDayFormatter)) {
        return '昨天';
    }

    return moment(date, kDayFormatterHm).format('MM-DD');
};

/**
 * 根据两个日期 返回中间所有日期
 * @returns {string}
 */
DateUtl.dateDiff = function (dateStart: string, dateEnd: string): Array<string> {

    let ret = [];

    if (StringUtl.isNull(dateStart) || StringUtl.isNull(dateEnd)) {
        return ret;
    }

    try {
        let startMoment = moment(dateStart, 'YYYY-MM-DD');
        let endtMoment = moment(dateEnd, 'YYYY-MM-DD');

        while (startMoment.add(1, 'days').isBefore(endtMoment)) {
            ret.push(startMoment.format('YYYY-MM-DD'));
        }
    } catch (error) {
        ret = [];
    }

    return ret;

};

/**
 * @description 格式化YYYY-MM-DD HH:mm:ss到指定格式
 */
DateUtl.formatDateFromString = function(date: string, formatter?: Formatter = 'MM-DD'): string {
    // return date.substring(5, date.length - 3);
    let result;
    switch(formatter) {
    case 'MM-DD HH:mm':
        result = date.substring(5, date.length - 3);
        break;
    case 'YYYY-MM-DD':
        result = date.substring(0, 10);
        break;
    case 'YYYY-MM-DD HH:mm':
        result = date.substring(0, date.length - 3);
        break;
    default:
        result = date;
    }
    return result;
};

export default DateUtl;