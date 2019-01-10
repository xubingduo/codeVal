/**
 * @author [lyq]
 * @email
 * @create date 2018-08-28 07:25:39
 * @modify date 2018-08-28 07:25:39
 * @desc [首页包邮专区页面]
 */

import React, { Component } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    DeviceEventEmitter,
    NativeModules,
    Platform,
    Text,
    TouchableOpacity,
    Image
} from 'react-native';
import { observer } from 'mobx-react';
import { DLFlatList, RefreshState } from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import GoodsItem from 'module/goods/widget/GoodsItem';
import HotStyleStore from '../store/HotStyleStore';
import NavigationHeader from 'component/NavigationHeader';
import EmptyView from 'component/EmptyView';
import Alert from 'component/Alert';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import ColorOnlyNavigationHeader from 'component/ColorOnlyNavigationHeader';
import SearchView from 'component/SearchView';
import StringUtl from 'utl/StringUtl';
import fonts from 'gsresource/ui/fonts';

import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';


@observer
export default class FreeShippingScreen extends Component {
    // static navigationOptions = ({ navigation }) => {
    //     return {
    //         header: (
    //             <NavigationHeader
    //                 navigation={navigation}
    //                 navigationTitleItem={'包邮专区'}
    //             />
    //         )
    //     };
    // };

    static navigationOptions = ({ navigation }) => ({
        header: <ColorOnlyNavigationHeader backgroundColor={colors.white} statusBarStyle={'dark-content'} />
    });

    constructor(props) {
        super(props);
        this.store = new HotStyleStore();
        this.state = {
            refreshState: RefreshState.Idle,
            shopMsg: {},
            searchIcon: true,
            key: '',
        };
    }

    addListener() {
        this.deEmitter = DeviceEventEmitter.addListener(
            GOODS_ITEM_CHANGE,
            ({ key, data }) => {
                // console.log(key.toLowerCase(), data);
                switch (key) {
                case GOODS_ITEM_DELETE: {
                    let { goodsId } = data;
                    this.store.deleteHotStyle(goodsId);
                    break;
                }
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let { tenantId, favorFlag } = data;
                    this.store.setFocusOrNot(tenantId, favorFlag);
                    break;
                }
                case CHANGE_GOODS_WATCH_NUMBER: {
                    let { goodsId, viewNum } = data;
                    this.store.watchCallBack(goodsId, viewNum);
                    break;
                }
                case CHANGE_GOODS_STAR_NUMBER_STATE: {
                    let { goodsId, praiseFlag, praiseNum } = data;
                    this.store.setStarCount(true, goodsId);
                    break;
                }
                case CHANGE_GOODS_FAVOR_NUMBER_STATE: {
                    let { goodsId, spuFavorFlag, spuFavorNum } = data;
                    this.store.toggleFavorClick(
                        goodsId,
                        spuFavorNum,
                        spuFavorFlag
                    );
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageStart('今日爆款');
        }
    }

    componentDidMount() {
        this.addListener();
        this.onHeaderRefresh();
    }

    componentWillUnmount() {
        this.deEmitter && this.deEmitter.remove();
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageEnd('今日爆款');
        }
    }

    onHeaderRefresh = async () => {
        this.setState({
            refreshState: RefreshState.HeaderRefreshing
        });
        try {
            await this.store.fetchTodayHotList(this.state.key);
        } catch (error) {
            Alert.alert(error.message);
        }
        if(this.store.hotStyles.length === 0){
            this.setState({
                refreshState: RefreshState.NoMoreData
            });
        } else {
            this.setState({
                refreshState: RefreshState.Idle
            });
        }

        if (this.store.noMore === true && this.store.hotStyles.length > 0) {
            this.setState({
                refreshState: RefreshState.NoMoreData
            });
        }
    };

    onFooterRefresh = async () => {
        this.setState({
            refreshState: RefreshState.FooterRefreshing
        });
        try {
            await this.store.fetchMoreTodayHotList(this.state.key);
        } catch (error) {
            Alert.alert(error.message);
        }
        if (this.store.noMore === true && this.store.hotStyles.length > 0) {
            this.setState({
                refreshState: RefreshState.NoMoreData
            });
        } else {
            this.setState({
                refreshState: RefreshState.Idle
            });
        }
    };

    //头部
    renderHeade =()=> {
        return (
            <View style={{height: 44, alignItems: 'center', justifyContent: 'center'}}>
                <View style={{
                    flexDirection: 'row',
                    backgroundColor: colors.white,
                    height: 44,
                    width: '100%',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
                >
                    <TouchableOpacity
                        style={{marginLeft: 16}}
                        hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}
                    >
                        <Image source={require('gsresource/img/arrowLeftGrey.png')} />
                    </TouchableOpacity>

                    {this.state.searchIcon ? this.showTitle() : this.showSearchBar()}
                    {this.showSearchIconView()}
                </View>
            </View>
        );
    };

    //标题
    showTitle =()=> {
        return (
            <Text
                style={{
                    fontSize: fonts.font18,
                    color: '#3d4245',
                    backgroundColor: 'transparent',
                    textAlign: 'center',
                }}
            >包邮专区</Text>
        );
    };

    //搜索
    showSearchBar =()=> {
        return(
            <SearchView
                style={{
                    borderRadius: 4,
                    flex: 1,
                    marginLeft: 13,
                    marginRight: 4,
                    backgroundColor: colors.bg,
                    height: 28
                }}
                autoFocus={true}
                tiStyle={{marginLeft: 10}}
                isNeedSearchIcon={false}
                hint={'请输入商品名称'}
                onTextChange={(text) => {
                    const value = StringUtl.filterChineseSpace(text);
                    setTimeout(()=>{
                        this.setState({
                            key: value
                        });
                    });
                }}
                onSubmitEditing={this.onHeaderRefresh}
            />
        );
    };

    //搜索按钮
    showSearchIconView =()=> {
        return this.state.searchIcon ? this.showIcon() : this.showText();
    };

    showIcon =()=> {
        return(
            <TouchableOpacity
                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginRight: 15}}
                onPress={() => {
                    // 显示搜索框
                    this.setState({
                        searchIcon: !this.state.searchIcon
                    });
                }}
            >
                <Image source={require('gsresource/img/searchBig.png')} />
            </TouchableOpacity>
        );
    };

    showText =()=> {
        return(
            <TouchableOpacity

                hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 8,marginRight: 15}}
                onPress={() => {
                    this.setState({
                        searchIcon: !this.state.searchIcon
                    },()=>{
                        if(this.state.searchIcon){
                            this.setState({
                                key: ''
                            },()=>{
                                this.onHeaderRefresh();
                            });
                        }
                    });
                }}
            >
                <Text style={{fontSize: fonts.font14,color: colors.greyFont}}>取消</Text>
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeade()}
                <DLFlatList
                    data={this.store.hotStyles.slice()}
                    renderItem={({ item }) => this.renderCell(item)}
                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    refreshState={this.state.refreshState}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={<EmptyView emptyViewType={'NODATA'} />}
                />
                {/*购买弹出窗口*/}
                <GoodsBuy
                    onRef={ref => {
                        this.goodsBuy = ref;
                    }}
                    shopMsg={this.state.shopMsg}
                />
            </SafeAreaView>
        );
    }

    /**
     * 渲染列表cell
     */
    renderCell = item => {
        return (
            <GoodsItem
                key={item.id}
                goods={item}
                isShowDelete={true}
                showTime={false}
                buyClick={() => {
                    this.setState({ shopMsg: item }, () => {
                        this.goodsBuy.goodsBuyShow(item.detailUrl);
                    });
                }}
            />
        );
    };

    // /**
    //  * 点赞
    //  */
    // toggleStar = (code, goodsid) => {
    //     if (code) {
    //         this.store.setStarCount(code, goodsid);
    //     }
    // };
    //
    // /**
    //  * 关注
    //  */
    // toggleFocus = (result, response) => {
    //     if (result) {
    //         this.store.setFocusOrNot(response);
    //     }
    // };
    //
    // /**
    //  * 删除
    //  */
    // delete = (result, response) => {
    //     if (result) {
    //         this.store.deleteHotStyle(response);
    //     }
    // };
    //
    // watchCallBack(code, goodsId, viewNum) {
    //     if (code) {
    //         this.store.watchCallBack(goodsId, viewNum);
    //     }
    // }
    //
    // toggleFavorClick(code, goodsId, goods) {
    //     // console.log(code, goodsId)
    //     // this.watchCallBack(code, goodsId, (item.viewNum || 0) + 1);
    //     if (code) {
    //         let spuFavorNum = goods.spuFavorNum;
    //         let spuFavorFlag = goods.spuFavorFlag || 0;
    //         // 未收藏=》收藏
    //         if (spuFavorFlag === 0) {
    //             spuFavorNum++;
    //             this.store.toggleFavorClick(goodsId, spuFavorNum, 1);
    //         }
    //         // 收藏=》取消收藏
    //         if (spuFavorFlag === 1) {
    //             spuFavorNum--;
    //             this.store.toggleFavorClick(goodsId, spuFavorNum, 0);
    //         }
    //     }
    // }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});
