/**
 * author: tuhui
 * Date: 2018/7/30
 * Time: 15:56
 * des:购物车收起状态cell
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    TouchableOpacity,
    Text
} from 'react-native';
import Swipeout from 'react-native-swipeout';
import colors from '../../../gsresource/ui/colors';
import fonts from '../../../gsresource/ui/fonts';
import Image from '../../../component/Image';
import PropTypes from 'prop-types';
import ImageButton from '../../../component/ImageButton';
import DocSvc from '../../../svc/DocSvc';
import Alert from 'component/Alert';
import {inject,observer} from 'mobx-react';

@inject('shoppingCartStore')
@observer
export default class ShoppingCartCellSpu extends Component {

    static propTypes = {
        itemParent: PropTypes.object,
        item: PropTypes.object,
        onSPUCheckChange: PropTypes.func,
        onTextClick: PropTypes.func,
    };

    constructor(props){
        super(props);
    }

    onDeletePress = () => {
        const { item } = this.props;
        Alert.alert('提示', '是否删除该商品', [
            {
                text: '取消', onPress: () => null
            },
            {
                text: '确认',
                onPress: () => {
                    this.props.deleteSPU(item.spuId);
                }
            }
        ]);
    };

    swipeoutBtn = [
        {
            text: '删除',
            backgroundColor: colors.redBg,
            color: colors.white,
            type: 'delete',
            onPress: this.onDeletePress
        }
    ];

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

    render() {
        const {item, itemParent} = this.props;
        return (
            <Swipeout right={this.swipeoutBtn} autoClose={true} buttonWidth={90} close={true}>
                <View style={{
                    backgroundColor: colors.white,
                }}
                >
                    <View style={{
                        paddingBottom: 10,
                        paddingTop: 10,
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 106
                    }}
                    >

                        {
                            this.renderCheckBtn(item)
                        }


                        <TouchableOpacity
                            onPress={() => {
                                this.props.onTextClick && this.props.onTextClick(item, itemParent);
                            }}
                        >
                            <Image
                                source={{uri: DocSvc.docURLL(item.spuList && item.spuList.length > 0 ? item.spuList.split(',')[0] : '')}}
                                defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                                style={{width: 90, height: 90, borderRadius: 2}}
                            />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                this.props.onTextClick && this.props.onTextClick(item, itemParent);
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
                                {
                                    item.title
                                }
                            </Text>
                        </TouchableOpacity>

                    </View>
                </View>
            </Swipeout>
        );
    }

    /**
     * @param spu
     * @return 0 正常  1部分库存不足  2全部库存不足
     */
    checkSpuInveStatus(spu) {
        if (spu.spuFlag !== 1) {
            return -4;
        }
        //库存不足的sku个数
        let invLessCount = 0;
        for (let i = 0; i < spu.data.length; i++) {
            let sku = spu.data[i];
            if (0 >= sku.invNum) {
                invLessCount += 1;
            }
        }

        if (invLessCount === 0) {
            return 0;
        } else if (invLessCount === spu.data.length) {
            return 2;
        } else {
            return 1;
        }
    }
}


const styles = StyleSheet.create({});