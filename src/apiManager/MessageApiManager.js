/**
 * @author YiJunJie liyanqin
 * @email eric.hz.jj@gmail.com
 * @create date 2018-02-01 11:56:59
 * @desc [消息]
 * @flow
 */

import DLFetch from '@ecool/react-native-dlfetch';

/**
 * 提交个推用户ID
 *
 * @param {*} params
 */
const uploadCid = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserGuid-registerUserMessageCid',
        ...params
    });
};

/**
 * 获取未读消息数
 */
const fetchUnreadMessageCount = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserGuid-pullUnreadCount',
        ...params
    });
};

/**
 * 获取消息列表
 */
const fetchMessageList = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserGuid-pullMessagesList',
        ...params
    });
};

/**
 * 获取消息详情
 */
// const fetchMessageDetail = (params: Object = {}) => {
//     return DLFetch.post('/api.do', {
//         apiKey: 'ec-sspd-message-getMessageById',
//         ...params
//     });
// };

/**
 * 更新未读消息状态
 */
const updateUnreadMessageState = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserGuid-updateReadStatus',
        ...params
    });
};

/**
 * 更新所有消息为已读
 * @param {} params
 */
const updateAllUnreadMessageState = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spmdm-spUserGuid-updateAllUnreadMsgs',
        ...params
    });
};

export default {
    uploadCid,
    fetchUnreadMessageCount,
    fetchMessageList,
    // fetchMessageDetail,
    updateUnreadMessageState,
    updateAllUnreadMessageState
};
