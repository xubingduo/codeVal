/**
 *@author xbu
 *@date 2018/10/11
 *@desc  我的优惠券页面
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    DeviceEventEmitter
} from 'react-native';

import I18n from 'gsresource/string/i18n';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import ColorOnlyNavigationHeader from 'component/ColorOnlyNavigationHeader';
import {TabsView} from '@ecool/react-native-ui';
import {DLFlatList, RefreshState } from '@ecool/react-native-ui';
import CouponItem,{CouponType,CouponColorType,ShowRightType} from '../widget/CouponItem';
import {observer,inject} from 'mobx-react';
import CouponStore from '../store/CouponStore';
import Alert from 'component/Alert';
import { StackActions, NavigationActions } from 'react-navigation';


const resetAction = StackActions.reset({
    index: 0,
    actions: [NavigationActions.navigate({ routeName: 'MainContainerScreen' })],
});


const WIDTH = Dimensions.get('window').width;
const PAGE_SIZE = 20;

@inject('userStore')
@observer
export default class MyCoupon extends Component {
    static navigationOptions = () => {
        return {
            header: (
                <ColorOnlyNavigationHeader
                    backgroundColor={colors.white}
                    statusBarStyle={'dark-content'}
                />
            ),
        };
    };

    constructor(props){
        super(props);
        this.store = new CouponStore();
        this.state ={
            showMask: false,
            tabIndex: 0,
            listFreshState0: RefreshState.Idle,
            listFreshState1: RefreshState.Idle,
            listFreshState2: RefreshState.Idle,
        };
        this.pageNo0 = 1;
        this.pageNo1 = 1;
        this.pageNo2 = 1;
        this.cantrue0 = true;
        this.cantrue1 = true;
        this.cantrue2 = true;
        this.cardType = '';
        this.headerText= '卡券';
    }

    // 头部导航
    renderHeader =()=> {
        return(
            <View style={{backgroundColor: colors.white, flexDirection: 'row', height: 44, alignItems: 'center'}}>
                <TouchableOpacity
                    style={{marginLeft: 12}}
                    hitSlop={{left: 16, right: 16, top: 16, bottom: 16}}
                    onPress={this.onClickHeaderBack}
                >
                    <Image source={require('gsresource/img/arrowLeftGrey.png')} />
                </TouchableOpacity>
                <View style={{flex: 1,alignItems: 'center',justifyContent:'center'}}>
                    <TouchableOpacity
                        style={{flexDirection: 'row',alignItems: 'center',justifyContent:'center'}}
                        onPress={this.clickHeader}
                    >
                        <Text style={{fontSize: fonts.font18,color: colors.normalFont,paddingRight: 5}}>我的{this.headerText}</Text>
                        <Image source={require('gsresource/img/selectDrop.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    //头部筛选条件
    renderHeaderMask = () => {
        return (
            <View style={styles.mask}>
                <TouchableOpacity
                    style={[styles.mask,{backgroundColor: '#000',opacity: 0.6}]}
                    onPress={this.clickHeader}
                />
                <View
                    style={[styles.mask,{
                        backgroundColor: colors.white,
                        paddingBottom: 25,
                        borderTopWidth: 1,
                        borderTopColor: colors.divide,
                        height: 'auto',
                        top: 0,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                    }]}
                >
                    {
                        this.store.couponHeader.map((el,index)=> {
                            return(
                                <TouchableOpacity
                                    style={[styles.btn,{borderWidth: el.active ? 1 : 0,
                                        backgroundColor: el.active ? colors.white : colors.bg}]}
                                    key={index}
                                    onPress={()=>this.chooseCouponType(index)}
                                >
                                    <Text
                                        style={{
                                            color: el.active ? colors.activeBtn : colors.normalFont,
                                            fontSize: fonts.font14
                                        }}
                                    >{el.name}</Text>
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            </View>
        );
    };

    // 是否显示mask
    showHeaderMask = () => {
        if(this.state.showMask){
            return this.renderHeaderMask();
        } else {
            return null;
        }
    };

    // tab 切换
    renderTab = () => {
        return(
            <View style={{backgroundColor: colors.white}}>
                <TabsView
                    containerStyle={{
                        width: WIDTH,
                        alignItems: 'center',
                        height: 40,
                        borderTopColor: colors.border,
                        borderTopWidth: 1,
                    }}
                    tabItemStyle={{
                        paddingLeft: 27,
                        paddingRight: 0,
                        width: WIDTH / 3
                    }}
                    underlineStyle={{
                        width: 60,
                        backgroundColor: colors.activeFont,
                    }}
                    tabItemTextTyle={{
                        fontSize: fonts.font14,
                    }}
                    activeTextColor={colors.activeFont}
                    defaultTextColor={colors.normalFont}
                    activeItemIndex={this.state.tabIndex}
                    items={this.store.couponListTab}
                    goToPage={(index) => this.changeTabPage(index)}
                />
            </View>
        );
    };

    //  当数据为空展示列表
    listEmptyView = () => {
        return (
            <View style={{position: 'relative', flex: 1, alignItems: 'center', justifyContent: 'center', width: WIDTH}}>
                <Image source={require('gsresource/img/couponsNone.png')} />
                <Text style={{color: colors.greyFont, fontSize: fonts.font12,marginTop: 8}}>当前没有优惠券</Text>
            </View>
        );
    };

    // 未使用优惠券
    renderWaitUseCell =({item})=>{
        let showBtnType = ShowRightType.showNo;
        let dims = item.dims.slice();
        let shopId = '';
        if(dims.length){
            dims.forEach(val=>{
                if(val.dimName === 'dimShop'){
                    showBtnType = ShowRightType.showBtn;
                    shopId = val.dimValue;
                }
            });
        }

        return(
            <CouponItem
                couponType={CouponType.myCoupon}
                showType={showBtnType}
                showTitleIcon={true}
                titleColor={colors.normalFont}
                onClickBtn={()=>this.onclick(shopId)}
                onClickLookDetails={()=>this.lookCouponDetails(item,false)}
                data={item}
            />
        );
    };

    // 已经使用
    renderHasUseCell =({item})=>{
        return(
            <CouponItem
                couponType={CouponType.myCoupon}
                color={colors.couponColor4}
                showTitleIcon={true}
                showType={ShowRightType.showImg}
                onClickBtn={()=>this.onclick(item)}
                onClickLookDetails={()=>this.lookCouponDetails(item,true)}
                data={item}
            />
        );
    };

    // 已经过期
    renderHasOver =({item})=>{
        return(
            <CouponItem
                couponType={CouponType.myCoupon}
                showTitleIcon={true}
                color={colors.couponColor4}
                onClickBtn={()=>this.onclick(item)}
                onClickLookDetails={()=>this.lookCouponDetails(item,true)}
                data={item}
            />
        );
    };

    // 优惠券列表
    renderCouponList = (data, loading, type) => {
        let showElementType = null;
        if(type === ShowRightType.showBtn){
            showElementType = this.renderWaitUseCell;
        } else if(type === ShowRightType.showImg){
            showElementType = this.renderHasUseCell;
        } else {
            showElementType = this.renderHasOver;
        }

        return (
            <DLFlatList
                style={{width: WIDTH}}
                keyExtractor={(item, index) => index.toString()}
                renderItem={showElementType}
                mode={'FlatList'}
                refreshState={loading}
                data={data}
                ListEmptyComponent={this.listEmptyView}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
            />
        );
    };

    scrollTableView = () => {
        return(
            <ScrollView
                ref={(ref) => {this.scrollTabView = ref;}}
                pagingEnabled={true}
                scrollEnabled={false}
                horizontal={true}
                bounces={false}
                showsHorizontalScrollIndicator={false}
            >
                {this.renderCouponList(this.store.waitUseArr, this.state.listFreshState0, ShowRightType.showBtn)}
                {this.renderCouponList(this.store.hasUseArr,this.state.listFreshState1, ShowRightType.showImg)}
                {this.renderCouponList(this.store.hasOverUseArr,this.state.listFreshState2, ShowRightType.showNo)}
            </ScrollView>
        );
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {this.renderHeader()}
                {this.renderTab()}
                {this.scrollTableView()}
                {this.showHeaderMask()}
            </SafeAreaView>
        );
    }

    componentDidMount() {
        this.loadDataCount();
        this.loadData(true);
        // this.loadDataType();
        // this.refreshData();
    }

    // 点击头部返回
    onClickHeaderBack = () => {
        this.props.navigation.goBack();
    };

    // componentWillUnmount() {
    //     //移除控制 评价状态
    //     this.deEmitter.remove();
    // }

    // refreshData = () => {
    //     this.deEmitter = DeviceEventEmitter.addListener('REFRESH_MY_COUPON', () => {
    //         this.loadDataCount();
    //         this.onHeadFresh();
    //     });
    //
    //     DeviceEventEmitter.emit('REFRESH_MY_COUPON');
    // };

    // 优惠券类型
    loadDataType = async () => {
        try {
            await this.store.getCouponType();
        } catch (e) {
            Alert.alert(e.message);
        }
    };


    loadDataCount = async () => {
        let obj = {
            jsonParam:{
                flags: '0,1,2,3',
                cardType: this.cardType,
            }
        };
        try {
            await this.store.getMyCouponListCount(obj);
        } catch (e) {
            Alert.alert(e.message);
        }
    };

    loadData = async (freshStatus) => {
        let type = this.state.tabIndex;
        let flags = 1;
        let pageNunber = 1;
        let canLoad = true;
        switch (type) {
        case 0:
            flags = 1;
            canLoad = this.cantrue0;
            pageNunber = this.pageNo0;
            break;
        case 1:
            flags = '2,3';
            canLoad = this.cantrue1;
            pageNunber = this.pageNo1;
            break;
        case 2:
            flags = 0;
            canLoad = this.cantrue2;
            pageNunber = this.pageNo2;
            break;
        }
        // 加载完毕防止重复加载
        if(!canLoad){
            return;
        }

        let obj = {
            pageSize: PAGE_SIZE,
            pageNo: pageNunber,
            jsonParam:{
                flags: flags,
                unitId: this.props.userStore.user.unitId,
                cardType: this.cardType,
            }
        };

        try {
            if(pageNunber == 1){
                this.updateFreshState(RefreshState.HeaderRefreshing);
            } else {
                this.updateFreshState(RefreshState.FooterRefreshing);
            }

            await this.store.getMyCouponList(freshStatus,obj,(data,total)=>{
                switch (data){
                case 0:
                    this.updateFreshState(RefreshState.Idle);
                    break;
                case 1:
                    this.pagePlus(true);
                    this.updateFreshState(RefreshState.Idle);
                    break;
                case 2:
                    this.updateFreshState(RefreshState.NoMoreData);
                    this.canLoad(false);
                    break;
                }
            });
        } catch (e) {
            this.updateFreshState(RefreshState.Idle);
            Alert.alert(e.message);
        }
    };

    // 改加载状态
    updateFreshState = (state) => {
        let type = this.state.tabIndex;
        switch (type) {
        case 0:
            this.setState({
                listFreshState0: state,
            });
            break;
        case 1:
            this.setState({
                listFreshState1: state,
            });
            break;
        case 2:
            this.setState({
                listFreshState2: state,
            });
            break;
        }
    };

    // 分页页数加加
    pagePlus = (isTrue) => {
        let type = this.state.tabIndex;
        switch (type) {
        case 0:
            if(isTrue){
                this.pageNo0++;
            } else {
                this.pageNo0=1;
            }
            break;
        case 1:
            if(isTrue){
                this.pageNo1++;
            } else {
                this.pageNo1=1;
            }
            break;
        case 2:
            if(isTrue){
                this.pageNo2++;
            } else {
                this.pageNo2=1;
            }
            break;
        }
    };

    // 去出重复加载
    canLoad = (isOver) => {
        let type = this.state.tabIndex;
        switch (type) {
        case 0:
            this.cantrue0 = isOver;
            break;
        case 1:
            this.cantrue1 = isOver;
            break;
        case 2:
            this.cantrue2 = isOver;
            break;
        }
    };


    // 切换显示mask
    clickHeader = () => {
        this.setState({
            showMask: !this.state.showMask
        });
    };

    // 选择过滤优惠券类型
    chooseCouponType = (index) => {
        this.store.actionGetCouponType(index);
        switch (index) {
        case 0:
            //全部
            this.cardType = '';
            this.headerText='卡券';
            break;
        case 1:
            //优惠券
            this.cardType = 1;
            this.headerText='优惠券';
            break;
            // case 2:
            //     this.cardType = 2;
            //     //礼品券
            //     break;
        case 2:
            this.cardType = 3;
            this.headerText='运费券';
            //运费券
            break;
        }
        this.loadDataCount();
        this.onHeadFresh();
        this.clickHeader();
    };

    // tab切换类型
    changeTabPage = (index) => {
        if(this.state.tabIndex === index){
            return;
        }
        this.scrollTabView.scrollTo({x: index * WIDTH, animated: true});
        this.setState({tabIndex: index},()=>{
            setTimeout(()=>{
                this.onHeadFresh();
            },300);
        });
    };

    // 加载更多
    onLoadMore = () => {
        this.loadData(true);
    };

    // 刷新页面
    onHeadFresh = () => {
        this.canLoad(true);
        this.pagePlus(false);
        this.loadData(false);
        this.loadDataCount();
    };

    // 按钮点击事件
    onclick =(id)=> {
        // if(data.shopId === -10){ //IndexScreen
        //     // this.props.navigation.dispatch(resetAction);
        // } else {
        this.props.navigation.navigate('ShopIndexScreen', {
            tenantId: id,
            tenantName: '',
        });
        // }
    };

    // 查看优惠券详情
    lookCouponDetails = (obj,isTrue) => {
        this.props.navigation.navigate('CouponDetails',{
            from: 2,
            couponId: obj.couponId,
            startDate:obj.beginDateStr,
            endDate:obj.endDateStr,
            canShow: isTrue
        });
    };

    // 跳转去使用

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    mask: {
        position: 'absolute',
        top: 44,
        left: 0,
        right: 0,
        zIndex: 10,
        width: '100%',
        height: '100%',
    },

    btn: {
        height: 34,
        width: WIDTH * 0.2,
        marginLeft: WIDTH * 0.025,
        marginRight: WIDTH * 0.025,
        marginTop: 25,
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: colors.activeBtn,
        borderRadius: 4,
    }


});