/**
 * author: tuhui
 * Date: 2018/7/17
 * Time: 08:40
 * des:
 * @flow
 */
import { observable, computed, action, runInAction, toJS } from 'mobx';
import IndexApiManager from 'apiManager/IndexApiManager';
import CouponApiManager from 'apiManager/CouponApiManager';
import ShopSvc from 'svc/ShopSvc';
import DocSvc from 'svc/DocSvc';
import OtherApiManager from '../../../apiManager/OtherApiManager';
import rootStore from 'store/RootStore';
import storage from 'utl/DLStorage';
import NP from 'number-precision';
import { BannerActivityItem } from 'svc/BannerActivitySvc';
import { NativeModules } from 'react-native';

const PAGE_SIZE = 20;

export const STORAGE_INDEX_CACHE = 'IndexCache';
export const BANNER_DATA = 'BannerData';
export const STATISTIC_DATA = 'StatisticData';
export const SHOP_LIST = 'ShopList';

type JsonParam = {
    showSpus: number,
    cityCode: string,
    masterClassId: number | '',
    notInCityCodes?: string
}

export default class IndexStore {
    @observable shopList: Array<Object> = [];
    @observable bannerDatas: Array<BannerActivityItem> = [];
    @observable statisticsData: Object;

    @observable loadingMore = false; //是否正在上拉加载
    @observable noMore: boolean = false;
    @observable page = 1;
    @observable getCouponNewArray: Array<Object> = [];
    @observable allCouponMoney: number = 0;
    @observable cityCode: string = '';
    @observable tabIndex: number = -1;
    // 城市推荐
    @observable indexCityArray: Array<Object> = [
        { key: '', item: { title: '其他' } }
    ];

    @computed
    get indexCityObj(): Array<Object> {
        return this.indexCityArray.slice();
    }

    @computed
    get couponNewArray(): Array<Object> {
        return this.getCouponNewArray.slice();
    }

    /**
     * 加载缓存数据
     */
    @action
    loadCacheData = () => {
        let indexCache = rootStore.configStore.indexCacheData;
        if (indexCache) {
            this.bannerDatas = indexCache[BANNER_DATA]
                ? indexCache[BANNER_DATA]
                : [];
            this.statisticsData = indexCache[STATISTIC_DATA]
                ? indexCache[STATISTIC_DATA]
                : {};
            this.shopList = indexCache[SHOP_LIST] ? indexCache[SHOP_LIST] : [];
        }
    };

    @action
    fetchBannerData = async () => {
        let params = {
            pageSize: 10,
            pageNo: 1,
            jsonParam: {}
        };
        try {
            let { data } = await IndexApiManager.fetchBannerList(params);
            runInAction(() => {
                if (data && data.rows && data.rows.length > 0) {
                    this.bannerDatas = [];
                    data.rows.forEach(element => {
                        this.transformLinkTypeData(element);
                        this.bannerDatas.push(element);
                    });
                    this.cacheIndexData();
                }
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 转换带有跳转相关参数的数据结构
     * @param element
     * @returns {Object}
     */
    @action
    transformLinkTypeData = (element: Object) => {
        if (element.linkType === 2) {
            if (element.jumpLink) {
                let jumpLinkData = JSON.parse(element.jumpLink);
                element.param = jumpLinkData.hasOwnProperty('param')
                    ? jumpLinkData.param
                    : {};
                element.contentType = jumpLinkData.hasOwnProperty('contentType')
                    ? jumpLinkData.contentType
                    : 0;
            }
        } else if (element.linkType === 1) {
            if (element.jumpLink) {
                let jumpLinkData = JSON.parse(element.jumpLink);
                element.param = jumpLinkData.hasOwnProperty('param')
                    ? jumpLinkData.param
                    : {};
                element.url =
                    element.param && element.param.url ? element.param.url : '';
                element.contentType = jumpLinkData.hasOwnProperty('contentType')
                    ? jumpLinkData.contentType
                    : 0;
            }
        }
        return element;
    };

    /**
     * 获取首页统计数据
     */
    @action
    fetchHomePageStatisticsData = async () => {
        try {
            let { data } = await IndexApiManager.fetcHomePageStatisticsData();
            runInAction(() => (this.statisticsData = data));
            this.cacheIndexData();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     *加载好店列表数据
     */
    @action
    loadShopNewData = async () => {
        this.page = 1;
        let jsonParam: JsonParam = {
            showSpus: 1,
            cityCode: this.cityCode,
            masterClassId: rootStore.configStore.localBusinessCategary
                ? rootStore.configStore.localBusinessCategary.codeValue
                : '',
            // notInCityCodes: ''
        };
        if (this.cityCode === '') {
            jsonParam.notInCityCodes = this.tabCityIds.join(',');
        }
        let params = {
            pageSize: PAGE_SIZE,
            pageNo: this.page,
            jsonParam: jsonParam
        };
        try {
            const { data } = await IndexApiManager.fetchGoodShopList(params);

            action(() => {
                if (data && data.rows) {
                    this.shopList = data.rows;
                    this.noMore = data.rows.length === 0;
                } else {
                    this.noMore = true;
                }
            })();
            this.cacheIndexData();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     *加载更多好店列表数据
     */
    @action
    loadShopMoreData = async () => {
        if (this.loadingMore) {
            return;
        }
        this.page += 1;
        this.loadingMore = true;
        let jsonParam: JsonParam = {
            showSpus: 1,
            cityCode: this.cityCode,
            masterClassId: rootStore.configStore.localBusinessCategary
                ? rootStore.configStore.localBusinessCategary.codeValue
                : ''
        };
        let params = {
            pageSize: PAGE_SIZE,
            pageNo: this.page,
            jsonParam: jsonParam
        };
        try {
            const { data } = await IndexApiManager.fetchGoodShopList(params);
            action(() => {
                if (data && data.rows && data.rows.length > 0) {
                    this.shopList.push(...data.rows);
                    this.noMore = data.rows.length === 0;
                } else {
                    this.noMore = true;
                }
                this.loadingMore = false;
            })();
            this.cacheIndexData();
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 缓存首页数据
     */
    cacheIndexData = () => {
        storage.save({
            key: STORAGE_INDEX_CACHE,
            data: {
                BannerData: this.bannerDatas ? this.bannerDatas : [],
                StatisticData: this.statisticsData ? this.statisticsData : {},
                ShopList: this.shopList ? this.shopList : []
            }
        });
    };

    /**
     * 关注门店
     */
    @action
    focusShop = async (item: Object) => {
        try {
            await ShopSvc.fetchFollow(item.id, item.name);
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 取消关注门店
     */
    @action
    unFocusShop = async (item: Object) => {
        try {
            await ShopSvc.fetchUnFollow(item.id);
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     *
     * @param {门店id} shopId
     * @param {是否关注}}} favorFlag
     */
    @action
    updateShopFocusStatus(shopId: number, favorFlag: number) {
        let newList = [];
        this.shopList.forEach(item => {
            if (item.id === shopId) {
                item.favorFlag = favorFlag;
                if (favorFlag === 1) {
                    item.concernNum++;
                } else {
                    item.concernNum--;
                }
            }
            newList.push(item);
        });
        this.shopList = newList;
    }

    /**
     * 安卓的 提交推荐渠道码
     * @param name
     * @param code
     * @returns {Promise}
     */
    requestChannel(code: string) {
        return OtherApiManager.requestChannel({
            name: rootStore.userStore.user
                ? rootStore.userStore.user.userId
                : '',
            referral_code: code
        });
    }

    /**
     * IOS 上传渠道信息
     * @param {} info
     */
    uploadChannel(info: Object) {
        return OtherApiManager.uploadChannel(info);
    }

    fetchSLHServerAddress = (sn: string) => {};

    @action
    getCouponCenterList = async (obj: Object, callBack: Function) => {
        try {
            let { data } = await CouponApiManager.fetchCouponCenterList(obj);
            let rows = data.rows;
            let money = 0;
            rows.forEach(data => {
                money = NP.plus(money, data.execNum);
            });
            runInAction(() => {
                this.getCouponNewArray = rows;
                this.allCouponMoney = money;
            });

            callBack(rows.length);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    registerCallStateListener = () => {
        try {
            NativeModules.DLCallCenterManager.registerCallStateListener();
        } catch (e) {
            console.log('注册拨打电话监听失败');
        }
    };

    unregisterCallStateListener = () => {
        try {
            NativeModules.DLCallCenterManager.unregisterCallStateListener();
        } catch (e) {
            console.log('注销拨打电话监听失败');
        }
    };

    @computed
    get tabCityIds(): Array<number> {
        return this.indexCityArray.slice(0, this.indexCityArray.length - 1).map(item => item.key);
    }

    @action
    getCity = async () => {
        try {
            let res = await IndexApiManager.fetchRecommendCity();
            let codeValue = '';
            if (res.code === 0) {
                let result = [];
                res.data.rows.forEach(item => {
                    const cityItem = {};
                    for (const key in item) {
                        cityItem.key = key;
                        cityItem.item = { title: item[key] };
                    }
                    cityItem.hasOwnProperty('key') && result.push(cityItem);
                });
                result.push( {
                    key: '',
                    item: {
                        title: '其他'
                    }
                });
                // if (this.tabIndex === -1) {
                //     if (result.length >= 2) {
                //         codeValue = result[1].key;
                //     } else {
                //         codeValue = '';
                //     }
                // } else {
                //     if (this.indexCityArray.length >= result.length) {
                //         codeValue = result[this.tabIndex].key;
                //     } else {
                //         if (result.length >= 2) {
                //             codeValue = result[1].key;
                //         } else {
                //             codeValue = '';
                //         }
                //     }
                // }
                runInAction(() => {
                    // this.cityCode = codeValue;
                    this.indexCityArray = result;
                });
                return Promise.resolve(result);
            }
            return Promise.resolve(this.indexCityArray);
        } catch (e) {
            return Promise.reject(e);
        }
    };

    @action
    setCityCodeIndex = (nub: number, code: string) => {
        runInAction(() => {
            this.tabIndex = nub;
            this.cityCode = code;
        });
    };
}
