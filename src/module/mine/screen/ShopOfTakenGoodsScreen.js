/**
 * @author Yunliang Miao
 */
import React, { Component } from 'react';
import { View, Text } from 'react-native';

import NavigationHeader from 'component/NavigationHeader';
import ShopCell from 'module/index/screen/search/cell/ShopCell';
import EmptyView from 'component/EmptyView';
import Alert from 'component/Alert';
import { DLFlatList, RefreshState, Toast } from '@ecool/react-native-ui';

import ShopApiManager from 'apiManager/ShopApiManager';
import I18n from 'gsresource/string/i18n';
import DocSvc from 'svc/DocSvc';
import colors from 'gsresource/ui/colors';


const PAGE_SIZE = 20;

export default class ShopOfTakenGoods extends Component {
    static navigationOptions = ({ navigation }) => ({
        header: <NavigationHeader navigation={navigation} navigationTitleItem={I18n.t('shopTakeGoodsFrom')} />
    });

    constructor() {
        super();
        this.state = {
            refreshState: RefreshState.Idle,
            data: []
        };
        this.pageNo = 1;
    }

    componentDidMount() {
        this.fetchNewData();
    }

    fetchData = (refresh = true) => {
        const refreshState = this.pageNo === 1 ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing;
        this.setState({refreshState});
        ShopApiManager.getRecentShopList({pageNo: this.pageNo, pageSize: PAGE_SIZE})
            .then(({data}) => {
                const refreshState = data.rows.length === 0
                    ? RefreshState.NoMoreData
                    : RefreshState.Idle;
                let _data = this.state.data;
                if (refresh) {
                    _data = data.rows;
                } else {
                    _data = [..._data, ...data.rows];
                }
                this.setState({data: _data, refreshState});
            })
            .catch(err => {
                Alert.alert(err.message);
            });
    }

    fetchNewData = () => {
        this.pageNo = 1;
        this.fetchData();
    }

    fetchMoreData = () => {
        this.pageNo += 1;
        this.fetchData(false);
    }

    onShopItemClick = (shopId, shopName) => {
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: shopId,
            tenantName: shopName
        });
    }

    _keyExtractor = (item, index) => item.sellerId + index + '';

    _renderItem = ({item, index}) => {
        return (
            <ShopCell
                title={item.shopName}
                imgUrl={DocSvc.docURLM(item.logoPic)}
                shopId={item.sellerId}
                itemClick={this.onShopItemClick}
                address={item.detailAddr}
                favorFlag={item.favorFlag}
                labels={item.labelsContent}
                enableFollow={false}
                isOnline={item.shopFlag}
            />
        );
    }

    render() {
        return (
            <View style={{backgroundColor: colors.bg, flex: 1}}>
                <DLFlatList
                    data={this.state.data}
                    refreshState={this.state.refreshState}
                    renderItem={this._renderItem}
                    keyExtractor={this._keyExtractor}
                    onFooterRefresh={this.fetchMoreData}
                    onHeaderRefresh={this.fetchNewData}
                    ListEmptyComponent={<EmptyView />}
                />
            </View>
        );
    }
}
