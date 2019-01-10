/**
 * Created by sml2 on 2018/10/25.
 */
import React, { Component } from 'react';
import { View, Text,TouchableOpacity,StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Image from 'component/Image';

export default class GuaranteeTopView extends Component {
    static propTypes = {
        desc: PropTypes.string,
        source:PropTypes.any,
        style:PropTypes.object,
    }

    static defaultProps = {
        desc:'以下服务保障',
        source:require('gsresource/img/guaruntee_big.png'),
    }

    render(){
        return(
            <View style={this.props.style}>
                <Image style={{width:'100%'}} source={require('gsresource/img/guaruntee_top_bg.png')} />
                <View style={{position:'absolute',flexDirection:'row',alignItems:'center',width:'100%',height:'100%'}}>
                    <View style={{flex:1,paddingLeft:28}}>
                        <Text style={{fontSize:12,color:'white',marginBottom:6}}>该商品享受</Text>
                        <Text style={{fontSize:16,color:'white'}}>{this.props.desc}</Text>
                    </View>
                    <View style={{marginRight:45}}>
                        <Image source={this.props.source} />
                    </View>
                </View>
            </View>
        );
    }

}