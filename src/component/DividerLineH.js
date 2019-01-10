/**
 * author: tuhui
 * Date: 2017/12/6
 * Time: 下午5:22
 * 水平分割线
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    View
} from 'react-native';
import colors from 'gsresource/ui/colors';

export default class DividerLineH extends Component{
    render() {
        return (
            <View style={styles.container} />
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.divide,
        height: 1,
    }
});