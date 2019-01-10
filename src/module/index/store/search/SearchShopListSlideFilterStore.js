/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2018-03-07 09:38:32
 * @modify date 2018-03-07 09:38:32
 * @desc [侧滑筛选]
 * @flow
 */

import {observable, action, computed, runInAction, toJS} from 'mobx';
import * as _ from 'lodash';
import ConfigListDictApiManager from 'apiManager/ConfigListDictApiManager';

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
    RadioType: 4
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

    // 筛选数据
    @observable dataSource: Array<DataSourceItemType> = [];

    isShowCityFilterData: boolean = false;

    constructor(data: Array<Object>) {
        // 将map类型的筛选原数据 转换成list 每一个item包含筛选的type类型数据以及该类型下的选项子数据list
        // this.convertOriginData(data);
        this.convertOriginData(data);
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
            let enableExpand = true;
            if (element.typeValue === 4) {
                filterType = FilterType.RadioType;
            }
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
            let returnObj = {
                type: element.typeValue,
                typeName: element.typeName,
                datas: datas,
                result: [],
                filterType: filterType,
                enableExpand: enableExpand,
            };
            this.originalDataSource.push(returnObj);
        });
    }

    // 现在只有市场为老接口 key对应的为老接口的值
    @action
    convert(originMap: Map<string, Object>, key: string) {
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
                    filterType: FilterType.MutilSelectType
                };

                return returnObj;
            }
        }
    }

    /**
     * 生成显示需要的数据
     */
    @computed
    get showDataSource(): Array<DataSourceItemType> {
        let showData = this.dataSource;
        return showData;
    }

    /**
     * 重置筛选条件
     */
    @action reset = () => {
        // this.dataSource.clear();
        this.dataSource = this.originalDataSource;
        // this.originalDataSource.forEach(action(item => {
        //     this.dataSource.set(item.type + '', item);
        // }));
    };

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
                this.addMarketListToSource(codes);
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
    addMarketListToSource(cityCode: string) {
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
                                if (item) {
                                    for (let i = 0; marketList.datas && i < marketList.datas.length; i++) {
                                        if (item.id === marketList.datas[i].id) {
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
                        marketList.result = newResult;
                        this.addMarketAfterCitySource(marketList);
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

    addMarketAfterCitySource = (marketList: Object) => {
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
    removeMarketListFromSource() {
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
    queryMarketByCity(cityCode: string, callback: Function) {
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
            //         this.dataSource.set(item.type + '', item);
            //     });
            // });
            this.dataSource = this.cacheDataSource;
        }
    };

    /**
     * 清空缓存
     */
    cleanCache = () => {
        this.cacheDataSource = [];
    };

    /**
     * 更新原始数据源
     */
    updateOriginalDataSource = (dataSource: Array<DataSourceItemType>) => {
        this.convertOriginData(dataSource);
        this.reset();
    };

    /**
     * 返回当前用户的选中
     */
    confirm = () => {
        let innerResult = {};
        this.dataSource.forEach(item => {
            if (item.result) {
                // innerResult[item.type + ''] = item.result.map((innerItem) => {
                //     if (item.type + '' === '1' || item.type + '' === '2') {
                //         return typeof innerItem === 'object' ? innerItem.typeValue : innerItem;
                //     } else if (item.type + '' === '5') {
                //         // typeAccode =》typeId zc 1010.1407
                //         // typeId =》codeValue shh 1010.1500
                //         return typeof innerItem === 'object' ? innerItem.codeValue : innerItem;
                //     } else {
                //         return typeof innerItem === 'object' ? innerItem.typeId : innerItem;
                //     }
                // });
                innerResult[item.type + ''] = item.result.map((innerItem) => {
                    return typeof innerItem === 'object' ? innerItem.typeValue : innerItem;
                });
            } else {
                innerResult[item.type + ''] = null;
            }

        });

        // 缓存当前用户选择的状态
        this.cacheDataSource = [];
        this.dataSource.forEach(item => {
            this.cacheDataSource.push(toJS(item));
        });

        return innerResult;
    }
}
