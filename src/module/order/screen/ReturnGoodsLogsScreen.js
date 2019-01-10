/**
 *@author xbu
 *@date 2018/08/09
 *@desc  退款流水
 *
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    TouchableOpacity,
    SectionList,
    DeviceEventEmitter
} from 'react-native';
import colors from '/gsresource/ui/colors';
import I18n from '/gsresource/string/i18n';
import fonts from '/gsresource/ui/fonts';
import NavigationHeader from '../../../component/NavigationHeader';
import LogisticsStore from '../store/LogisticsStore';
import {DLFlatList, Toast, RefreshState} from '@ecool/react-native-ui';
import {observer} from 'mobx-react';
import DocSvc from '../../../svc/DocSvc';
import Image from '../../../component/Image';


@observer
export default class ReturnGoodsLogsScreen extends Component {
    constructor(props){
        super(props);
        this.store = new LogisticsStore();
        this.state = ({
            listFreshState: RefreshState.Idle,
        });
    }

    static navigationOptions = ({navigation}) => {

        const {params} = navigation.state;
        //右部导航
        let rightItem = (
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <TouchableOpacity
                    style={{flexDirection: 'row', alignItems: 'center', marginLeft: 15}}
                    hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                    onPress={() => {
                        if (params && params.revoke) {
                            params.revoke();
                        }
                    }}
                >
                    <Text style={{color: colors.activeBtn,fontSize: fonts.font12}}>撤销售后</Text>
                </TouchableOpacity>
            </View>
        );


        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'退款进度'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                    navigationRightItem={rightItem}
                />
            ),
        };
    };

    renderSectionHeader = ({section}) => {
        if(!section.title){
            return null;
        }
        return (
            <View>
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.white,
                    paddingLeft: 16,
                    height: 40
                }}
                >
                    <Text style={{
                        fontSize: fonts.font14,
                        color: colors.normalFont,
                    }}
                    >{section.title.tenantName}</Text>
                </View>
                <View style={{backgroundColor: colors.divide, height: 1}} />
            </View>
        );
    };

    renderCell = ({item, index, section}) => {
        if(!item.data.length){
            return null;
        }

        if(!item.data[0].data.length){
            return null;
        }

        return (
            <View style={[styles.container]}>
                <SectionList
                    renderSectionHeader={this.renderSectionHeaderBox}
                    sections={item.data}
                    keyExtractor={(item, index) => {
                        return index.toString();
                    }}
                    ItemSeparatorComponent={this.renderDividerView}
                    renderItem={this.renderItem}
                />
                <View style={{backgroundColor: colors.white, height: 10}} />
            </View>
        );
    };
    renderDividerView = () => {
        return (
            <View style={{height: 10, backgroundColor: colors.white}} />
        );
    };
    renderSectionHeaderBox = ({section}) => {
        if(!section.data.length){
            return null;
        }
        return (
            <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                height: 106
            }]}
            >
                <View style={{paddingLeft: 16}}>
                    <Image
                        defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                        style={{width: 90, height: 90, borderRadius: 2}}
                        source={{uri: DocSvc.docURLS(this.getImg(section.spuDocId))}}
                    />
                </View>
                <View style={{flex:1, justifyContent: 'space-between', height: 90}}>
                    <Text style={{color: colors.normalFont, fontSize: fonts.font14, marginLeft: 6,marginRight: 10}}
                        numberOfLines={2}
                    >
                        {section.spuTitle}

                    </Text>
                    <TouchableOpacity
                        style={{
                            height: 50,
                            justifyContent: 'flex-end',
                            flexDirection: 'row',
                            padding: 15,
                        }}
                        onPress={()=>this.changeArrowIsTrue(!section.arrowIsTrue,section.spuId)}
                    >
                        {
                            section.arrowIsTrue ? <Image source={require('gsresource/img/arrowTop.png')} /> : <Image source={require('gsresource/img/arrowBottom.png')} />
                        }
                    </TouchableOpacity>
                </View>
            </View>
        );
    };


    renderItem = ({item,index,section}) => {
        if(section.arrowIsTrue){
            return null;
        }
        return (
            <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                paddingLeft: 16,
                paddingRight: 10,
                height: 50
            }}
            >

                <View style={{
                    flex: 1,
                    height: 50,
                    flexDirection: 'row',
                    backgroundColor: colors.border,
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                >
                    <View style={{marginLeft: 16}}>
                        <View>
                            <Text style={{
                                color: colors.greyFont,
                                fontSize: 12
                            }}
                            >{item.spec2Name} {item.spec1Name}</Text>
                            <Text style={{color: colors.activeFont, fontSize: 12, marginTop: 4}}>
                                ¥{item.skuPrice}
                                <Text style={{color: colors.greyFont, fontSize: 12}}>/件</Text>
                            </Text>
                        </View>

                    </View>
                    <Text style={{fontSize: fonts.font16,color: colors.normalFont,paddingRight: 10}}>{item.skuNum }件</Text>
                </View>
            </View>
        );
    };

    //退货流水
    renderFlowerLogs =({section})=>{
        let len = section.flows.length -1;
        let element = section.flows.map((el,index)=>{

            return(
                <View style={styles.box} key={index}>
                    <View style={styles.navBox}>
                        <View style={styles.dot} />
                        <Text style={[styles.leftText,{color: el.isWait=== 1 && el.typeId===2 ? colors.activeFont: colors.normalFont}]}>{el.flowName}</Text>

                        {
                            (el.canDeliver === 1 && el.isOn === 1 ) ? (<TouchableOpacity style={styles.orderBtn} onPress={this.onClickGoToTransport}>
                                <Text style={styles.orderBtnText}>请填写物流单号</Text>
                            </TouchableOpacity>) : null
                        }
                    </View>
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>{el.typeId === 2 ? el.rejectReason : null}</Text>
                        <Text style={styles.rightText}>{el.proTime}</Text>
                    </View>
                </View>
            );
        });

        return(
            <View style={{marginTop: 10}}>
                <View style={[styles.line,{height: 80*len}]} />
                {element}
            </View>
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



    render() {
        if(!this.store.myNeedData.length){
            return null;
        }
        return (
            <SafeAreaView style={styles.container}>
                <DLFlatList
                    keyExtractor={(item, index) => {
                        return item.toString() + index;
                    }}
                    renderItem={this.renderCell}
                    renderSectionHeader={this.renderSectionHeader}
                    renderSectionFooter={this.renderFlowerLogs}
                    mode={'SectionList'}
                    refreshState={this.state.listFreshState}
                    sections={this.store.myNeedData}
                    onFooterRefresh={this.onLoadMore}
                    onHeaderRefresh={this.onHeadFresh}
                    ListEmptyComponent={this.listEmptyView}
                    stickySectionHeadersEnabled={true}
                />
            </SafeAreaView>
        );
    }

    componentDidMount() {
        // 绑定方法
        this.props.navigation.setParams({
            revoke: this.revoke,
        });
        this.onHeadFresh();

        //刷行物流轨迹
        this.deEmitter = DeviceEventEmitter.addListener('Refresh_ReturnGoodsLogs_Screen', () => {
            this.onHeadFresh();
        });
    }

    componentWillUnmount() {
        this.deEmitter.remove();
        this.backMetheds();
    }

    // 获取请求
    async loadData (id) {
        Toast.loading();
        this.store.returnData(id).then((data)=>{
            Toast.dismiss();
        }).catch(e =>{
            Toast.dismiss();
        });
    }

    //  刷新
    onHeadFresh =()=>{
        const { params } = this.props.navigation.state;
        this.loadData(params.orderId);
    };

    // 撤销
    revoke =()=> {
        let obj = {
            jsonParam: {
                id: this.store.ReturnBillId
            }
        };

        Toast.loading();
        this.store.buyManRevokeBill(obj).then(data=>{
            Toast.dismiss();
            Toast.show('撤销成功');
            this.onHeadFresh();
            DeviceEventEmitter.emit('APPLay_ORDER_DETAILS');
        }).catch((e)=>{
            Toast.dismiss();
            Toast.show(e.message);
        });
    };

    // 物流
    onClickGoToTransport =() => {
        this.props.navigation.navigate('ReturnGoodsTransportScreen',{id: this.store.ReturnBillId});
    };

    // 箭头上下拉动
    changeArrowIsTrue =(isTrue,id)=> {
        this.store.changeArrowIsTrue(isTrue,id);
    };

    // 返回执行函数
    backMetheds =()=> {
        let data_arr = this.store.orgReturnGoods;
        let obj_arr = this.store.orgReturnGoods[data_arr.length-1].bill;
        let obj = {
            flag: obj_arr.billFlag,
            frontFlag: obj_arr.billFrontFlag,
            frontFlagName: obj_arr.billFrontFlagName,
            id: obj_arr.purBillId,
            backFlag: obj_arr.backFlag,
            backFlagName: obj_arr.backFlagName,
            backMoney: obj_arr.backMoney,
        };
        DeviceEventEmitter.emit('REVOKE_DATA',obj);
    };

    getImg = (spuDocId) => {
        if(spuDocId){
            let arrayImg = spuDocId.split(',');
            return arrayImg[0];
        }
        return '';
    };


}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg
    },

    line: {
        width: 2,
        position: 'absolute',
        top: 25,
        left: 18,
        zIndex: 500,
        backgroundColor: colors.activeFont,
    },

    box: {
        height: 70,
        backgroundColor: colors.white,
        borderBottomColor: colors.borderE,
        borderBottomWidth: 1,
        marginBottom: 10,
    },

    dot: {
        width: 9,
        height: 9,
        borderRadius: 9,
        backgroundColor: colors.activeBtn,
    },

    leftText: {
        fontSize: fonts.font14,
        // color: colors.normalFont,
        paddingLeft: 10,
    },

    rightText: {
        fontSize: fonts.font12,
        color: colors.greyFont,
        textAlign: 'right',
        paddingRight: 15,
        paddingBottom: 9,
    },

    navBox: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        paddingLeft: 15,
    },

    orderBtn: {
        borderWidth: 1,
        borderColor: colors.activeBtn,
        borderRadius: 3,
        marginLeft: 20,
    },

    orderBtnText: {
        color: colors.activeFont,
        fontSize: fonts.font12,
        padding: 5,
        paddingTop: 3,
        paddingBottom: 3,
    },

    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    footerText: {
        fontSize: fonts.font12,
        color: colors.activeFont,
        paddingLeft: 35
    }

});

