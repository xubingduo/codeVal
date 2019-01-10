import { Platform } from 'react-native';
import StringUtl from 'utl/StringUtl';

/**
 *
 * @param filePath 文件路径
 * @param serverUrl 服务器地址
 * @param uploadFileCompleteHandler 结果回调
 * @returns {Promise<string>}
 * @flow
 */
function uploadFile(
    filePath: string,
    serverUrl: string,
    uploadFileCompleteHandler: Function
) {
    let formData = new FormData();
    let file = {
        uri: filePath,
        type: 'application/octet-stream',
        name: StringUtl.getFileNameFromPath(filePath)
    };
    formData.append('file', file);
    let productType = Platform.OS === 'ios' ? 'slhGoodShopIOS' : 'slhGoodShopAndroid';
    formData.append('productType', productType);
    return fetch(serverUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        body: formData
    })
        .then(response => response.text())
        .then(responseData => {
            uploadFileCompleteHandler(true, responseData);
        })
        .catch(error => {
            let err = new Error('上传失败');
            uploadFileCompleteHandler(false, err);
        });
}

export default {
    uploadFile
};
