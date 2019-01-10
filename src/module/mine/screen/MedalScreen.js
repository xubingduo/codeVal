/**
 * author: wwj
 * Date: 2018/8/9
 * Time: 下午7:25
 * des: 勋章界面
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    View, Text, Image,
    FlatList,
    SafeAreaView, Platform, NativeModules,
} from 'react-native';
import {observer} from 'mobx-react';
import colors from '../../../gsresource/ui/colors';
import fonts from '../../../gsresource/ui/fonts';
import NavigationHeader from '../../../component/NavigationHeader';
import MedalStore from '../store/MedalStore';
import MedalItem from '../widget/MedalItem';
import PropTypes from 'prop-types';
@observer
export default class MedalScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param shopId number 门店id
         * @param medals Array<Object> 门店勋章
         */
        navigation: PropTypes.object,
    }

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'勋章'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.store = new MedalStore();
        this.store.shopId = this.props.navigation.getParam('shopId',0);
        this.store.medals = this.props.navigation.getParam('medals',[]);
    }

    beforeMount() {
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageStart('勋章介绍');
        }
    }

    componentDidMount(){
        this.beforeMount();
        if(this.store.shopId){
            this.store.quertShopMedals();
        } else {
            this.store.queryMedalList((ret, ext) => {

            });
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageEnd('勋章介绍');
        }
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, paddingBottom: 5,backgroundColor: colors.bg}}>
                <FlatList
                    style={{paddingTop:5}}
                    data={this.store.medalListShow}
                    renderItem={this.renderItem}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                />
            </SafeAreaView>
        );
    }

    renderItem = ({item}) => {
        return (
            <MedalItem item={item} />
        );
    }
}


const styles = StyleSheet.create({

});