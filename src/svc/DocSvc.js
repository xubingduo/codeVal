/**
 * @author GaoYuJian
 * @create date 2018/3/1
 * @desc 图片、文件处理
 * @flow
 */

import Config from '../config/Config';
import FastImage from 'react-native-fast-image';
import {Platform, Image} from 'react-native';

/**
 * 根据docID获取docURL
 * 图片为缩略图大写默认为120x120
 * @param docID(多个docID用','间隔)
 * @return {string}
 */
function docURLS(docID: ?string): string {
    return docURLWithWH(docID, 120);
}

/**
 * 根据docID获取docURL
 * 图片为缩略图大写默认为240x240
 * @param docID(多个docID用','间隔)
 * @return {string}
 */
function docURLM(docID: ?string): string {
    return docURLWithWH(docID, 240);
}

/**
 * 根据docID获取docURL
 * 图片为缩略图大写默认为360x360
 * @param docID(多个docID用','间隔)
 * @return {string}
 */
function docURLL(docID: ?string): string {
    return docURLWithWH(docID, 360);
}

/**
 * 根据docID获取docURL
 * 图片为缩略图大写默认为200x200
 * @param docID(多个docID用','间隔)
 * @return {string}
 */
function docURL(docID: ?string): string {
    return docURLWithWH(docID, 240);
}

/**
 * 根据docID获取docURL
 * 图片为缩略图大写默认为640*640
 * @param docID(多个docID用','间隔)
 * @return {string}
 */
function docURLXXL(docID: ?string): string {
    return docURLWithWH(docID, 640);
}


/**
 * 根据docID获取docURL
 * 服务端默认生成的缩略图大小为200x200,240x240, 360x360
 * 选择缩略图大小时尺寸上面的默认大小就选用默认大小，可以提高图片加载性能
 * @param docID
 * @param height 缩略图高度(px)
 * @return {string}
 */
function docURLWithWH(docID: ?string, height: number): string {
    if (docID && docID.length) {
        return `${Config.DocDownUrl}/v2/content.do?id=${docID}&thumbFlag=1&thumbType=h${height}`;
    } else {
        return '';
    }
}

/**
 * 根据docID获取docURL
 * 图片为原图(查看原图用)
 * @param docID(多个docID用','间隔)
 * @return {string}
 */
function originDocURL(docID: ?string): string {
    if (docID && docID.length) {
        return `${Config.DocDownUrl}/v2/content.do?id=${docID}&thumbFlag=0`;
    } else {
        return '';
    }
}

/**
 * 根据docID获取docURL
 * 图片为压缩后的原图(展示大图用)
 * @param docID(多个docID用','间隔)
 * @return {string}
 */
function compressedDocURL(docID: ?string): string {
    if (docID && docID.length) {
        return `${Config.DocDownUrl}/v2/content.do?id=${docID}&thumbFlag=1&thumbType=h1k`;
    } else {
        return '';
    }
}

/**
 * 大图URLs
 * @param docID(多个docID用','间隔)
 */
function originDocURLs(docID: ?string): ?(string[]) {
    if (docID && docID.length) {
        return docID.split(',').map(item => originDocURL(item));
    }
}

/**
 * 预先加载图片
 * @param urls
 */
function preloadImages(urls: string[]) {
    if (Platform.OS === 'ios') {
        FastImage.preload(urls.map((item) => {
            return {uri : item};
        }));
    } else {
        urls.forEach((url) => Image.prefetch(url));
    }
}

export default {
    /**
     * 根据docID获取docURL
     * 图片为缩略图大写默认为200x200
     * @param docID(多个docID用','间隔)
     * @return {string}
     */
    docURLS,
    docURLM,
    docURLL,
    docURL,
    /**
     * 根据docID获取docURL
     * 服务端默认生成的缩略图大小为100x100, 200x200, 460x460
     * 选择缩略图大小时尺寸姐姐上面的默认大小就选用默认大小，可以提高图片加载性能
     * @param docID
     * @param width 缩略图宽度(px)
     * @param height 缩略高度(px)
     * @return {string}
     */
    docURLWithWH,
    /**
     * 根据docID获取docURL
     * 图片为原图(查看原图用)
     * @param docID(多个docID用','间隔)
     * @return {string}
     */
    originDocURL,
    /**
     * 大图URLs
     * @param docID(多个docID用','间隔)
     */
    originDocURLs,

    /**
     * 根据docID获取docURL
     * 图片为压缩后的原图(展示大图用)
     * @param docID(多个docID用','间隔)
     * @return {string}
     */
    compressedDocURL,

    /**
     * 预先加载图片
     * @param urls
     */
    preloadImages,

    /**
     * 640*640  门头照
     */
    docURLXXL
};
