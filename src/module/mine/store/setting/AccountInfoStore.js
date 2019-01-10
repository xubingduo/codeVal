/**
 * author: wwj
 * Date: 2018/8/8
 * Time: 下午4:33
 * des:
 * @flow
 */

import {observable, action} from 'mobx';
import UserApiManager from '../../../../apiManager/UserApiManager';
import FileUpload from 'utl/FileUpload';
import DocSvc from '../../../../svc/DocSvc';
import IndexApiManager from '../../../../apiManager/IndexApiManager';

export default class AccountInfoStore{

    @observable shopName: string = '';

    /**
     * 获取用户账户信息
     */
    queryAccountInfo(callback: Function){
        UserApiManager.fetchUserInfoProvider()
            .then(action(({data}) => {
                if (data) {
                    callback(true, data);
                }
            }), (error) => {
                callback(false, error.message);
            });
    }

    /**
     * 修改用户昵称
     * @param nickName
     */
    updateAccountNickName(nickName: string, callback: Function){
        UserApiManager.updateUserInfoProvider({
            jsonParam: {
                nickName: nickName,
            }
        }).then(action(({data}) => {
            callback(true, 0);
        }), (error) => {
            callback(false, error.message);
        });
    }

    /**
     * 修改用户头像
     * @param avatar
     * @param callback
     */
    updateUserAvatar(avatar: string, callback: Function) {
        UserApiManager.updateUserInfoProvider({
            jsonParam: {
                avatar: avatar,
            }
        }).then(action(({data}) => {
            callback(true, avatar);
        }), (error) => {
            callback(false, error.message);
        });
    }

    /**
     * 上传用户头像
     * @param filePath
     * @param uploadImgUrl
     * @param callback
     */
    uploadUserAvatar = (filePath: string, uploadImgUrl: string, callback: Function) => {
        FileUpload.uploadFile(filePath, uploadImgUrl, (result, responseData) => {
            if (result) {
                let data = JSON.parse(responseData);
                callback(true, data.data.val);
            } else {
                callback(false, responseData.message);
            }
        });
    };

    /**
     * 获取店铺信息
     * @param callback
     */
    queryShopInfo = (callback?: Function) => {
        IndexApiManager.fetchShopAuthInfo({jsonParam: {}})
            .then(action(({data}) => {
                if (data) {
                    this.shopName = data.shopName;
                }
                callback && callback(true, 0);
            }), (error) => {
                callback && callback(false, error.message);
            });
    }
}