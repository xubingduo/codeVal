/**
 * author: wwj
 * Date: 2018/8/21
 * Time: 下午4:40
 * des: 关注店铺列表 空白页
 */

import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Image from '../../../component/Image';
import I18n from 'gsresource/string/i18n';
import fonts from '../../../gsresource/ui/fonts';

export default class ShopListEmptyView extends Component {

    render(){
        return(
            <View style={styles.content}>
                <Image
                    source={require('gsresource/img/noFocusShop.png')}
                />
                <Text style={styles.text}>{I18n.t('noFoucsShopTip')}</Text>
            </View>

        );
    }
}

const styles = StyleSheet.create({
    content: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },

    text: {
        fontSize: fonts.font12,
        color: '#9b9b9b',
        marginTop: 12,
    },
});