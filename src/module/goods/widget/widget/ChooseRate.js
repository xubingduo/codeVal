/**
 *@author xbu
 *@date 2018/12/05
 *@desc 选择利率
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    ScrollView,
    View,
    Text,
    Dimensions,
    TouchableOpacity
} from 'react-native';

import colors from 'gsresource/ui/colors';
import PropTypes from 'prop-types';

const WIDTH = Dimensions.get('window').width;
export default class ChooseRate extends Component {

    static propTypes = {
        priceRate: PropTypes.array,
        isShow: PropTypes.bool,
        style: PropTypes.object,
        onPress: PropTypes.func,
    };

    static defaultPropTypes = {
        onPress: () => null,
        priceRate: [],
        isShow: false,
        style: {}
    };

    render() {
        if(!this.props.isShow){
            return null;
        }
        return (
            <View style={[styles.scrollBox,this.props.style]}>
                <ScrollView>
                    {
                        this.props.priceRate.map(val => {
                            return (
                                <TouchableOpacity key={val} onPress={()=> this.props.onPress(val)}>
                                    <Text style={styles.scrollBoxText}>{val}</Text>
                                </TouchableOpacity>
                            );
                        })
                    }
                </ScrollView>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    scrollBox: {
        width: WIDTH*0.22,
        position: 'absolute',
        height: 100,
        borderWidth: 1,
        borderColor: '#f1f1f1',
        top: 200,
        right: 15,
        zIndex: 1000,
        backgroundColor: '#fff',
        opacity: 0.8,
    },

    scrollBoxText: {
        height: 40,
        lineHeight: 40,
        paddingLeft: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        color: colors.greyFont,
        fontSize: 14,
    }

});