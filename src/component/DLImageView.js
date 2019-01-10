/**
 * @author sml2
 * @date 2018/03/08
 * @desc ImageView携带图片浏览功能 需要设置urls
 */
import DLShareModule from '@ecool/react-native-sharelib';
import React, { Component } from 'react';
import Image from 'component/Image';
import {ActionSheet} from '@ecool/react-native-ui';
import PropTypes from 'prop-types';
import I18n from 'gsresource/string/i18n';
import {TouchableOpacity,View,Dimensions,SafeAreaView,Platform} from 'react-native';
import topView from 'rn-topview';
import PhotoBrowser from 'react-native-photo-browser';
import NavigationSvc from 'svc/NavigationSvc';
import Alert from 'component/Alert';

const SHARE_SELECTED_IMAGE = I18n.t('shareSelectedImages');
const SAHRE_ALL_IMAGES = I18n.t('shareAllImages');
const Width = Dimensions.get('window').width;
const Height = Dimensions.get('window').height;


export class ImageBrowerScreen extends Component {
    static propTypes = {
        /**
         * 导航参数
         * @param medias Array<{photo:url,selected:false}>
         * @param initialIndex
         * @param exportButtonOnClick 回调参数是medias
         * @param goBack
         */
        navigation: PropTypes.object,
    }

    static navigationOptions = ({navigation}) => {

        return {
            header: null,
        };
    };

    constructor(props) {
        super(props);
        this.state = {};
    }

    render(){
        let params = this.props.navigation.state.params;
        return(
            <SafeAreaView style={{flex:1,backgroundColor:'black'}}>
                <PhotoBrowser
                    onBack={()=>{
                        if(params.goBack){
                            params.goBack();
                        }
                    }}
                    mediaList={params.medias}
                    initialIndex={params.initialIndex}
                    displayActionButton={true}
                    displaySelectionButtons={true}
                    displayTopBar={true}
                    onActionButton={()=>{
                        if(params.exportButtonOnClick){
                            params.exportButtonOnClick(params.medias);
                        }
                    }}
                    onSelectionChanged={(media, index, isSelected)=>{params.medias[index].selected = isSelected;}}
                />
            </SafeAreaView>
        );
    }

}


export default class DLImageView extends Component {
    static propTypes = {
        // 图片url数组 （展示图片浏览时必需）
        urls:PropTypes.arrayOf(PropTypes.string),
        // 是否能交互 默认 true(不需要图片浏览功能时 建议设置为false)
        userInteractionEnabled:PropTypes.bool,
        // 展示图片序号
        index:PropTypes.number,
        ...Image.propTypes,
    }

    static defaultProps = {
        userInteractionEnabled:true,
    }

    render(){
        const {urls,index,userInteractionEnabled,...otherProps} = this.props;
        return (
            <TouchableOpacity
                disabled={!userInteractionEnabled}
                activeOpacity={1}
                onPress={()=>{
                    let initialIndex = index ? index : 0;
                    let medias = [];
                    if(urls && urls.length > 0){
                        for(let i = 0,len=urls.length; i < len; i++) {
                            if(urls[i].length <= 0) continue;
                            medias.push({photo:urls[i],selected:false});
                        }
                        if(medias.length > 0){
                            if(Platform.OS === 'ios'){
                                topView.set(
                                    <View style={{width:Width,height:Height}}>
                                        <SafeAreaView style={{flex:1,backgroundColor:'black'}}>
                                            <PhotoBrowser
                                                onBack={this.goBack}
                                                mediaList={medias}
                                                initialIndex={initialIndex}
                                                displayActionButton={true}
                                                displaySelectionButtons={true}
                                                displayTopBar={true}
                                                onActionButton={()=>{
                                                    this.exportButtonOnClick(medias);
                                                }}
                                                onSelectionChanged={(media, index, isSelected)=>{medias[index].selected = isSelected;}}
                                            />
                                        </SafeAreaView>
                                    </View>
                                );
                            } else {
                                NavigationSvc.navigate('ImageBrowerScreen',{
                                    medias:medias,
                                    initialIndex:initialIndex,
                                    exportButtonOnClick: this.exportButtonOnClick,
                                    goBack:()=>{NavigationSvc.pop();},
                                });
                            }
                        }
                    }
                }}
            >
                <Image {...otherProps} />
            </TouchableOpacity>
        );
    }

    // 导出按钮点击
    exportButtonOnClick = (medias)=>{
        ActionSheet.showActionSheetWithOptions({
            options:[SHARE_SELECTED_IMAGE,SAHRE_ALL_IMAGES,I18n.t('cancel')],
            cancelButtonIndex: 2,
            maskClosable: true,
        },(value)=>{
            if(value === 0){
                this.shareSelectedImages(medias);
            } else if(value === 1) {
                this.shareAllImages(medias);
            }
        });
    }

    // 分享选中图片
    shareSelectedImages(medias){
        let urls = [];
        for(let i = 0,len = medias.length; i < len; i++) {
            let item = medias[i];
            if(item.selected){
                urls.push(item.photo);
            }
        }
        if(urls.length === 0){
            Alert.alert(I18n.t('pleaseClickRightToSelectedImage'));
        } else {
            DLShareModule.shareImageURLs(urls,()=>{});
        }
    }

    // 分享所有图片
    shareAllImages(medias){
        let urls = [];
        for(let i = 0,len = medias.length; i < len; i++) {
            urls.push(medias[i].photo);
        }
        DLShareModule.shareImageURLs(urls,()=>{});
    }

    goBack = ()=>{
        topView.remove();
    }
}