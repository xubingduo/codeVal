/**
 * author: tuhui
 * Date: 2018/8/2
 * Time: 15:02
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet, Text,
    View
} from 'react-native';
import Image from '../../../component/Image';
import StatusButton from '../../../component/StatusButton';
import PropTypes from 'prop-types';

export default class ShoppingCartUnLogin extends Component {
    static propTypes = {
        onItemClick: PropTypes.func,
    };

    render() {
        return (
            <View style={styles.container}>
                <Image source={require('gsresource/img/shoppingCartUnlogin.png')} />

                <Text style={styles.text}>
                    您还未登录
                </Text>

                <StatusButton
                    onItemClick={this.props.onItemClick}
                    checked={true}
                    text={'去登录'}
                    style={{width: 205, height: 45}}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {}
});