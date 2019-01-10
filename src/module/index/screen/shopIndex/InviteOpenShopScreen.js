/**
 * @author [lyq]
 * @email
 * @create date 2018-10-12 14:43:33
 * @modify date 2018-10-12 14:43:33
 * @desc 邀请商陆花客户开头好店店铺
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    Dimensions,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Image,
    SafeAreaView
} from 'react-native';
import PropTypes from 'prop-types';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import NavigationHeader from 'component/NavigationHeader';
import Header from 'rmc-calendar/lib/calendar/Header';
import Alert from 'component/Alert';
import {Toast} from '@ecool/react-native-ui';
import ShopApiManager from 'apiManager/ShopApiManager';

export default class InviteOpenShopScreen extends Component {
    static propTypes = {
        slhShopInfo: PropTypes.object,
        navigation: PropTypes.object
    };

    static navigationOptions = ({navigation}) => {
        let {params} = navigation.state;
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    navigationTitleItem={params.slhShopInfo.shopName}
                />
            )
        };
    };

    render() {
        let {params} = this.props.navigation.state;
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.content}>
                    <Image source={require('gsresource/img/emptyShop.png')} />
                    <Text style={styles.shopName}>
                        {params.slhShopInfo.shopName}
                    </Text>
                    <Text style={styles.tip}>
                        商家暂无商品，快邀请他上传商品
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.button}
                    onPress={this.inviteShop}
                >
                    <Text style={styles.buttonText}>发送邀请</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    /**
     * 邀请slh店铺开通好店
     */
    inviteShop = async () => {
        let {params} = this.props.navigation.state;
        if (params && params.slhShopInfo && params.slhShopInfo.shopid) {
            try {
                Toast.loading();
                await ShopApiManager.inviteShopScanOpen({
                    slhSn: params.slhShopInfo.sn,
                });
                //await ShopApiManager.inviteShop(params.slhShopInfo.slhUrl);
                Toast.success('邀请发送成功');
            } catch (error) {
                Toast.dismiss();
                Alert.alert(error.message);
            }
        }
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        alignItems: 'center'
    },
    shopName: {
        fontSize: fonts.font14,
        color: colors.normalFont
    },
    tip: {
        fontSize: fonts.font12,
        color: colors.greyFont,
        marginTop: 3
    },
    buttonText: {
        fontSize: fonts.font14,
        color: colors.white
    },
    button: {
        backgroundColor: colors.title,
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 45,
        justifyContent: 'center',
        alignItems: 'center'
    }
});
