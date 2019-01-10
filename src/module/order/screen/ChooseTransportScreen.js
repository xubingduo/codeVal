/**
 *@author xbu
 *@date 2018/10/29
 *@desc  选择物流
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    DeviceEventEmitter
} from 'react-native';
import colors from '../../../gsresource/ui/colors';
import I18n from '../../../gsresource/string/i18n';
import NavigationHeader from '../../../component/NavigationHeader';
import {DLFlatList, RefreshState, Toast} from '@ecool/react-native-ui';
import Alert from '../../../component/Alert';
import LogisticsStore from '../store/LogisticsStore';
import fonts from '../../../gsresource/ui/fonts';
import StringUtl from '../../../utl/StringUtl';

const PAGE_SIZE = 20;
export default class ChooseTransportScreen extends Component {
    constructor(props){
        super(props);
        this.store = new LogisticsStore();
        this.state ={
            listFreshState: RefreshState.Idle,
            inputText: '',
        };
        this.pageNo = 1;
    }

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'选择物流公司'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    listEmptyView = () => {
        return(
            <View style={styles.cartBox}>
                <Image source={require('gsresource/img/transition.png')} />
                <Text style={{fontSize: fonts.font12,color: colors.greyFont,paddingBottom: 20}}>暂无物流信息，请稍后查询</Text>
            </View>
        );
    };

    renderItem =({item}) =>{
        return (
            <TouchableOpacity style={styles.item} onPress={()=> this.backUrl(item)}>
                <Text style={styles.title}>{item.name}</Text>
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.searchBox}>
                    <TextInput
                        style={styles.input}
                        placeholder={'点击快速搜索物流公司'}
                        onChangeText={(inputText) => {
                            const value = StringUtl.filterChineseSpace(inputText);
                            this.setState({inputText: value});
                        }}
                        underlineColorAndroid='transparent'
                        returnKeyType={'done'}
                        blurOnSubmit={true}
                        maxLength={150}
                        onSubmitEditing={this.onSubmitEditing}
                    />
                </View>

                <DLFlatList
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={this.renderItem}
                    mode={'FlatList'}
                    refreshState={this.state.listFreshState}
                    data={this.store.transportList}
                    ListEmptyComponent={this.listEmptyView}
                    onFooterRefresh={this.onLoadMore}
                    onHeaderRefresh={this.onHeadFresh}
                />

            </SafeAreaView>
        );
    }
    componentDidMount() {
        setTimeout(()=>{
            this.loadData(true);
        },500);
    }
    componentWillUnmount() {
    }

    loadData = async (freshStatus) => {
        let obj = {
            pageSize: PAGE_SIZE,
            pageNo: this.pageNo,
            jsonParam: {
                cap: 1,
                name: this.state.inputText
            }
        };
        try {
            if(this.pageNo === 1){
                this.updateFreshState(RefreshState.HeaderRefreshing);
            } else{
                this.updateFreshState(RefreshState.FooterRefreshing);
            }

            await this.store.requestTransStore(freshStatus,obj,(data)=>{
                switch (data){
                case 0:
                    // 无数据
                    this.updateFreshState(RefreshState.Idle);
                    break;
                case 1:
                    // 还有分页
                    this.pageNo++;
                    this.updateFreshState(RefreshState.Idle);
                    break;
                case 2:
                    // 分页完毕
                    this.updateFreshState(RefreshState.NoMoreData);
                    break;
                }
            });
        } catch (e) {
            this.updateFreshState(RefreshState.Idle);
            Alert.alert(e.message);
        }
    };

    updateFreshState = (state) => {
        this.setState({
            listFreshState: state,
        });
    };

    // 加载更多
    onLoadMore = () =>{
        this.loadData(true);
    };

    // 刷新
    onHeadFresh = () => {
        this.pageNo = 1;
        this.loadData(false);
    };

    backUrl =(data)=> {
        DeviceEventEmitter.emit('CHOOSE_TRANSPORT',{names:  data.name, id: data.id});
        setTimeout(()=>{
            this.props.navigation.goBack();
        },200);
    };

    onSubmitEditing =()=> {
        setTimeout(()=>{
            this.onHeadFresh();
        },500);
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    searchBox: {
        height: 39,
        backgroundColor: colors.border1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 10,
        paddingRight: 10,
    },

    input: {
        backgroundColor: colors.white,
        width: '100%',
        borderRadius: 20,
        padding: 0,
        paddingLeft: 15,
        height: 29,

    },

    cartBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    item: {
        height: 44,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
        justifyContent: 'center',
        paddingLeft: 20,
    },

    title: {
        color: colors.normalFont,
        fontSize: fonts.font14
    }

});