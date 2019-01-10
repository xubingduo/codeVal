/**
 * @author [lyq]
 * @email
 * @create date 2018-08-28 03:16:16
 * @modify date 2018-08-28 03:16:16
 * @desc [首页今日上新门店页面]
 */

import React, { Component } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    Platform,
    NativeModules,
    DeviceEventEmitter,Dimensions
} from 'react-native';
import { DLFlatList, RefreshState, Toast } from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import ShopListStore from '../store/ShopListStore';
import NavigationHeader from 'component/NavigationHeader';
import EmptyView from 'component/EmptyView';
import Alert from 'component/Alert';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import ShopCell from 'module/index/widget/ShopCell';
import UGCModule from '@ecool/react-native-video';
import { observer } from 'mobx-react';
import ShopSvc from 'svc/ShopSvc';
import NetWorkUtl from 'utl/NetWorkUtl';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';

let UGC = NativeModules.UGCModule;
const WIDTH = Dimensions.get('window').width;

@observer
export default class ShopListScreen extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    navigationTitleItem={'今日上新门店'}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.store = new ShopListStore();
        this.state = {
            refreshState: RefreshState.Idle,
            shopMsg: {}
        };
    }

    componentDidMount() {
        this.onHeaderRefresh();
        // 注册店铺关注状态变化事件监听
        this.deEmitter = DeviceEventEmitter.addListener(
            GOODS_ITEM_CHANGE,
            ({ key, data }) => {
                // console.log(key.toLowerCase(), data);
                switch (key) {
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let { tenantId, favorFlag } = data;
                    this.store.updateShopFocusStatus(tenantId, favorFlag);
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );
    }

    componentWillUnmount() {
        // 移除事件监听
        this.deEmitter.remove();
    }

    onHeaderRefresh = async () => {
        this.setState({
            refreshState: RefreshState.HeaderRefreshing
        });
        try {
            await this.store.fetchShopsList();
        } catch (error) {
            Alert.alert(error.message);
        }
        this.setState({
            refreshState: RefreshState.Idle
        });
        if (this.store.noMore === true && this.store.shops.length > 0) {
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
            await this.store.fetchMoreShopsList();
        } catch (error) {
            Alert.alert(error.message);
        }
        if (this.store.noMore === true && this.store.shops.length > 0) {
            this.setState({
                refreshState: RefreshState.NoMoreData
            });
        } else {
            this.setState({
                refreshState: RefreshState.Idle
            });
        }
    };

    /**
     * 关注门店
     */
    onFocusShopClick = async item => {
        Toast.loading();
        try {
            if (item.favorFlag === 1) {
                //已关注
                await this.store.unFocusShop(item);
                Toast.success('取消成功', 2);
            } else {
                await this.store.focusShop(item);
                Toast.success('关注成功', 2);
            }
            sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                favorFlag: item.favorFlag ? 0 : 1,
                tenantId: item.id
            });
        } catch (error) {
            Toast.dismiss();
            Alert.alert(error.message);
        }
    };

    /**
     * 跳转到门店首页
     */
    jumpToShop = item => {
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: item.id,
            tenantName: item.name
        });
    };

    /**
     * 点击播放按钮
     */
    playVideo = item => {
        if (item.videoUrl && item.videoUrl.length > 0) {
            //有视频点击播放视频
            if (Platform.OS === 'ios') {
                NetWorkUtl.getNetWorkState().then(enable => {
                    if (enable) {
                        UGCModule.autoPlay(item.videoUrl, item.coverUrl);
                    } else {
                        Toast.show('网络似乎不给力', 2);
                    }
                });
            } else {
                UGC.play(item.videoUrl, item.coverUrl);
            }
        }
    };

    /**
     * 查看更多
     */
    viewMoreStyle = item => {
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: item.id,
            tenantName: item.name
        });
    };

    itemSeparateComponent = () => {
        return <View style={{ width: WIDTH, height: 10 }} />;
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <DLFlatList
                    data={this.store.shops.slice()}
                    renderItem={({ item }) => this.renderCell(item)}
                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    refreshState={this.state.refreshState}
                    keyExtractor={(item, index) => index.toString()}
                    ListEmptyComponent={<EmptyView emptyViewType={'NODATA'} />}
                    ItemSeparatorComponent={this.itemSeparateComponent}
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
            <ShopCell
                cellItem={item}
                onFocusClick={shopInfo => this.onFocusShopClick(shopInfo)}
                onPlayClick={shopInfo => this.playVideo(shopInfo)}
                onBackGroundImageClick={shopInfo => this.jumpToShop(shopInfo)}
                onShopInfoClick={shopInfo => this.jumpToShop(shopInfo)}
            />
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});
