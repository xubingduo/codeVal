/**
 * @author sml2
 * @date 2018/10/25.
 * @desc 好店担保
 */
import React, { Component } from 'react';
import { View, Text, SafeAreaView,ScrollView,StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import NavigationHeader from 'component/NavigationHeader';
import colors from 'gsresource/ui/colors';
import GuaranteeTopView from '../widget/GuaranteeTopView';
import {Screen} from 'gsresource/ui/ui';
import NavigationSvc from 'svc/NavigationSvc';
import configStore from 'store/ConfigStore';
import {Observer} from 'mobx-react';

let didBack = false;

export default class GoodShopGuaranteeScreen extends Component {
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
                    navigationTitleItem={'好店担保'}
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

    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillUnmount() {
        if(!didBack){
            let params = this.props.navigation.state.params;
            params && params.backHandler && params.backHandler();
        }
    }

    componentDidMount() {
        configStore.fetchGoodShopGuarantee();
    }

    render(){
        return(
            <SafeAreaView style={styles.container}>
                <ScrollView style={{flex:1}}>
                    <GuaranteeTopView
                        style={{width:Screen.width}}
                        desc={'商陆好店担保'}
                        source={require('gsresource/img/guaruntee_2.png')}
                    />
                    <View style={{flexDirection:'row',alignItems:'center',paddingLeft:14,marginTop:13,marginBottom:13}}>
                        <Text style={{fontSize:12, color:colors.goodFont,marginRight:10}}>商陆好店担保</Text>
                        <View style={{height:1,width:12,backgroundColor:colors.title}} />
                    </View>
                    <View style={{flex:1}}>
                        {this.renderContent()}
                    </View>
                </ScrollView>
            </SafeAreaView>
        );
    }

    renderContent = ()=>{
        return (
            <Observer>
                {
                    () => (
                        <View style={{marginLeft:14,marginRight:14,flex:1,marginBottom:8,borderRadius:4,borderWidth:1,borderColor:'#eeeeee',paddingBottom:10}}>
                            <View style={{width:'100%',marginTop:10,alignItems:'center'}}>
                                <Text style={{color:colors.title,fontSize:16}}>商陆好店担保</Text>
                            </View>
                            {configStore.goodShopGuaranteeItems.slice().map((item,index)=>{
                                return this.renderContentCell(item,index);
                            })}
                        </View>
                    )
                }
            </Observer>
        );
    }

    renderContentCell = (item,index)=>{
        return (
            <View key={index} style={{paddingTop:10,paddingBottom:10,marginLeft:16,marginRight:16}}>
                <View style={{flexDirection:'row',}}>
                    <Text style={{fontSize:14, color:colors.title}}>•</Text>
                    <Text style={{fontSize:14,marginBottom:10,marginLeft:10,color:'black'}}>{item.name}</Text>
                </View>
                <Text style={{fontSize:12, color:colors.goodFont,lineHeight:25}} numberOfLines={100}>    {item.content}</Text>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:'#ffffff',
    },
});
