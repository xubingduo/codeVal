/**
 * author: tuhui
 * Date: 2018/7/24
 * Time: 10:56
 * des: 商品cell 提供公用
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Dimensions,
    Text,
    View,
    TouchableOpacity,
} from 'react-native';
import colors from '../../../gsresource/ui/colors';
import Image from '../../../component/Image';
import PropTypes from 'prop-types';

const WIDTH = Dimensions.get('window').width;

export default class GoodsCell extends Component {

    static propTypes = {
        style: PropTypes.object,
        describe: PropTypes.string,
        imgUrl: PropTypes.string,
        price: PropTypes.number,
        saleNumber: PropTypes.number,
        itemClick: PropTypes.func,
    };


    render() {
        return (
            <TouchableOpacity
                style={[styles.container, {width: (WIDTH - 36) / 2}, this.props.style]}
                onPress={()=>{
                    if(this.props.itemClick){
                        this.props.itemClick();
                    }
                }}
            >

                <Image
                    style={{height: 210, width: (WIDTH - 36) / 2}}
                    source={{uri: this.props.imgUrl}}
                />

                <Text numberOfLines={2}
                    style={styles.textDesc}
                >
                    {this.props.describe}
                </Text>

                <View style={{
                    width: (WIDTH - 36) / 2,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 16,
                    paddingLeft: 7,
                    paddingRight: 7,
                    marginBottom: 12,
                }}
                >
                    <Text style={styles.textPrice}>{`¥${this.props.price}`}</Text>
                    <Text style={styles.hasSale}>{`已售${this.props.saleNumber}`}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        margin: 4,
    },
    textDesc: {
        fontSize: 11,
        marginLeft: 7,
        marginTop: 4,
        textAlign:'left',
        marginRight: 7,
        color: colors.normalFont
    },
    textPrice: {
        fontSize: 12,
        color: colors.activeFont
    },
    hasSale: {
        fontSize: 12,
        color: colors.greyFont
    }
});