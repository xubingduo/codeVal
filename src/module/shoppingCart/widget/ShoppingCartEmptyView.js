/**
 * author: tuhui
 * Date: 2018/8/2
 * Time: 14:09
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet, Text,
    View,
} from 'react-native';
import StatusButton from '../../../component/StatusButton';
import Image from '../../../component/Image';
import fonts from '../../../gsresource/ui/fonts';
import colors from '../../../gsresource/ui/colors';
import PropTypes from 'prop-types';

export default class ShoppingCartEmptyView extends Component {

    static propTypes = {
        onItemClick: PropTypes.func,
    };

    render() {
        return (
            <View style={styles.container}>
                <Image
                    source={require('gsresource/img/emptyShoppingCart.png')}
                />

                <Text style={styles.text}>
                    您的进货车空空如也
                </Text>

                <StatusButton
                    onItemClick={this.props.onItemClick}
                    checked={true}
                    text={'去逛逛'}
                    style={{width: 205, height: 45}}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    text: {
        marginBottom: 30,
        fontSize: fonts.font14,
        color: colors.greyFont
    }
});