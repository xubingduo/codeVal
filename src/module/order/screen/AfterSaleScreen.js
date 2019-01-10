/**
 *@author xbu
 *@date 2018/08/28
 *@desc  退款/售后页面
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
} from 'react-native';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh/index';
import {DLFlatList,Toast} from '@ecool/react-native-ui';
import colors from '/gsresource/ui/colors';
import Image from '../../../component/Image';
import NavigationHeader from '../../../component/NavigationHeader';
import {observer} from 'mobx-react';
import Alert from '../../../component/Alert';
import OrderList from '../store/OrderListStore';
import AfterSaleComponent from '../widget/AfterSaleComponent';
import I18n from '../../../gsresource/string/i18n';
import ShowChatScreen from 'svc/CustomerServiceSvc';

const PAGE_SIZE = 20;
@observer
export default class AfterSaleScreen extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('returnOrrefund')}
                    themeStyle={'default'}
                    statusBarStyle={'dark-content'}
                />
            ),
        };
    };


    constructor(props) {
        super(props);
        this.store = new OrderList();
        this.state = {
            key: '',
            listFreshState: RefreshState.Idle,
        };
        this.pageNo = 1;
    }


    render() {
        return (
            <SafeAreaView style={styles.container}>
                {
                    this.renderList(this.store.AfterSale)
                }

            </SafeAreaView>
        );
    }



    // 中间item
    renderList = (data) => {
        return (
            <DLFlatList
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderCell}
                mode={'FlatList'}
                refreshState={this.state.listFreshState}
                data={data}
                ListEmptyComponent={this.listEmptyView}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
                keyboardDismissMode={'on-drag'}
            />
        );
    };

    //  当数据为空展示列表
    listEmptyView = () => {
        return (
            <View style={{position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('gsresource/img/noOrder.png')} />
                <Text style={{color: colors.normalFont}}>暂无数据</Text>
            </View>
        );
    };

    // 具体数据列表
    renderCell =({item}) => {
        return(
            <AfterSaleComponent
                listData={item}
                goToUrl={this.goToDetailsPage}
                onClickBtn={()=> {
                    this.onClickBtn(item);
                }}
                onClickPlat={()=>{
                    this.onClickPlat(item);
                }}
            />
        );
    };


    componentDidMount() {
        //数据请求
        this.onHeadFresh();
    }

    onLoadMore = () => {
        this.loadData(false);
    };

    onHeadFresh = () => {
        this.loadData(true);
    };


    // 加载更多
    async loadData(fresh) {
        if (fresh) {
            this.pageNo = 1;
            this.updateFreshState(RefreshState.HeaderRefreshing);
        } else {
            this.updateFreshState(RefreshState.FooterRefreshing);
        }

        let obj = {
            pageSize : PAGE_SIZE,
            pageNo: this.pageNo,
            statusType: 5,
            searchToken: this.state.key
        };

        try {
            await this.store.getOrderListData(fresh, obj , (ret, extra) => {
                if (!ret) {
                    Alert.alert(extra);
                    this.updateFreshState(RefreshState.Idle);
                } else {
                    this.pageNo = this.pageNo + 1;
                    if (extra === 0) {
                        this.updateFreshState(RefreshState.NoMoreData);
                    } else {
                        this.updateFreshState(RefreshState.Idle);
                    }
                }
            });

        }catch (e) {
            this.updateFreshState(RefreshState.Failure);
            Alert.alert(e.message);
        }
    }

    // 改状态
    updateFreshState = (state) => {
        this.setState({
            listFreshState: state,
        });
    };

    // 点击进入订单详情页面
    goToDetailsPage=(data)=> {
        this.props.navigation.navigate('OrderDetailsScreen', {id: data,returnFlag: 0});
    };


    // 申请售后
    onClickBtn =(data) => {
        let order_id = data.bill.id;
        // let money= data.bill.totalMoney;
        // let status = data.bill.frontFlag;
        // let backFlag = data.bill.backFlag;
        // if(backFlag === 0 || backFlag === 2 || backFlag === 12){
        //     OrderCommonUtl.onClickBtnCenter(order_id , money, status, this.props.navigation);
        // } else {
        this.props.navigation.navigate('ReturnGoodsLogsScreen',{orderId: order_id});
        // }
    };

    // 平台申述
    onClickPlat =(data)=>{
        let orderId = JSON.stringify(data.bill.id);
        let returnOrderId = data.bill.billNo;
        let styleId = data.skus[0].id;
        console.log(orderId);
        console.log(returnOrderId);
        ShowChatScreen.showChatScreen({orderId: orderId,returnOrderId: returnOrderId});
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    }
});