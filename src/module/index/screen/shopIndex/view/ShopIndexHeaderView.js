/**
 * Created by sml2 on 2018/10/30.
 */
import React, { Component } from 'react';
import { View, Text,TouchableOpacity,StyleSheet,PixelRatio,ScrollView, Platform } from 'react-native';
import PropTypes from 'prop-types';
import Image from 'component/Image';
import DocSvc from 'svc/DocSvc';
import {Screen} from 'gsresource/ui/ui';
import {TabsView} from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import NavigationSvc from 'svc/NavigationSvc';
import {observer,Observer} from 'mobx-react';
import button from '../widget/Button';
const FontScale = PixelRatio.getFontScale();
import ShopIndexStore from '../../../store/shopIndex/ShopIndexStore';
const Label_H = 13;
const BottomGap = 6;

const Button = observer(button);
@observer
export default class ShopIndexHeaderView extends Component {
    static propTypes = {
        // ShopIndexStore的实例
        store:PropTypes.object.isRequired,
        // 跳转详细
        toDetailHandler: PropTypes.func,
        // 点击搜索框
        searchClickHandler: PropTypes.func,
        // 点击关注
        followClickHandler: PropTypes.func,
        // tab切换
        tabDidChange: PropTypes.func,
        // 打电话
        callHandler:PropTypes.func,
        // IM
        imClickHanlder: PropTypes.func,
        // 分享店铺
        onClickShareStore: PropTypes.func,
        // 点击排序按钮
        onSortBtnClick: PropTypes.func
    };

    renderBgView = (shopDetailInfo,bgH)=>{
        return (
            <React.Fragment>
                <Image
                    resizeMode={'cover'}
                    style={[styles.backgroundImg,{height:bgH}]}
                    source={{
                        uri: DocSvc.docURLWithWH(
                            shopDetailInfo ? shopDetailInfo.coverPic : '',
                            Screen.width * FontScale
                        )
                    }}
                />
                <View
                    style={[
                        {height:bgH},
                        styles.backgroundImageCover,
                    ]}
                />
            </React.Fragment>
        );
    }

    render(){
        let shopDetailInfo = this.props.store.shopDetailInfo;
        let labels = this.props.store.shopLabels;
        let bgH = labels && labels.length > 0 ? 209 : 209 - Label_H - BottomGap;
        return (
            <View style={[styles.backgroundImg,{height:bgH}]}>
                {this.renderBgView(shopDetailInfo,bgH)}
                <View style={styles.contentView}>
                    {this.renderTopView()}
                    {this.renderCenterView()}
                    {this.renderBottomView()}
                    {this.renderSort()}
                </View>
            </View>
        );
    }

    renderTopView = ()=>{
        return (
            <View style={styles.topViewContainer}>
                <TouchableOpacity
                    hitSlop={{top: 8, left: 8, bottom: 16, right: 8}}
                    style={{width:25,justifyContent:'center'}}
                    onPress={()=>{
                        NavigationSvc.pop();
                    }}
                >
                    <Image source={require('gsresource/img/shop_arrow_left.png')} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.topViewSearchTouch}
                    onPress={()=>{
                        this.props.searchClickHandler && this.props.searchClickHandler();
                    }}
                >
                    <View style={styles.topViewSearchTextContainer}>
                        <Image source={require('gsresource/img/search_white2.png')} />
                        <Text style={styles.topViewSearchText}>搜索本店商品</Text>
                    </View>
                    <View style={styles.topViewSearchBg} />
                </TouchableOpacity>

                <View
                    style={{flexDirection:'row-reverse'}}
                >
                    <TouchableOpacity
                        style={{marginLeft:16,justifyContent:'center'}}
                        hitSlop={{top: 8, left: 8, bottom: 16, right: 8}}
                        onPress={()=>{
                            // 分享店铺
                            if (this.props.onClickShareStore) {
                                this.props.onClickShareStore();
                            }
                        }}
                    >
                        <Image source={require('gsresource/img/share_white.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{marginLeft:16,justifyContent:'center'}}
                        hitSlop={{top: 8, left: 8, bottom: 16, right: 8}}
                        onPress={()=>{
                            // 修改为跳转到IM聊天
                            if (this.props.imClickHanlder) {
                                this.props.imClickHanlder();
                            }
                        }}
                    >
                        <Image source={require('gsresource/img/im_white.png')} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{justifyContent:'center'}}
                        hitSlop={{top: 8, left: 8, bottom: 16, right: 8}}
                        onPress={()=>{
                            if(this.props.callHandler){
                                this.props.callHandler();
                            }
                        }}
                    >
                        <Image source={require('gsresource/img/call_white.png')} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderCenterView = ()=>{
        let shopDetailInfo = this.props.store.shopDetailInfo;
        let name = shopDetailInfo ? shopDetailInfo.name : '';
        let watchNum = shopDetailInfo ? shopDetailInfo.concernNum : 0;
        const inSaleNum = shopDetailInfo.dresBi ? shopDetailInfo.dresBi.spuNums : 0;
        let labels = this.props.store.shopLabels;
        return (
            <View style={{paddingLeft:19,paddingRight:19,}}>
                <View style={styles.shopInfoContainer}>
                    <TouchableOpacity
                        style={[styles.avatarContainer,{alignItems:'center',justifyContent:'center',backgroundColor:'white'}]}
                        onPress={()=>{
                            this.props.toDetailHandler && this.props.toDetailHandler();
                        }}
                    >
                        <Image
                            style={[styles.avatarImage]}
                            defaultSource={require('gsresource/img/sellerDefault42.png')}
                            source={{uri:DocSvc.docURL(shopDetailInfo ? shopDetailInfo.logoPic : '')}}
                        />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.shopInfoMessageTouch}
                        onPress={()=>{
                            this.props.toDetailHandler && this.props.toDetailHandler();
                        }}
                    >
                        <View style={styles.shopInfoMessageTextContainer}>
                            <Text style={styles.shopInfoMessageText} numberOfLines={1}>{name}</Text>
                            <Image source={require('gsresource/img/arrow_right_white.png')} />
                        </View>
                        <View style={styles.shopInfoMessageTextContainer}>
                            <Text style={styles.shopInfoMessageWatchText}>关注：{watchNum}</Text>
                            <Text style={styles.shopInfoMessageWatchText}>在售款数：{inSaleNum}</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{marginLeft:10}}
                        onPress={()=>{
                            this.props.followClickHandler && this.props.followClickHandler();
                        }}
                    >
                        <Image source={shopDetailInfo && shopDetailInfo.favorFlag === 1
                            ? require('gsresource/img/has_watch_gray.png') : require('gsresource/img/shop_top_watch_white.png')}
                        />
                    </TouchableOpacity>
                </View>
                {labels && labels.length > 0 && (
                    <ScrollView
                        style={{flexDirection:'row',marginTop:2,marginBottom:2}}
                        horizontal={true}
                    >
                        {labels.map((row,index)=>{
                            return this.renderLabelTag(row,index);
                        })}
                    </ScrollView>
                )}
            </View>
        );
    }

    renderLabelTag = (text,index)=>{
        return (
            <View key={index} style={styles.labelContainer}>
                <Text style={styles.labelText}>{text}</Text>
            </View>
        );
    }


    renderBottomView = ()=>{
        let itemW = 50;
        let items = [
            {key:'1',value:0,item:{
                title:'首页',
            }},
            {key:'10',value:0,item:{
                title:'新品'
            }},
            {key:'2',value:2,item:{
                title:'推荐'
            }},
            {key:'3',value:3,item:{
                title:'爆款'
            }}
        ];
        let WIDTH = itemW * items.length;

        return (
            <View style={[styles.tabContainer]}>
                <TabsView
                    containerStyle={{
                        width: WIDTH,
                        alignItems: 'center',
                        height:30,
                        borderBottomColor:'transparent',
                    }}
                    tabItemStyle={{
                        paddingLeft: 0,
                        paddingRight: 0,
                        width: itemW,
                    }}
                    underlineStyle={{
                        width: 30,
                        backgroundColor: colors.white,
                    }}
                    tabItemTextTyle={{
                        fontSize: 16,
                        fontWeight:'bold',
                    }}
                    activeTextColor={colors.white}
                    defaultTextColor={colors.white}
                    activeItemIndex={0}
                    items={items}
                    goToPage={(index) =>{
                        this.props.tabDidChange && this.props.tabDidChange(items,index);
                    }}
                />
            </View>
        );
    }

    renderSort = () => {
        const { sortBtns } = this.props.store;
        return (
            <View style={[styles.sortBtns,{marginBottom:14}]}>
                {sortBtns.map(btn => <Button key={btn.value} {...btn} onPress={this.props.onSortBtnClick} />)}
            </View>
        );
    }

}


const styles = StyleSheet.create({
    backgroundImg: {
        width: Screen.width
    },
    backgroundImageCover:{
        backgroundColor: 'rgba(0,0,0,0.3)',
        position:'absolute',
        top:0,
        left:0,
        right:0,
        bottom:0,
        width:Screen.width,
    },
    contentView:{
        position:'absolute',
        top:35,
        left:0,
        right:0,
        bottom:0,
    },
    topViewContainer:{
        flexDirection:'row',
        paddingLeft:19,
        paddingRight:19
    },
    topViewSearchTouch:{
        flex:1,
        justifyContent:'center',
        height:27,
        marginRight:16
    },
    topViewSearchTextContainer:{
        position:'absolute',
        marginLeft:12,
        flexDirection:'row',
        alignItems:'center',
    },
    topViewSearchBg:{
        flex:1,
        backgroundColor:'#ffffff',
        borderWidth:1,
        borderRadius:13.5,
        borderColor:'transparent',
        opacity:0.4,
    },
    topViewSearchText:{
        fontSize:12,
        color:'white',
        marginLeft:4
    },
    labelContainer:{
        marginRight:10,
        borderRadius:3,
        borderColor:'transparent',
        borderWidth:1,
        backgroundColor:'#FFD000',
    },
    labelText:{
        marginVertical: 1,
        fontSize:10,
        color:'#800000',
        paddingLeft:5,
        paddingRight:5,
        height:Label_H,
        lineHeight: Label_H
    },
    avatarContainer:{
        width:42,
        height:42,
        borderRadius:21,
        borderColor:'white',
        shadowColor:'black',
        shadowOffset:{width:2,height:2},
        shadowOpacity:0.3,
        shadowRadius:10,
        elevation:10,
    },
    avatarImage:{
        width:39,
        height:39,
        borderColor:'white',
        borderRadius:19.5,
    },
    tabContainer:{
        flexDirection:'row',
        alignItems:'center',
        paddingLeft:19,
        paddingRight:19,
    },
    shopInfoContainer:{
        height:60,
        flexDirection:'row',
        alignItems:'center'
    },
    shopInfoMessageTouch:{
        paddingLeft:10,
        height:'90%',
        flex:1,
        paddingTop:4,
        paddingBottom:4,
    },

    shopInfoMessageTextContainer:{
        flex:1,
        flexDirection:'row',
        alignItems:'center'
    },
    shopInfoMessageText:{
        fontSize:14,
        color:'#ffffff',
        marginRight:8,
        maxWidth:'90%',
    },
    shopInfoMessageWatchText:{
        fontSize:12,
        color:'#ffffff',
        marginRight:10
    },
    sortBtns: {
        flexDirection: 'row',
        paddingLeft: 19,
        marginTop: 9
    }
});
