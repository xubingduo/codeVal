/**
 * author: tuhui
 * Date: 2018/7/17
 * Time: 08:40
 * des:
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Platform,
    Dimensions,
    SafeAreaView,
    View,
    Text
} from 'react-native';
import {DLFlatList, Toast, RefreshState} from '@ecool/react-native-ui';
import {observer, inject} from 'mobx-react';
import PropTypes from 'prop-types';
import ShoppingCartCell from './ShoppingCartCell';
import colors from '../../../gsresource/ui/colors';
import Image from '../../../component/Image';
import TextButton from '../../../component/TextButton';
import DividerLineH from '../../../component/DividerLineH';
import fonts from '../../../gsresource/ui/fonts';
import ShoppingCartCellSpu from './ShoppingCartCellSpu';
import ImageButton from '../../../component/ImageButton';
import StatusButton from '../../../component/StatusButton';
import Alert from '../../../component/Alert';
import ShoppingCartEmptyView from '../widget/ShoppingCartEmptyView';
import BillingConfirmScreen from '../../bill/screen/BillingConfirmScreen';
import UserActionSvc from 'svc/UserActionSvc';
import PopCoupon from '../../coupon/widget/PopCoupon';
import NavigationHeader from '../../../component/NavigationHeader';
import ColorOnlyNavigationHeader from '../../../component/ColorOnlyNavigationHeader';
import ShopSvc from '../../../svc/ShopSvc';
import NavigationSvc from '../../../svc/NavigationSvc';
import GoodDetailScreen from '../../goods/screen/GoodDetailScreen';
import GoodsSvc, {genGoodsDetailUrl} from '../../../svc/GoodsSvc';
import {VIEWABILITY_CONFIG} from '../../index/screen/IndexScreen';
import AuthService from '../../../svc/AuthService';
import CountDown from '../../../component/CountDown';

const WIDTH = Dimensions.get('window').width;

// 销售模式，普通，童装普通，童装批发
const NORMAL = 0;
const CHILD_NORMAL = 1;
const CHILD_GROUP = 2;

const propTypes = {
    shoppingCartStore: PropTypes.object,
    /**
     * 是否在tab中展示
     * 可用于判断是否展示返回的箭头
     * 当作为tab的时候是不需要箭头,
     * 在包裹类中展示购物车 需要返回箭头
     */
    inTab: PropTypes.bool,
    /**
     * 箭头点击回调
     */
    onArrowClick: PropTypes.func,

    navigation: PropTypes.object
};

@inject('shoppingCartStore')
@observer
class ShoppingCartScreen extends Component {
    static defaultProps = {
        inTab: true
    };

    constructor() {
        super();
        this.state = {
            listFreshState: RefreshState.Idle,
            // 是否展示顶部的提示区域
            isShowTopTip: false
        };
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeader()}
                <DividerLineH />

                {/*{*/}
                {/*this.state.isShowTopTip &&*/}
                {/*this.renderInvShortageTip()*/}
                {/*}*/}

                {this.renderList()}
                {this.props.shoppingCartStore.goodsArrShow.length !== 0 &&
                this.renderBottom()}

                {/*领券弹出窗口*/}
                <PopCoupon
                    ref={ref => {
                        this.popCoupon = ref;
                    }}
                    data={this.props.shoppingCartStore.couponsListShow}
                    refreshState={0}
                    onclickBtn={item => {
                        //console.warn(item);
                    }}
                />
            </SafeAreaView>
        );
    }

    componentDidMount() {
        if (this.props.inTab) {
            this.setLoadState(RefreshState.HeaderRefreshing);
            this.props.shoppingCartStore.requestShoppingCart((ret, extra) => {
                this.setLoadState(RefreshState.Idle);
                if (!ret) {
                    Toast.show(extra);
                }

                try {
                    this.props.shoppingCartStore.querySellerCanGetCoupons();
                } catch (e) {
                    Alert.alert(e.message);
                }
            });
        }
    }

    setLoadState = state => {
        this.setState({
            listFreshState: state
        });
    };

    /**
     * header
     * @returns {*}
     */
    renderHeader = () => {
        return (
            <View
                style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: 40,
                    flexDirection: 'row',
                    backgroundColor: colors.white
                }}
            >
                {!this.props.inTab && (
                    <TouchableOpacity
                        style={{position: 'absolute', left: 16}}
                        hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                        onPress={this.props.onArrowClick}
                    >
                        <View style={styles.leftItemWrap}>
                            <View style={{flexDirection: 'row'}}>
                                <Image
                                    source={require('gsresource/img/backGray.png')}
                                />
                            </View>
                        </View>
                    </TouchableOpacity>
                )}

                <Text
                    style={{fontSize: fonts.font18, color: colors.activeFont}}
                >
                    {`进货车(${this.props.shoppingCartStore.getAllCountShow})`}
                </Text>

                <View
                    style={{
                        flexDirection: 'row',
                        position: 'absolute',
                        right: 10,
                        alignItems: 'center'
                    }}
                >
                    <TextButton
                        hitSlop={{top: 16, left: 10, bottom: 16, right: 10}}
                        onPress={() => {
                            this.props.shoppingCartStore.toggleSpu();
                        }}
                        textStyle={{
                            color: colors.normalFont,
                            fontSize: fonts.font14
                        }}
                        text={
                            this.props.shoppingCartStore.toggle
                                ? '展开'
                                : '收起'
                        }
                    />

                    <View
                        style={{
                            backgroundColor: colors.border1,
                            height: 13,
                            width: 1,
                            marginLeft: 4,
                            marginRight: 4
                        }}
                    />

                    <TextButton
                        hitSlop={{top: 16, left: 10, bottom: 16, right: 10}}
                        onPress={() => {
                            this.props.shoppingCartStore.setManage(
                                !this.props.shoppingCartStore.manage
                            );
                            this.props.shoppingCartStore.clearAllCheck();
                        }}
                        textStyle={{
                            color: colors.normalFont,
                            fontSize: fonts.font14
                        }}
                        text={
                            this.props.shoppingCartStore.manage
                                ? '完成'
                                : '管理'
                        }
                    />
                </View>
            </View>
        );
    };


    onTipsClick = () => {
        this.props.shoppingCartStore.setCloseTips();
    };

    /**
     * 底部操作栏
     * @returns {*}
     */
    renderBottom() {
        let isShowTips = this.props.shoppingCartStore.isSingleFog || this.props.shoppingCartStore.isCombinative;
        let tips;

        if (this.props.shoppingCartStore.isSingleFog && this.props.shoppingCartStore.isCombinative) {
            tips = `已为您开启一件代发与合包服务，预计节省运费￥${this.props.shoppingCartStore.feeAmount}`;
        } else if (this.props.shoppingCartStore.isSingleFog) {
            tips = `已为您开启一件代发，预计节省运费￥${this.props.shoppingCartStore.feeAmount}`;
        } else if (this.props.shoppingCartStore.isCombinative) {
            tips = `已为您开启合包服务，预计节省运费￥${this.props.shoppingCartStore.feeAmount}`;
        }

        return (
            <View style={{}}>
                {
                    isShowTips &&
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            height: 34,
                            backgroundColor: colors.orderColor,
                            justifyContent: 'space-between',
                            paddingLeft: 10,
                            paddingRight: 16
                        }}
                    >

                        <Text
                            style={{color: colors.darkRed, fontSize: fonts.font12}}
                        >
                            {
                                tips
                            }
                        </Text>

                        <ImageButton
                            hitSlop={{left: 10, right: 10, bottom: 10, top: 10}}
                            onClick={() => {
                                this.onTipsClick();
                            }
                            }
                            source={require('gsresource/img/closeWhite.png')}
                        />


                    </View>
                }

                <DividerLineH />
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 50,
                        backgroundColor: colors.white,
                        justifyContent: 'space-between'
                    }}
                >
                    <TouchableOpacity
                        hitSlop={{top: 16, left: 16, bottom: 16, right: 20}}
                        style={{
                            flexDirection: 'row',
                            marginLeft: 16,
                            alignItems: 'center'
                        }}
                        onPress={() => {
                            this.props.shoppingCartStore.checkAll(
                                !this.props.shoppingCartStore.isAllChecked,
                            );
                        }}
                    >
                        <Image
                            source={
                                this.props.shoppingCartStore.isAllChecked
                                    ? require('gsresource/img/check.png')
                                    : require('gsresource/img/unCheck.png')
                            }
                        />
                        <Text
                            style={{
                                marginLeft: 4,
                                color: colors.normalFont,
                                fontSize: fonts.font12
                            }}
                        >
                            全选
                        </Text>
                    </TouchableOpacity>

                    <View
                        style={{flexDirection: 'row', alignItems: 'center'}}
                    >
                        {!this.props.shoppingCartStore.manage && (
                            <View style={{alignItems: 'flex-end'}}>
                                <Text
                                    style={{
                                        color: colors.normalFont,
                                        fontSize: fonts.font12
                                    }}
                                >
                                    合计:
                                    <Text
                                        style={{
                                            color: colors.activeFont,
                                            fontSize: fonts.font12
                                        }}
                                    >
                                        {`¥${
                                            this.props.shoppingCartStore
                                                .totalCheckMoney
                                        }`}
                                    </Text>
                                </Text>

                                <Text
                                    style={{
                                        color: colors.greyFont,
                                        fontSize: fonts.font12
                                    }}
                                >
                                    {`${
                                        this.props.shoppingCartStore
                                            .totalCheckGoodsCount
                                    }件;不含运费`}
                                </Text>
                            </View>
                        )}

                        <StatusButton
                            text={
                                this.props.shoppingCartStore.manage
                                    ? '删除'
                                    : '立即下单'
                            }
                            onItemClick={() => {
                                if (this.props.shoppingCartStore.manage) {
                                    Alert.alert(
                                        '提示',
                                        '是否删除商品',
                                        [
                                            {
                                                text: '取消',
                                                onPress: () => {
                                                }
                                            },
                                            {
                                                text: '确定',
                                                onPress: () => {
                                                    this.props.shoppingCartStore.deleteGoodsBatchToShoppingCart(
                                                        this.props.shoppingCartStore.getAllCheckedIds(),
                                                        (ret, extra) => {
                                                            if (ret) {
                                                                this.props.shoppingCartStore.deleteChecked();
                                                                Toast.show(
                                                                    '商品删除成功'
                                                                );
                                                            } else {
                                                                Alert.alert(
                                                                    extra
                                                                );
                                                            }
                                                            UserActionSvc.track(
                                                                'CART_GOODS_DELETE'
                                                            );
                                                        }
                                                    );
                                                }
                                            }
                                        ],
                                        {cancelable: false}
                                    );
                                } else {
                                    // this.props.navigation.navigate('ChoicePayMethodScreen', {fromShoppingCart: true});
                                    UserActionSvc.track('CART_PAY');
                                    //判断是否审核通过
                                    // if (AuthService.isBuyAuthed()) {
                                    // this.props.navigation.navigate('ChoicePayMethodScreen', {fromShoppingCart: true});
                                    UserActionSvc.track('CART_PAY');
                                    this.props.navigation.navigate(
                                        'BillingConfirmScreen',
                                        {fromShoppingCart: true}
                                    );
                                    // }
                                }
                            }}
                            checked={this.props.shoppingCartStore.isAnyChecked}
                            style={{
                                width: 100,
                                height: 38,
                                marginRight: 6,
                                marginLeft: 10
                            }}
                        />
                    </View>
                </View>
            </View>
        );
    }

    /**
     * 列表
     * @returns {*}
     */
    renderList = () => {
        return (
            <DLFlatList
                keyExtractor={this.keyExtractor}
                renderItem={this.renderCell}
                renderSectionHeader={this.renderSectionHeader}
                mode={'SectionList'}
                refreshState={this.state.listFreshState}
                sections={this.props.shoppingCartStore.goodsArrShow}
                renderSectionFooter={this.spuFooter}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
                ListEmptyComponent={this.listEmptyView}
                stickySectionHeadersEnabled={true}
            />
        );
    };

    /**
     * 库存不足的提示
     * @returns {*}
     */
    renderInvShortageTip = () => {
        return (
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: colors.fontHint,
                    paddingLeft: 16,
                    paddingRight: 10,
                    paddingTop: 8,
                    paddingBottom: 8
                }}
            >
                <Text style={{fontSize: fonts.font12, color: colors.white}}>
                    {'红色数字表示当前商品库存不足，已切换至最大库存数量'}
                </Text>
                <ImageButton
                    hitSlop={{left: 10, right: 10, bottom: 10, top: 10}}
                    source={require('gsresource/img/deleteWhite.png')}
                    onClick={() => {
                        this.setState({isShowTopTip: false});
                    }}
                />
            </View>
        );
    };

    listEmptyView = () => {
        return (
            <ShoppingCartEmptyView
                onItemClick={() => {
                    this.props.navigation.navigate('IndexScreen');
                }}
            />
        );
    };

    /**
     * 店铺尾部
     * @param section
     * @returns {*}
     */
    spuFooter = ({section}) => {
        if (this.props.shoppingCartStore.toggle) {
            let shopSummary = this.props.shoppingCartStore.computedShopSummary(
                section.tenantId
            );
            return (
                <View style={{backgroundColor: colors.white}}>
                    <DividerLineH />
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'flex-end',
                            minHeight: 20,
                            paddingRight: 16,
                            alignItems: 'center'
                        }}
                    >
                        <Text
                            style={{
                                color: colors.normalFont,
                                fontSize: fonts.font12
                            }}
                        >
                            {`${shopSummary.goodsCount}件`}
                        </Text>

                        <View
                            style={{
                                backgroundColor: colors.divide,
                                width: 1,
                                height: 16,
                                marginRight: 10,
                                marginLeft: 10
                            }}
                        />

                        <Text
                            style={{
                                color: colors.activeFont,
                                fontSize: fonts.font14
                            }}
                        >
                            {`¥${shopSummary.priceTotal}`}
                        </Text>
                    </View>
                    <DividerLineH />
                </View>
            );
        } else {
            return null;
        }
    };

    /**
     * 店铺头部
     * @param section
     * @returns {*}
     */
    renderSectionHeader = ({section}) => {
        return (
            <View
                style={{
                    backgroundColor: colors.white
                }}
            >
                {!this.props.shoppingCartStore.isFirstShop(
                    section.tenantId
                ) && (
                    <View style={{height: 10, backgroundColor: colors.bg}} />
                )}

                <TouchableOpacity
                    activeOpacity={0.5}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: colors.white,
                        paddingLeft: 16,
                        paddingRight: 20,
                        height: 40
                    }}
                    onPress={() => {
                        if (section && section.tenantId) {
                            this.props.navigation.push('ShopIndexScreen', {
                                tenantId: section.tenantId
                            });
                        }
                    }}
                >
                    <ImageButton
                        hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                        onClick={() => {
                            this.props.shoppingCartStore.checkShop(
                                !section.checked,
                                section.tenantId,
                                this.props.shoppingCartStore.manage
                            );
                        }}
                        source={
                            section.checked
                                ? require('gsresource/img/check.png')
                                : require('gsresource/img/unCheck.png')
                        }
                    />

                    <View
                        style={{
                            alignItems: 'center',
                            flexDirection: 'row',
                            width: WIDTH - 100 - 43,
                            marginLeft: 12
                        }}
                    >

                        <Text
                            style={{
                                fontSize: fonts.font14,
                                color: colors.normalFont,
                            }}
                            numberOfLines={1}
                            ellipsizeMode={'tail'}
                        >
                            {section.traderName}
                        </Text>

                        <Image
                            style={{marginLeft: 5}}
                            source={require('gsresource/img/arrowRight.png')}
                        />

                    </View>

                    {section.couponsToGet && (
                        <TouchableOpacity
                            hitSlop={{top: 16, left: 0, bottom: 16, right: 0}}
                            style={{position: 'absolute', right: 14, backgroundColor: colors.white}}
                            onPress={() => {
                                // 优惠券
                                this.props.shoppingCartStore.queryShopCouponsList(section.tenantId)
                                    .then((data) => {
                                        if (data && data.length > 0) {
                                            this.props.shoppingCartStore.setShopCoupons(data);
                                            this.popCoupon.show();
                                        }
                                    }, (error) => {
                                        Alert.alert(error.message);
                                    });
                            }}
                        >
                            <Text
                                style={{
                                    color: colors.activeFont,
                                    fontSize: 12
                                }}
                            >
                                {'领取优惠券>'}
                            </Text>
                        </TouchableOpacity>
                    )}

                </TouchableOpacity>

                <View style={{backgroundColor: colors.divide, height: 1}} />
            </View>
        );
    };

    keyExtractor = (item, index) => {
        return item ? item.spu[0].spuId.toString() : index.toString();
    };

    onDetailClick = (item, itemParent) => {
        let url = genGoodsDetailUrl(
            itemParent.clusterCode,
            itemParent.tenantId,
            item.spuId
        );
        if (url) {
            NavigationSvc.navigate('GoodDetailScreen', {url: url});
        }
    };

    onDetailClickSpread = (item, itemParent, index) => {
        try {
            let url = genGoodsDetailUrl(
                itemParent.clusterCode,
                itemParent.tenantId,
                item[0].spuId
            );
            if (url) {
                NavigationSvc.navigate('GoodDetailScreen', {url: url});
            }
        } catch (e) {
            dlconsole.log('购物车跳转失败' + e.message);
        }
    };

    handleCellDeleteBtn = skuItem => {
        const {shoppingCartStore} = this.props;
        if (skuItem.salesWayId === CHILD_GROUP) {
            const skus = shoppingCartStore.getSkuGroup(skuItem);
            const ids = [];
            const skuIds = [];
            skus.forEach(sku => {
                ids.push(sku.id);
                skuIds.push(sku.skuId);
            });
            shoppingCartStore.deleteGoodsBatchToShoppingCart(
                ids,
                (ret, msg) => {
                    if (ret) {
                        shoppingCartStore.deleteSkus(skuIds);
                        //
                        Toast.show('删除成功', 1);
                    } else {
                        Alert.alert(msg);
                    }
                }
            );
        } else {
            shoppingCartStore.deleteGoodsShoppingCart(
                skuItem.id,
                skuItem.skuId,
                (ret, msg) => {
                    if (ret) {
                        Toast.show('删除成功', 1);
                    } else {
                        Alert.alert(msg);
                    }
                }
            );
        }
    };

    handleSpuCellDeleteBtn = spuId => {
        this.props.shoppingCartStore.deleteSPU(spuId, (ret, msg) => {
            if (ret) {
                Toast.show('删除成功', 1);
            } else {
                Alert.alert(msg);
            }
        });
    };

    onSKUCheckChange = (checked, skuId) => {
        this.props.shoppingCartStore.checkSKU(
            checked,
            skuId,
            this.props.shoppingCartStore.manage
        );
    }

    onSPUCheckChange = (checked, spuId) => {
        this.props.shoppingCartStore.checkSPU(
            checked,
            spuId,
            this.props.shoppingCartStore.manage
        );
    }

    onNumberChange = (value, skuId, spu, spec1Name) => {
        UserActionSvc.track('CART_GOODS_EDIT');
        if (spu[0].salesWayId === CHILD_GROUP) {
            spu[0].data.forEach(sku => {
                if (sku.spec1Name === spec1Name) {
                    this.props.shoppingCartStore.setSKUNumber(
                        value,
                        sku.skuId,
                        (ret, msg) => {
                            if (!ret) {
                                Alert.alert(msg);
                            }
                        }
                    );
                }
            });
        } else {
            this.props.shoppingCartStore.setSKUNumber(
                value,
                skuId,
                (ret, msg) => {
                    if (!ret) {
                        Alert.alert(msg);
                    }
                }
            );
        }
    }

    /**
     * 列表cell  包含收起和展开状态
     * @returns {*}
     */
    renderCell = ({item, index, section}) => {
        if (this.props.shoppingCartStore.toggle) {
            return (
                <ShoppingCartCellSpu
                    itemParent={section}
                    onSPUCheckChange={this.onSPUCheckChange}
                    item={item}
                    onTextClick={this.onDetailClick}
                    deleteSPU={this.handleSpuCellDeleteBtn}
                />
            );
        } else {
            return (
                <ShoppingCartCell
                    deleteSku={this.handleCellDeleteBtn}
                    deleteSpu={this.handleSpuCellDeleteBtn}
                    onDetailClick={this.onDetailClickSpread}
                    onNumberChange={this.onNumberChange}
                    item={item.spu}
                    itemParent={section}
                    onSPUCheckChange={this.onSPUCheckChange}
                    onSKUCheckChange={this.onSKUCheckChange}
                />
            );
        }
    };

    /**
     * 刷新
     */
    onHeadFresh = () => {
        this.setLoadState(RefreshState.HeaderRefreshing);
        this.props.shoppingCartStore.requestShoppingCart((ret, extra) => {
            this.setLoadState(RefreshState.Idle);
            if (!ret) {
                Toast.show(extra);
            }
        });
    };

    /**
     * 加载更多
     */
    onLoadMore = () => {
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});
ShoppingCartScreen.propTypes = propTypes;
export default ShoppingCartScreen;
