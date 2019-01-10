/**
 * author: tuhui
 * Date: 2018/7/18
 * Time: 11:16
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    SectionList,
} from 'react-native';
import Swipeout from 'react-native-swipeout';
import Image from '../../../component/Image';
import PropTypes from 'prop-types';
import NumberEditView from '../../../component/NumberEditView';
import colors from '../../../gsresource/ui/colors';
import fonts from '../../../gsresource/ui/fonts';
import ImageButton from '../../../component/ImageButton';
import {Toast} from '@ecool/react-native-ui';
import {toJS} from 'mobx';
import DocSvc from '../../../svc/DocSvc';
import Alert from 'component/Alert';
import {inject,observer} from 'mobx-react';

@inject('shoppingCartStore')
@observer
export default class ShoppingCartCell extends Component {

    static propTypes = {
        item: PropTypes.array,
        itemParent: PropTypes.object,
        showTopMargin: PropTypes.bool,
        onNumberChange: PropTypes.func,
        onSPUCheckChange: PropTypes.func,
        onSKUCheckChange: PropTypes.func,
        onDetailClick: PropTypes.func,
        deleteSku: PropTypes.func,
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={[styles.container]}>
                <SectionList
                    extraData={this.props.shoppingCartStore.manage}
                    renderSectionHeader={this.renderSectionHeader}
                    sections={this.props.item}
                    keyExtractor={this.keyExtractor}
                    ItemSeparatorComponent={this.renderDividerView}
                    renderItem={this.renderItem}
                />
                <View style={{backgroundColor: colors.white, height: 10}} />
            </View>
        );
    }

    keyExtractor = (item, index) => {
        return item.skuId.toString();
    };

    renderDividerView = () => {
        return (
            <View style={{height: 10, backgroundColor: colors.white}} />
        );
    };


    renderCheckBtn(section) {
        if (this.checkSpuInveStatus(section) === -4 && !this.props.shoppingCartStore.manage) {
            return (
                <View style={{
                    width: 30,
                    height: 16,
                    marginLeft: 8,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 8,
                    backgroundColor: colors.unEnable,
                    borderRadius: 10
                }}
                >
                    <Text style={{
                        fontSize: fonts.font10,
                        color: colors.white,
                    }}
                    >
                        失效
                    </Text>
                </View>
            );
        } else {
            return (
                <ImageButton
                    style={{marginLeft: 8, marginRight: 8}}
                    onClick={() => {
                        if (this.checkSpuInveStatus(section) === 2 && !this.props.shoppingCartStore.manage) {
                            return;
                        }
                        this.props.onSPUCheckChange && this.props.onSPUCheckChange(!section.checked, section.spuId);
                    }}
                    source={this.checkSpuInveStatus(section) === 2 && !this.props.shoppingCartStore.manage ? require('gsresource/img/disableCheck.png') :
                        section.checked ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                />
            );
        }
    }

    renderSectionHeader = ({section, index}) => {
        const onPress = () => {
            Alert.alert('提示', '是否删除该商品', [
                {
                    text: '取消', onPress: () => null
                },
                {
                    text: '确认',
                    onPress: () => {
                        this.props.deleteSpu(section.spuId);
                    }
                }
            ]);
        };
        const swipeoutBtn = [
            {
                text: '删除',
                backgroundColor: colors.redBg,
                color: colors.white,
                type: 'delete',
                onPress
            }
        ];
        return (
            <Swipeout right={swipeoutBtn} buttonWidth={90} autoClose={true} close={true}>
                <View style={[{
                    paddingBottom: 10,
                    paddingTop: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.white,
                    height: 106
                }]}
                >

                    {
                        this.renderCheckBtn(section)
                    }

                    <TouchableOpacity onPress={() => {
                        this.props.onDetailClick && this.props.onDetailClick(this.props.item, this.props.itemParent);
                    }}
                    >
                        <Image
                            source={{uri: DocSvc.docURLL(section.spuPic && section.spuPic.length > 0 ? section.spuPic.split(',')[0] : '')}}
                            defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                            style={{width: 90, height: 90, borderRadius: 2}}
                        />
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => {
                        this.props.onDetailClick && this.props.onDetailClick(this.props.item, this.props.itemParent);
                    }}
                    >
                        <Text style={{
                            color: colors.normalFont,
                            fontSize: fonts.font14,
                            marginTop: 12,
                            marginLeft: 6,
                            marginRight: 140,
                            height: 106
                        }}
                        >
                            {section.title}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Swipeout>
        );
    };

    renderItem = ({item, section}) => {
        if (this.checkSpuInveStatus(section) === -4) {
            return null;
        }

        const groupNum = item.groupNum
            ? item.groupNum
            : 1;
        // 是否售罄
        let isSellOut = item.invNum <= 0;
        const onPress = () => {
            Alert.alert('提示', '是否删除该商品', [
                {
                    text: '取消', onPress: () => null
                },
                {
                    text: '确认',
                    onPress: () => {
                        this.props.deleteSku(item);
                    }
                }
            ]);
        };
        const swipeoutBtn = [
            {
                text: '删除',
                backgroundColor: colors.redBg,
                color: colors.white,
                type: 'delete',
                onPress
            }
        ];
        return (
            <Swipeout right={swipeoutBtn} buttonWidth={90} autoClose={true} close={true}>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.white,
                    paddingLeft: 16,
                    height: 50
                }}
                >
                    <ImageButton
                        hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                        onClick={() => {
                            if (this.checkSkuInveStatus(item) === 1 && !this.props.shoppingCartStore.manage) {
                                return;
                            }
                            this.props.onSKUCheckChange && this.props.onSKUCheckChange(!item.checked, item.skuId);
                        }}
                        source={this.checkSkuInveStatus(item) === 1 && !this.props.shoppingCartStore.manage ? require('gsresource/img/disableCheck.png')
                            : item.checked ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                    />

                    <View style={{
                        flex: 1,
                        height: 50,
                        marginLeft: 16,
                        flexDirection: 'row',
                        backgroundColor: isSellOut ? '#f5f5f588' : colors.border,
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                    >
                        <View style={{marginLeft: 16}}>
                            <Text style={{
                                color: isSellOut ? colors.unenableGreyFont : colors.greyFont,
                                fontSize: 12
                            }}
                            >{`${item.spec1Name} ${item.spec2Name}`}</Text>
                            <Text style={{
                                color: isSellOut ? colors.unenableGreyFont : colors.activeFont,
                                fontSize: 12,
                                marginTop: 4
                            }}
                            >
                                {`¥${item.skuPrice}`}
                                <Text style={{
                                    color: isSellOut ? colors.unenableGreyFont : colors.greyFont,
                                    fontSize: 12
                                }}
                                >/件</Text>
                            </Text>
                        </View>

                        {
                            this.checkSkuInveStatus(item) === 1 &&
                            <Image
                                source={require('gsresource/img/sellOutMin.png')}
                            />
                        }

                        {
                            <NumberEditView
                                editable={this.checkSkuInveStatus(item) === 0}
                                showBottomLine={true}
                                maxLength={4}
                                maxNum={9999}
                                defaultText={toJS(item.skuNum)}
                                onTextChange={(value) => {
                                    if (value > 9999) {
                                        Toast.show('最多拿货9999件');
                                        return;
                                    }
                                    this.props.onNumberChange && this.props.onNumberChange(value, item.skuId, this.props.item, item.spec1Name);
                                }}
                                style={{flexDirection: 'row', alignItems: 'center', marginRight: 16}}
                                onceChange={groupNum}
                            />
                        }
                    </View>
                </View>
            </Swipeout>
        );
    };


    /**
     * @param spu
     * @return 0 正常  1部分库存不足  2全部库存不足 -4失效商品
     */
    checkSpuInveStatus = (spu) => {

        if (spu.spuFlag !== 1) {
            return -4;
        }

        //库存不足的sku个数
        let invLessCount = 0;
        for (let i = 0; i < spu.data.length; i++) {
            let sku = spu.data[i];
            if (sku.invNum <= 0) {
                invLessCount += 1;
            }
        }

        if (invLessCount <= 0) {
            return 0;
        } else if (invLessCount === spu.data.length) {
            return 2;
        } else {
            return 1;
        }
    };

    /**
     * 检测sku库存状态
     * @param sku
     * @return 0 正常  1库存不足
     */
    checkSkuInveStatus = (sku) => {
        if (sku.invNum <= 0) {
            return 1;
        } else {
            return 0;
        }
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});