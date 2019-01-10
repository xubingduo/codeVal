/**
 * @Author: tt
 * @CreateDate:2018/12/14
 * @ModifyDate:2018/12/14
 * @desc 描述注释
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import colors from '../../../gsresource/ui/colors';
import Image from '../../../component/Image';
import PropTypes from 'prop-types';
import fonts from '../../../gsresource/ui/fonts';
import ImageButton from '../../../component/ImageButton';
import Alert from '../../../component/Alert';
import rootStore from '../../../store/RootStore';
import I18n from '../../../gsresource/string/i18n';

const tips = '1.合包内所有子订单状态均为未配货，合包运费将跟随退款的最后一个子订单退还\n' + '2.若合包内存在处于其他状态的子订单时，合包运费不退';

export default class CombFeeCell extends Component {

    static propTypes = {
        value: PropTypes.number,
    };

    render() {
        return (
            <View style={styles.returnBox}>

                <View style={{flexDirection: 'row',}}>
                    <Text style={styles.returnText}>合包运费</Text>
                    <ImageButton
                        onClick={() => {

                            Alert.alert('合包运费说明', tips, [
                                {
                                    text: '我知道了',
                                    onPress: () => {

                                    }
                                }
                            ]);
                        }}
                        style={{marginLeft: 8}}
                        hitSlop={{top: 16, left: 10, bottom: 16, right: 10}}
                        source={require('gsresource/img/tips.png')}
                    />
                </View>


                <Text style={{paddingRight: 10, color: colors.greyFont,}}>
                    {this.props.value}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    returnBox: {
        height: 45,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingRight: 15,
        paddingLeft: 15,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
    },
    returnText: {
        fontSize: fonts.font14,
        color: colors.normalFont,
    },
});