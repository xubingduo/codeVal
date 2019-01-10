/**
 * author: wwj
 * Date: 2018/12/6
 * Time: 下午3:55
 * des:
 */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Text,
    Dimensions,
    CameraRoll,
    Platform,
} from 'react-native';
import { Popup } from '@ecool/react-native-ui';
import PropTypes from 'prop-types';
import { GridView, Toast} from '@ecool/react-native-ui';
import { getLocationImg } from 'utl/PermissionsUtl.android';
import ViewShot from 'react-native-view-shot';
import Image from 'component/Image';
import Alert from 'component/Alert';

import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';

import ShareSvc from 'svc/ShareSvc';
import DocSvc from 'svc/DocSvc';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
export default class ShopSliderShare extends Component {
    static propTypes = {
        // 选中的item 有两个参数回调
        chooseItemCallback: PropTypes.func,
        // 弹框消失可以执行的方法
        onDismiss: PropTypes.func,
        // 显示goodsPop
        goodsPopShow: PropTypes.bool,
        // 分享参数
        data: PropTypes.object,
        // 二维码参数
        baseImg: PropTypes.string,
        // 显示价格
        showPrice: PropTypes.object,
        // 显示风格
        showModal: PropTypes.bool,
        // 短信分享回调
        onShortMessageClickCallback: PropTypes.func,
    };

    static defaultPropTypes = {
        onValueChanged: () => null,
        goodsPopShow: false,
        data: {},
        onDismiss: () => null,
        chooseItemCallback: () => null,
        onShortMessageClickCallback: () => null
    };

    constructor(props) {
        super(props);
        this.state = {
            uri: '',
            data: [{ title: '分享到', data: ['item1']}],
            datCell:[
                {
                    key: 1,
                    name: '微信',
                    img: require('gsresource/img/weixin.png'),
                },
                {
                    key: 2,
                    name: '朋友圈',
                    img: require('gsresource/img/weixinFriend.png'),
                },
                {
                    key: 3,
                    name: '短信分享',
                    img: require('gsresource/img/shareShortMessage.png')
                }
            ],
            objData: {},
            key: 0,
            url: '',
            clickOne: true,
        };
    }


    takeToImage = (data,key) => {
        if (Platform.OS === 'android') {
            getLocationImg(this.share,data,key);
        } else {
            this.share(data,key);
        }
    };

    share = async (data,key) => {
        try {
            let uri = await this.viewShot.capture();
            let newUri = await CameraRoll.saveToCameraRoll(uri, 'photo');
            let url = Platform.select({ios: uri, android: newUri});
            this.popup.dismiss(() => {
                // this.props.chooseItemCallback && this.props.chooseItemCallback(data,key,url);
                this.chooseItemCallBack(data,key,url);
            });
        } catch (error) {
            this.setState({clickOne: true});
            Alert.alert(error.message);
        }
    };

    chooseItemCallBack = (val,key,url) => {
        let obj = {type: val.key,shareImgUrl: url, shareDesc: '分享图片' };
        this.setState({clickOne: true});
        ShareSvc.shareLocalImage(obj,(isTrue,text)=>{
            if(isTrue === false){
                Toast.show(text,2);
            }
        });
    };


    /**
     * 显示侧滑菜单
     */
    show = () => {
        this.popup.show();
    };

    dismiss = () => {
        this.popup.dismiss();
    };

    /**
     * 确定
     */
    confirm = (data,key) => {
        if (key === 2) {
            if (this.props.onShortMessageClickCallback) {
                this.props.onShortMessageClickCallback();
                this.dismiss();
            }
        } else {
            if(this.state.clickOne){
                if(this.props.goodsPopShow) {
                    this.setState({clickOne: false});
                    this.takeToImage(data,key);
                }
            }
        }
    };

    /**
     * 隐藏的时候的回调
     */
    onDismiss = () => {
        this.props.onDismiss && this.props.onDismiss();
    };

    /**
     * 渲染底部视图
     */
    renderFooter = () => {
        return (
            <View style={styles.footerWrap}>
                {/*确定按钮*/}
                <TouchableOpacity
                    style={styles.footerBtn}
                    onPress={this.dismiss}
                >
                    <Text style={{ color: colors.white, fontSize: fonts.font14 }}>取消</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // 头部
    sectionListHeader = (title) => {
        return(
            <View style={styles.header}>
                <Text style={{color: colors.normalFont, fontSize: fonts.font16}}>{title}</Text>
            </View>
        );
    };

    sectionListItem1 =(data) => {
        return (
            <View style={styles.common}>
                <Image source={data.img} />
                <Text style={styles.shareText}>{data.name}</Text>
            </View>
        );
    };

    renderBox = () => {
        return(
            <GridView
                numberOFCol={3}
                itemMarging={3}
                items={this.state.datCell}
                renderItem={this.sectionListItem1}
                customItemStyle={{height: 100,alignItems: 'center', justifyContent: 'center'}}
                containerWidth={WIDTH - 40}
                onItemDidClick={this.confirm}
            />
        );
    };

    renderShareTitle = () => {
        let obj = this.props.data;
        return(
            <View style={styles.shearMsg}>
                <Text style={styles.shearMsgTitle} numberOfLines={1}>{obj.shopName}</Text>
                {/*<View style={styles.location}>*/}
                {/*<Image source={require('gsresource/img/location.png')} />*/}
                {/*<Text style={styles.locationText} numberOfLines={1}>{obj.shopAddr}</Text>*/}
                {/*</View>*/}
            </View>
        );
    };

    renderPop = () => {
        let obj = this.props.data;
        return(
            <TouchableOpacity activeOpacity={1} onPress={this.dismiss}>
                <ViewShot ref={(ref) => {this.viewShot = ref;}} style={[styles.popImgBox,{marginTop: HEIGHT*0.1}]}>
                    <View style={styles.shearHeader}>
                        <View style={styles.shearLogo}>
                            {
                                this.props.showModal ? (
                                    <Image
                                        style={styles.shearLogoImg}
                                        defaultSource={require('gsresource/img/sellerDefault42.png')}
                                        source={{uri: obj.shopLogoPic}}
                                    />
                                ) : (<Image source={require('gsresource/img/shareLogo.png')} />)
                            }

                        </View>
                        {
                            this.props.showModal ? this.renderShareTitle() : (
                                <Image source={require('gsresource/img/shareTtitleStyle.png')} />
                            )
                        }
                    </View>
                    <Image
                        style={styles.imgBox}
                        source={{uri:DocSvc.originDocURL(obj.img)}}
                        defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                        resizeMode={'cover'}
                    />

                    <View style={styles.popBox}>
                        <View style={[styles.popBoxLeft,{ height: 70 }]}>
                            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                <Image
                                    style={[styles.shopAvatarImage]}
                                    defaultSource={require('gsresource/img/sellerDefault42.png')}
                                    source={{uri:DocSvc.docURL(obj ? obj.shopLogo : '')}}
                                />
                                <Text numberOfLines={2} ellipsizeMode={'tail'} style={{marginLeft: 10, fontSize: 11, color: colors.black}}>{obj.shopName}</Text>
                            </View>
                            <Text style={styles.popBoxTips}>长按识别二维码查看店铺</Text>

                        </View>
                        <View style={styles.popBoxCode}>
                            <Image style={{width: 60, height: 60}} source={{uri:this.props.baseImg}} defaultSource={require('gsresource/img/dressDefaultPic110.png')} />
                        </View>
                    </View>

                </ViewShot>
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <Popup
                ref={popup => (this.popup = popup)}
                popupType={'1'}
                backgroundColor={'transparent'}
                width={WIDTH}
                height={HEIGHT}
                contentBackgroundColor={'transparent'}
                onDismiss={this.onDismiss}
            >
                {this.props.goodsPopShow ? this.renderPop() : null}
                <View style={styles.containerWrap}>
                    <SectionList
                        renderSectionHeader={({ section: { title } }) => (this.sectionListHeader(title))}
                        sections={this.state.data}
                        keyExtractor={(item, index) => item + index}
                        renderItem={this.renderBox}
                        style={{flex: 1}}
                    />
                    {this.renderFooter()}

                </View>

            </Popup>
        );
    }
}

const styles = StyleSheet.create({
    shearHeader: {
        height: 50,
        backgroundColor: colors.white,
        flexDirection: 'row',
        alignItems: 'center',
        alignContent: 'center'
    },

    shearLogo: {
        width: 53,
        height: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },

    shearLogoImg: {
        width: 30,
        height: 30,
        borderRadius: 15,
    },

    shearMsgTitle: {
        color: colors.normalFont,
        fontSize: fonts.font16,
        width: WIDTH*0.72 -60,
    },

    // location: {
    //     flexDirection: 'row',
    //     alignItems: 'center',
    //     marginTop: 3,
    //     width: WIDTH*0.72 -70,
    // },
    //
    // locationText: {
    //     color: colors.normalFont,
    //     fontSize: fonts.font9,
    //     paddingLeft: 5,
    // },

    containerWrap: {
        backgroundColor: '#fff',
        paddingLeft: 28,
        paddingRight: 28,
        flex: 1,
        width:WIDTH,
        height:260,
        justifyContent: 'center',
    },


    footerBtn: {
        height: 37,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.activeBtn,
        borderRadius: 37,
        marginBottom: 12,
    },

    header: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
    },

    common: {
        alignItems: 'center',
    },

    shareText: {
        color: colors.greyFont,
        fontSize: fonts.font12,
        paddingTop: 10
    },

    popImgBox: {
        width: WIDTH*0.72,
        height: HEIGHT* 0.5,
        backgroundColor: colors.greyFont,
        marginLeft: WIDTH*0.14,
        marginBottom: 30,
        borderRadius: 8,
    },

    popBox:{
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems:'center',
        backgroundColor: colors.white,
        width: WIDTH*0.72,
        height: 80,
    },

    popBoxLeft: {
        paddingLeft: 13,
        justifyContent: 'space-around',
        width: (WIDTH*0.72 -110),
        alignContent: 'center',
    },

    popBoxTips: {
        fontSize: fonts.font8,
        color: colors.greyFont,
    },

    popBoxCode: {
        width: 80,
        justifyContent: 'center',
        alignItems: 'center',
    },

    imgBox: {
        width: WIDTH*0.72,
        height: HEIGHT* 0.5 - 130,
        borderRadius: 2,
        backgroundColor: colors.white,
    },

    shopAvatarImage:{
        width:30,
        height:30,
        borderColor:'white',
        borderRadius:15,
    },
});