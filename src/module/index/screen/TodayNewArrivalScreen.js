/**
 * @author Yunliang Miao
 * @create date 2018-11-16 15:15:00
 * @desc [首页今日上新页面]
 */

import React, { Component } from 'react';
import {
    View,
    SafeAreaView,
    StyleSheet,
    DeviceEventEmitter,
    NativeModules,
    Platform,
    Image,
    Text,
    TouchableOpacity,
    TextInput,
    Keyboard
} from 'react-native';
import { observer } from 'mobx-react';
import NewArrivalStore from '../store/NewArrivalStore';


import { DLFlatList, RefreshState } from '@ecool/react-native-ui';
import WithRecommendList from 'component/WithRecommendList';
import ColorOnlyNavigationHeader from 'component/ColorOnlyNavigationHeader';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import GoodsItem from 'module/goods/widget/GoodsItem';
import NavigationHeader from 'component/NavigationHeader';
import EmptyView from 'component/EmptyView';
import Alert from 'component/Alert';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import StringUtl from 'utl/StringUtl';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import {VIEWABILITY_CONFIG} from './IndexScreen';

@observer
export default class TodayNewArrivalScreen extends Component {
    static navigationOptions = ({ navigation }) => ({
        header: <ColorOnlyNavigationHeader backgroundColor={colors.white} statusBarStyle={'dark-content'} />
    });

    constructor() {
        super();
        this.store = new NewArrivalStore();
        this.state = {
            refreshState: RefreshState.Idle,
            shopMsg: {},
            isSearchMode: false, // 是否处于搜索模式
            text: '',
            isRecommendVisiable: false
        };
        this.isSearched = false; // 是否进行过关键字搜索
        this.searchText = ''; // 手动刷新时的搜索关键字
        
        // this.layoutMemo = [];
    }

    addListener() {
        this.deEmitter = DeviceEventEmitter.addListener(GOODS_ITEM_CHANGE, ({ key, data }) => {
            switch (key) {
            case GOODS_ITEM_DELETE: {
                let { goodsId } = data;
                this.store.deleteGoodsItem(goodsId);
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
                this.store.toggleFavorClick(goodsId, spuFavorNum, spuFavorFlag);
                break;
            }
            }
        });
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('今日上新');
        }
    }

    componentDidMount() {
        this.addListener();
        this.onHeaderRefresh();
    }

    componentWillUnmount() {
        this.deEmitter && this.deEmitter.remove();
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('今日上新');
        }
    }

    onHeaderRefresh = async (options) => {
        this.setState({
            refreshState: RefreshState.HeaderRefreshing
        });
        try {
            const text = typeof options === 'object' && options !== null && options.hasOwnProperty('text')
                ? options.text
                : this.searchText;
            await this.store.fetchTodayNewArrvialList(text);
        } catch (error) {
            Alert.alert(error.message);
        }
        this.setState({
            refreshState: RefreshState.Idle
        }, () => {
            this.scrollView.scrollToOffset({offset: 0});
        });
        if (this.store.noMore === true && this.store.data.length > 0) {
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
            await this.store.fetchMoreTodayNewArrivalList();
        } catch (error) {
            Alert.alert(error.message);
        }
        if (this.store.noMore === true && this.store.data.length > 0) {
            this.setState({
                refreshState: RefreshState.NoMoreData
            });
        } else {
            this.setState({
                refreshState: RefreshState.Idle
            });
        }
    };

    onCellClick = goods => {
        this.setState({ shopMsg: goods }, () => {
            this.goodsBuy.goodsBuyShow(goods.detailUrl);
        });
    };

    showSearchBar = () => {
        this.setState({isSearchMode: true});
    }

    hideSearchBar = () => {
        this.setState({isSearchMode: false, text: '', isRecommendVisiable: false}, () => {
            this.searchText = '';
            this.isSearched && this.onHeaderRefresh();
            this.isSearched = false;
        });
    }

    onTextChange = (text) => {
        const value = StringUtl.filterChineseSpace(text);
        this.setState({text: value});
        this.store.updateRecommendList({keyword: text}); // 
    }

    onSubmitEditing = () => {
        this.hideRecommendList();
        this.isSearched = true;
        this.searchText = this.state.text;
        this.onHeaderRefresh({text: this.state.text});
    }

    // 图片128 256
    // 414 + 15 + 5 + 5 + 5
    // 1 => 268 
    // 3 => 524 + 15 + 5 + 5 + 5
    getItemLayout = (data, index) => {
        // console.log(data, 'datatata');
        const docContent = JSON.parse(data[index].docContent);
        let lineNum = Math.ceil(docContent.length / 3);
        lineNum = Math.max(lineNum, 3);
        const length = 140 + lineNum * 128;
        this.layoutMemo[index] = length;
        let offset = 0;
        for (let i = 0; i < index; i++ ) {
            offset += this.layoutMemo[index];
        }
        return {
            length,
            offset,
            index
        };
    }

    goodsBuyRef = ref => this.goodsBuy = ref;

    keyExtractor = (item, index) => index.toString();

    onRecommendItemClick = (text) => {
        // this.hideRecommendList();
        this.setState({text}, () => {
            this.onSubmitEditing();
            Keyboard.dismiss();
            this.textInput.blur();
            // this.store.clearRecommendList();
        });
    };

    showRecommendList = () => {
        this.setState({isRecommendVisiable: true});
    };

    hideRecommendList = () => {
        this.setState({isRecommendVisiable: false});
    };

    _onFocus = () => {
        this.store.updateRecommendList({keyword: this.state.text});
        this.showRecommendList();
    };

    renderInputCloseImg = () => {
        if (this.state.text) {
            return (
                <TouchableOpacity
                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                    onPress={() => {
                        this.setState({text: '', isRecommendVisiable: false});
                    }}
                >
                    <Image
                        style={{marginLeft: 10, marginRight: 10}}
                        source={require('gsresource/img/delete.png')}

                    />
                </TouchableOpacity>
            );
        }
    };

    renderSearchBar = () => {
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.textInput}
                    autoFocus={true}
                    onChangeText={this.onTextChange}
                    maxLength={20}
                    underlineColorAndroid={'transparent'}
                    placeholderTextColor={colors.greyFont}
                    autoCorrect={false}
                    multiline={false}
                    value={this.state.text}
                    placeholder={'搜索你想要的商品'}
                    returnKeyType={'search'}
                    onSubmitEditing={this.onSubmitEditing}
                    onFocus={this._onFocus}
                    ref={view => (this.textInput = view)}
                />
                {this.renderInputCloseImg()}
            </View>
           
        );
    };

    renderTitle = () => {
        return <Text style={styles.title}>{I18n.t('TodayNewest')}</Text>;
    };

    renderCancelText = () => {
        return (
            <TouchableOpacity onPress={this.hideSearchBar}>
                <Text style={[styles.cancelText, styles.searchIcon]}>{I18n.t('cancel')}</Text>
            </TouchableOpacity>
        );
    };

    renderSearchIcon = () => {
        return (
            <TouchableOpacity style={styles.searchIcon} onPress={this.showSearchBar}>
                <Image source={require('gsresource/img/searchBig.png')} />
            </TouchableOpacity>
        );
    };

    renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <View style={styles.headerWrapper}>
                    <TouchableOpacity
                        style={{ marginLeft: 6, padding: 10 }}
                        // hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onPress={() => {
                            this.props.navigation.goBack();
                        }}
                    >
                        <Image source={require('gsresource/img/arrowLeftGrey.png')} />
                    </TouchableOpacity>

                    {this.state.isSearchMode ? this.renderSearchBar() : this.renderTitle()}
                    {this.state.isSearchMode ? this.renderCancelText() : this.renderSearchIcon()}
                </View>
            </View>
        );
    };

    /**
     * 空白
     */
    renderEmpty = () => <EmptyView emptyViewType={'NODATA'} />

    /**
     * 渲染列表cell
     */
    renderCell = ({item}) => {
        return <GoodsItem goods={item} buyClick={this.onCellClick} />;
    };

    //列表滚动变化事件
    _onViewableItemsChanged = (changed) => {
        // console.log(changed);
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <WithRecommendList
                    onRecommendItemClick={this.onRecommendItemClick}
                    text={this.state.text}
                    isRecommendVisiable={this.store.shouldListShow && this.state.isRecommendVisiable}
                    recommendList={this.store._recommendList}
                    // containerStyle={{flex: 1, height: 28}}
                >
                    {this.renderHeader()}
                </WithRecommendList>
                <View />
                <DLFlatList
                    data={this.store.list}
                    renderItem={this.renderCell}
                    onHeaderRefresh={this.onHeaderRefresh}
                    onFooterRefresh={this.onFooterRefresh}
                    refreshState={this.state.refreshState}
                    keyExtractor={this.keyExtractor}
                    ListEmptyComponent={this.renderEmpty}
                    scrollEventThrottle={500}
                    removeClippedSubviews={Platform.OS === 'android'}
                    onViewableItemsChanged={this._onViewableItemsChanged}
                    viewabilityConfig={VIEWABILITY_CONFIG}
                    listRef={ref => this.scrollView = ref}
                    windowSize={80}
                    updateCellsBatchingPeriod={100}
                />
                {/*购买弹出窗口*/}
                <GoodsBuy
                    onRef={this.goodsBuyRef}
                    shopMsg={this.state.shopMsg}
                />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },
    headerContainer: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center'
    },
    headerWrapper: {
        flex: 1,
        paddingHorizontal: 6,
        flexDirection: 'row',
        backgroundColor: colors.white,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    searchIcon: {
        padding: 10
    },
    title: {
        fontSize: 18,
        color: colors.normalFont
    },
    inputContainer: {
        flex: 1,
        height: 28,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bg,
    },
    textInput: {
        flex: 1,
        color: colors.normalFont,
        padding: 0,
        paddingLeft: 5,
        backgroundColor: colors.bg,
        height: 28,
        fontSize: 13
    },
    cancelText: {
        color: colors.greyFont
    }
});
