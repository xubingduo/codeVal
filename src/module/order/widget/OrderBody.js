/**
 *@author xbu
 *@date 2018/07/28
 *@desc 订单身体
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text
} from 'react-native';
import fonts from '/gsresource/ui/fonts';
import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import Image from '../../../component/Image';
import DocSvc from '../../../svc/DocSvc';

export default class names extends Component {
    static propTypes = {
        title: PropTypes.string,
        rem: PropTypes.string,
        money: PropTypes.number,
        number: PropTypes.number,
        url: PropTypes.string,
        returnStatus: PropTypes.string
    };

    render() {
        let img = this.getImg();
        return (
            <View style={styles.orderListBarBox}>
                <Image style={{width: 70, height: 70,borderRadius: 2}} source={{uri:DocSvc.docURLM(img)}} defaultSource={require('gsresource/img/dressDefaultPic110.png')} />
                <View style={styles.orderListBarRight}>
                    <Text style={styles.orderListBarTitle}>{this.props.title}</Text>
                    <Text style={{color:colors.greyFont, fontSize:12}} numberOfLines={1}>{this.props.rem ? '留言:' + this.props.rem : ''}</Text>
                    <View style={styles.orderListBarNav}>
                        <View style={{flexDirection: 'row', alignItems:'center'}}>
                            <Text style={[styles.orderListBarTitle,{fontSize: fonts.font14, fontWeight: '600'}]}>¥{this.props.money}{' '}</Text>
                            <Text style={[styles.orderListBarTitle,{fontSize: fonts.font10, paddingLeft: 10}]}>X{this.props.number}</Text>
                        </View>
                        <Text style={styles.orderStatus}>{this.props.returnStatus}</Text>
                    </View>
                </View>
            </View>
        );
    }

    getImg = () => {
        let spuDocId = this.props.url;
        if(spuDocId){
            let arrayImg = spuDocId.split(',');
            return arrayImg[0];
        }
        return spuDocId;
    };
}


const styles = StyleSheet.create({

    orderListBarBox: {
        flexDirection: 'row',
        alignItems:'center',
        height: 104,
        borderBottomWidth: 1,
        borderBottomColor: colors.white,
        paddingLeft: 15,
    },

    orderListBarRight: {
        paddingLeft: 9,
        paddingRight: 15,
        flex: 1,
        height: 70,
        justifyContent: 'space-between'
    },

    orderListBarTitle: {
        fontSize: fonts.font12,
        color: colors.normalFont,
    },

    orderListBarNav: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
    },

    orderStatus: {
        fontSize: fonts.font14,
        color: colors.orderColor,
    }

});