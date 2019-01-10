/**
 * author: tuhui
 * Date: 2018/7/27
 * Time: 11:02
 * des:
 */

import React, {Component} from 'react';
import {StyleSheet, Platform, View, Text, TouchableOpacity} from 'react-native';
import fonts from '../../../../../gsresource/ui/fonts';
import colors from '../../../../../gsresource/ui/colors';
import Image from '../../../../../component/Image';
import PropTypes from 'prop-types';

export default class ShopCell extends Component {
    static propTypes = {
        title: PropTypes.string,
        imgUrl: PropTypes.string,
        score: PropTypes.number,
        shopId: PropTypes.number,
        itemClick: PropTypes.func,
        address: PropTypes.string,
        favorFlag: PropTypes.number,
        changeFollow: PropTypes.func,
        //0 下线 1 上线
        isOnline: PropTypes.number,
        // 标签
        labels: PropTypes.any,
        // 开启关注按钮
        enableFollow: PropTypes.bool,
        //邀请开店
        onInviteShopClick: PropTypes.func,
        style: PropTypes.object,
    };

    static defaultProps = {
        labels: [],
        item: {},
        enableFollow: true,
        style: {}
    };

    render() {
        let outLine = this.props.isOnline === 0;
        return (
            <View style={[{backgroundColor: colors.white}, this.props.style]}>
                <View style={styles.listStyle}>
                    <TouchableOpacity
                        style={styles.itemStyle}
                        onPress={() => {
                            this.props.itemClick && this.props.itemClick(this.props.shopId, this.props.title);
                            this.props.onInviteShopClick && this.props.onInviteShopClick(this.props.item);
                        }}
                    >
                        {outLine ? (
                            <Image
                                style={[{}, Platform.OS === 'ios' ? {borderRadius: 30} : {borderRadius: 100}]}
                                source={require('gsresource/img/outLineShop.png')}
                            />
                        ) : (
                            <Image
                                style={[
                                    {
                                        width: 42,
                                        height: 42
                                    },
                                    Platform.OS === 'ios' ? {borderRadius: 21} : {borderRadius: 100}
                                ]}
                                defaultSource={require('gsresource/img/sellerDefault42.png')}
                                source={{uri: this.props.imgUrl}}
                            />
                        )}

                        <View style={{padding: 10, flex: 1}}>
                            <Text
                                style={[
                                    {
                                        fontSize: fonts.font14,
                                        color: colors.normalFont
                                    },
                                    outLine ? {color: colors.greyFont} : {}
                                ]}
                                numberOfLines={2}
                            >{`${outLine ? '(已下线) ' : ''}${this.props.title}`}</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
                                <Image source={require('gsresource/img/location.png')} />

                                <Text
                                    style={{
                                        marginLeft: 4,
                                        fontSize: fonts.font12,
                                        color: colors.greyFont
                                    }}
                                    numberOfLines={1}
                                >
                                    {this.props.address}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>

                    <View style={{flexDirection: 'row', alignItems: 'center', paddingRight: 15}}>
                        {this.props.enableFollow && (
                            <TouchableOpacity
                                onPress={() => {
                                    this.props.changeFollow && this.props.changeFollow(this.props.shopId, this.props.title, this.props.favorFlag);
                                }}
                            >
                                <Image
                                    source={
                                        this.props.favorFlag === 0
                                            ? require('gsresource/img/watch_pink.png')
                                            : require('gsresource/img/has_watch_gray.png')
                                    }
                                />
                            </TouchableOpacity>
                        )}
                        <Image style={{marginLeft: 8}} source={require('gsresource/img/arrowRight.png')} />
                    </View>
                </View>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingLeft: 15,
                        paddingRight: 20,
                        flexWrap: 'wrap',
                    }}
                >
                    {this.renderLabel()}
                </View>

                <View style={{height: 4, backgroundColor: colors.bg}} />
            </View>
        );
    }

    renderLabel = () => {
        let element = this.props.labels.map((data, index) => {
            return (
                <View style={styles.labelBox} key={index}>
                    <Text style={styles.labelTab}>{data}</Text>
                </View>
            );
        });

        return element;
    };
}

const styles = StyleSheet.create({
    listStyle: {
        flex: 1,
        minHeight: 70,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    itemStyle: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        paddingLeft: 15
    },
    labelBox: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.activeBtn,
        marginRight: 8,
        marginBottom: 4,
        borderRadius: 2,
    },

    labelTab: {
        paddingLeft: 5,
        paddingRight: 5,
        fontSize: fonts.font10,
        color: colors.activeBtn
    }
});
