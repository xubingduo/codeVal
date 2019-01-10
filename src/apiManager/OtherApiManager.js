/**
 * author: tuhui
 * Date: 2018/9/21
 * Time: 上午10:00
 * des:
 * @flow
 */
import DLFetch from '@ecool/react-native-dlfetch';

/**
 * 上传下载渠道到CRM
 * @param params
 * @returns {Promise}
 */
const requestChannel = (params: Object) => {
    return DLFetch.postFullUrl(
        'http://oa.hzdlsoft.com:7080/mycrm/callInterface.do',
        { interfaceid: 'cs-sethotshop', ...params }
    );
};

/**
 * IOS 上传安装信息到CRM
 * @param {} params
 */
const uploadChannel = (params: Object) => {
    return DLFetch.postFullUrl(
        'http://115.231.110.253:7080/mycrm/callInterface.do',
        { interfaceid: 'cs-matchRecord', ...params }
    );
};

/**
 * 查询试用资格等
 * @param {} params
 */
const checkTryUse = (params: Object = {}) => {
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-spugr-spTenant-verifyTryUse',
        ...params
    });
};

/**
 * 验证邀请码类型
 * @param {} params
 */
const verifyInviteCode = (params: Object = {}) => {
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spauth-spBuyer-verifyInviteCode',
        ...params
    });
};

export default {
    requestChannel,
    uploadChannel,
    checkTryUse,
    verifyInviteCode
};
