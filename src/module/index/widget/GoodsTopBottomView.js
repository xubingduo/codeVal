/**
 * author: tuhui
 * Date: 2018/7/20
 * Time: 10:35
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet, Text,
    View
} from 'react-native';
import colors from '../../../gsresource/ui/colors';
import PropTypes from 'prop-types';
import Image from '../../../component/Image';
import fonts from '../../../gsresource/ui/fonts';

export default class GoodsTopBottomView extends Component {

    static propTypes = {
        style: PropTypes.object,
        imgUrl: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
    };

    static defaultProps = {
        style: {}
    };

    render() {
        return (
            <View style={[styles.container, this.props.style]}>

                <Image
                    style={{width: 77, height: 77, marginTop: 2}}
                    source={{uri: this.props.imgUrl}}
                />


                <View style={{
                    borderWidth: 1,
                    borderColor: colors.activeFont,
                    borderRadius: 4,
                    backgroundColor: colors.pinkLabel,
                    padding: 1,
                    marginTop: 3
                }}
                >
                    <Text style={{
                        textAlign: 'center',
                        color: colors.activeFont,
                        fontSize: fonts.font10
                    }}
                    >
                        {this.props.label}
                    </Text>
                </View>

                <Text style={{
                    fontWeight: 'bold',
                    marginTop: 3,
                    color: colors.activeFont,
                    fontSize: fonts.font18
                }}
                >
                    {`¥ ${this.props.price}`}
                </Text>

            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.labelBg,
        borderRadius: 3,
        alignItems: 'center'
    }
});