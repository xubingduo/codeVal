import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';

import DeviceInfo from 'react-native-device-info';
import { colors } from 'gsresource/ui/ui';
import NumberUtl from 'utl/NumberUtl';
import docSvc from 'svc/DocSvc';
import Navigations from 'svc/NavigationSvc';
import { GoodCategaryType } from 'svc/GoodsSvc';
import DateUtl from 'utl/DateUtl';

const DISPLAY_MODE_NORMAL = 0;
const DISPLAY_MODE_SHARE = 1;

@observer
export default class GoodsItem extends Component {
    static propTypes = {
        goods: PropTypes.object.isRequired,
        onGoodsItemClick: PropTypes.func,
        mode: PropTypes.oneOf([DISPLAY_MODE_NORMAL, DISPLAY_MODE_SHARE])
    };

    static defaultProps = {
        onGoodsItemClick: () => null,
        mode: DISPLAY_MODE_NORMAL
    }

    goDetailScreen = () => {
        const { goods } = this.props;
        Navigations.navigate('GoodDetailScreen', {url: goods.detailUrl});
    }

    onGoodsItemClick = () => {
        const { goods, onGoodsItemClick } = this.props;
        onGoodsItemClick && onGoodsItemClick(goods);
        this.goDetailScreen();
    }

    /**
     * 获取类目对应图标
     */
    getCategaryIcon = (goods) => {
        if (!goods || !goods.masterClassName) {
            return null;
        }
        let source = null;
        if (goods.masterClassName.indexOf(GoodCategaryType.men_cloth) >= 0) {
            source = require('gsresource/img/men_cloth.png');
        } else if (goods.masterClassName.indexOf(GoodCategaryType.women_cloth) >= 0) {
            source = require('gsresource/img/women_cloth.png');
        } else if (goods.masterClassName.indexOf(GoodCategaryType.child_cloth) >= 0) {
            source = require('gsresource/img/child_cloth.png');
        } else if (goods.masterClassName.indexOf(GoodCategaryType.child_shoe) >= 0) {
            source = require('gsresource/img/child_shoe.png');
        }
        return source;
    };

    render() {
        const { goods, mode } = this.props;
        const docHeader = JSON.parse(goods.docHeader);
        const img = docHeader.find(item => item.typeId === 1);
        const source = docSvc.docURLM(img.docId);
        const categarySource = this.getCategaryIcon(goods);
        const recommandSource = goods.showCaption === 2 ? require('gsresource/img/good_recommand.png') : null;
        const lowAndroidStyle = Platform.OS === 'android' && DeviceInfo.getAPILevel() < 23
            ? {fontWeight: '400'}
            : {};
        return (
            <TouchableOpacity onPress={this.onGoodsItemClick}>
                <View style={styles.container}>
                    <View>
                        <Image style={[styles.img]} source={{uri: source}} />
                        {goods.invNum < 1 && 
                        <View style={styles.selloutImgContainer}>
                            <Image source={require('gsresource/img/selloutWhite.png')} />
                        </View>}
                    </View>
                    <View style={styles.rightContent}>
                        <View>
                            <View style={styles.titleContainer}>
                                {categarySource && <Image source={categarySource} style={{marginRight: 3}} />}
                                <Text style={styles.title} numberOfLines={4}>{goods.title}</Text>
                            </View>
                            {
                                mode === DISPLAY_MODE_SHARE && <Text style={styles.checkNum}>{DateUtl.formatDateFromString(goods.updatedDate, 'MM-DD HH:mm')}</Text>
                            }
                        </View>
                        <View style={styles.bottomText}>
                            <View style={{minWidth: 100, marginRight: 5}}>
                                <Text style={styles.price}>¥{goods.pubPrice}</Text>
                                {/* {
                                    mode === DISPLAY_MODE_NORMAL
                                        ? <Text style={styles.price}>¥{goods.pubPrice}</Text>
                                        : <View style={styles.bottomText}>
                                            {goods.distributionPrice !== 0 && <Text style={[styles.price, lowAndroidStyle]}>¥{goods.distributionPrice}</Text>}
                                            {goods.originalPrice !== 0 && <Text style={styles.dPrice}>¥{goods.originalPrice}</Text>}
                                        </View>
                                } */}
                            </View>
                            {
                                mode === DISPLAY_MODE_NORMAL && goods.hasOwnProperty('viewNum') && 
                                <View style={styles.checkNumContainer}>
                                    <Image style={styles.checkNumImg} source={require('gsresource/img/watch.png')} />
                                    <Text style={styles.checkNum}>{NumberUtl.NumberFormat(goods.viewNum || 0)}</Text>
                                </View>
                            }
                        </View>
                    </View>
                    {recommandSource && (
                        <View style={{position: 'absolute', top: 10, left: 10}}>
                            <Image source={recommandSource} />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 10,
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderColor: colors.divide
    },
    img: {
        width: 110,
        height: 110,
    },
    selloutImgContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.halfTransparentBlack
    },
    rightContent: {
        justifyContent: 'space-between',
        paddingVertical: 3,
        flex: 1,
        marginLeft: 9
    },
    titleContainer: {
        flexDirection: 'row',
        // alignItems: 'flex-start'
    },
    title: {
        color: colors.normalFont,
        fontSize: 14,
        // paddingLeft: 3,
        // marginLeft: 3,
        flex:1,
        alignSelf: 'flex-end'
    },
    bottomText: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    price: {
        color: colors.activeFont,
        fontSize: 14,
        fontWeight: '500'
    },
    // dPrice: {
    //     fontSize: 12,
    //     textDecorationLine: 'line-through',
    //     marginLeft: 10,
    //     color: colors.greyFont
    // },
    checkNumImg: {
        marginRight: 3
    },
    checkNum: {
        color: colors.greyFont,
        fontSize: 10
    },
    checkNumContainer: {
        flexDirection: 'row'
    }
});