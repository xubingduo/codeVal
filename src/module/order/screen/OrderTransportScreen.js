/**
 *@author xbu
 *@date 2018/07/30
 *@desc 物流流水记录
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    ScrollView
} from 'react-native';

import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';
import I18n from '/gsresource/string/i18n';
import NavigationHeader from '../../../component/NavigationHeader';
import LogisticsStore from '../store/LogisticsStore';
import {Toast} from '@ecool/react-native-ui';
import {observer} from 'mobx-react';

@observer
export default class OrderTransportScreen extends Component {
    constructor(props){
        super(props);
        this.store = new LogisticsStore();
        this.state = {
            tranId: '',
            tranName: ''
        };
    }
    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('lookUpTransport')}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    renderItem = (el,index) =>{
        return(
            <View style={styles.transition} key={index}>
                <View style={styles.dot} />
                <View style={styles.transitionText}>
                    <Text style={index === 0 ? styles.transitionTitle : styles.transitionDate} numberOfLines={4}>{el.acceptStation}</Text>
                    <Text style={[styles.transitionDate,{textAlign: 'right'}]}>{el.acceptTime}</Text>
                </View>
            </View>
        );
    };

    renderElement =()=>{
        let element = this.store.logisticsArrayData.map((el,index)=>{
            return this.renderItem(el,index);
        });

        return element;
    };

    renderItemData = () => {
        return(
            <ScrollView>
                <View style={styles.transitionBox}>
                    <View style={[styles.line,{height: 90 * (this.store.logisticsArrayData.length -1)}]} />
                    {this.renderElement()}
                </View>
            </ScrollView>
        );
    };

    renderItemNull = () => {
        return(
            <View style={styles.cartBox}>
                <Image source={require('gsresource/img/transition.png')} />
                <Text style={{fontSize: fonts.font12,color: colors.greyFont,paddingBottom: 20}}>暂无物流信息，请稍后查询</Text>
            </View>
        );
    };

    elementUi = () => {
        return this.store.logisticsArrayData.length ? this.renderItemData() : this.renderItemNull();
    };


    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTop}>{this.state.tranName}</Text>
                        <Text style={styles.headerBottom}>{I18n.t('orderNumber')}：{this.state.tranId}</Text>
                    </View>
                </View>
                <Text style={styles.title}>{I18n.t('transportMsg')}</Text>
                {this.elementUi()}
            </SafeAreaView>
        );
    }

    componentDidMount() {
        const { params } = this.props.navigation.state;
        let obj = JSON.parse(params.id);

        let id = '';
        let name = '';
        let codeId = '';
        for(let i = 0; i < obj.length; i ++){
            if(obj[i].waybillNo){
                id = obj[i].waybillNo;
            }
            if(obj[i].logisCompName){
                name = obj[i].logisCompName;
            }
            if(obj[i].logisCompId){
                codeId = obj[i].logisCompId;
            }
        }

        this.setState({
            tranId: id,
            tranName: name
        });

        this.loadData(id,codeId);
    }

    async loadData (id,code) {
        Toast.loading();
        this.store.requestData(id,code).then((data)=>{
            Toast.dismiss();
        }).catch(e=>{
            Toast.show(e.message,2);
        });
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    header: {
        backgroundColor: colors.normalFont,
        height: 84,
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 15,
    },


    headerTop: {
        fontSize: fonts.font18,
        color: colors.white,
    },

    headerBottom: {
        fontSize: fonts.font12,
        color: colors.white,
        paddingTop: 8,
    },

    title: {
        height: 34,
        lineHeight: 34,
        color: colors.transformFont,
        paddingLeft: 15,
    },

    transition: {
        height: 90,
        backgroundColor: colors.white,
        paddingLeft: 15,
        flexDirection: 'row',
        paddingTop: 15,
        zIndex: 50,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
    },

    dot: {
        width: 8,
        height: 8,
        borderRadius: 8,
        backgroundColor: colors.activeFont,
        marginTop: 4,
    },

    transitionText: {
        height: 50,
        flex: 1,
        paddingRight: 15,
        paddingLeft: 10,
        justifyContent: 'space-between',
    },

    transitionTitle: {
        fontSize: fonts.font12,
        color: colors.activeFont,
        textAlign: 'left',
    },

    transitionDate: {
        fontSize: fonts.font12,
        color: colors.greyFont,
    },

    line: {
        width: 1,
        backgroundColor: colors.activeFont,
        position: 'absolute',
        left: 19,
        top: 19,
        zIndex: 500,
    },

    cartBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }

});