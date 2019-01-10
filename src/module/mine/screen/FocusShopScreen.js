/**
 * author: wwj
 * Date: 2018/8/21
 * Time: 下午1:39
 * des: 关注的店铺列表
 */

import React, {Component} from 'react';
import {StyleSheet, View, SafeAreaView, DeviceEventEmitter, Platform, NativeModules} from 'react-native';
import FocusShopStore from '../store/FocusShopStore';
import {DLFlatList} from '@ecool/react-native-ui';
import {observer} from 'mobx-react';
import colors from '../../../gsresource/ui/colors';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh';
import NavigationHeader from '../../../component/NavigationHeader';
import ShopCell from '../../index/screen/search/cell/ShopCell';
import * as _ from 'lodash';
import {PAGE_SIZE} from '../../../config/Constant';
import Alert from '../../../component/Alert';
import ShopListEmptyView from '../widget/ShopListEmptyView';
import {Toast} from '@ecool/react-native-ui';
import ShopSvc from '../../../svc/ShopSvc';
import SearchView from '../../../component/SearchView';
import UserActionSvc from 'svc/UserActionSvc';
import DocSvc from '../../../svc/DocSvc';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import DividerLineH from '../../../component/DividerLineH';

@observer
export default class FocusShopScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'关注门店'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.store = new FocusShopStore();
        this.state = {refreshState: RefreshState.Idle, key: ''};
        this.pageNo = 1;
    }

    beforeMount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('我关注的店铺');
        }
    }

    componentDidMount() {
        this.beforeMount();
        this.throttleLoadData();
        // 注册店铺关注状态变化事件监听
        // 用于监听其他页面对列表中店铺关注状态的变化,以便于及时刷新
        this.deEmitter = DeviceEventEmitter.addListener(GOODS_ITEM_CHANGE,
            ({key, data}) => {
                // console.log(key.toLowerCase(), data);
                switch (key) {
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let {tenantId, favorFlag} = data;
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
        // 更新我的页面
        DeviceEventEmitter.emit('mineScreenrefresh');
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('我关注的店铺');
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.bg}}>
                <View style={{flexDirection: 'row', padding: 10, backgroundColor: colors.white}}>
                    <SearchView
                        style={{
                            borderRadius: 4,
                            flex: 1,
                            backgroundColor: colors.bg,
                            height: 28
                        }}
                        tiStyle={{marginLeft: 10}}
                        isNeedSearchIcon={true}
                        hint={'输入店铺名称'}
                        onTextChange={(text) => {
                            this.setState({key: text});
                            if (!text) {
                                this.throttleLoadData();
                            }
                        }}
                        onSubmitEditing={() => {
                            this.throttleLoadData();
                        }}
                    />
                </View>
                <DLFlatList
                    style={{flex: 1}}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={this.renderShopItem}
                    refreshState={this.state.refreshState}
                    data={this.store.shopListShow}
                    onHeaderRefresh={this.onHeadFresh}
                    onFooterRefresh={this.onFooterRefresh}
                    ListEmptyComponent={<ShopListEmptyView />}
                />
            </SafeAreaView>
        );
    }

    renderShopItem = ({item}) => {
        return (
            <ShopCell
                isOnline={item.isOnline}
                title={item.shopName}
                imgUrl={DocSvc.docURLS(item.logoUrl)}
                favorFlag={item.favorFlag}
                shopId={item.shopId}
                itemClick={this.shopClick}
                address={item.shopAddr}
                changeFollow={this.changeFollow}
                labels={item.labelNames}
            />
        );
    };

    /**
     * 每个店铺的点击事件
     * @param shopId
     * @param shopName
     */
    shopClick = (shopId, shopName) => {
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: shopId,
            tenantName: shopName
        });
    };

    onHeadFresh = () => {
        this.loadData(true);
    };

    onFooterRefresh = () => {
        this.loadData(false);
    };

    throttleLoadData = _.throttle(() => {
        this.loadData(true);
    }, 500);

    /**
     * 加载店铺列表
     */
    loadData(refresh) {
        if (refresh) {
            this.pageNo = 1;
            this.updateFreshState(RefreshState.HeaderRefreshing);
        } else {
            this.updateFreshState(RefreshState.FooterRefreshing);
        }
        let param = {
            jsonParam: {
                shopNameLike: this.state.key,
                pageSize: PAGE_SIZE,
                pageNo: this.pageNo,
            }
        };
        this.store.queryFocusShopList(refresh, param, (ret, ext) => {
            if (!ret) {
                Alert.alert(ext);
                this.updateFreshState(RefreshState.Idle);
            } else {
                if (ext === 0) {
                    this.updateFreshState(RefreshState.NoMoreData);
                } else {
                    this.updateFreshState(RefreshState.Idle);
                }
                this.pageNo = this.pageNo + 1;
            }
        });
    }

    /**
     * 修改刷新状态
     * @param state
     */
    updateFreshState = state => {
        this.setState({
            refreshState: state
        });
    };

    changeFollow = (shopId, shopName, flag) => {
        UserActionSvc.track('SHOP_TOGGLE_FOCUS_ON');
        let obj = {
            shopId: shopId,
            shopName: shopName,
            flag: flag
        };
        Toast.loading();
        ShopSvc.follow(obj, this.callbackSuccess, this.callbackCancel);
    };

    callbackSuccess = shopId => {
        Toast.success('关注成功');
        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
            favorFlag: 1,
            tenantId: shopId
        });
    };

    callbackCancel = shopId => {
        Toast.success('取消成功');
        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
            favorFlag: 0,
            tenantId: shopId
        });
    };
}

const styles = StyleSheet.create({});
