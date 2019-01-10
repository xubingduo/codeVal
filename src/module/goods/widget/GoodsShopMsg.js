/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   店铺信息组件-头部商品信息
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-21 11:56:34
 */
import React, {Component} from 'react';
import {StyleSheet, TouchableOpacity, View, Text, Dimensions, Platform} from 'react-native';
import PropTypes from 'prop-types';
import {observer, inject} from 'mobx-react';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import Image from 'component/Image';

import NavigationSvc from 'svc/NavigationSvc';
import DocSvc from 'svc/DocSvc';
import {Toast} from '@ecool/react-native-ui';
import UserActionSvc from 'svc/UserActionSvc';
import sendGoodsItemChangeEvent, {
    GOODS_ITEM_CHANGE,
    GOODS_ITEM_DELETE,
    TOGGLE_SHOP_FOCUS_ON_SHOP,
    CHANGE_GOODS_WATCH_NUMBER,
    CHANGE_GOODS_STAR_NUMBER_STATE,
    CHANGE_GOODS_FAVOR_NUMBER_STATE
} from 'svc/GoodsSvc';

const WIDTH = Dimensions.get('window').width;

@inject('commonStore')
@observer
export default class GoodsShopMsg extends Component {
    static propTypes = {
        shopMsg: PropTypes.object,// 店铺信息
        // toggleFocusOnClick: PropTypes.func,// 点击关注切换
        store: PropTypes.any,// store,
        style: PropTypes.object,
        //  是否显示时间
        showTime: PropTypes.bool,
    };

    static defaultProps = {
        showTime: true,
    };

    constructor(props) {
        super(props);
        this.store = this.props.store;
    }

    render() {
        let shopMsg = this.props.shopMsg;
        let shopAddress = (shopMsg.hasOwnProperty('tenantAddr') && shopMsg.tenantAddr.length > 0);
        let showTime = shopMsg.hasOwnProperty('upDateTime') && !(shopMsg.showCaption === 1 || shopMsg.showCaption === 2);
        return (
            <TouchableOpacity opactity={1} style={[styles.shopBox, this.props.style]} onPress={() => {
                this.toShop(shopMsg);
            }}
            >

                <View style={styles.shopLogoBox}>
                    <Image
                        style={styles.shopLogoImg}
                        source={shopMsg.tenantLogoUrl ? {uri: DocSvc.docURLS(shopMsg.tenantLogoUrl)} : {}}
                        defaultSource={require('gsresource/img/sellerDefault42.png')}
                    />
                </View>
                <View style={styles.shopMsgBox}>
                    <View style={styles.shopMsgUpBox}>
                        <View style={[styles.shopNameTextMedalBox, {alignItems: 'center'}]}>
                            <Text style={styles.shopNameText} numberOfLines={1}
                                ellipsizeMode={'tail'}
                            >{shopMsg.tenantName}</Text>
                            <View style={styles.medalImgBox}>
                                {
                                    shopMsg.hasOwnProperty('medals') &&
                                    shopMsg.medals.map((e, i) => {
                                        return (
                                            <Image key={i} style={styles.medalImg}
                                                source={{uri: DocSvc.originDocURL(e.logoDoc)}}
                                            />
                                        );
                                    })
                                }
                            </View>
                        </View>

                        <View style={styles.focusOnBtnBox}>
                            <TouchableOpacity
                                hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                                style={{alignItems: 'center', justifyContent: 'center'}}
                                // style={shopMsg.favorFlag === 1 ? styles.focusOnBtn : styles.focusOnBtnActive}
                                onPress={() => {
                                    this.goodsHeaderToggleFocusOnClick(shopMsg);
                                }}
                            >
                                {/*<Text style={styles.focusOnText}>*/}
                                {/*{shopMsg.favorFlag === 1 ? '已关注' : '关注'}*/}
                                {/*</Text>*/}
                                <Image
                                    source={shopMsg.favorFlag === 0 ? require('gsresource/img/watch_pink.png') : require('gsresource/img/has_watch_gray.png')}
                                />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.shopMsgDownBox}>

                        {

                            this.props.showTime ? (
                                showTime &&
                                <View style={styles.upDataTimeBox}>
                                    <Text style={styles.upDataTimeText}>{shopMsg.upDateTime}</Text>
                                </View>
                            ) : null

                        }
                        {
                            shopAddress &&
                            <View style={styles.addrBox}>
                                <Image style={styles.addrIcon} source={require('gsresource/img/positioning.png')} />
                                <Text style={styles.addrText} numberOfLines={1}
                                    ellipsizeMode={'tail'}
                                >{shopMsg.tenantAddr}</Text>
                            </View>
                        }
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    toShop(goods) {
        if (!this.props.commonStore.isModalOpen) {
            NavigationSvc.navigate('ShopIndexScreen', {
                tenantId: goods.tenantId,
                tenantName: goods.tenantName
            });
        }
    }

    goodsHeaderToggleFocusOnClick(shopMsg) {
        UserActionSvc.track('SHOP_TOGGLE_FOCUS_ON');
        Toast.loading();

        this.store.toggleFocusOnClick(shopMsg).then(res => {
            Toast.dismiss();
            setTimeout(() => {
                if (res['code'] === 0) {
                    // Toast.show(res['msg']);
                    if (shopMsg['favorFlag'] === 0) {
                        Toast.success('关注成功');
                        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                            favorFlag: 1,
                            tenantId: shopMsg['tenantId']
                        });
                    }
                    if (shopMsg['favorFlag'] === 1) {
                        Toast.success('取消成功');
                        sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                            favorFlag: 0,
                            tenantId: shopMsg['tenantId']
                        });
                    }
                } else {
                    Toast.show(res['msg']);
                }
            }, 1000);
        }, err => {
            Toast.dismiss();
            Toast.show(err['message']);
        });
    }
}

const styles = StyleSheet.create({
    shopBox: {
        flexDirection: 'row',
        marginBottom: 5,
        paddingRight: 20,
        justifyContent: 'space-between'
    },
    shopLogoBox: {
        width: 42,
        height: 42
    },
    shopLogoImg: {
        width: 42,
        height: 42,
        borderRadius: Platform.OS === 'ios' ? 21 : 100
    },
    shopMsgBox: {
        flex: 1,
        height: 42,
        flexDirection: 'column',
        alignContent: 'space-between'
    },
    shopMsgUpBox: {
        flexDirection: 'row',
        paddingLeft: 5,
        justifyContent: 'space-between',
    },
    shopNameTextMedalBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start'
    },
    shopNameText: {
        maxWidth: WIDTH - 235,
        fontSize: 14,
        color: colors.normalFont
    },
    medalImgBox: {
        marginLeft: 10,
        flexDirection: 'row',
        flex: 1,
        maxWidth: 72,
        justifyContent: 'flex-start',
    },
    medalImg: {
        marginRight: 2,
        marginLeft: 2,
        width: 18,
        height: 18
    },
    focusOnBtnBox: {
        marginLeft: 10
    },
    shopMsgDownBox: {
        flexDirection: 'row',
        paddingLeft: 5,
        marginTop: 8,
        justifyContent: 'space-between',
        alignContent: 'flex-end'
    },
    upDataTimeBox: {
        marginRight: 15
    },
    upDataTimeText: {
        fontSize: 12,
        color: colors.greyFont,
    },
    addrBox: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'flex-start',
    },
    addrIcon: {
        marginRight: 3
    },
    addrText: {
        fontSize: fonts.font12,
        color: colors.greyFont
    }
});