/**
 * Created by tt on 2018/8/22.
 */
import Config from 'react-native-config';
import storage from 'utl/DLStorage';
import DLFetch from '@ecool/react-native-dlfetch';

/**
 * dev: 开发环境
 * test: 测试环境
 * check: 审核环境
 * product: 正式环境
 * @type {string}
 */
let PRODUCT_ENVIRONMENT = 'product';
if (Config.PRODUCT_ENVIRONMENT) {
    PRODUCT_ENVIRONMENT = Config.PRODUCT_ENVIRONMENT;
}

/**
 * 代表是否是内部版本，初始打包为非正式版时代表内部版本，可以切换环境
 * @type {boolean}
 */
export const IS_INTERNAL_VERSION = Config.PRODUCT_ENVIRONMENT !== 'product';

if (IS_INTERNAL_VERSION) {
    storage.load({key: 'PRODUCTENVIRONMENT'}).then((res) => setEnv(res.PRODUCT_ENVIRONMENT));
}

/**
 * 设置环境(只在非正式环境时才能设置)
 * @param env
 */
export function setEnv(env) {
    console.log(`--setEnv: ${env}`);
    PRODUCT_ENVIRONMENT = env;
    storage.save({key: 'PRODUCTENVIRONMENT', data: {PRODUCT_ENVIRONMENT}});

    DLFetch.setBaseUrl(ConfigParams[PRODUCT_ENVIRONMENT].entranceServerUrl1);
    console.log(`--Configure: ${JSON.stringify(ConfigParams[PRODUCT_ENVIRONMENT])}`);
}

const ConfigParams = {
    /**
     * 开发
     */
    dev: {
        entranceServerUrl1: 'http://192.168.0.34',
        entranceServerUrl2: 'http://192.168.0.34',
        DocDownUrl: 'https://spdev.hzecool.com/doc',
        DocUpLoadUrl: 'https://spdev.hzecool.com/doc/v2/upload.do',
        CRMUrl: 'http://115.231.110.253:7080/mycrm'
    },

    /**
     * 测试
     */
    test: {
        entranceServerUrl1: 'https://spdev.hzecool.com',
        entranceServerUrl2: 'https://spdev.hzecool.com',
        DocDownUrl: 'https://spdev.hzecool.com/doc',
        DocUpLoadUrl: 'https://spdev.hzecool.com/doc/v2/upload.do',
        CRMUrl: 'http://115.231.110.253:7080/mycrm'
    },

    /**
     * 审核
     */
    check: {
        entranceServerUrl1: 'https://spchk.hzecool.com',
        entranceServerUrl2: 'https://spchk.hzecool.com',
        DocDownUrl: 'https://spchk.hzecool.com/doc',
        DocUpLoadUrl: 'https://spchk.hzecool.com/doc/v2/upload.do',
        CRMUrl: 'http://115.231.110.253:7080/mycrm'
    },

    /**
     * 生产测试
     */
    productTest: {
        entranceServerUrl1: 'https://spt.hzecool.com',
        entranceServerUrl2: 'https://spt.hzecool.com',
        DocDownUrl: 'https://spt.hzecool.com/doc',
        DocUpLoadUrl: 'https://spt.hzecool.com/doc/v2/upload.do',
        CRMUrl: 'http://oa.hzdlsoft.com:7080/mycrm'
    },

    /**
     * 正式
     */
    product: {
        entranceServerUrl1: 'https://sp.hzecool.com',
        entranceServerUrl2: 'https://spbak.hzecool.com',
        DocDownUrl: 'https://sp.hzecool.com/doc',
        DocUpLoadUrl: 'https://sp.hzecool.com/doc/v2/upload.do',
        CRMUrl: 'http://oa.hzdlsoft.com:7080/mycrm'
    }
};

// 更改mask 可以显示新手引导;
const mask = 34;

export default {
    get entranceServerUrl1() {
        return ConfigParams[PRODUCT_ENVIRONMENT].entranceServerUrl1;
    },

    get entranceServerUrl2() {
        return ConfigParams[PRODUCT_ENVIRONMENT].entranceServerUrl2;
    },

    get DocDownUrl() {
        return ConfigParams[PRODUCT_ENVIRONMENT].DocDownUrl;
    },

    get DocUpLoadUrl() {
        return ConfigParams[PRODUCT_ENVIRONMENT].DocUpLoadUrl;
    },

    get CRMUrl() {
        return ConfigParams[PRODUCT_ENVIRONMENT].CRMUrl;
    },

    get PRODUCT_ENVIRONMENT() {
        /**
         * 0代表开发环境 1代表测试环境  2审核环境   3代表生产环境
         */
        return PRODUCT_ENVIRONMENT;
    },

    changeMask: mask
};

//TODO true代表是独立app  false代表嵌入笑铺
export const IS_STAND_APP = true;





