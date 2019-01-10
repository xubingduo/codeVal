/**
 * author: wwj
 * Date: 2018/8/21
 * Time: 下午8:13
 * des: 门店无商品 空白页
 */
import React, {Component} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import Image from '../../../component/Image';
import fonts from '../../../gsresource/ui/fonts';
import I18n from 'gsresource/string/i18n';
import colors from '../../../gsresource/ui/colors';
import PropTypes from 'prop-types';

export default class ShopIndexEmptyView extends Component {

    static propTypes = {
        btnClickFunc: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {showBtn: false, };
    }

    componentWillReceiveProps(nextProps){
        this.setState({showBtn: nextProps.showBtn});
    }

    render() {
        return(
            <View style={styles.content}>
                <Image
                    source={require('gsresource/img/noShopGoods.png')}
                />
                <Text style={styles.text}>{I18n.t('noShopGoodsTip')}</Text>

                {/*// 1.0版本邀请不做*/}
                {/*{this.state.showBtn && (*/}
                {/*<TouchableOpacity*/}
                {/*style={styles.buttonContainer}*/}
                {/*onPress={this.props.btnClickFunc}*/}
                {/*>*/}
                {/*<Text style={styles.btnText}>{'发送邀请'}</Text>*/}
                {/*</TouchableOpacity>*/}
                {/*)}*/}
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

    buttonContainer: {
        marginTop: 30,
        height: 45,
        width: 205,
        backgroundColor: colors.activeBtn,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    buttonGreyContainer: {
        marginTop: 30,
        height: 45,
        width: 205,
        backgroundColor: colors.greyFont,
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    btnText: {
        color: colors.white,
        fontSize: fonts.font14,
    },
});