/**
 * Created by sml2 on 2018/10/25.
 */
import React, { Component } from 'react';
import { View, Text,StyleSheet,ScrollView } from 'react-native';
import NavigationHeader from 'component/NavigationHeader';
import colors from 'gsresource/ui/colors';
import GuaranteeTopView from '../widget/GuaranteeTopView';
import Image from 'component/Image';
import PropTypes from 'prop-types';
import {Screen} from 'gsresource/ui/ui';
import NavigationSvc from 'svc/NavigationSvc';
import configStore from 'store/ConfigStore';
import DocSvc from 'svc/DocSvc';

let didBack = false;

export default class ServiceGuaranteeScreen extends Component {
    static propTypes = {
        backHandler: PropTypes.func,
    }

    static navigationOptions = ({navigation}) => {
        didBack = false;
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    titleItemTextStyle={{color: colors.goodFont}}
                    backgroundColor={colors.white}
                    navigationTitleItem={'服务保障'}
                    statusBarStyle={'dark-content'}
                    onLeftClickHandler={()=>{
                        didBack = true;
                        NavigationSvc.pop();
                        let params = navigation.state.params;
                        params && params.backHandler && params.backHandler();
                    }}
                />
            ),
        };
    };

    componentWillUnmount() {
        if(!didBack){
            let params = this.props.navigation.state.params;
            params && params.backHandler && params.backHandler();
        }
    }

    componentDidMount() {
        configStore.fetchServiceGuarantee();
    }

    render(){
        return(
            <ScrollView style={styles.container}>
                <GuaranteeTopView style={{width:Screen.width}} />
                <View style={{flexDirection:'row',alignItems:'center',paddingLeft:14,marginTop:13,marginBottom:13}}>
                    <Text style={{fontSize:12, color:colors.goodFont,marginRight:10}}>服务保障</Text>
                    <View style={{height:1,width:12,backgroundColor:colors.title}} />
                </View>
                {configStore.serviceGuaranteeItems.slice().map((item,index)=>{
                    return (
                        <View key={index}>
                            {this.renderCell(item)}
                        </View>
                    );
                })}
            </ScrollView>
        );
    }

    renderCell = (item)=>{
        return (
            <View style={styles.cellContainer}>
                <View style={{flex:1,paddingLeft:20,paddingRight:20,height:'100%',paddingBottom:20}}>
                    <Text style={{fontSize:14, color:colors.title,marginTop:10,marginBottom:8}}>{item.name}</Text>
                    <View>
                        <Text style={{fontSize:12, color:colors.goodFont,lineHeight:18}} numberOfLines={0}>{item.content}</Text>
                    </View>
                </View>
                <View style={{marginRight:18,width:50,height:50}}>
                    <Image style={{width:'100%',height:'100%'}} source={{uri: DocSvc.docURL(item.docId)}} />
                </View>
            </View>
        );
    }

}


const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:'#ffffff',
    },
    cellContainer:{
        marginLeft:14,
        marginRight:14,
        marginBottom:8,
        flexDirection:'row',
        alignItems:'center',
        borderRadius:4,
        borderWidth:1,
        borderColor:'#eeeeee'
    }
});
