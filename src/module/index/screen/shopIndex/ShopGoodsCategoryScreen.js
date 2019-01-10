/**
 * author: wwj
 * Date: 2018/8/6
 * Time: 下午2:46
 * des: 门店商品分类
 */
import React, {Component} from 'react';
import {
    View, Text, Image,
    TouchableOpacity, FlatList, Dimensions,
    SafeAreaView, Platform, NativeModules,
    ScrollView, Keyboard, StyleSheet
} from 'react-native';
import {observer, inject} from 'mobx-react';
import colors from '../../../../gsresource/ui/colors';
import SearchView from '../../../../component/SearchView';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import fonts from '../../../../gsresource/ui/fonts';
import ImageButton from '../../../../component/ImageButton';
import {Toast} from '@ecool/react-native-ui';
import SearchGoodsListScreen from '../search/SearchGoodsListScreen';
import ShopGoodsCategoryStore from '../../store/shopIndex/ShopGoodsCategoryStore';
import {GridView} from '@ecool/react-native-ui';
import StringUtl from '../../../../utl/StringUtl';
import Alert from 'component/Alert';
import WithRecommendList from 'component/WithRecommendList';

/**
 *          导航跳转所需参数
 *      tenantId: number = 店铺id
 */
const HIGHT = Dimensions.get('window').height;
@inject('searchHistoryStore')
@observer
export default class ShopGoodsCategoryScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <ColorOnlyNavigationHeader
                    backgroundColor={colors.white}
                />
            ),
        };
    };

    constructor(props) {
        super(props);

        this.state = {
            key: '',
        };
        this.store = new ShopGoodsCategoryStore();
    }

    componentDidMount() {
        this.tenantId = this.props.navigation.state.params.tenantId;


        this.queryAllCategory();
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageStart('店铺分类界面');
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android') {
            NativeModules.DLStatisticsModule.onPageEnd('店铺分类界面');
        }
        this.props.searchHistoryStore.clearSearchResult();
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: colors.bg}}>
                <WithRecommendList
                    isRecommendVisiable={this.state.isRecommendVisiable && this.props.searchHistoryStore.shouldListShow}
                    onRecommendItemClick={this.onRecommendItemClick}
                    recommendList={this.props.searchHistoryStore._recommendList}
                    text={this.state.key}
                >
                    {this.renderSearch()}
                </WithRecommendList>
                
                <FlatList
                    keyExtractor={(item, index) => item.id.toString()}
                    data={this.store.showCategoryList}
                    renderItem={({item}) => this.renderCategoryItem(item)}
                    keyboardDismissMode={'on-drag'}
                    ListEmptyComponent={this.listEmptyView}
                />
            </SafeAreaView>
        );
    }

    listEmptyView =()=>{
        return (
            <View style={{justifyContent: 'center',alignItems: 'center',height: HIGHT-40}}>
                <View>
                    <Image
                        source={require('gsresource/img/noFocusOnShop.png')}
                    />
                    <Text style={{fontSize: fonts.font12, color: '#9b9b9b', marginTop: 12,}}>没有数据哦～</Text>
                </View>
            </View>
        );
    };

    /**
     * 分类item
     * @param category
     * @returns {*}
     */
    renderCategoryItem = (category) => {
        return (
            <View style={{flexDirection: 'column', backgroundColor: 'white', marginTop: 10, paddingLeft: 14, paddingRight: 14}}>
                <TouchableOpacity
                    style={{
                        flexDirection: 'row',
                        backgroundColor: colors.white,
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 14,
                        paddingBottom: 14,
                    }}
                    onPress={() => this.goToCategoryGoodsListPage(category)}
                >
                    <Text style={{fontSize: fonts.font14, color: colors.normalFont}}>{category.name}</Text>
                    <Image source={require('gsresource/img/arrowRight.png')} />
                </TouchableOpacity>

                <GridView
                    itemEnable={true}
                    numberOFCol={2}
                    itemMarging={0}
                    items={category.subItems ? category.subItems.slice() : []}
                    renderItem={this.renderSubCategoryGridItem}
                    containerStyle={{justifyContent: 'space-between'}}
                    customItemStyle={{height: 40, width: (Dimensions.get('window').width - 34) / 2}}
                    onItemDidClick={this.goToCategoryGoodsListPage}
                    containerWidth={Dimensions.get('window').width - 28}
                />
            </View>
        );
    };

    /**
     * 子类分类item
     * @returns {*}
     */
    renderSubCategoryGridItem = (item) => {
        return (
            <View style={{borderRadius: 3}}>
                <Text
                    style={{fontSize: fonts.font12, color: '#4a4a4a', backgroundColor: colors.bg, padding: 10}}
                >{item.name}</Text>
            </View>
        );
    };

    onRecommendItemClick = (text) => {
        this.searchView.setState({text});
        this.setState({key: text}, () => {
            this.onSubmitEditing();
            Keyboard.dismiss();
        });
    }

    onTextChange = text => {
        this.setState({key: text});
        this.props.searchHistoryStore.updateRecommendList({keyword:text, tenantId: this.tenantId.toString()});
    }

    showRecommendList = () => {
        this.setState({isRecommendVisiable: true});
    }

    hideRecommendList = () => {
        this.setState({isRecommendVisiable: false});
    }

    _onFocus = () => {
        // this.historyStore.updateRecommendList(this.state.key);
        this.showRecommendList();
    }

    onSubmitEditing = () => {
        this.hideRecommendList();
        /**
         * 移除中文输入法字符间隔
         * @type {string | void | *}
         */
        const value = StringUtl.filterChineseSpace(this.state.key);
        // 搜索对应商品
        this.props.navigation.navigate('SearchGoodsListScreen', {key: value, tenantId: this.tenantId});
    }


    renderSearch = () => {
        return (
            <View
                style={{
                    flexDirection: 'row', backgroundColor: colors.white,
                    alignItems: 'center', paddingLeft: 14,
                    paddingTop: 6,
                    paddingBottom: 6,
                    borderBottomWidth: 1,
                    borderColor: colors.divide,
                }}
            >
                <ImageButton
                    hitSlop={{left: 16, right: 16, bottom: 16, top: 16}}
                    onClick={() => {
                        this.props.navigation.goBack();
                    }}
                    source={require('gsresource/img/arrowLeftGrey.png')}
                />
                <SearchView
                    ref={ins => this.searchView = ins}
                    style={{
                        flex: 1,
                        borderRadius: 4,
                        backgroundColor: colors.bg,
                        marginLeft: 18,
                        marginRight: 18,
                    }}
                    tiStyle={{fontSize: fonts.font13, backgroundColor: colors.bg}}
                    hint={'发现你要的商品'}
                    onTextChange={this.onTextChange}
                    onFocus={this._onFocus}
                    onSubmitEditing={this.onSubmitEditing}
                    isTextInput={true}
                />
            </View>

        );
    };

    /**
     * 查询全品类
     */
    queryAllCategory() {
        Toast.loading();
        let {params} = this.props.navigation.state;
        console.log('查询全品类',params);
        this.store.queryAllCategoryList(params.unitId,params.shopCid,params.tenantId,(ret, ext) => {
            if (ret) {
                Toast.dismiss();
            } else {
                Toast.dismiss();
                Alert.alert(ext);
            }
        });
    }

    /**
     * 点击店铺分类 跳转到指定分类的商品列表
     * @param category
     */
    goToCategoryGoodsListPage = (category) => {
        this.props.navigation.push('SearchGoodsListScreen', {tenantId: this.tenantId, classAccodeLike: category.accode, classAccodeName: category.name, isShowShopInfo: false});
    };
}