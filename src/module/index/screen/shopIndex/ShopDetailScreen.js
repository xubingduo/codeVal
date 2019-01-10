/**
 * Created by sml2 on 2018/10/30.
 */
import React, { Component } from 'react';
import { View, Text, ScrollView,TouchableOpacity,StyleSheet,SafeAreaView } from 'react-native';
import PropTypes from 'prop-types';
import NavigationHeader from 'component/NavigationHeader';
import ListViewTextArrowCell from 'component/ListViewTextArrowCell';
import colors from 'gsresource/ui/colors';
import Image from 'component/Image';
import DocSvc from 'svc/DocSvc';
import {GridView} from '@ecool/react-native-ui';
import {wFactor} from 'gsresource/ui/ui';
import {observer} from 'mobx-react';
import sendGoodsItemChangeEvent, {
    TOGGLE_SHOP_FOCUS_ON_SHOP,
} from 'svc/GoodsSvc';
import {Toast} from '@ecool/react-native-ui';
import { deepClone } from 'outils';
import ImageViewer from 'component/ImageViewer';
import configStore,{SYS_CONFIG_PARAMS} from 'store/ConfigStore';

@observer
export default class ShopDetailScreen extends Component {
    static propTypes = {
        /**
         * @param store ShopIndexStore isRequired
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
                    navigationTitleItem={'门店详情'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.state = {};
        this.store = this.props.navigation.state.params.store;
        this.detail = this.store.shopDetailInfo;
    }

    /**
     * 关注店铺
     */
    focusShop = ()=>{
        let shopId = this.detail.id;
        let shopName = this.detail.name;
        this.store.focusShop(shopId, shopName, (ret, ext) => {
            if (ret) {
                this.store.queryShopDetail(shopId);
                sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                    favorFlag: 1,
                    tenantId: shopId
                });
                Toast.success('关注成功',2);
            } else {
                Toast.show(ext);
            }
        });
    }

    /**
     * 取消关注店铺
     */
    unfocusShop = ()=>{
        let shopId = this.detail.id;
        this.store.unFocusShop(shopId, (ret, ext) => {
            if (ret) {
                this.store.queryShopDetail(shopId);
                sendGoodsItemChangeEvent(TOGGLE_SHOP_FOCUS_ON_SHOP, {
                    favorFlag: 0,
                    tenantId: shopId
                });
                Toast.success('取消成功',2);
            } else {
                Toast.show(ext);
            }
        });
    }

    /**
     * 获取门店图片DocIds
     */
    getShopImgDocIds = ()=>{
        let shopImgs = [];
        if(this.detail.headPic && this.detail.headPic.length > 0){
            shopImgs.push(...(this.detail.headPic.split(',')));
        }
        if(this.detail.contentPic && this.detail.contentPic.length > 0){
            shopImgs.push(...(this.detail.contentPic.split(',')));
        }
        return shopImgs;
    }

    renderShopLabelView = ()=>{
        return (
            <View style={{flexDirection:'row',backgroundColor:'white',alignItems:'center'}}>
                <View style={{paddingTop:17,paddingBottom:17,paddingLeft:23,flex:1}}>
                    <Text style={{fontSize:14, color:colors.normalFont}}>服务</Text>
                </View>
                <View style={{maxWidth:200,flexDirection:'row-reverse',alignItems:'center',marginLeft:14}}>
                    <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                        {this.store.shopLabels.slice().map((item,index)=>{
                            return this.renderLabelTag(item,index);
                        })}
                    </View>
                </View>
            </View>
        );
    }

    renderMedalsView = ()=>{
        return (
            <TouchableOpacity
                style={{flexDirection:'row',backgroundColor:'white',alignItems:'center'}}
                onPress={()=>{
                    this.props.navigation.navigate('MedalScreen',{shopId:this.detail.id,medals:this.store.medalList});
                }}
            >
                <View style={{paddingTop:17,paddingBottom:17,paddingLeft:23,flex:1}}>
                    <Text style={{fontSize:14, color:colors.normalFont}}>勋章</Text>
                </View>
                <View style={{maxWidth:200,flexDirection:'row-reverse',alignItems:'center',marginLeft:14}}>
                    <Image source={require('gsresource/img/arrowRight.png')} />
                    <View style={{flexDirection:'row',alignItems:'center',flexWrap:'wrap'}}>
                        {this.store.medalList.map((item,index)=>{
                            return (
                                <View style={{width:18,height:18,marginRight:8,marginBottom:4}} key={index}>
                                    <Image style={{flex:1}} source={{uri:DocSvc.originDocURL(item.logoDoc)}} />
                                </View>
                            );
                        })}
                    </View>

                </View>
            </TouchableOpacity>
        );
    }

    render(){
        // 门店照片
        let shopImgs = this.getShopImgDocIds();
        return(
            <SafeAreaView style={styles.container}>
                <ScrollView style={{flex:1}}>
                    {this.renderHeader()}
                    <View style={{height:1,backgroundColor:colors.borderE}} />
                    {this.renderShopLabelView()}
                    <View style={{height:1,backgroundColor:colors.borderE}} />
                    {this.renderMedalsView()}
                    <View style={{height:1,backgroundColor:colors.borderE}} />
                    <ListViewTextArrowCell
                        title={'关注数'}
                        subTitleHidden={true}
                        arrowHidden={true}
                        tapEnable={false}
                        value={this.detail.concernNum}
                    />
                    <View style={{height:1,backgroundColor:colors.borderE}} />
                    <ListViewTextArrowCell
                        title={'好评数'}
                        subTitleHidden={true}
                        arrowHidden={true}
                        tapEnable={false}
                        value={this.detail.likeNum}
                    />
                    <View style={{height:1,backgroundColor:colors.borderE}} />
                    <ListViewTextArrowCell
                        style={{height:80}}
                        title={'店铺地址'}
                        subTitleHidden={true}
                        arrowHidden={true}
                        tapEnable={false}
                        value={this.detail.shopAddr}
                        valueNumberOfLines={3}
                    />
                    <View style={{height:1,backgroundColor:colors.borderE}} />
                    <ListViewTextArrowCell
                        title={'店铺照片'}
                        subTitleHidden={true}
                        arrowHidden={true}
                        tapEnable={false}
                        value={''}
                    />
                    {shopImgs && shopImgs.length > 0 && (
                        <GridView
                            numberOFCol={3}
                            items={shopImgs}
                            renderItem={this.renderShopImgItem}
                            containerStyle={{backgroundColor:'white'}}
                        />
                    )}
                </ScrollView>
            </SafeAreaView>
        );
    }

    /**
     * 门店标签
     * @param text
     * @param index
     */
    renderLabelTag = (text,index)=>{
        return (
            <View key={index} style={{marginLeft:6,borderRadius:3,borderColor:colors.activeFont,borderWidth:1,marginBottom:4}}>
                <Text style={{padding:1,fontSize:10, color:colors.activeFont,paddingLeft:5,paddingRight:5,height:14}}>{text}</Text>
            </View>
        );
    }

    /**
     * 门店照片
     * @param fileId
     * @param index
     */
    renderShopImgItem = (fileId,index)=>{
        return (
            <View style={{width:90 * wFactor,height:90 * wFactor}}>
                <ImageViewer
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: 2
                    }}
                    source={{ uri: DocSvc.docURL(fileId) }}
                    defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                    docIDs={this.getShopImgDocIds()}
                    index={index}
                />
            </View>
        );
    }

    /**
     * 头部信息
     */
    renderHeader = ()=>{
        let flag = configStore.getSysParamByKey(SYS_CONFIG_PARAMS[1]);
        return (
            <View
                style={{height:73,flexDirection:'row'
                    ,marginBottom:10,alignItems:'center',paddingLeft:20,paddingRight:14,
                    justifyContent:'space-between',backgroundColor:'white',marginTop:10,
                }}
            >
                <View style={{width:39,height:39,borderRadius:19.5,borderWidth:1,borderColor:'transparent'}}>
                    <Image
                        style={{width:'100%',height:'100%',borderRadius:19.5}}
                        source={{uri:DocSvc.docURL(this.detail.logoPic)}}
                        defaultSource={require('gsresource/img/sellerDefault42.png')}
                    />
                </View>
                <View style={{flex:1,paddingLeft:8}}>
                    <Text style={{fontSize:14, color:colors.normalFont,marginBottom:6}} numberOfLines={1}>{this.detail.name}</Text>
                    <View style={{flexDirection:'row'}}>
                        <Text style={{fontSize:12, color:colors.greyFont,marginRight:30}}>在售款数:{this.detail.dresBi ? this.detail.dresBi.spuNums : 0}</Text>
                        {flag === '0' && (
                            <Text style={{fontSize:12, color:colors.greyFont}}>累计销售:{this.detail.dresBi ? this.detail.dresBi.sellNum : 0}</Text>
                        )}
                    </View>
                </View>
                <TouchableOpacity
                    hitSlop={{top: 8, left: 8, bottom: 8, right: 8}}
                    onPress={()=>{
                        if(this.store.shopDetailInfo.favorFlag === 0){
                            this.focusShop();
                        } else {
                            this.unfocusShop();
                        }
                    }}
                >
                    <Image source={this.store.shopDetailInfo.favorFlag === 0 ? require('gsresource/img/watch_pink.png') : require('gsresource/img/has_watch_gray.png')} />
                </TouchableOpacity>
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
