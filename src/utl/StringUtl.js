/**
 * author: tuhui
 * Date: 2017/12/5
 * Time: 上午9:22
 * @flow
 */

var StringUtl = {};

/**
 * 字符串判空
 * @param str
 * @returns {boolean}
 */
StringUtl.isNull = function (str: string) {
    if (str == null || typeof str === 'undefined' || str.length === 0) {
        return true;
    }
    return false;
};

/**
 * 是否为空:null,空串,全空格
 */
StringUtl.isEmpty = (str: string) => {
    return !str || typeof str === 'undefined' || str.length <= 0 || !str.trim();
};

/**
 *  切割字符串到数组  去掉前后多余的切割字符串字符  比如 ,ABC,dfd,  会去掉前后的, 返回['ABC','dfd']
 * @param str
 * @param spliteStr
 * @returns {*}
 */
StringUtl.splitByWholeSeperator = function (
    str: string,
    spliteStr: string
): Array<string> {
    if (StringUtl.isNull(str) || StringUtl.isNull(spliteStr)) {
        return [];
    }

    let result = StringUtl.deleteExtraSymbol(str, spliteStr);

    return result.split(spliteStr);
};

/**
 * 删除头部 尾部多余切割符号  如   ,a,b,s,   会返回a,b,s
 * @param str
 * @param symbol
 * @returns {string}
 */
StringUtl.deleteExtraSymbol = function (str: string, symbol: string): string {
    if (StringUtl.isNull(str)) {
        return '';
    }

    let result = str;
    /**
     * 去头
     */
    if (str.startsWith(symbol)) {
        result = str.slice(1, result.length);
    }

    /**
     * 去尾
     */
    if (result.endsWith(symbol)) {
        result = result.slice(0, result.length - symbol.length);
    }

    return result;
};

/**
 * 返回分隔符的第一个元素   如 a,b,c   返回a
 * @param str
 * @returns {string}
 */
StringUtl.getFirstStringFromSplitString = function (str: string): string {
    if (StringUtl.isNull(str)) {
        return '';
    }

    let arr = StringUtl.splitByWholeSeperator(str, ',');
    if (arr.length > 0) {
        return arr[0];
    } else {
        return '';
    }
};

/**
 * 从一个文件路径字符串中  获取文件名
 * @param filePath
 * @returns {string}
 */
StringUtl.getFileNameFromPath = function (filePath: string) {
    if (!filePath) {
        return '';
    }

    return filePath.split('/')[filePath.split('/').length - 1];
};

StringUtl.isContainSpecialChar = function (str: string) {
    if (!str) {
        return false;
    }
    let pattern = new RegExp(
        '[`~!@#$^&*()=|{}\':;\',\\[\\].<>/?~！@#¥￥……&*（）——|{}【】‘；：”“\'。，、？]'
    );

    return pattern.test(str);
};

/**
 * 移除中文输入法字符间隔
 * @type {string | void | *}
 */
StringUtl.filterChineseSpace = function (str: string): string {
    return str.replace(/\u2006/g, '');
};

StringUtl.genDocIdsFromString = function (ids: string): Array<Object> {
    let imgList = [];
    if (!ids) {
        return [];
    }
    let idList = ids.split(',');

    for (let i = 0; i < idList.length; i++) {
        imgList.push({
            docId: idList[i],
            typeId: 1
        });
    }

    return imgList;
};

StringUtl.getRestExceptStr = function (source: string, str: string): {left: ?string, right: ?string, isExist: boolean} {
    const len = str.length;
    const position = source.indexOf(str);
    const left = source.substring(0, position);
    const right = source.substring(position + len);
    return {
        left,
        right,
        isExist: position > -1
    };
};

export default StringUtl;
