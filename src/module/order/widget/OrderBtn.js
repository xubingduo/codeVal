/**
 *@author xbu
 *@date 2018/07/30
 *@desc  通用按钮
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import fonts from '/gsresource/ui/fonts';
import colors from '/gsresource/ui/colors';
import I18n from '/gsresource/string/i18n';
import PropTypes from 'prop-types';

export default class OrderBtn extends Component {
    static propTypes = {
        onClickBtn: PropTypes.func,
        btnColor: PropTypes.string,
        name: PropTypes.string,
    };

    render() {

        return(
            <TouchableOpacity
                style={[styles.btn,{borderColor: this.props.btnColor ? this.props.btnColor : colors.unEnable,}]}
                hitSlop={{left: 0, right: 0, top: 10, bottom: 10}}
                onPress={()=>{
                    if(this.props.onClickBtn){
                        this.props.onClickBtn();
                    }
                }}
            >
                <Text style={{fontSize: fonts.font10,color: this.props.btnColor ? this.props.btnColor : colors.greyFont}}>{this.props.name ? this.props.name : I18n.t('delete')}</Text>
            </TouchableOpacity>
        );
    }
}


const styles = StyleSheet.create({

    btn: {
        width: 48,
        height: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        marginLeft: 5,
    }

});