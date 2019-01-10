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

export default class GoodsLeftRightView extends Component {

    static propTypes = {
        style: PropTypes.object,
        imgUrl: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        price: PropTypes.string.isRequired,
    };

    static defaultProps = {
        style: {}
    };

    render() {
        return (
            <View style={[styles.container, this.props.style]}>

                <Text style={{
                    fontWeight: 'bold',
                    marginTop: 6,
                    marginLeft: 8,
                    color: colors.normalFont,
                    fontSize: 18
                }}
                >
                    {this.props.title}
                </Text>

                <View style={{
                    position: 'absolute',
                    bottom: 30,
                    left: 8,
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
                    position: 'absolute',
                    bottom: 4,
                    fontWeight: 'bold',
                    left: 8,
                    color: colors.activeFont,
                    fontSize: fonts.font18
                }}
                >
                    {`¥ ${this.props.price}`}
                </Text>

                <Image
                    style={{flex: 1, width: 63, height: 92, position: 'absolute', right: 4, top: 4, bottom: 4}}
                    source={{uri: this.props.imgUrl}}
                />

            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.labelBg,
        borderRadius: 3,
    }
});