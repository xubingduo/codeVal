/**
 *@author xbu
 *@date 2018/10/09
 *@desc  选择需要退的商品
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    SectionList,
    Image,
    TouchableOpacity, DeviceEventEmitter
} from 'react-native';

import colors from 'gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import fonts from 'gsresource/ui/fonts';
import NavigationHeader from 'component/NavigationHeader';
import {DLFlatList, Toast, RefreshState} from '@ecool/react-native-ui';
import ImageButton from 'component/ImageButton';
import NumberEditView from 'component/NumberEditView';
import DividerLineH from 'component/DividerLineH';
import ReturnGoods from '../store/ReturnGoodsStore';
import {toJS} from 'mobx';
import {observer} from 'mobx-react';
import DocSvc from 'svc/DocSvc';
import Alert from 'component/Alert';

@observer
export default class ReturnChooseGoodsListScreen extends Component {
    constructor() {
        super();
        this.store = new ReturnGoods();
        this.state = ({
            listFreshState: RefreshState.Idle,
            manage: false,
        });
    }

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'选择货品'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    /**
     * 店铺头部
     * @param section
     * @returns {*}
     */
    renderSectionHeader = ({section}) => {
        if(!section.title){
            return null;
        }
        return (
            <View>
                <DividerLineH />
                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.white,
                    paddingLeft: 16,
                    height: 40
                }}
                >
                    <ImageButton
                        hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                        onClick={() => {
                            this.store.chooseGoodsSize(!section.title.checked, section.title.tenantId);
                        }}
                        source={section.title.checked ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                    />

                    <Text style={{
                        fontSize: fonts.font14,
                        color: colors.normalFont,
                        marginLeft: 12
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
        return (
            <View style={[styles.container]}>
                <SectionList
                    renderSectionHeader={this.renderSectionHeaderBox}
                    sections={item.data}
                    keyExtractor={(item, index) => {
                        return item.toString() + index;
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
        return (
            <View style={[{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.white,
                paddingLeft: 16,
                height: 106
            }]}
            >
                <ImageButton
                    hitSlop={{top: 40, left: 40, bottom: 40, right: 40}}
                    onClick={() => {
                        this.store.checkSPUChangeAll(!section.iconIsTrue, section.spuId);
                    }}
                    source={section.iconIsTrue ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                />

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
                height: 50
            }}
            >

                <ImageButton
                    hitSlop={{top: 16, left: 16, bottom: 16, right: 16}}
                    onClick={() => {
                        // this.props.onSKUCheckChange && this.props.onSKUCheckChange(!item.checked, item.skuId);
                        this.store.singleChecked(!item.checkIsTrue, item.skuId);
                    }}
                    source={item.checkIsTrue ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                />

                <View style={{
                    flex: 1,
                    height: 50,
                    marginLeft: 16,
                    flexDirection: 'row',
                    backgroundColor: colors.border,
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}
                >
                    <View style={{marginLeft: 16}}>
                        <Text style={{
                            color: colors.greyFont,
                            fontSize: 12
                        }}
                        > { item.spec2Name } { item.spec1Name }  </Text>
                        <Text style={{color: colors.activeFont, fontSize: 12, marginTop: 4}}>
                            ¥{item.skuAvgPrice}
                            <Text style={{color: colors.greyFont, fontSize: 12}}>/件</Text>
                        </Text>
                    </View>

                    <NumberEditView
                        maxLength={4}
                        tips={'退货'}
                        maxNum={item.maxReturn - item.backReturn}
                        defaultText={toJS(item.skuNum)}
                        onTextChange={(value) => {
                            if (value > `${item.maxReturn - item.backReturn}`) {
                                Toast.show(`最多退货${item.maxReturn - item.backReturn}件`);
                                return;
                            }
                            // this.props.onNumberChange && this.props.onNumberChange(value, item.skuId);
                            this.store.getSingleClick(value, item.skuId);
                        }}
                        style={{flexDirection: 'row', alignItems: 'center', marginRight: 16}}
                    />
                </View>

            </View>
        );
    };


    renderBottom() {
        return (
            <View style={{}}>
                <DividerLineH />
                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        height: 50,
                        backgroundColor: colors.white,
                        justifyContent: 'space-between'
                    }}
                >
                    <TouchableOpacity
                        hitSlop={{top: 16, left: 16, bottom: 16, right: 20}}
                        style={{flexDirection: 'row', marginLeft: 20, alignItems: 'center'}}
                        onPress={() => {
                            this.store.btnCheckAll(!this.store.checkAll);
                        }}
                    >
                        <Image source={this.store.checkAll ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')} />
                        <Text style={{marginLeft: 4, color: colors.normalFont, fontSize: fonts.font12}}>全选</Text>
                    </TouchableOpacity>

                    <View style={{flexDirection: 'row', alignItems: 'center',paddingRight: 15}}>
                        <View style={{alignItems: 'flex-end'}}>
                            {/*{this.store.sort}种*/}
                            {/*<Text style={{color: colors.greyFont, fontSize: fonts.font12}}>{this.store.sortNumber}件</Text>*/}
                            <Text style={{color: colors.normalFont, fontSize: fonts.font12,paddingTop: 5}}>
                                应退金额:
                                <Text style={{color: colors.activeFont, fontSize: fonts.font12}}>¥{this.store.getReturnMoney}</Text>
                                {'  '}实退金额:
                                <Text style={{color: colors.activeFont, fontSize: fonts.font12}}>¥{this.store.getMoney}</Text>
                            </Text>

                        </View>
                    </View>

                </View>
                <TouchableOpacity
                    style={{
                        height: 45,
                        backgroundColor: colors.activeBtn,
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={this.confirmData}
                >
                    <Text style={{fontSize:fonts.font14, color: colors.white}}>确定</Text>
                </TouchableOpacity>
            </View>
        );
    }

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
        if(!this.store.orgReturnGoods){
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
                    mode={'SectionList'}
                    refreshState={this.state.listFreshState}
                    sections={this.store.myNeedData}
                    onFooterRefresh={this.onLoadMore}
                    onHeaderRefresh={this.onHeadFresh}
                    ListEmptyComponent={this.listEmptyView}
                    stickySectionHeadersEnabled={true}
                />
                {
                    this.renderBottom()
                }
            </SafeAreaView>
        );
    }

    // 方法区
    componentDidMount() {
        const { params } = this.props.navigation.state;
        if(!params.passData){
            const { params } = this.props.navigation.state;
            this.loadData(params.id);
        } else {
            this.store.getParentData(params.passData,params.footData);
        }

    }

    onHeadFresh =()=>{
        // const { params } = this.props.navigation.state;
        // this.loadData(params.id,params);
    };

    onLoadMore =()=>{

    };

    // 请求数据
    async loadData(order_id) {
        Toast.loading();
        try {
            await this.store.getReturnGoodsList(order_id);
            await this.store.changeCheckAllStatus();
        }catch (e) {
            Toast.show(e.message, 2);
        }
        Toast.dismiss();
    }

    confirmData =()=> {
        let data = this.store.getLastData();
        let is_false = false;
        for (let i = 0; i < data.obj.length; i++) {
            if(data.obj[i].num === 0){
                is_false = true;
                break;
            }
        }

        if(is_false){
            Toast.show('请选择退货商品数量大于1的');
            return;
        }

        if(data.obj.length > 0){
            if(data.totalMoney === 0){
                Alert.alert('此单已经全部退完，可退金额为0');
                return;
            }
            let emitData = {
                allCheck : this.store.checkAll,
                backMoney: this.store.getMoney,
                returnMoney: this.store.getReturnMoney
            };
            DeviceEventEmitter.emit('RETUN_GOODS_ARRAY',data,this.store.orgReturnGoods,emitData);
            this.props.navigation.goBack();
        } else {
            Toast.show('请选择退货商品');
        }
    };

    // 箭头上下拉动
    changeArrowIsTrue =(isTrue,id)=> {
        this.store.changeArrowIsTrue(isTrue,id);
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
    }

});