/**
 * @author Yunliang Miao
 */
import React, {PureComponent} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import NavigationHeader from 'component/NavigationHeader';
import GoodsItem from 'component/GoodsItem';
import EmptyView from 'component/EmptyView';
import Alert from 'component/Alert';
import {DLFlatList, RefreshState, Toast} from '@ecool/react-native-ui';
import {fetchSharedGoods} from 'apiManager/GoodsApiManager';
import I18n from 'gsresource/string/i18n';
import colors from 'gsresource/ui/colors';
import fonts from '../../../gsresource/ui/fonts';
import Image from '../../../component/Image';
import {fetchSharedFeedBack} from '../../../apiManager/GoodsApiManager';
import ImageButton from '../../../component/ImageButton';
import {getStorage, setStorage} from '../../../svc/StorageSvc';
import {IS_SHOW_SHARE_FEED_BACK} from '../../../config/Constant';


const PAGE_SIZE = 20;
const DISPLAY_MODE_SHARE = 1;
export default class MySharedGoodsScreen extends PureComponent {
    static navigationOptions = ({navigation}) => ({
        header: <NavigationHeader navigation={navigation} navigationTitleItem={I18n.t('mySharing')} />
    });

    constructor() {
        super();
        this.state = {
            refreshState: RefreshState.Idle,
            data: [],
            isShowFeedBack: false,
        };
        this.pageNo = 1;
    }

    componentDidMount() {
        this.fetchNewData();

        this.getShowOpt();
    }

    getShowOpt = async () => {
        try {
            let show = await getStorage(IS_SHOW_SHARE_FEED_BACK);

            if (show === undefined) {
                this.setState({
                    isShowFeedBack: true
                });
            } else {
                this.setState({
                    isShowFeedBack: show
                });
            }
        } catch (e) {
            this.setState({
                isShowFeedBack: true
            });
        }
    };

    fetchData = (refresh = true) => {
        const refreshState = this.pageNo === 1 ? RefreshState.HeaderRefreshing : RefreshState.FooterRefreshing;
        this.setState({refreshState});
        fetchSharedGoods({pageNo: this.pageNo, pageSize: PAGE_SIZE})
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
                this.setState({refreshState: RefreshState.Failure});
            });
    };

    fetchNewData = () => {
        this.pageNo = 1;
        this.fetchData();
    };

    fetchMoreData = () => {
        this.pageNo += 1;
        this.fetchData(false);
    };

    // onShopItemClick = (shopId, shopName) => {
    //     this.props.navigation.navigate('ShopIndexScreen', {
    //         tenantId: shopId,
    //         tenantName: shopName
    //     });
    // }

    _keyExtractor = (item, index) => index.toString();

    _renderItem = ({item}) => {
        return (
            <GoodsItem
                goods={item}
                mode={DISPLAY_MODE_SHARE}
            />
        );
    };

    render() {
        return (
            <View style={{backgroundColor: colors.bg, flex: 1}}>

                {
                    this.renderShareFeedBack()
                }

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

    renderShareFeedBack() {
        if (this.state.isShowFeedBack) {
            return (
                <View
                    style={{
                        height: 73,
                        paddingLeft: 10,
                        paddingRight: 10,
                        justifyContent: 'center',
                        backgroundColor: '#ffd00088'
                    }}
                    onPress={() => {
                        Alert.alert('反馈', '是否希望我们给您的零售店提供一个微信小程序店铺，让您的客户能在线下单并彻底提升购物体验?',
                            [
                                {
                                    text: '不需要', onPress: () => {
                                        fetchSharedFeedBack({
                                            functionType: 1,
                                            itemType: 1,
                                            itemValue: 0
                                        })
                                            .then(({data}) => {
                                                Toast.show('感谢您的反馈');
                                            })
                                            .catch(err => {
                                                Alert.alert(err.message);
                                            });
                                    }
                                },
                                {
                                    text: '需要', onPress: () => {
                                        fetchSharedFeedBack({
                                            functionType: 1,
                                            itemType: 1,
                                            itemValue: 1
                                        })
                                            .then(({data}) => {
                                                Toast.show('感谢您的反馈');
                                            })
                                            .catch(err => {
                                                Alert.alert(err.message);
                                            });
                                    }
                                }
                            ],
                            {cancelable: false}
                        );
                    }}
                >

                    <Text style={{
                        color: '#58040e',
                        position: 'absolute',
                        top: 7,
                        left: 10,
                        fontSize: fonts.font12,
                        marginRight: 30
                    }}
                    >
                        是否希望我们给您的零售店提供一个微信小程序店铺，让您的
                        客户能在线下单并提升购物体验?
                    </Text>

                    <TouchableOpacity
                        onPress={() => {
                            fetchSharedFeedBack({
                                functionType: 1,
                                itemType: 1,
                                itemValue: 1
                            })
                                .then(({data}) => {
                                    this.setState({
                                        isShowFeedBack: false,
                                    });
                                    setStorage(IS_SHOW_SHARE_FEED_BACK, false);
                                    Toast.show('感谢您的反馈');
                                })
                                .catch(err => {
                                    Alert.alert(err.message);
                                });
                        }}
                        style={{
                            position: 'absolute',
                            left: 12,
                            bottom: 7,
                            width: 50,
                            height: 20,
                            justifyContent: 'center',
                            borderRadius: 4,
                            alignItems: 'center',
                            backgroundColor: colors.white
                        }}
                    >
                        <Text style={{color: '#58040e', fontSize: fonts.font12}}>是</Text>

                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => {
                            fetchSharedFeedBack({
                                functionType: 1,
                                itemType: 1,
                                itemValue: 0
                            })
                                .then(({data}) => {
                                    this.setState({
                                        isShowFeedBack: false,
                                    });
                                    setStorage(IS_SHOW_SHARE_FEED_BACK, false);
                                    Toast.show('感谢您的反馈');
                                })
                                .catch(err => {
                                    Alert.alert(err.message);
                                });
                        }}
                        style={{
                            position: 'absolute',
                            left: 82,
                            bottom: 7,
                            width: 50,
                            height: 20,
                            borderWidth: 1,
                            borderColor: colors.white,
                            borderRadius: 4,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Text style={{color: colors.white, fontSize: fonts.font12}}>否</Text>

                    </TouchableOpacity>


                    <ImageButton
                        onClick={() => {
                            this.setState({
                                isShowFeedBack: false,
                            });
                            setStorage(IS_SHOW_SHARE_FEED_BACK, false);
                        }}
                        hitSlop={{top: 16, left: 10, bottom: 16, right: 10}}
                        style={{right: 10, position: 'absolute'}} source={require('gsresource/img/closeWhite.png')}
                    />
                </View>
            );
        } else {
            return null;
        }
    }


}
