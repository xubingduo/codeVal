/**
 * @author [lyq]
 * @email
 * @create date 2018-08-09 03:56:30
 * @modify date 2018-08-09 03:56:30
 * @desc [description]
 * @flow
 */

import storage from 'utl/DLStorage';
import { observable, action, computed, runInAction } from 'mobx';
import { STORAGE_INDEX_CACHE } from 'module/index/store/IndexStore';
import ConfigListDictApiManager from '../apiManager/ConfigListDictApiManager';
import Alert from 'component/Alert';
import DLStorage from 'utl/DLStorage';
import { getConfigListDict } from '../apiManager/ShopApiManager';

const SERVERCE_GUARANTEE_SAVE_KEY = 'ServiceGuaranteeSaveKey';
const GOOD_SHOP_GUARANTEE_SAVE_KEY = 'GoodShopGuaranteeSaveKey';

/**
 * 营业类目
 */
type BusinessCategaryType = {
    flag?: string,
    codeValue: number,
    codeName: string,
    id?: number,
    namepy?: string,
    showOrder?: number,
    typeId?: number
};

/**
 * 保障信息
 */
type GuaranteeMeessageType = {
    name: string,
    content: string,
    docId?: string
};

//注意!!!  顺序不可改动,只能往后加参数
export const SYS_CONFIG_PARAMS = [
    //是否展示IM 1 显示，0 隐藏
    'sp_im_enable',
    //是否隐藏门店销售量  0显示  1隐藏
    'sp_shop_hide_sales',
    //分享是否显示价格
    'share_good_show_price',
    //分享 modal风格
    'share_good_ui_style'
];

export class ConfigStore {
    @observable
    uploadImgUrl: string = 'https://spdev.hzecool.com/doc/v2/upload.do';
    @observable
    region: Array<Object>;
    // 价格区间齐全 0不齐全 1齐全
    @observable isPriceRangeComplete: number = 0;
    // 主营类目齐全 0不齐全 1齐全
    @observable isMasterCategaryComplete: number = 0;
    // 营业类目
    @observable businessCategary: ?BusinessCategaryType;
    // 首页所选营业类目，生命周期同app，优先级低
    @observable localBusinessCategary: ?BusinessCategaryType;
    // 区间价格1
    @observable rangePrice1: string = '';
    // 区间价格2
    @observable rangePrice2: string = '';
    // 系统参数
    @observable sysConfigParams: Array<Object> = [];
    // 服务保障data
    @observable serviceGuaranteeData: Object;
    // 好店担保data
    @observable goodShopGuaranteeData: Object;
    // 门店主营类目列表
    masterCategaryList: Array<BusinessCategaryType> = [];

    indexCacheData: Object;

    loadIndexCacheData = async () => {
        this.indexCacheData = await storage.load({ key: STORAGE_INDEX_CACHE });
    };

    /**
     * 服务保障items
     * @return Array<GuaranteeMeessageType>
     */
    @computed get serviceGuaranteeItems(): Array<GuaranteeMeessageType> {
        if (this.serviceGuaranteeData) {
            let rows = this.serviceGuaranteeData.rows
                ? this.serviceGuaranteeData.rows
                : [];
            let items = [];
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                if (row && row.props) {
                    let props = JSON.parse(row.props);
                    let item: GuaranteeMeessageType = {
                        name: '',
                        docId: '',
                        content: ''
                    };
                    item.name = row.codeName;
                    item.docId = props.docId;
                    item.content = props.content;
                    items.push(item);
                }
            }
            return items;
        } else {
            // 加载本地缓存
            DLStorage.load({ key: SERVERCE_GUARANTEE_SAVE_KEY })
                .then(data => {
                    runInAction(() => {
                        this.serviceGuaranteeData = data;
                    });
                })
                .catch(error => {
                    // 加载远程
                    this.fetchServiceGuarantee();
                });
            return [];
        }
    }

    /**
     * 加载并缓存服务保障
     */
    fetchServiceGuarantee = () => {
        ConfigListDictApiManager.fetchServiceGuaranteeLabels()
            .then(result => {
                runInAction(() => {
                    this.serviceGuaranteeData = result.data;
                });
                // 保存本地
                DLStorage.save({
                    key: SERVERCE_GUARANTEE_SAVE_KEY,
                    data: this.serviceGuaranteeData
                });
            })
            .catch(error => {
                Alert.alert(error.message);
            });
    };

    /**
     * 好店担保items
     * @return Array<GuaranteeMeessageType>
     */
    @computed get goodShopGuaranteeItems(): Array<GuaranteeMeessageType> {
        if (this.goodShopGuaranteeData) {
            let rows = this.goodShopGuaranteeData.rows
                ? this.goodShopGuaranteeData.rows
                : [];
            let items = [];
            for (let i = 0; i < rows.length; i++) {
                let row = rows[i];
                if (row && row.props) {
                    let props = JSON.parse(row.props);
                    let item: GuaranteeMeessageType = {
                        name: '',
                        content: ''
                    };
                    item.name = row.codeName;
                    item.content = props.content;
                    items.push(item);
                }
            }
            return items;
        } else {
            // 加载本地
            DLStorage.load({ key: GOOD_SHOP_GUARANTEE_SAVE_KEY })
                .then(data => {
                    runInAction(() => {
                        this.goodShopGuaranteeData = data;
                    });
                })
                .catch(() => {
                    // 加载远程
                    this.fetchGoodShopGuarantee();
                });
            return [];
        }
    }

    /**
     * 加载并缓存好店担保
     */
    fetchGoodShopGuarantee = () => {
        ConfigListDictApiManager.fetchGoodShopGuaranteeLabels()
            .then(result => {
                runInAction(() => {
                    this.goodShopGuaranteeData = result.data;
                });
                // 保存本地
                DLStorage.save({
                    key: GOOD_SHOP_GUARANTEE_SAVE_KEY,
                    data: this.goodShopGuaranteeData
                });
            })
            .catch(error => {
                Alert.alert(error.message);
            });
    };

    /**
     * 批量获取所有的系统参数
     * @param params
     * @return {Promise<void>}
     */
    @action
    async fetchSysParamsBatch(params: Object) {
        dlconsole.log('-------fetchSysParamsBatch');
        try {
            let { data } = await ConfigListDictApiManager.fetchSysParamsBatch(
                params
            );
            if (data.rows) {
                this.sysConfigParams = data.rows;
                dlconsole.log(
                    '-------fetchSysParamsBatch result=' + this.sysConfigParams
                );
            }
        } catch (e) {
            //do not care result
        }
    }

    /**
     * 获取单个系统参数的值
     * @param key
     * @return {undefined}
     */
    getSysParamByKey(key: string): any {
        let val = undefined;
        if (this.sysConfigParams && this.sysConfigParams.length > 0) {
            for (let i = 0; i < this.sysConfigParams.length; i++) {
                let item = this.sysConfigParams[i];
                if (item.code === key) {
                    val = item.val;
                    break;
                }
            }
        }

        return val;
    }

    /**
     * 是否展示im
     * @return {boolean}
     */
    isShowIm(): boolean {
        let imEnable = this.getSysParamByKey(SYS_CONFIG_PARAMS[0]);
        if (imEnable === '1') {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 获取门店主营类目列表
     */
    fetchMasterCategoryList() {
        getConfigListDict({ typeId: '2010' })
            .then(({ data }) => {
                if (data && data.rows) {
                    this.masterCategaryList = data.rows;
                }
            })
            .catch(error => {
                console.log(error.message);
            });
    }

    /**
     * 改变主营类目回调
     * @param {} newBusinessCategary
     */
    setBusinessCategary(newBusinessCategary: BusinessCategaryType) {
        this.businessCategary = newBusinessCategary;
        this.localBusinessCategary = newBusinessCategary;
    }
}

export default new ConfigStore();
