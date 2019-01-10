/**
 * @author [lyq]
 * @email
 * @create date 2018-08-02 01:43:12
 * @modify date 2018-08-02 01:43:12
 * @desc [店铺认证store]
 * @flow
 */

import { observable, action, computed, runInAction } from 'mobx';
import DLFetch from '@ecool/react-native-dlfetch';
import storage from 'utl/DLStorage';
import rootStore from 'store/RootStore';
import FileUpload from 'utl/FileUpload';
import DocSvc from 'svc/DocSvc';
import NumberEditView from 'component/NumberEditView';
import ShopAuthScreen from 'module/login/screen/ShopAuthScreen';
import { inject } from 'mobx-react';
import IndexApiManager from 'apiManager/IndexApiManager';
import Config from '../../../config/Config';
import configStore from 'store/ConfigStore';
import NumberUtl from 'utl/NumberUtl';

/**
 * 缓存店铺信息的KEY
 */
const STORAGE_SHOP_INFO = 'SHOPINFO';
export const SectionKey = {
    Head: 0,
    Content: 1,
    Identity: 2
};

export default class ShopStore {
    @observable
    shop = {
        shopName: '',
        provCode: '',
        cityCode: '',
        areaCode: '',
        shopAddr: '', //详细地址
        headPic: [],
        headPicDocIds: [],
        contentPic: [],
        contentPicDocIds: [],
        certPic: [],
        certPicDocIds: [],
        inviteCode: ''
    };

    @observable
    id: ?number;
    @observable
    address: Array<string> = [];

    @action
    reset = () => {};

    /**
     * 图片发送改变
     * @param {} imgs
     * @param {*} sectionKey
     */
    @action
    changeImgs(imgs: Array<string>, sectionKey: number, callback: Function) {
        if (sectionKey === SectionKey.Head) {
            if (this.shop.headPic.length > imgs.length) {
                //如果是删除，直接替换
                this.shop.headPic = imgs;
                callback(true);
            } else {
                //如果是添加，上传图片
                this.uploadImg(imgs, sectionKey, callback);
            }
        } else if (sectionKey === SectionKey.Content) {
            if (this.shop.contentPic.length > imgs.length) {
                this.shop.contentPic = imgs;
                callback(true);
            } else {
                this.uploadImg(imgs, sectionKey, callback);
            }
        } else if (sectionKey === SectionKey.Identity) {
            if (this.shop.certPic.length > imgs.length) {
                this.shop.certPic = imgs;
                callback(true);
            } else {
                this.uploadImg(imgs, sectionKey, callback);
            }
        }
    }

    /**
     *上传图片
     * @param {s} imgUploadUrl  上传服务器地址
     *
     */
    @action
    uploadImg(imgsArr: Array<string>, sectionKey: number, callback: Function) {
        let uploadImgUrl = Config.DocUpLoadUrl;
        if (uploadImgUrl && uploadImgUrl.length > 0) {
            //todo 需要释放timeout
            setTimeout(() => {
                FileUpload.uploadFile(
                    imgsArr[imgsArr.length - 1],
                    uploadImgUrl,
                    (result, responseData) => {
                        if (result === true && responseData) {
                            let response = JSON.parse(responseData);
                            let { data } = response;
                            if (sectionKey === SectionKey.Head) {
                                runInAction(() => {
                                    this.shop.headPic.push(
                                        DocSvc.docURLS(data.val)
                                    );
                                });
                            } else if (sectionKey === SectionKey.Content) {
                                runInAction(() => {
                                    this.shop.contentPic.push(
                                        DocSvc.docURLS(data.val)
                                    );
                                });
                            } else if (sectionKey === SectionKey.Identity) {
                                runInAction(() => {
                                    this.shop.certPic.push(
                                        DocSvc.docURLS(data.val)
                                    );
                                });
                            }
                            callback(true);
                        } else {
                            callback(false, responseData);
                        }
                    }
                );
            }, 200);
        }
    }

    /**
     * 获取店铺审核信息
     */
    @action
    fetchShopAuthInfo = async () => {
        try {
            let { data } = await IndexApiManager.fetchShopAuthInfo({
                jsonParam: {}
            });
            runInAction(() => {
                if (data) {
                    this.id = data.id;
                    this.shop.shopName = data.shopName;
                    this.shop.provCode = data.provCode;
                    this.shop.cityCode = data.cityCode;
                    this.shop.areaCode = data.areaCode;
                    this.shop.inviteCode = data.inviteCode;
                    this.shop.shopAddr = data.shopAddr; //详细地址
                    this.shop.headPic = this.splitStr(data.headPic);
                    this.shop.contentPic = this.splitStr(data.contentPic);
                    this.shop.certPic = this.splitStr(data.certPic);
                    this.shop.headPicDocIds = data.headPic
                        ? data.headPic.split(',')
                        : [];
                    this.shop.contentPicDocIds = data.contentPic
                        ? data.contentPic.split(',')
                        : [];
                    this.shop.certPicDocIds = data.certPic
                        ? data.certPic.split(',')
                        : [];
                    //地区组件准备初始化数据
                    this.address = [];
                    this.address.push(data.provCode + '');
                    this.address.push(data.cityCode + '');
                    this.address.push(data.areaCode + '');
                    // 主营类目
                    configStore.setBusinessCategary({
                        codeName: data.ecCaption
                            ? data.ecCaption.masterClassId
                            : '',
                        codeValue: data.masterClassId
                    });
                }
            });
            return Promise.resolve();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 认证保存
     */
    @action
    authSave = async (isUpdate: boolean, CallBack: Function) => {
        // 照片fileid
        let headPicIds = this.processPics(this.shop.headPic);
        let contentPicIds = this.processPics(this.shop.contentPic);
        let certPicIds = this.processPics(this.shop.certPic);

        let jsonParam = {};
        if (this.id) {
            Object.assign(jsonParam, { id: this.id });
        }
        Object.assign(jsonParam, {
            shopName: this.shop.shopName,
            shopAddr: this.shop.shopAddr,
            provCode: this.shop.provCode,
            cityCode: this.shop.cityCode,
            areaCode: this.shop.areaCode,
            headPic: headPicIds,
            contentPic: contentPicIds,
            certPic: certPicIds,
            masterClassId: configStore.businessCategary
                ? configStore.businessCategary.codeValue
                : '',
            // priceRange: JSON.stringify([{price1:configStore.rangePrice1,price2:configStore.rangePrice2}]),
            inviteCode: rootStore.authStore.inviteCode
                ? rootStore.authStore.inviteCode
                : this.shop.inviteCode
        });

        let param = {
            jsonParam: jsonParam
        };
        try {
            if (isUpdate && isUpdate === 1) {
                let { data } = await IndexApiManager.updateShopInfo(param);
                CallBack(true, data);
            } else {
                let { data } = await IndexApiManager.authShop(param);
                CallBack(true, data);
            }
        } catch (error) {
            CallBack(false, error);
        }
    };

    splitStr = (picStr: string) => {
        if (picStr && picStr.length > 0) {
            let arrayDocs = picStr.split(',');
            let resultArray = [];
            arrayDocs.forEach(element => {
                resultArray.push(DocSvc.docURLS(element));
            });
            return resultArray;
        }
        return [];
    };

    processPics = (pics: Array<string>) => {
        let fileId = '';
        for (let i = 0, len = pics.length; i < len; i++) {
            let str = pics[i] + '';
            if (str.indexOf('id=') >= 0) {
                let index = str.indexOf('id=');
                str = str.substring(index + 3, str.length);
                str = str.split('&thumbFlag')[0];
            }
            if (i < len - 1) {
                fileId += str + ',';
            } else {
                fileId += str;
            }
        }
        return fileId;
    };
}
