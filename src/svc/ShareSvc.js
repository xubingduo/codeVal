/**
 *@author xbu
 *@date 2018/10/18
 *@flow
 *@desc 分享接口汇总
 *
 */

import {DLShareByUmengManager} from '@ecool/dlsharebyumenglib';


/**
 * @param type 0:新浪微博 1:微信朋友 2:微信朋友圈  3:微信收藏  4: QQ   5: QQ空间
 * @param text  分享的文本
 * @param callback(isTrue,text)  分享返回的回调 参数1，true&false 参数2, 成功失败描述
 */

const shareText = (obj: { type: number, text: string }, callback: Function) => {
    DLShareByUmengManager.shareTextByUmeng(obj.type, obj.text, callback);
};

/**
 * 分享网络图片
 * @param type 0:新浪微博 1:微信朋友 2:微信朋友圈  3:微信收藏  4: QQ   5: QQ空间
 * @param shareImgUrl  'http://'
 * @param shareDesc
 * @param callback(isTrue,text)
 */

const shareNetImg = (obj: {type: number,shareImgUrl: string, shareDesc: string },callback: Function) => {
    DLShareByUmengManager.shareNetImageByUmeng(obj.type, obj.shareImgUrl, obj.shareDesc, callback);
};


/**
 * 分享本地图片
 * @param type 0:新浪微博 1:微信朋友 2:微信朋友圈  3:微信收藏  4: QQ   5: QQ空间
 * @param shareImgUrl  'http://'
 * @param shareDesc
 * @param callback(isTrue,text)
 */
const shareLocalImage = (obj: {type: number,shareImgUrl: string, shareDesc: string },callback: Function) => {
    DLShareByUmengManager.shareLocalImageByUmeng(obj.type, obj.shareImgUrl, obj.shareDesc, callback);
};

/**
 * 分享链接
 * @param type 0: 新浪微博 1:微信朋友 2:微信朋友圈  3:微信收藏  4: QQ   5: QQ空间
 * @param shareUrlLink
 * @param shareThumbUrl
 * @param shareTitle
 * @param shareDesc
 * @param callback
 */

const shareUrlLink = (obj: {type: number, shareUrlLink: string, shareThumbUrl: string, shareTitle: string, shareDesc: string},callback: Function) => {
    DLShareByUmengManager.shareUrlLinkByUmeng(obj.type, obj.shareUrlLink, obj.shareThumbUrl, obj.shareTitle, obj.shareDesc, callback);
};

export default {
    shareText,
    shareNetImg,
    shareUrlLink,
    shareLocalImage
};
