/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品详情组件
 * @Last Modified by: Miao Yunliang
 * @Last Modified time: 2018-11-06 16:27:28
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    Dimensions,
    Platform
} from 'react-native';
import Image from 'component/Image';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import PropTypes from 'prop-types';
import GoodsItemStore from '../store/GoodsItemStore';
import { observer, Observer } from 'mobx-react';
import { Toast } from '@ecool/react-native-ui/index';
import { detailGoodsList } from '../util/GoodsItemUtil';
import ExpandAnimateView from 'module/goods/widget/ExpandAnimateView.js';
import GoodsShopMsg from './GoodsShopMsg';
import ImageVideoList from './widget/ImageVideoList';
import UserActionSvc from 'svc/UserActionSvc';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';
import { runInAction } from 'mobx';
import { GoodCategaryType } from 'svc/GoodsSvc';
import Navigations from 'svc/NavigationSvc';
import AuthService from 'svc/AuthService';
import NumberUtl from 'utl/NumberUtl';
import GoodsDeletePopupView from 'module/newest/widget/GoodsDeletePopupView';
import Alert from 'component/Alert';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

@observer
export default class GoodsItem extends Component {
    static propTypes = {
        isShowShopInfo: PropTypes.bool, // 是否包含店铺信息
        isShowDelete: PropTypes.bool, // 是否包含删除
        goods: PropTypes.object.isRequired, // 商品信息
        buyClick: PropTypes.func.isRequired, // 购买事件
        isOtherModalOpen: PropTypes.bool, // 是否有modal打开了
        showTime: PropTypes.bool, //  是否显示时间
        isShowDeletePopup: PropTypes.bool //是否显示删除弹框
    };

    static defaultProps = {
        isShowShopInfo: true,
        isShowDelete: true,
        isOtherModalOpen: false,
        showTime: true,
        isShowDeletePopup: false
    };

    constructor(props) {
        super(props);
        this.goodsItemStore = new GoodsItemStore();
    }

    // 包邮专区
    renderLabel = data => {
        if (!data.labelNames) {
            return null;
        }
        if (!data.labelNames.length) {
            return null;
        }
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                {data.labelNames.map((val, index) => {
                    return (
                        <View
                            key={index + 'label'}
                            style={{
                                borderWidth: 1,
                                borderColor: colors.activeFont,
                                marginBottom: 10,
                                paddingLeft: 5,
                                paddingRight: 5,
                                paddingTop: 2,
                                paddingBottom: 2,
                                borderRadius: 5,
                                marginRight: 10
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: 10,
                                    color: colors.activeFont
                                }}
                            >
                                {val}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    };

    render() {
        let goods = detailGoodsList(this.props.goods);
        let categarySource = this.getCategaryIcon(goods);

        let hotSource =
            this.props.isShowShopInfo && goods.showCaption === 1
                ? require('gsresource/img/good_hot.png')
                : null;
        //不再显示热门
        hotSource = false;

        // 转成二进制
        let value = goods.showCaption;
        // 限制最多8位,超出会返回空串''
        let showCaption2String = NumberUtl.binary(value, 8);
        let recommandSource;
        for (let i = 0; i < showCaption2String.length; i++) {
            if (
                i === 6 &&
                showCaption2String[i] === '1' &&
                this.props.isShowShopInfo
            ) {
                recommandSource = require('gsresource/img/good_recommand.png');
            }
        }

        // let recommandSource =
        //     this.props.isShowShopInfo && goods.showCaption === 2
        //         ? require('gsresource/img/good_recommand.png')
        //         : null;
        let hasVideo =
            goods.hasOwnProperty('docContent') && goods.docContent.length > 0;
        let hasInv = goods.hasOwnProperty('invNum') && goods.invNum <= 0;

        return (
            <View style={[styles.goodsItemBox, {}]}>
                {/*删除*/}
                {this.props.isShowShopInfo && this.props.isShowDelete && (
                    <View style={styles.closeBox}>
                        <TouchableOpacity
                            style={styles.colseImgBtn}
                            hitSlop={{
                                top: 16,
                                left: 16,
                                bottom: 16,
                                right: 16
                            }}
                            onPress={() => {
                                this.deleteClick(goods);
                            }}
                        >
                            <Image
                                style={styles.colseImg}
                                source={require('gsresource/img/closeMin.png')}
                            />
                        </TouchableOpacity>
                    </View>
                )}
                {/*店铺信息*/}
                {this.props.isShowShopInfo && (
                    <GoodsShopMsg
                        style={{
                            marginLeft: 5,
                            marginRight: 5,
                            marginBottom: 8
                        }}
                        shopMsg={goods}
                        store={this.goodsItemStore}
                        showTime={this.props.showTime}
                        // isOtherModalOpen={this.props.isOtherModalOpen}
                    />
                )}
                {/*商品信息*/}
                <View style={styles.goodsBox}>
                    <TouchableOpacity
                        style={[
                            styles.goodsDesBox,
                            {
                                marginLeft: 8,
                                flexDirection: 'row',
                                alignItems: 'center',
                                marginBottom: 10
                            }
                        ]}
                        onPress={this.goToGoodsDetails}
                    >
                        {categarySource && (
                            <Image
                                style={{ marginRight: 2 }}
                                source={categarySource}
                            />
                        )}
                        <Text style={[styles.goodsDesText]}>{goods.title}</Text>
                    </TouchableOpacity>
                    {hasVideo && (
                        <ImageVideoList
                            watchCallBack={this.watchCallBack}
                            goToUrl={this.goToGoodsDetails}
                            goods={goods}
                            imageVideoList={goods.docContent}
                            // // isOtherModalOpen={this.props.isOtherModalOpen}
                        />
                    )}
                </View>
                {/*包邮专区*/}
                {this.renderLabel(goods)}
                {/*购买*/}
                <View style={styles.goodsBuyBox}>
                    <View style={styles.starBox}>
                        <TouchableOpacity
                            style={[styles.starImgTextBox, { paddingLeft: 12 }]}
                            hitSlop={{
                                top: 16,
                                left: 16,
                                bottom: 16,
                                right: 16
                            }}
                            onPress={() => {
                                this.toggleStarClick(goods);
                                this.canLikeAnimate = true;
                            }}
                        >
                            {goods.praiseFlag !== 1 && (
                                <Image
                                    style={styles.starImg}
                                    source={require('gsresource/img/giveLike.png')}
                                />
                            )}
                            {goods.praiseFlag === 1 && (
                                <ExpandAnimateView
                                    animatedEnable={this.canLikeAnimate}
                                    animateCompleteHandler={() => {
                                        this.canLikeAnimate = false;
                                    }}
                                >
                                    <Image
                                        style={styles.starImg}
                                        source={require('gsresource/img/giveLikeActive.png')}
                                    />
                                </ExpandAnimateView>
                            )}
                            <Text
                                style={
                                    goods.praiseFlag === 1
                                        ? styles.starTextActive
                                        : styles.starText
                                }
                                numberOfLines={1}
                                ellipsizeMode={'tail'}
                            >
                                {NumberUtl.NumberFormat(
                                    goods.praiseNum ||
                                        (goods.praiseFlag === 1 && 1) ||
                                        0
                                )}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.favorBox, {}]}>
                        <Observer>
                            {() => (
                                <TouchableOpacity
                                    style={[
                                        styles.favorImgTextBox,
                                        { paddingLeft: 15 }
                                    ]}
                                    hitSlop={{
                                        top: 16,
                                        left: 16,
                                        bottom: 16,
                                        right: 16
                                    }}
                                    onPress={() => {
                                        this.toggleFavorClick(goods);
                                        this.canCollectAnimate = true;
                                    }}
                                >
                                    {goods.spuFavorFlag !== 1 && (
                                        <Image
                                            style={styles.favorImg}
                                            source={require('gsresource/img/goodsCollect.png')}
                                        />
                                    )}
                                    {goods.spuFavorFlag === 1 && (
                                        <ExpandAnimateView
                                            animatedEnable={
                                                this.canCollectAnimate
                                            }
                                            animateCompleteHandler={() => {
                                                this.canCollectAnimate = false;
                                            }}
                                        >
                                            <Image
                                                style={styles.favorImg}
                                                source={require('gsresource/img/goodsCollectActive.png')}
                                            />
                                        </ExpandAnimateView>
                                    )}
                                    <Text
                                        style={
                                            goods.spuFavorFlag === 1
                                                ? styles.favorTextActive
                                                : styles.favorText
                                        }
                                        numberOfLines={1}
                                        ellipsizeMode={'tail'}
                                    >
                                        {NumberUtl.NumberFormat(
                                            goods.spuFavorNum ||
                                                (goods.spuFavorFlag === 1 &&
                                                    1) ||
                                                0
                                        )}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </Observer>
                    </View>
                    <View style={styles.watchBox}>
                        <View
                            style={[
                                styles.watchImgTextBox,
                                { paddingLeft: 15 }
                            ]}
                        >
                            <Image
                                style={styles.watchImg}
                                source={require('gsresource/img/watch.png')}
                            />
                            <Text
                                style={styles.watchText}
                                numberOfLines={1}
                                ellipsizeMode={'tail'}
                            >
                                {NumberUtl.NumberFormat(goods.viewNum || 0)}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.priceBox}>
                        {/*// todo 后期需要改动算法*/}
                        <Text
                            style={styles.priceText}
                            numberOfLines={1}
                            ellipsizeMode={'tail'}
                        >
                            ¥{goods.pubPrice}
                        </Text>
                    </View>
                    <View style={styles.lineViewBox}>
                        <Text />
                    </View>
                    <View style={styles.goodsBuyBtnBox}>
                        {/*invNum*/}
                        {hasInv ? (
                            <TouchableOpacity
                                style={[
                                    styles.goodsBuyBtn,
                                    styles.goodsBuyBtnSellOut
                                ]}
                                hitSlop={{
                                    top: 16,
                                    left: 16,
                                    bottom: 16,
                                    right: 16
                                }}
                                onPress={() => {
                                    UserActionSvc.track('GOODS_BUY');
                                    Toast.show('该商品已售罄！');
                                }}
                            >
                                <Text style={styles.goodsBuyText}>售罄</Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity
                                style={styles.goodsBuyBtn}
                                hitSlop={{
                                    top: 16,
                                    left: 16,
                                    bottom: 16,
                                    right: 16
                                }}
                                onPress={() => {
                                    UserActionSvc.track('GOODS_BUY');
                                    this.buyClick(goods);
                                }}
                            >
                                <Text style={styles.goodsBuyText}>购买</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
                {recommandSource && (
                    <View style={{ position: 'absolute', top: 0, left: 0 }}>
                        <Image source={recommandSource} />
                    </View>
                )}
                {hotSource && (
                    <View style={{ position: 'absolute', top: 0, right: 90 }}>
                        <Image source={hotSource} />
                    </View>
                )}
            </View>
        );
    }

    /**
     * 获取类目对应图标
     */
    getCategaryIcon = goods => {
        if (!goods || !goods.masterClassName) {
            return;
        }
        let source;
        if (goods.masterClassName.indexOf(GoodCategaryType.men_cloth) >= 0) {
            source = require('gsresource/img/men_cloth.png');
        } else if (
            goods.masterClassName.indexOf(GoodCategaryType.women_cloth) >= 0
        ) {
            source = require('gsresource/img/women_cloth.png');
        } else if (
            goods.masterClassName.indexOf(GoodCategaryType.child_cloth) >= 0
        ) {
            source = require('gsresource/img/child_cloth.png');
        } else if (
            goods.masterClassName.indexOf(GoodCategaryType.child_shoe) >= 0
        ) {
            source = require('gsresource/img/child_shoe.png');
        }
        return source;
    };

    deleteClick(goods) {
        UserActionSvc.track('GOODS_DELETE');

        if (this.props.isShowDeletePopup === true) {
            GoodsDeletePopupView.show(async tendencyType => {
                if (tendencyType !== -1) {
                    //保存用户倾向
                    try {
                        Toast.loading();
                        await this.goodsItemStore.saveUserTendency(
                            goods,
                            tendencyType
                        );
                        this.goodsItemStore.deleteClick(goods).then(res => {
                            Toast.success('删除成功！');
                            sendGoodsItemChangeEvent(GOODS_ITEM_DELETE, {
                                goodsId: goods['id']
                            });
                        });
                    } catch (error) {
                        Toast.dismiss();
                        Alert.alert(error.message);
                    }
                }
            });
        } else {
            Toast.loading();
            this.goodsItemStore.deleteClick(goods).then(res => {
                Toast.success('删除成功！');
                sendGoodsItemChangeEvent(GOODS_ITEM_DELETE, {
                    goodsId: goods['id']
                });
            });
        }
    }

    toggleStarClick(goods) {
        if (goods.praiseFlag === 0) {
            this.watchCallBack(goods, 3); // fetchWatchGoods
            this.goodsItemStore.toggleStarClick(goods).then(
                res => {
                    if (res['code'] === 0) {
                        sendGoodsItemChangeEvent(
                            CHANGE_GOODS_STAR_NUMBER_STATE,
                            {
                                goodsId: goods['id'],
                                praiseFlag: 1,
                                praiseNum: (goods['praiseNum'] || 0) + 1
                            }
                        );
                    }
                },
                err => {
                    Toast.show(err['message']);
                }
            );
        } else {
            Toast.show('您已经点赞过了！');
        }
        UserActionSvc.track('GOODS_TOGGLE_STAR');
    }

    toggleFavorClick(goods) {
        if (goods.spuFavorFlag === 0) {
            this.watchCallBack(goods, 4);
        }
        this.goodsItemStore.toggleGoodsFavor(goods).then(
            res => {
                if (res.code === 0) {
                    if (goods.spuFavorFlag === 0) {
                        sendGoodsItemChangeEvent(
                            CHANGE_GOODS_FAVOR_NUMBER_STATE,
                            {
                                goodsId: goods['id'],
                                spuFavorFlag: 1,
                                spuFavorNum: goods['spuFavorNum'] + 1
                            }
                        );
                    } else {
                        sendGoodsItemChangeEvent(
                            CHANGE_GOODS_FAVOR_NUMBER_STATE,
                            {
                                goodsId: goods['id'],
                                spuFavorFlag: 0,
                                spuFavorNum:
                                    goods['spuFavorNum'] - 1 < 0
                                        ? 0
                                        : goods['spuFavorNum'] - 1
                            }
                        );
                    }
                }
            },
            err => {
                Toast.show(err['message']);
            }
        );
        UserActionSvc.track('GOODS_TOGGLE_FAVOR');
    }

    buyClick(goods) {
        // if (!AuthService.isBuyAuthed()) {
        //     return;
        // }
        this.watchCallBack(goods, 1);
        this.props.buyClick(goods);
    }

    watchCallBack = (goods, type) => {
        this.goodsItemStore.watchGoods(goods, type).then(
            res => {
                if (res.code === 0) {
                    sendGoodsItemChangeEvent(CHANGE_GOODS_WATCH_NUMBER, {
                        goodsId: goods['id'],
                        viewNum: (goods.viewNum || 0) + 1
                    });
                }
            },
            err => {
                // Toast.show('查看商品失败！');
            }
        );
    };

    // 去商品详情页面
    goToGoodsDetails = dataIndex => {
        let goods = detailGoodsList(this.props.goods);
        let styleType = typeof dataIndex === 'number' ? dataIndex : 0;
        Navigations.navigate('GoodDetailScreen', {
            url: goods.detailUrl,
            indexNub: styleType
        });
    };
}
const itemBox = {
    goodsItemBox: {
        position: 'relative',
        marginTop: 5,
        marginBottom: 5,
        paddingTop: 15,
        paddingRight: 15,
        paddingBottom: 5,
        paddingLeft: 15,
        backgroundColor: '#fff'
    },
    closeBox: {
        position: 'absolute',
        zIndex: 1,
        top: 19,
        right: 15,
        width: 11,
        height: 11
    },
    goodsBox: {
        paddingBottom: 10
    },
    goodsBuyBox: {
        flexDirection: 'row',
        paddingTop: 5,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        justifyContent: 'space-between'
    }
};
const closeBox = {
    colseImgBtn: {
        width: 11,
        height: 11
    },
    colseImg: {}
};
const goodsBox = {
    goodsBox: {},
    goodsDesBox: {},
    goodsDesText: {
        fontSize: fonts.font14,
        color: colors.normalFont,
        flex: 1
    }
};
const buyBox = {
    favorBox: {
        flexDirection: 'row',
        flex: 3,
        justifyContent: 'flex-start'
    },
    favorImgTextBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    favorImg: {
        marginRight: 1
    },
    favorText: {
        // width: ((WIDTH - 90) / 5) - 25,
        fontSize: 10,
        color: colors.greyFont
    },
    favorTextActive: {
        // width: ((WIDTH - 90) / 5) - 25,
        fontSize: 10,
        color: colors.activeFont
    },
    watchBox: {
        flexDirection: 'row',
        flex: 3,
        justifyContent: 'flex-start',
        paddingRight: 15
    },
    watchImgTextBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    watchImg: {
        // marginRight: 1
    },
    watchText: {
        // width: ((WIDTH - 90) / 5) - 25,
        fontSize: 10,
        color: colors.greyFont
    },
    starBox: {
        flexDirection: 'row',
        flex: 3,
        justifyContent: 'flex-start'
    },
    starImgTextBox: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    starImg: {
        marginRight: 1
    },
    starText: {
        // width: ((WIDTH - 90) / 5) - 25,
        fontSize: 10,
        color: colors.greyFont
    },
    starTextActive: {
        // width: ((WIDTH - 90) / 5) - 25,
        fontSize: 10,
        color: colors.activeFont
    },
    priceBox: {
        flex: 5,
        paddingTop: 5,
        paddingRight: 15,
        paddingBottom: 5
    },
    priceText: {
        fontSize: fonts.font14,
        color: colors.title,
        fontWeight: 'bold',
        textAlign: 'right'
    },
    lineViewBox: {
        marginTop: 8,
        width: 1,
        height: 10,
        backgroundColor: '#9b9b9b'
    },
    goodsBuyBtnBox: {
        paddingLeft: 5
    },
    goodsBuyBtn: {
        marginTop: Platform.OS === 'ios' ? 0 : 3,
        width: 70,
        height: 24,
        borderRadius: 12,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.activeBtn
    },
    goodsBuyBtnSellOut: {
        backgroundColor: colors.border1
    },
    goodsBuyText: {
        fontSize: 12,
        color: colors.white,
        textAlign: 'center'
    }
};
const styles = StyleSheet.create({
    ...itemBox,
    ...closeBox,
    ...goodsBox,
    ...buyBox
});
