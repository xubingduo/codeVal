/**
 * @Author: tt
 * @CreateDate:2018/11/1
 * @ModifyDate:2018/11/1
 * @desc 描述注释
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
} from 'react-native';
import Image from '../../../../component/Image';
import colors from '../../../../gsresource/ui/colors';
import I18n from '../../../../gsresource/string/i18n';
import NavigationHeader from '../../../../component/NavigationHeader';

export default class ShareQrCodeScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'好店下载二维码'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            )
        };
    };


    render() {
        return (
            <View style={styles.container}>
                <Image
                    style={{marginTop: 20,}}
                    source={require('gsresource/img/downQrcode.png')}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,

        alignItems: 'center',
        backgroundColor: colors.bg
    }
});