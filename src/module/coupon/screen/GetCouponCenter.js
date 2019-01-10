/**
 *@author xbu
 *@date 2018/10/11
 *@desc  领券中心页面
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    Image,
    Dimensions,
    DeviceEventEmitter
} from 'react-native';

import I18n from 'gsresource/string/i18n';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import NavigationHeader from 'component/NavigationHeader';
import CouponItem,{ CouponType, ShowRightType } from '../widget/CouponItem';
import {DLFlatList, RefreshState, Toast} from '@ecool/react-native-ui';
import CouponStore from '../store/CouponStore';
import Alert from 'component/Alert';
import {observer} from 'mobx-react';
import UserActionSvc from 'svc/UserActionSvc';

const PAGE_SIZE = 20;
@observer
export default class GetCouponCenter extends Component {
    static navigationOptions = ({navigation}) => {
        let rightItem = (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center', marginLeft: 15}}
                    hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                    onPress={() => {
                        UserActionSvc.track('MINE_COUPONS');
                        navigation.navigate('MyCoupon');
                    }}
                >
                    <Text style={{color: colors.activeBtn,fontSize: fonts.font12}}>我的券</Text>
                </TouchableOpacity>
            </View>
        );

        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'领券中心'}
                    themeStyle={'default'}
                    statusBarStyle={'dark-content'}
                    navigationRightItem={rightItem}
                />
            ),
        };
    };

    constructor(props){
        super(props);
        this.store = new CouponStore();
        this.state ={
            listFreshState: RefreshState.Idle,
        };
        this.pageNo = 1;
    }


    //  当数据为空展示列表
    listEmptyView = () => {
        return (
            <View style={{position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('gsresource/img/couponsNone.png')} />
                <Text style={{color: colors.greyFont, fontSize: fonts.font12,marginTop: 8}}>当前没有优惠券</Text>
            </View>
        );
    };

    // 优惠券
    renderCell =({item})=>{
        let data = {
            color: item.color,
            userGetFlag:  item.userGetFlag,
            execNum: item.execNum,
            fulfilValue: item.fulfilValue,
            shopName: item.shopName,
            endDateStr: item.expiresDateStr,
            beginDateStr:item.effectiveDateStr,
            dims: item.dims,
            cardType: item.cardType,
            execOther: item.execOther,
            couponId: item.couponId,
            unitId: item.unitId
        };

        return(
            <CouponItem
                couponType={CouponType.couponCenter}
                data={data}
                showType={ShowRightType.showBtn}
                showTitleIcon={true}
                titleColor={colors.normalFont}
                onClickBtn={this.onclick}
                onClickLookDetails={this.lookCouponDetails}
            />
        );
    };

    renderCouponList = () => {
        return (
            <DLFlatList
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderCell}
                mode={'FlatList'}
                refreshState={this.state.listFreshState}
                data={this.store.getCouponCenterArr}
                ListEmptyComponent={this.listEmptyView}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
            />
        );
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderCouponList()}
            </SafeAreaView>
        );
    }

    componentDidMount() {
        this.loadData(true);

        //监控 状态变化
        this.deEmitter = DeviceEventEmitter.addListener('REFRSH_CONPON', (obj) => {
            this.store.handlerChangeStore(obj.id,obj.status);
        });
    }

    componentWillUnmount() {
        this.deEmitter.remove();
    }

    loadData = async (freshStatus) => {
        let obj = {
            pageNo: this.pageNo,
            pageSize: PAGE_SIZE,
            jsonParam: {
                belongPackageType: 1
            }
        };
        try {
            if(this.pageNo === 1){
                this.updateFreshState(RefreshState.HeaderRefreshing);
            } else{
                this.updateFreshState(RefreshState.FooterRefreshing);
            }

            await this.store.getCouponCenterList(freshStatus,obj,(data)=>{
                switch (data){
                case 0:
                    this.updateFreshState(RefreshState.Idle);
                    break;
                case 1:
                    this.pageNo++;
                    this.updateFreshState(RefreshState.Idle);
                    break;
                case 2:
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

    //  按钮点击领券
    onclick = (data) => {
        let obj = {
            jsonParam: {
                coupons: [{
                    couponId: data.couponId,
                    couponUnitId: data.unitId,
                    hashKey: (new Date().getTime()).toString(),
                    receiveChannelType: 1,
                    receiveFrom:1,
                }]
            }
        };
        this.getMyCoupon(obj,data.couponId);
    };

    // 点击请求领券
    getMyCoupon = async (obj,couponId) => {
        try {
            Toast.loading();
            // userGetFlag  int  用户领取状态（单元区查询独有）,0 待领取, 1 已领取, 2 已领完
            // -1 失效 -2领完， -3不存在。-4 已达到最大领取次数
            await this.store.getCoupon(obj).then(datas =>{
                let {data} = datas;
                if(data && data.rows.length <= 0){
                    return;
                }
                let code = data.rows[0].resultCode;
                let msg = data.rows[0].resultMsg;
                let lastTick = data.rows[0].residueNum;
                // 失效
                if(code === -1 || code === -3 || code === -4){
                    Toast.dismiss();
                    Toast.show(msg,2);
                    // 领完
                } else if(code === -2){
                    Toast.dismiss();
                    Toast.show(msg,2);
                    this.store.handlerChangeStore(couponId,2);
                    // 领券成功
                }else {
                    Toast.dismiss();
                    Toast.show('领券成功',2);
                    this.store.handlerChangeStore(couponId, 1, lastTick);
                }
            });
        } catch (e) {
            Toast.dismiss();
            Alert.alert(e.message);
        }
    };

    // 查看优惠券详情
    lookCouponDetails = (obj) => {
        if(obj.userGetFlag === 0){
            this.props.navigation.navigate('CouponDetails',{
                from: 1,
                couponId: obj.couponId ,
                startDate:obj.beginDateStr,
                endDate:obj.endDateStr
            });
        }
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    }

});