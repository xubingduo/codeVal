/**
 * @author [lyq]
 * @email
 * @create date 2018-09-05 10:20:12
 * @modify date 2018-09-05 10:20:12
 * @desc [数据同步service]
 * @flow
 */

import rootStore from 'store/RootStore';
import DLFetch from '@ecool/react-native-dlfetch';
import {Alert} from 'react-native';
import storage from 'utl/DLStorage';
import {runInAction} from 'mobx';

/**
 * 本地存储地区key
 */
const STORAGE_REGION = 'REGION';
const STORAGE_REGION_VERSION = 'REGIONVERSION';

/**
 * 开始同步
 */
const startSync = async () => {
    //图片地址固定 不在需要获取图片地址
    //getUploadUrl();
    try {
        await getRegion();
        await getShopBusinessInfo();
        await rootStore.shopStore.fetchShopAuthInfo();
        // await Promise.all([getRegion(),getShopBusinessInfo(),rootStore.shopStore.fetchShopAuthInfo()]);
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * 获取店铺营业信息
 */
export const getShopBusinessInfo = async () => {
    try {
        let result = await DLFetch.post('/spg/api.do', {
            apiKey: 'ec-spadmin-spBuyerShop-verifyShopMessage'
        });
        if (result && result.data) {
            runInAction(() => {
                rootStore.configStore.isMasterCategaryComplete = result.data.masterClassIdCompleteIs;
                rootStore.configStore.isPriceRangeComplete = result.data.priceRangeCompleteIs;
            });
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};


/**
 * 获取上传图片服务器地址
 */
const getUploadUrl = async () => {
    try {
        let result = await DLFetch.post('/spg/api.do', {
            apiKey: 'ec-doc-getDocUploadUrl'
        });
        if (result || result.length > 0) {
            runInAction(
                () => (rootStore.configStore.downloadImgUrl = result.data.val)
            );
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

/**
 * 获取地区
 */
const getRegion = async () => {
    let region = [];
    let regionVersion;
    try {
        region = await storage.load({key: STORAGE_REGION});
        regionVersion = await storage.load({
            key: STORAGE_REGION_VERSION
        });
    } catch (error) {
    }

    try {
        if (region) {
            runInAction(() => (rootStore.configStore.region = region));
        }
        let result = await DLFetch.post('/spg/api.do', {
            apiKey: 'ec-config-spRegion-exportDistrictRegion',
            regionVer: regionVersion
        });
        if (result && result.data) {
            runInAction(
                () => (rootStore.configStore.region = result.data.rows)
            );
            await storage.save({
                key: STORAGE_REGION,
                data: result.data.rows
            });
            await storage.save({
                key: STORAGE_REGION_VERSION,
                data: result.data.ext.regionVer
            });
        }
        return Promise.resolve();
    } catch (error) {
        return Promise.reject(error);
    }
};

export default {
    startSync: startSync
};
