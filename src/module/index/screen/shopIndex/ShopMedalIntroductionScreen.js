/**
 * Created by sml2 on 2018/10/30.
 */
import React, { Component } from 'react';
import { View, Text, ScrollView,TouchableOpacity,StyleSheet,SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
import NavigationHeader from 'component/NavigationHeader';
import colors from 'gsresource/ui/colors';
import Image from 'component/Image';

export default class ShopMedalIntroductionScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'门店勋章'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };


    constructor(props) {
        super(props);
        this.state = {};
    }

    render(){
        let items = [
            {source:require('gsresource/img/accurate_accurate.png'),title:'准',desc:'库存数量小于0占比低于10%'},
            {source:require('gsresource/img/accurate_quick.png'),title:'快',desc:'平台普通货品要求48小时内发货\n95%以上订单能在24小时内发货'},
            {source:require('gsresource/img/accurate_new.png'),title:'新',desc:'当日新款超过20款'},
            {source:require('gsresource/img/accurate_more.png'),title:'多',desc:'在售款式数量超过100'},
            {source:require('gsresource/img/accurate_good.png'),title:'好',desc:'商陆好店平台人工授予'},
        ];
        return(
            <SafeAreaView style={styles.container}>
                <ScrollView style={{flex:1}}>
                    {items.map((item,index)=>{
                        return this.renderCell(item,index);
                    })}
                </ScrollView>
            </SafeAreaView>
        );
    }

    renderCell = (item,index)=>{
        return (
            <View key={index}
                style={{flexDirection:'row',height:100,alignItems:'center',backgroundColor:'white',paddingLeft:20,paddingRight:20,marginLeft:14,marginRight:14,marginTop:10}}
            >
                <View style={{width:75,height:75}}>
                    <Image style={{width:75,height:75,borderWidth:1,borderRadius:37.5,borderColor:'transparent'}} source={item.source} />
                </View>
                <View style={{marginLeft:19,height:'75%'}}>
                    <Text style={{fontSize:24, color:colors.normalFont,marginBottom:6,marginTop:10,fontWeight:'bold'}}>{item.title}</Text>
                    <Text style={{fontSize:14, color:colors.greyFont}}>{item.desc}</Text>
                </View>
            </View>
        );
    }

}


const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:colors.bg,
    },
});
