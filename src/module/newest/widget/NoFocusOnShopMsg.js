/**
 * author: wdy
 * Date: 2018/8/21
 * Time: 下午5:06
 * des: 搜索商品无结果 空白页
 */
import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Image from '../../../component/Image';
import I18n from 'gsresource/string/i18n';
import fonts from '../../../gsresource/ui/fonts';

export default class NoFocusOnShopMsg extends Component{
    render() {
        return(
            <View style={styles.content}>
                <Image
                    source={require('gsresource/img/noFocusOnShop.png')}
                />
                <Text style={styles.text}>无关注门店的信息</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    content: {
        flexDirection: 'column',
        alignItems: 'center',
    },

    text: {
        fontSize: fonts.font12,
        color: '#9b9b9b',
        marginTop: 12,
    },
});