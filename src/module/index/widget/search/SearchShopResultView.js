/**
 * author: wwj
 * Date: 2018/11/14
 * Time: 上午9:28
 * des:
 */
import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    TouchableOpacity,
    DeviceEventEmitter,
    Text,
    Platform,
    NativeModules, Dimensions
} from 'react-native';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh/index';

import {DLFlatList, Toast} from '@ecool/react-native-ui';
import colors from '../../../../gsresource/ui/colors';
import Image from '../../../../component/Image';
import SearchView from '../../../../component/SearchView';
import ShopCell from '../../screen/search/cell/ShopCell';
import DividerLineH from '../../../../component/DividerLineH';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import Alert from '../../../../component/Alert';
import SearchGoodsEmptyView from '../../widget/SearchGoodsEmptyView';
import SearchShopListSlideFilter from '../../widget/search/SearchShopListSlideFilter';//
import SearchFeedBackView from '../search/SearchFeedBackView';

import ShopSearchStore from '../../store/ShopSearchStore';
import ShopSvc from 'svc/ShopSvc';
import UserActionSvc from 'svc/UserActionSvc';
import StringUtl from '../../../../utl/StringUtl';
import DocSvc from 'svc/DocSvc';
import {toJS, reaction} from 'mobx';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import NavigationSvc from 'svc/NavigationSvc';
import TextButton from 'component/TextButton';
import SortTextArrow from 'component/SortTextArrow';
import fonts from '../../../../gsresource/ui/fonts';

const PAGE_SIZE = 20;
const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
const OrderByType = {
    DEFAULT: '',
    READ: 'marketNum',
    LIKE: 'concernNum',
    WHOLESALEPRICE: 'likeNum',
};


@observer
export default class SearchShopResultView extends Component {
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
            isFeedbackVisiable: false,
            orderBy: OrderByType.DEFAULT, // 默认选中
        };
        this.firstSearch = false;
        this.viewabilityConfig = {
            itemVisiblePercentThreshold: 350
        };
        this.orderByDesc = true;
    }

    componentWillMount() {

    }

    componentDidMount() {
        // this.beforeMount();
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
        this._dataReaction = reaction(() => this.store.shopSearchListShow, list => {
            if (!this.state.isFeedbackVisiable && list.length === 0) {
                this.showFeedback();
            }
        });
    }

    componentWillUnmount() {
        this.deEmitter.remove();
        this._dataReaction && this._dataReaction();
    }

    showFeedback = () => {
        if (this.firstSearch) {
            this.setState({isFeedbackVisiable: true});
        }
    }

    /**
     * 列表视图改变回调
     */

    onViewableItemsChanged = ({ viewableItems, changed }) => {
        if (!this.state.isFeedbackVisiable && this.firstSearch) {
            const len = viewableItems.length;
            if (len > 0 && viewableItems[viewableItems.length - 1].index >= 12) {
                this.showFeedback();
            }
        }
    }

    onEndReached = ({distanceFromEnd: number}) => {
        if (number < 30) {
            this.showFeedback();
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

    onLoadMore = () => {
        this.loadData(false);
    };

    onHeadFresh = () => {
        this.loadData(true);
    };

    searchResult = (fresh, key) => {
        this.setState({key: key}, () => {
            this.loadData(fresh);
        });
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
                this.firstSearch = true;
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

    /**
     * 反馈按钮
     */

    onFeedBackClick = () => {
        NavigationSvc.navigate('SearchFeedBackScreen', { keyWord: this.state.key});
    }

    updateFreshState = state => {
        this.setState({
            listFreshState: state
        });
    };

    shopClick = (shopId, shopName) => {
        NavigationSvc.navigate('ShopIndexScreen', {
            tenantId: shopId,
            tenantName: shopName
        });
    };

    onInviteShopClick = (item) => {
        ShopSvc.requestShopData({
            id: item.id,
            epid: item.slhId,
            shopid: item.slhShopId,
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
        Toast.success('关注成功~', 2);
    };

    callbackCancel = shopId => {
        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
            favorFlag: 0,
            tenantId: shopId
        });
        Toast.success('已取消关注~', 2);
    };

    onSubmitEditing = () => {
        this.loadData(true);
    };

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

    renderList = () => {
        return (
            <DLFlatList
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderShopCell}
                refreshState={this.state.listFreshState}
                data={this.store.shopSearchListShow}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
                ListEmptyComponent={this.renderEmpty}
                onEndReached={this.onEndReached}
                onEndReachedThreshold={0.05}
                onViewableItemsChanged={this.onViewableItemsChanged}
                viewabilityConfig={this.viewabilityConfig}
            />
        );
    };

    /**
     * 无数据界面
     */
    renderEmpty = () => {
        return (
            <View style={{
                position: 'relative',
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                width: WIDTH,
                height: HEIGHT - 100
            }}
            >
                <SearchGoodsEmptyView />
            </View>
        );
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
                    score={0}
                    shopId={item.id}
                    onInviteShopClick={this.onInviteShopClick}
                    address={''}
                    favorFlag={1}
                    changeFollow={null}
                    labels={[]}
                    enableFollow={false}
                    item={item}
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

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {
                    this.renderSort()
                }
                {
                    this.renderSlideFilter()
                }
                <DividerLineH />
                {this.renderList()}
                {this.state.isFeedbackVisiable && <SearchFeedBackView onPress={this.onFeedBackClick} />}
            </SafeAreaView>
        );
    }
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

