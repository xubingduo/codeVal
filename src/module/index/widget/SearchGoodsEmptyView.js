/**
 * author: wwj
 * Date: 2018/8/21
 * Time: 下午5:06
 * des: 搜索商品无结果 空白页
 */
import React, {Component} from 'react';
import {StyleSheet, View, Text} from 'react-native';
import Image from '../../../component/Image';
import I18n from 'gsresource/string/i18n';
import fonts from '../../../gsresource/ui/fonts';
import PropTypes from 'prop-types';

export default class SearchGoodsEmptyView extends Component{

    static propTypes = {
        style: PropTypes.object,
    };

    render() {
        return(
            <View style={[styles.content, this.props.style]}>
                <Image
                    source={require('gsresource/img/noSearchResult.png')}
                />
                <Text style={styles.text}>{I18n.t('noSearchResult')}</Text>
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