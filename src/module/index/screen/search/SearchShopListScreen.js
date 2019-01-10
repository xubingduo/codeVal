/**
 * author: tuhui & xbu
 * Date: 2018/7/24
 * Time: 14:06
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    TouchableOpacity,
    DeviceEventEmitter,
    Text,
    Platform,
    NativeModules,
} from 'react-native';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh/index';
import {DLFlatList, Toast} from '@ecool/react-native-ui';
import colors from '../../../../gsresource/ui/colors';
import Image from '../../../../component/Image';
import SearchView from '../../../../component/SearchView';
import ShopSearchStore from '../../store/ShopSearchStore';
import {observer, inject} from 'mobx-react';
import DividerLineH from '../../../../component/DividerLineH';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import Alert from '../../../../component/Alert';
import ShopCell from './cell/ShopCell';
import SearchGoodsEmptyView from '../../widget/SearchGoodsEmptyView';
import ShopSvc from 'svc/ShopSvc';
import UserActionSvc from 'svc/UserActionSvc';
import TextButton from 'component/TextButton';
import StringUtl from '../../../../utl/StringUtl';
import {toJS} from 'mobx';
import DocSvc from 'svc/DocSvc';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import SearchShopListSlideFilter from '../../widget/search/SearchShopListSlideFilter';
import SortTextArrow from '../../../../component/SortTextArrow';
import fonts from '../../../../gsresource/ui/fonts';
import * as _ from 'lodash';

const PAGE_SIZE = 20;
const OrderByType = {
    DEFAULT: '',
    READ: 'marketNum',
    LIKE: 'concernNum',
    WHOLESALEPRICE: 'likeNum',
};

@observer
export default class SearchShopListScreen extends Component {
    static navigationOptions = () => {
        return {
            header: <ColorOnlyNavigationHeader backgroundColor={colors.white} />
        };
    };

    constructor(props) {
        super(props);
        this.store = new ShopSearchStore();
        this.pageNo = 1;

        this.state = {
            key: '',
            hasFilterData: false,
            cityCodes: '',// 城市
            marketIds: '',// 市场
            masterClassId: '',// 主营类目id
            serverDict: [], // 标签
            medalList: [], // 勋章
            styleList: [], // 风格
            listFreshState: RefreshState.Idle,
            orderBy: OrderByType.DEFAULT, // 默认选中
        };
        this.orderByDesc = true;
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeader()}
                {this.renderSort()}
                {
                    this.renderSlideFilter()
                }
                <DividerLineH />
                {this.renderList()}
            </SafeAreaView>
        );
    }

    renderSlideFilter = () => {
        if (this.state.hasFilterData && this.store.filterDataSource) {
            return (
                <SearchShopListSlideFilter
                    ref={(slideFilter) => this.slideFilter = slideFilter}
                    dataSource={this.store.filterDataSource}
                    onValueChanged={(result) => {
                        UserActionSvc.track('GOODS_SORT_FILTRATE');
                        this.onFilterResult(result);
                    }}
                />
            );
        }
    };
    renderHeader = () => {
        return (
            <View
                style={{
                    backgroundColor: colors.white,
                    flexDirection: 'row',
                    height: 44,
                    alignItems: 'center'
                }}
            >
                <TouchableOpacity
                    hitSlop={{left: 16, right: 16, bottom: 16, top: 16}}
                    style={{marginLeft: 16}}
                    onPress={() => {
                        this.props.navigation.goBack();
                    }}
                >
                    <Image
                        source={require('gsresource/img/arrowLeftGrey.png')}
                    />
                </TouchableOpacity>
                <SearchView
                    style={{
                        borderRadius: 4,
                        flex: 1,
                        marginLeft: 13,
                        backgroundColor: colors.bg,
                        height: 28,
                        marginRight: 20,
                    }}
                    tiStyle={{marginLeft: 10}}
                    isNeedSearchIcon={false}
                    defaultText={this.state.key}
                    hint={'请输入门店'}
                    onTextChange={text => {
                        this.setState({
                            key: text
                        });
                    }}
                    onSubmitEditing={this.onSubmitEditing}
                />
            </View>
        );
    };

    // 门店头部排序
    renderSort = () => {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: colors.white,
                height: 40
            }}
            >
                <TextButton
                    textStyle={this.state.orderBy === OrderByType.DEFAULT ? styles.sortSeletedText : styles.sortNormalText}
                    text={'综合'}
                    onPress={() => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = true;
                            this.setState({
                                orderBy: OrderByType.DEFAULT,
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.readSta = sta}
                    textStyle={this.state.orderBy === OrderByType.READ ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.READ ? 0 : this.readSta.state.sort}
                    text={'上新数'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            this.setState({
                                orderBy: OrderByType.READ
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.likeSta = sta}
                    textStyle={this.state.orderBy === OrderByType.LIKE ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.LIKE ? 0 : this.likeSta.state.sort}
                    text={'关注数'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            this.setState({
                                orderBy: OrderByType.LIKE
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.priceSta = sta}
                    textStyle={this.state.orderBy === OrderByType.WHOLESALEPRICE ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.WHOLESALEPRICE ? 0 : this.priceSta.state.sort}
                    text={'点赞数'}
                    onSortChange={(sort) => {
                        if (this.state.listFreshState !== RefreshState.HeaderRefreshing
                            || this.state.listFreshState !== RefreshState.FooterRefreshing) {
                            this.orderByDesc = sort === -1;
                            this.setState({
                                orderBy: OrderByType.WHOLESALEPRICE
                            }, () => {
                                this.loadData(true);
                            });
                        }
                    }}
                />

                {
                    this.state.hasFilterData &&
                    <TextButton
                        textStyle={{color: colors.normalFont, fontSize: 14}}
                        text={'筛选'}
                        //enable={this.state.hasFilterData}
                        onPress={() => {
                            // 请求完筛选数据时候 才可以打开侧滑筛选
                            this.openSlideFilter();
                        }}
                    />
                }

            </View>
        );
    };

    renderList = () => {
        return (
            <DLFlatList
                keyExtractor={(item, index) => item.id.toString()}
                renderItem={this.renderShopCell}
                refreshState={this.state.listFreshState}
                data={this.store.shopSearchListShow}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
                ListEmptyComponent={this.renderEmpty}
            />
        );
    };

    /**
     * 无数据界面
     */
    renderEmpty = () => {
        return <SearchGoodsEmptyView />;
    };

    renderShopDividerView = () => {
        return <View style={{height: 2}} />;
    };

    renderShopCell = ({item, index}) => {

        if (item && item.slhId) {
            return (
                <ShopCell
                    title={item.name}
                    imgUrl={''}
                    score={''}
                    shopId={item.id}
                    onInviteShopClick={this.inviteShopClick}
                    address={''}
                    favorFlag={1}
                    changeFollow={null}
                    labels={''}
                />
            );
        } else {
            let labelData = [];
            if (item.ecCaption.labels) {
                labelData = item.ecCaption.labels.slice();
            }
            return (
                <ShopCell
                    title={item.name}
                    imgUrl={DocSvc.docURLM(item.logoPic)}
                    score={item.score}
                    shopId={item.id}
                    itemClick={this.shopClick}
                    address={item.shopAddr}
                    favorFlag={item.favorFlag}
                    changeFollow={this.changeFollow}
                    labels={labelData}
                />
            );
        }


    };

    componentWillMount() {
        this.setState({
            key: this.props.navigation.state.params.key ? this.props.navigation.state.params.key : ''
        });
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('门店搜索结果列表界面');
        }
    }

    componentDidMount() {
        // this.beforeMount();
        this.throttleLoadData();
        this.store.getFilterConfigData((code, msg) => {
            if (code) {
                if(msg.length !== 1 || msg[0].typeValue !== 6){
                    this.setState({hasFilterData: true});
                }
            }
            dlconsole.log(JSON.stringify(toJS(this.store.filterDataSource)));
        });
        this.deEmitter = DeviceEventEmitter.addListener(GOODS_ITEM_CHANGE,
            ({key, data}) => {
                switch (key) {
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let {tenantId, favorFlag} = data;
                    this.store.changeFlag(tenantId);
                    break;
                }
                default: {
                    // console.log('this is other function', key);
                }
                }
            }
        );
    }

    componentWillUnmount() {
        this.deEmitter.remove();
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('门店搜索结果列表界面');
        }
    }

    /**
     * 打开筛选侧滑界面
     */
    openSlideFilter = () => {
        if (this.slideFilter) {
            this.slideFilter.show();
        }
    };

    onFilterResult(result) {
        this.setState({
            cityCodes: result['5'] ? result['5'].join(',') : '',
            marketIds: result['6'] ? result['6'].join(',') : '',
            masterClassId: result['4'] ? result['4'].join(',') : '',
            serverDict: result['1'],
            medalList: result['2'],
            styleList: result['3']
        }, () => {
            this.loadData(true);
        });
    }

    throttleLoadData = _.throttle(() => {
        this.loadData(true);
    }, 800);

    onLoadMore = () => {
        this.loadData(false);
    };

    onHeadFresh = () => {
        this.loadData(true);
    };

    loadData(fresh) {
        if (fresh) {
            this.pageNo = 1;
            this.updateFreshState(RefreshState.HeaderRefreshing);
        } else {
            this.updateFreshState(RefreshState.FooterRefreshing);
        }

        /**
         * 移除中文输入法字符间隔
         * @type {string | void | *}
         */
        const value = StringUtl.filterChineseSpace(this.state.key);
        let jsonParams = {
            searchToken: value,
            cityCodes: this.state.cityCodes,
            marketIds: this.state.marketIds,
            masterClassId: this.state.masterClassId,
            labelsAll: this.state.serverDict,
            medalsCodeList: this.state.medalList,
            tagsAll: this.state.styleList
        };
        // for(let key in jsonParams){
        //     if(jsonParams[key]===''){
        //
        //     }
        // }

        let params ={
            pageSize: PAGE_SIZE,
            pageNo: this.pageNo,
            orderByDesc: this.orderByDesc,
        };

        if (!StringUtl.isEmpty(this.state.orderBy)) {
            Object.assign(params, {orderBy: this.state.orderBy, orderByDesc: this.orderByDesc,});
        }
        this.store.searchShop(
            fresh, params, jsonParams,
            (ret, extra) => {
                if (!ret) {
                    Alert.alert(extra);
                    this.updateFreshState(RefreshState.Idle);
                } else {
                    this.pageNo = this.pageNo + 1;
                    if (extra === 0) {
                        this.updateFreshState(RefreshState.NoMoreData);
                    } else {
                        this.updateFreshState(RefreshState.Idle);
                    }
                }
            }
        );
    }

    updateFreshState = state => {
        this.setState({
            listFreshState: state
        });
    };

    shopClick = (shopId, shopName) => {
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: shopId,
            tenantName: shopName
        });
    };

    inviteShopClick = (item) => {
        __DEV__&&console.log('--------------------');
        __DEV__&&console.log(item);
        ShopSvc.requestShopData({
            epid: item.slhId,
            shopId: item.slhShopId,
            clientid: '',
            sn: item.slhSn
        });
    };

    changeFollow = (shopId, shopName, flag) => {
        let obj = {
            shopId: shopId,
            shopName: shopName,
            flag: flag
        };
        UserActionSvc.track('SHOP_TOGGLE_FOCUS_ON');
        ShopSvc.follow(obj, this.callbackSuccess, this.callbackCancel);
    };

    callbackSuccess = shopId => {
        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
            favorFlag: 1,
            tenantId: shopId
        });
        Toast.success('关注成功', 2);
    };

    callbackCancel = shopId => {
        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
            favorFlag: 0,
            tenantId: shopId
        });
        Toast.success('已取消关注', 2);
    };

    onSubmitEditing = () => {
        this.loadData(true);
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    sortNormalText: {
        color: colors.normalFont,
        fontSize: fonts.font14,
    },

    sortSeletedText: {
        color: colors.activeFont,
        fontSize: fonts.font14,
    },
});
