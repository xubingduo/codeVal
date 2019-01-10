import {
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
    TouchableOpacity,
    View,
    Dimensions,
    Platform,
    PixelRatio,
    YellowBox
} from 'react-native';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import DocSvc from 'svc/DocSvc';
import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import { DLFlatList, GridView } from '@ecool/react-native-ui';
import { observer } from 'mobx-react';
import GoodsBuy from 'module/goods/widget/GoodsBuy';
import Image from 'component/Image';
import UserActionSvc from 'svc/UserActionSvc';
import AuthService from 'svc/AuthService';
import NumberUtl from 'utl/NumberUtl';
import Navigations from 'svc/NavigationSvc';
import { fetchBannerLabel } from 'apiManager/ShopApiManager';
import fonts from 'gsresource/ui/fonts';

const WIDTH = Dimensions.get('window').width;
const FontScale = PixelRatio.getFontScale();
@observer
export default class ShopCell extends Component {
    static propTypes = {
        cellItem: PropTypes.object.isRequired, //好店列表item
        onFocusClick: PropTypes.func.isRequired, //点击关注按钮事件
        onPlayClick: PropTypes.func.isRequired, //点击播放按钮事件
        onBackGroundImageClick: PropTypes.func.isRequired, //点击底部背景图片事件
        onShopInfoClick: PropTypes.func.isRequired //点击门店信息事件
    };

    render() {
        let shopMsg = {
            tenantName: this.props.cellItem.name,
            unitId: this.props.cellItem.unitId,
            clusterCode: this.props.cellItem.clusterCode,
            tenantId: this.props.cellItem.tenantId
        };
        return (
            <View
                style={{
                    backgroundColor: 'white',
                    paddingHorizontal: 15,
                    paddingTop: 8
                }}
            >
                {this.renderShopContainerView(this.props.cellItem)}
                {this.renderShopImage(this.props.cellItem)}
                {this.renderStyleList(this.props.cellItem)}
            </View>
        );
    }

    /**
     * 渲染门店信息视图
     */
    renderShopContainerView = item => {
        return (
            <TouchableWithoutFeedback
                onPress={() => this.props.onShopInfoClick(item)}
            >
                <View style={styles.shopInfoContainer}>
                    {this.renderShopInfoView(item)}
                    {this.renderFocusInfo(item)}
                </View>
            </TouchableWithoutFeedback>
        );
    };

    /**
     * 渲染门店图片
     * item 发现好店列表item
     */
    renderShopImage = item => {
        return (
            <TouchableWithoutFeedback
                onPress={() => this.props.onBackGroundImageClick(item)}
            >
                <View style={styles.shopBgImg}>
                    <Image
                        style={{ width: '100%', height: '100%' }}
                        source={{
                            uri: DocSvc.docURLXXL(item.coverPic)
                        }}
                    />
                    {this.renderVideoPlayButton(item)}
                </View>
            </TouchableWithoutFeedback>
        );
    };

    /**
     * 渲染视频播放按钮
     */
    renderVideoPlayButton = item => {
        if (item.videoUrl && item.videoUrl.length > 0) {
            return (
                <TouchableWithoutFeedback
                    onPress={() => this.props.onPlayClick(item)}
                >
                    <Image
                        style={{ position: 'absolute', left: 10, bottom: 10 }}
                        source={require('gsresource/img/littleVideoPlay.png')}
                    />
                </TouchableWithoutFeedback>
            );
        }
    };

    /**
     * 渲染门店信息视图，点击可跳转到门店
     * item 发现好店列表item
     */
    renderShopInfoView = item => {
        let labels;
        if (item.ecCaption && item.ecCaption.labelJsons) {
            labels = item.ecCaption.labelJsons.slice(0, 3);
        }
        return (
            <View
                style={{
                    flexDirection: 'row',
                    flex: 1
                }}
            >
                <Image
                    style={styles.logo}
                    source={{
                        uri: DocSvc.docURLS(item.logoPic)
                    }}
                    defaultSource={require('gsresource/img/sellerDefault42.png')}
                    resizeMode='cover'
                />
                <View
                    style={{
                        justifyContent: 'space-between',
                        flex: 1,
                        marginLeft: 3
                    }}
                >
                    <View
                        style={{
                            flexDirection: 'row'
                        }}
                    >
                        <Text
                            style={{
                                color: '#333333',
                                fontSize: 14,
                                maxWidth: WIDTH * 0.35
                            }}
                            numberOfLines={1}
                        >
                            {item.name}
                        </Text>
                        {this.renderMedals(item)}
                    </View>
                    {labels && (
                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                maxWidth: WIDTH * 0.5,
                                marginLeft: -5
                            }}
                        >
                            {labels.map((item, index) => {
                                return (
                                    <View
                                        key={index}
                                        style={{
                                            borderWidth: 1,
                                            borderColor: '#ffd000',
                                            padding: 1,
                                            borderRadius: 3,
                                            marginLeft: 5
                                        }}
                                    >
                                        <Text
                                            style={{
                                                fontSize: fonts.font10,
                                                color: '#ffd000'
                                            }}
                                        >
                                            {JSON.parse(item).name}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}
                </View>
            </View>
        );
    };

    /**
     * 勋章列表
     */
    renderMedals = item => {
        let medalList = this.detailMedals(item.medalList);
        return (
            <DLFlatList
                style={{ flex: 1, marginLeft: 6 }}
                data={medalList}
                renderItem={({ item }) => this.renderMedalItem(item)}
                keyExtractor={(item, index) => item.code.toString()}
                numColumns={6}
                showsVerticalScrollIndicator={false}
            />
        );
    };

    // 处理勋章的函数
    detailMedals = medals => {
        if (!medals) {
            return [];
        }

        // 过滤未拥有的
        let medalList = medals.filter(item => {
            return item['showFlag'] === 1;
        });
        // 取出前三条
        let returnMedalList = medalList.filter((item, index) => {
            return index <= 2;
        });
        return returnMedalList;
    };

    renderMedalItem = item => {
        return (
            <Image
                style={{ width: 17, height: 17, marginLeft: 4 }}
                source={{ uri: DocSvc.originDocURL(item.logoDoc) }}
            />
        );
    };

    /**
     * 关注信息
     */
    renderFocusInfo = item => {
        return (
            <View
                style={{
                    justifyContent: 'space-between',
                    alignItems: 'flex-end',
                    minWidth: 80,
                    marginLeft: 10,
                    height: 40
                }}
            >
                <TouchableOpacity
                    hitSlop={{ top: 8, left: 8, bottom: 8, right: 8 }}
                    onPress={() => {
                        UserActionSvc.track('SHOP_TOGGLE_FOCUS_ON');
                        this.props.onFocusClick(item);
                    }}
                >
                    <Image
                        source={
                            item.favorFlag === 1
                                ? require('gsresource/img/has_watch_gray.png')
                                : require('gsresource/img/watch_pink.png')
                        }
                    />
                </TouchableOpacity>

                <Text
                    style={{
                        fontSize: 11,
                        color: colors.greyFont
                    }}
                >
                    {`${NumberUtl.NumberFormat(item.concernNum)}人关注`}
                </Text>
            </View>
        );
    };

    /**
     * 渲染款号列表
     * styles 款号spus数组
     */
    renderStyleList = cellItem => {
        let styles = cellItem.spus;
        let datas = [];
        if (styles) {
            datas = styles.slice(0, 4);
        }

        return (
            <View style={{ marginLeft: -5, marginBottom: 7 }}>
                <GridView
                    numberOFCol={4}
                    itemMarging={5}
                    items={datas}
                    renderItem={this.renderStyleItem}
                    containerWidth={WIDTH - 15 * 2 + 5 * 2}
                />
            </View>
        );
    };

    /**
     * 渲染款号item
     */
    renderStyleItem = item => {
        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (!AuthService.isShopAuthed()) {
                        return;
                    }
                    // this.goodsBuy.goodsBuyShow(item.detailUrl);
                    Navigations.navigate('GoodDetailScreen', {
                        url: item.detailUrl
                    });
                }}
            >
                <Image
                    style={styles.styleItemContainer}
                    resizeMode='cover'
                    source={{
                        uri: DocSvc.docURLM(item.docId)
                    }}
                    defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                />
            </TouchableWithoutFeedback>
        );
    };
}

const styles = StyleSheet.create({
    shopBgImg: {
        width: '100%',
        height: WIDTH * 0.51,
        borderRadius: 3,
        overflow: 'hidden'
    },
    logo: {
        width: 40,
        height: 40,
        borderRadius: 20
    },
    shopInfoContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingTop: 12,
        paddingBottom: 10
    },
    styleItemContainer: {
        width: (WIDTH - 15 * 2 - 5 * 3) / 4,
        height: (WIDTH - 15 * 2 - 5 * 3) / 4,
        backgroundColor: colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
        overflow: 'hidden'
    }
});
