/**
 * author: tuhui
 * Date: 2018/8/7
 * Time: 14:13
 * des:支付方式选择Item
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Image from '../../../../component/Image';
import PropTypes from 'prop-types';
import colors from '../../../../gsresource/ui/colors';
import fonts from '../../../../gsresource/ui/fonts';

export default class PayMethodCell extends Component {

    static propTypes = {
        icon: PropTypes.any,
        name: PropTypes.string,
        describe: PropTypes.string,
        checked: PropTypes.bool,
        onItemClick: PropTypes.func,
    };


    render() {
        return (
            <TouchableOpacity
                onPress={this.props.onItemClick}
                style={styles.container}
            >
                <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                    <Image source={this.props.icon} />
                    <View
                        style={{marginLeft: 20}}
                    >
                        <Text style={styles.textName}>
                            {this.props.name}
                        </Text>

                        <Text style={styles.textDes}>
                            {this.props.describe}
                        </Text>

                    </View>
                </View>

                <Image
                    source={this.props.checked ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                />
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.white,
        paddingLeft: 18,
        paddingRight: 16,
        flexDirection: 'row',
        height: 70,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    textName: {
        color: colors.normalFont,
        fontSize: fonts.font14,
    },
    textDes: {
        marginTop: 6,
        color: colors.greyFont,
        fontSize: fonts.font14,
    }
});