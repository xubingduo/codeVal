/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2018-03-07 09:38:32
 * @modify date 2018-03-07 09:38:32
 * @desc [侧滑筛选]
 * @flow
*/

import { observable, action, computed, runInAction, toJS } from 'mobx';
import * as _ from 'lodash';
import ConfigListDictApiManager from '../../../apiManager/ConfigListDictApiManager';

/**
 * 过滤的类型
 */
export const FilterType = {
    // 日期
    DateType: 0,
    // 下拉列表选择
    DropDownType: 1,
    // checkBox开关
    CheckBoxType: 2,
    // 多选
    MutilSelectType: 3,
    // 单选
    RadioType: 4,
    // 价格区间
    PriceType: 5
};

type DataSourceItemType = {
    type: string,

    typeName: string,

    datas: Array<{
        // id
        id: number,
        // 显示标志，位操作（0-不可见 1-卖家可见 2-买家可见 3-卖家买家都可见）
        showFlag: number,
        // 1-标签；2-勋章；3-风格；4-主营类目；5-城市；6-市场；7-价格
        type: string,
        // 对应分类的id（字典类型或指定表的id：type=1城市/2风格时：=dict.type_id；type=3市场时：=sc_market.id；type=4类目时：=dres_class.id）
        typeId: number,
        // 对应分类的值（仅type=1/2时的字典项时：=dict.code_value；其他类型无效）
        typeValue: string,
        // 对应分类的名称（type=1城市/2风格时：type_id+type_value确定dict.code_name；
        //               type=3市场时：type_id确定sc_market.short_name；
        //               type=4类目时：type_id确定dres_class.name）
        typeName: string,
    }>,
    // 筛选类型  目前用到 单选或者多选
    filterType: $Values<typeof FilterType>,
    // 默认筛选
    result: Array<number>,
    // 是否可以多选
};

export const TYPE_PRICE_RANGE = 'priceRange';

export default class GoodsSlideFilterStore {

    // 筛选原始数据
    originalDataSource: Array<DataSourceItemType>;

    // 缓存中间状态
    cacheDataSource: Array<DataSourceItemType>;

    defaultSelectedMap: Map<string, number>;

    // 筛选数据
    @observable dataSource: Array<DataSourceItemType> = [];

    isShowCityFilterData: boolean = false;

    constructor(data: Array<Object>, defaultSelectedMap: Map<string, number>) {
        // 将map类型的筛选原数据 转换成list 每一个item包含筛选的type类型数据以及该类型下的选项子数据list
        this.convertOriginData(data);
        this.defaultSelectedMap = defaultSelectedMap;
        this.reset();
    }

    @action
    convertOriginData(originList: Array<Object>) {
        this.originalDataSource = [];
        originList.forEach(element => {
            if (element.typeValue === 6) {
                this.isShowCityFilterData = true;
                return;
            }
            let filterType = FilterType.MutilSelectType;
            if (element.typeValue === 4) {
                filterType = FilterType.RadioType;
            }
            if (element.typeValue === 7) {
                filterType = FilterType.PriceType;
            }

            // 是否可展开
            let enableExpand = true;
            if (element.typeValue === 1 || element.typeValue === 2) {
                enableExpand = false;
            }

            let datas = element.filterDatas.map(filterItem => {
                return {
                    id: filterItem.codeValue,
                    type: element.typeValue,
                    typeName: filterItem.codeName,
                    typeValue: filterItem.codeValue
                };
            });
            if (element.typeValue === 7) {
                datas = this.createLocalPriceRangeData();
            }
            let returnObj = {
                type: element.typeValue,
                typeName: element.typeName,
                datas: datas,
                result: [],
                filterType: filterType,
                enableExpand: enableExpand
            };
            this.originalDataSource.push(returnObj);
        });
    }

    // @action
    // convertOriginMap(originMap: Map<string, Object>){
    //     this.originalDataSource = [];
    //     let cityList = this.convert(originMap, '1');
    //     if (cityList) {
    //         this.originalDataSource.push(cityList);
    //     }
    //     let styleList = this.convert(originMap, '2');
    //     if (styleList) {
    //         this.originalDataSource.push(styleList);
    //     }
    // }

    @action
    convert(originMap: Map<string, Object>, key: string){
        let typeName = '';
        if (key === '3') {
            typeName = '市场';
        }else{
            return;
        }

        if (originMap.hasOwnProperty(key)) {
            let originMapElement = originMap[key];
            console.log(originMapElement);
            if (originMapElement && originMapElement.length > 0) {
                let datas = originMapElement.map(filterItem => {
                    return {
                        id: filterItem.id,
                        type: filterItem.type,
                        typeName: filterItem.typeName,
                        typeValue: filterItem.typeId
                    };
                });
                let returnObj;
                returnObj = {
                    type: 6,
                    typeName: typeName,
                    datas: datas,
                    result: [],
                    filterType: FilterType.MutilSelectType,
                    enableExpand: false
                };

                return returnObj;
            }
        }
    }

    // /**
    //  * 本地创建价格区间数据
    //  */
    createLocalPriceRangeData(): Array<Object>{
        let datas = [];
        // 下面的价格区间段由运营确定
        // -1 表示不限制最大价格，在传值到服务器时会剔除
        datas.push({
            id: 1,
            type: 7,
            typeValue: '0,200',
            typeName: '0-200',
        });
        datas.push({
            id: 2,
            type: 7,
            typeValue: '200,400',
            typeName: '200-400',
        });
        datas.push({
            id: 3,
            type: 7,
            typeValue: '400,-1',
            typeName: '400以上',
        });
        return datas;
    }

    /**
     * 生成显示需要的数据
     */
    @computed get showDataSource(): Array<DataSourceItemType> {
        let showData = this.dataSource;
        return showData;
    }

    /**
     * 重置筛选条件
     */
    @action reset = () => {
        this.dataSource = this.originalDataSource;
        // this.dataSource.clear();
        // this.originalDataSource.forEach(action(item => {
        //     item.result = [];
        //     this.dataSource.set(item.type+'', item);
        // }));
        // // 重置本地价格区间筛选数据
        // this.dataSource.set(TYPE_PRICE_RANGE, this.createLocalPriceRangeData());
    };

    // @action initData = () => {
    //     this.dataSource.clear();
    //     // 将初始化默认选中的城市item放入result
    //     this.originalDataSource.forEach(action(typeItem => {
    //         if (typeItem.type + '' === '1' && this.defaultSelectedMap && this.defaultSelectedMap.hasOwnProperty('1')) {
    //             let key = '1';
    //             typeItem.datas.forEach(item => {
    //                 if(item.typeValue === this.defaultSelectedMap[key]){
    //                     typeItem.result.push(item);
    //                     // 请求选中的城市的市场列表
    //                     this.addMarketListToSource(this.defaultSelectedMap[key] + '', true);
    //                 }
    //             });
    //         }
    //         this.dataSource.set(typeItem.type+'', typeItem);
    //     }));
    //     // 重置本地价格区间筛选数据
    //     this.dataSource.set(TYPE_PRICE_RANGE, this.createLocalPriceRangeData());
    //     // 缓存当前用户选择的状态
    //     this.cacheData();
    // };

    /**
     * 更新数据源
     */
    @action update = (item: DataSourceItemType, newValue: any) => {
        item.result = newValue;
        // 如果是选择了城市，需要进行市场数据的替换
        if (item.type === 5 && this.isShowCityFilterData) {
            // 选中了某个城市
            if (newValue && newValue.length > 0) {
                // 将选中的城市code拼接
                let codeList = [];
                newValue.forEach(item => {
                    codeList.push(item.typeValue);
                });
                let codes = _.join(codeList, ',');
                this.addMarketListToSource(codes, false);
            } else {
                // 取消选中某个城市
                this.removeMarketListFromSource();
            }

        }
    };

    /**
     * 添加对应城市的市场到筛选条件中
     * @param cityCode
     */
    addMarketListToSource(cityCode: string, isFirst: boolean){
        this.queryMarketByCity(cityCode, (ret, ext) => {
            if (ret) {
                let marketList = this.convert(ext, '3');
                if (this.dataSource) {
                    let newResult = [];
                    // 如果相应的城市有市场 将原有选中的市场和新的市场列表
                    // 选择的城市没有市场 则直接跳过此步骤 直接清空
                    if (this.getMarketFilterData() && marketList) {
                        let oldMarketData = this.getMarketFilterData();
                        // 将原有选中的result数据筛选保留到现有市场中
                        if (oldMarketData && oldMarketData.result) {
                            oldMarketData.result.forEach((item) => {
                                if(item){
                                    for(let i=0;marketList.datas && i<marketList.datas.length;i++){
                                        if(item.id === marketList.datas[i].id){
                                            newResult.push(item);
                                        }
                                    }
                                }
                            });
                        }
                    }
                    // 删除原有的市场列表
                    this.removeMarketListFromSource();
                    // 如果有相应城市的市场列表，将已选中的市场放入此列表，重新展示
                    if (marketList) {
                        // 将初始化默认的市场选中
                        // if (isFirst && this.defaultSelectedMap && this.defaultSelectedMap.hasOwnProperty('3')) {
                        //     marketList.datas.forEach(item => {
                        //         if (item.typeId === this.defaultSelectedMap['3']) {
                        //             newResult.push(item);
                        //         }
                        //     });
                        // }
                        marketList.result = newResult;
                        this.addMarketAfterCitySource(marketList);
                        // 第一次加载时,如果有默认市场,则把这数据进行缓存，保证打开侧滑筛选时默认市场是被选中的状态
                        if (isFirst && this.defaultSelectedMap && this.defaultSelectedMap.hasOwnProperty('3')){
                            this.cacheData();
                        }
                    }
                }
            } else {
                this.removeMarketListFromSource();
            }
        });
    }

    // 判断筛选数据源中是否有市场数据
    getMarketFilterData = () => {
        for(let i=0; i< this.dataSource.length; i++){
            if (this.dataSource[i].type === 6) {
                return this.dataSource[i];
            }
        }
        return null;
    };

    addMarketAfterCitySource = (marketList: DataSourceItemType) => {
        let index = -1;
        for(let i=0; i<this.dataSource.length; i++){
            if(this.dataSource[i].type === 5){
                index = i + 1;
                break;
            }
        }
        if (index !== -1) { // 插入到城市数据的后面
            this.dataSource.splice(index, 0, marketList);
        } else {
            this.dataSource.push(marketList);
        }
    };

    /**
     * 去除市场筛选条件
     */
    removeMarketListFromSource(){
        if (this.dataSource) {
            let index = -1;
            for(let i=0; i<this.dataSource.length; i++){
                if (this.dataSource[i].type === 6) { // 存在市场筛选数据
                    index = i;
                    break;
                }
            }
            if (index !== -1) {
                this.dataSource.splice(index, 1);
            }
        }
    }

    /**
     * 根据城市获取对应市场筛选条件
     * @param cityCode
     * @param callback
     */
    queryMarketByCity(cityCode: string, callback: Function){
        ConfigListDictApiManager.fetchFilterConditionProvider({
            type: '3',
            cityCodes: cityCode,
            showFlagBit: 2,
        }).then(action(({data}) => {
            if (data) {
                callback(true, data);
            }
        }), (error) => {
            callback(false, error.message);
        });
    }

    /**
     * 加载缓存数据
     */
    @action loadCache = () => {
        if (this.cacheDataSource && this.cacheDataSource.length > 0) {
            // this.cacheDataSource.forEach(item => {
            //     runInAction(() => {
            //         this.dataSource.set(item.type+'', item);
            //     });
            // });
            this.dataSource = this.cacheDataSource;
        }
    }

    /**
     * 清空缓存
     */
    cleanCache = () => {
        this.cacheDataSource = [];
    }

    /**
     * 更新原始数据源
     */
    updateOriginalDataSource = (dataSource: Array<DataSourceItemType>) => {
        this.convertOriginData(dataSource);
        this.reset();
    }

    /**
     * 返回当前用户的选中
     */
    confirm = () => {
        let innerResult = {};
        this.dataSource.forEach(item => {
            if (item.result) {
                // innerResult[item.type+''] = item.result.map((innerItem) => {
                //     if (item.type + '' === '1' || item.type + '' === '2') {
                //         return typeof innerItem === 'object' ? innerItem.typeValue : innerItem;
                //     } else if(item.type === TYPE_PRICE_RANGE){ // 价格区间
                //         return typeof innerItem === 'object' ? innerItem.pubPriceStart + ',' + innerItem.pubPriceEnd : innerItem;
                //     } else {
                //         return typeof innerItem === 'object' ? innerItem.typeId : innerItem;
                //     }
                //
                // });
                innerResult[item.type + ''] = item.result.map((innerItem) => {
                    return typeof innerItem === 'object' ? innerItem.typeValue : innerItem;
                });
            } else {
                innerResult[item.type+''] = null;
            }

        });

        // 缓存当前用户选择的状态
        this.cacheData();
        // this.cacheDataSource = [];
        // this.dataSource.forEach(item => {
        //     this.cacheDataSource.push(toJS(item));
        // });

        return innerResult;
    }

    cacheData = () => {
        // 缓存当前用户选择的状态
        this.cacheDataSource = [];
        this.dataSource.forEach(item => {
            this.cacheDataSource.push(toJS(item));
        });
    };

    canPopupDismiss = () => {
        let canDismiss = true;
        let message = '';
        let innerResult = {};
        this.dataSource.forEach(item => {
            if (item.result) {
                innerResult[item.type + ''] = item.result.map((innerItem) => {
                    return typeof innerItem === 'object' ? innerItem.typeValue : innerItem;
                });
            } else {
                innerResult[item.type+''] = null;
            }

        });
        // 判断价格区间  最高价是否大于最低价
        // 如果最高价小于最低价 不允许后续的筛选请求
        if (innerResult['7']) {
            let priceRange = _.split(innerResult['7'], ',');
            let lowPrice = priceRange[0];
            let heightPrice = priceRange[1];
            if(heightPrice !== '-1'){
                if (parseFloat(lowPrice) > parseFloat(heightPrice)) {
                    canDismiss = false;
                    message = '最高价不能小于最低价';
                }
            }
        }
        return {
            canDismiss: canDismiss,
            message: message
        };
    };
}
