/**
 * author: tuhui
 * Date: 2018/7/23
 * Time: 15:49
 * des: 搜索历史lab
 */

import React, {Component} from 'react';
import {
    StyleSheet, Dimensions, TouchableOpacity,
    SafeAreaView, View, TextInput, Text,
    DeviceEventEmitter, Platform, NativeModules,
    ScrollView, Keyboard,
} from 'react-native';
import colors from '../../../../gsresource/ui/colors';
import TextButton from '../../../../component/TextButton';
import DividerLineH from '../../../../component/DividerLineH';
import {TabsView, Toast} from '@ecool/react-native-ui';
import {observer, inject} from 'mobx-react';
import fonts from '../../../../gsresource/ui/fonts';
import Image from '../../../../component/Image';
import TagSelect from '../../../../component/tag/TagSelect';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import WithRecommendList from 'component/WithRecommendList';
import UserActionSvc from 'svc/UserActionSvc';
import StringUtl from '../../../../utl/StringUtl';
import GoodsItem from '../../../goods/widget/GoodsItem';
import ShopCell from './cell/ShopCell';
import DocSvc from '../../../../svc/DocSvc';
import GoodsBuy from '../../../goods/widget/GoodsBuy';
import ShopSvc from 'svc/ShopSvc';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import PropTypes from 'prop-types';
import GoodsSearchStore from '../../store/GoodsSearchStore';
import ShopSearchStore from '../../store/ShopSearchStore';
import {OrderByType} from '../../widget/search/SearchSortView';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh';
import SearchGoodsResultView from '../../widget/search/SearchGoodsResultView';
import SearchShopResultView from '../../widget/search/SearchShopResultView';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

@inject('searchHistoryStore')
@observer
export default class SearchHistoryScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param mode 不传/0:显示商品+店铺 1:只显示商品
         */
        navigation: PropTypes.object,
    };

    static navigationOptions = () => {

        return {
            header: (
                <ColorOnlyNavigationHeader
                    statusBarStyle={'dark-content'}
                    backgroundColor={colors.white}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.store = this.props.searchHistoryStore;

        this.goodsSearchStore = new GoodsSearchStore();
        this.shopSearchStore = new ShopSearchStore();

        this.state = ({
            text: '',
            tabIndex: 0,
            // goods购买专用
            shopMsg: {},
            // 是否展示搜索结果页面
            isShowResult: false,
            goodsOrderBy: OrderByType.DEFAULT,
            goodsListFreshState: RefreshState.Idle,
            shopListFreshState: RefreshState.Idle,
            // searchHeight: 0,
            isRecommendVisiable: false
        });
        this.goodsOrderByDesc = true;
        this.store.loadSearchHistoryTag();
    }

    componentDidMount() {
        // 下级搜索页面搜索关键字改变时，搜索历史页面搜索框中的字也进行监听变化
        this.deEmiter = DeviceEventEmitter.addListener('search_history_text_change', (newText) => {
            this.setState({text: newText});
        });
        this.foucsEmitter = DeviceEventEmitter.addListener(GOODS_ITEM_CHANGE,
            ({key, data}) => {
                switch (key) {
                case TOGGLE_SHOP_FOCUS_ON_SHOP: {
                    let {tenantId, favorFlag} = data;
                    this.store.changeFlag(tenantId);
                    break;
                }
                case CHANGE_GOODS_WATCH_NUMBER: {
                    let {goodsId, viewNum} = data;
                    this.store.updateViewNumByGoodsId(goodsId);
                    break;
                }
                case CHANGE_GOODS_STAR_NUMBER_STATE: {
                    let {goodsId, praiseFlag, praiseNum} = data;
                    this.store.updateStarNumByGoodsId(goodsId, praiseFlag, praiseNum);
                    break;
                }
                case CHANGE_GOODS_FAVOR_NUMBER_STATE: {
                    let {goodsId, spuFavorFlag, spuFavorNum} = data;
                    this.store.updateFavorNumByGoodsId(goodsId, spuFavorNum, spuFavorFlag);
                    break;
                }
                default: {
                    console.log('this is other function', key);
                }
                }
            }
        );
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('搜索历史界面');
        }
    }

    componentWillUnmount() {
        this.store.saveSearchHistoryTag();
        this.deEmiter.remove();
        this.foucsEmitter.remove();
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('搜索历史界面');
        }
        this.store.clearSearchResult();
    }

    onRecommendItemClick = (text) => {
        this.setState({text}, () => {
            this.onSubmitEditing();
            Keyboard.dismiss();
            this.textInput.blur();
            // this.store.clearRecommendList();
        });
    };

    onTextChange = text => {
        this.setState({text});
        if (!text) {
            this.store.clearSearchResult();
            this.setState({isShowResult: false});
        }
        this.store.updateRecommendList({keyword: text});
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

    renderGoodsCell = ({item}) => {
        if (item) {
            return (
                <GoodsItem
                    key={item.id}
                    goods={item}
                    isShowShopInfo={false}
                    buyClick={() => {
                        this.setState({shopMsg: item}, () => {
                            this.goodsBuy.goodsBuyShow(item.detailUrl);
                        });
                    }}
                />
            );
        }
    };

    renderShopCell = ({item, index}) => {
        let labelData = [];
        if (item && item.ecCaption && item.ecCaption.labels) {
            labelData = item.ecCaption.labels.slice();
        }
        return (
            <ShopCell
                style={{minHeight:70}}
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
    };

    shopClick = (shopId, shopName) => {
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: shopId,
            tenantName: shopName
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
        /**
         * 移除中文输入法字符间隔
         * @type {string | void | *}
         */
        const value = StringUtl.filterChineseSpace(this.state.text);
        // this.store.hideRecommendList();
        // runInAction(() => {
        //     this.store.isRecommendVisiable = false;
        // })
        this.hideRecommendList();
        this.store.updateRecommendList({keyword: value});
        this.querySearchKeyData(value);
    };

    loadGoodsData = (fresh) => {
        if (this.searchGoodsView) {
            this.searchGoodsView.searchResult(fresh, this.state.text);
        }
    };

    loadShopData = (fresh) => {
        if (this.searchShopView) {
            this.searchShopView.searchResult(fresh, this.state.text);
        }
    };

    querySearchKeyData = async (text) => {
        let textString = text.trim();
        if (textString !== '') {
            this.store.saveSearchHistoryMemory(textString);
            this.store.saveSearchHistoryTag();
        }
        this.store.queryGoodsAndShop(textString, this.state.tabIndex, (result, ext) => {
            this.setState({isShowResult: true}, () => {
                if (result) {
                    // this.setState({
                    //     tabIndex: ext,
                    // }, () => {
                    //     this.tabsview.gotoIndex(ext);
                    // });
                }
            });
            this.loadGoodsData(true);
            this.loadShopData(true);
            Toast.dismiss();
        });
    };

    /**
     * 切换tab页面
     * @param index
     */
    scrollTab = (index) => {
        this.scrollview.scrollTo({x: index * WIDTH, animated: true});
    };

    onAnimatinonEnd(e) {
        let index = this.state.tabIndex;
        // this.onLoading(index);
    }

    renderSingleShop = () => {
        let item = this.store.getSingleShopItem();

        if (item) {
            return (
                <View style={{minHeight: 70, flexDirection: 'column'}}>
                    {
                        this.renderShopCell({item})
                    }

                    <DividerLineH />
                </View>

            );
        } else {
            return null;
        }

    };

    renderTab = () => {
        return (
            <View style={{flexDirection: 'row'}}>
                <TabsView
                    ref={(ref) => this.tabsview = ref}
                    containerStyle={{
                        borderColor: colors.transparent,
                        backgroundColor: colors.white,
                        width: WIDTH,
                        alignItems: 'center',
                        height: 40,
                    }}
                    tabItemStyle={{}}
                    underlineStyle={{
                        height: 2,
                        backgroundColor: colors.activeFont,
                    }}
                    tabItemTextTyle={{
                        fontSize: 14,
                    }}
                    activeTextColor={colors.activeFont}
                    defaultTextColor={colors.normalFont}
                    activeItemIndex={this.state.tabIndex}
                    items={this.store.typeTabShow}
                    goToPage={(index, item) => {
                        this.setState({
                            tabIndex: index,
                        }, () => {
                            this.scrollTab(index);
                        });
                    }}
                />
            </View>
        );
    };

    renderHistoryTip = () => {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                marginLeft: 16,
                marginRight: 16
            }}
            >
                <Text style={{fontSize: fonts.font14, color: colors.normalFont}}>搜索历史</Text>

                <TouchableOpacity
                    onPress={() => {
                        this.store.clearSearchHistory();
                    }}
                    style={{flexDirection: 'row', alignItems: 'center'}}
                >
                    <Text style={{color: colors.greyFont, fontSize: fonts.font14}}>清空</Text>
                    <Image source={require('gsresource/img/delete.png')} />
                </TouchableOpacity>
            </View>
        );
    };

    /**
     * 搜索历史tag
     */
    renderTag() {
        return (
            <TagSelect
                data={this.store.historyTagShow}
                containerStyle={{marginTop: 15}}
                onPress={(text) => {
                    this.setState({text}, () => {
                        this.querySearchKeyData(this.state.text);
                    });
                }}
            />
        );
    }

    renderInputCloseImg = () => {
        if (this.state.text) {
            return (
                <TouchableOpacity
                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                    onPress={() => {
                        this.setState({text: '', isShowResult: false});
                        this.store.clearSearchResult();
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

    renderSearchTitle() {
        return (
            <View
                style={{flexDirection: 'row', height: 44, alignItems: 'center', backgroundColor: colors.white}}
            >
                <TouchableOpacity
                    hitSlop={{left: 16, right: 16, top: 16, bottom: 16}}
                    style={{marginLeft: 16}}
                    onPress={() => {
                        this.props.navigation.goBack();
                    }}
                >
                    <Image source={require('gsresource/img/arrowLeftGrey.png')} />
                </TouchableOpacity>
                <View style={styles.tiContainer}>
                    <TextInput
                        style={styles.ti}
                        autoFocus={true}
                        onChangeText={this.onTextChange}
                        maxLength={20}
                        underlineColorAndroid={'transparent'}
                        placeholderTextColor={colors.greyFont}
                        autoCorrect={false}
                        multiline={false}
                        value={this.state.text}
                        placeholder={'请输入名称'}
                        returnKeyType={'search'}
                        onSubmitEditing={this.onSubmitEditing}
                        onFocus={this._onFocus}
                        ref={view => this.textInput = view}
                    />
                    {this.renderInputCloseImg()}
                </View>

                <TextButton
                    textStyle={{color: colors.normalFont, fontSize: 14}}
                    style={{paddingLeft: 8, paddingRight: 8, height: 44}}
                    text={'搜索'}
                    onPress={() => {
                        this.setState({isShowResult: true, isRecommendVisiable: false});
                        this.querySearchKeyData(this.state.text);
                        Keyboard.dismiss();
                    }}
                />

            </View>
        );
    }

    renderContent = () => {
        return (
            <View style={{flex: 1}}>
                <ScrollView
                    style={{flex: 1}}
                    ref={(ref) => {
                        this.scrollview = ref;
                    }}
                    pagingEnabled={true}
                    scrollEnabled={false}
                    horizontal={true}
                    bounces={false}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => this.onAnimatinonEnd(e)}
                >
                    {this.renderGoodsResultArea()}
                    {this.renderShopResultArea()}
                </ScrollView>
                {
                    !this.state.isShowResult &&
                    <View style={{position: 'absolute', backgroundColor: colors.bg, width: WIDTH, height: HEIGHT}}>
                        {this.renderHistoryTip()}
                        {this.renderTag()}
                    </View>
                }
            </View>
        );
    };

    // 展示商品搜索结果区域
    renderGoodsResultArea = () => {
        return (
            <View style={{flex: 1, width: WIDTH}}>
                <SearchGoodsResultView
                    ref={(ref) => this.searchGoodsView = ref}
                    key={this.state.key}
                />
            </View>
        );
    };

    renderShopResultArea = () => {
        return (
            <View style={{position: 'relative', flex: 1, width: WIDTH}}>
                <SearchShopResultView
                    ref={(ref) => this.searchShopView = ref}
                />
            </View>
        );
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <WithRecommendList
                    text={this.state.text}
                    onRecommendItemClick={this.onRecommendItemClick}
                    recommendList={this.store._recommendList}
                    isRecommendVisiable={this.store.shouldListShow && this.state.isRecommendVisiable}
                >
                    {this.renderSearchTitle()}
                </WithRecommendList>

                {this.state.tabIndex === 0 && this.renderSingleShop()}

                {this.renderTab()}
                {this.renderContent()}
                <GoodsBuy
                    onRef={(goodsBuy) => {
                        this.goodsBuy = goodsBuy;
                    }}
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
    tiContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: colors.bg,
        alignItems: 'center',
        marginLeft: 16,
    },
    ti: {
        flex: 1,
        fontSize: 13,
        height: 28,
        backgroundColor: colors.bg,
        color: colors.normalFont,
        padding: 0,
        paddingLeft: 10
    },
});