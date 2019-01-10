/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品图片列表
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-21 11:56:34
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    NativeModules,
    Platform,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import Image from 'component/Image';
import DocSvc from 'svc/DocSvc';
import NavigationSvc from 'svc/NavigationSvc';
import UGCModule from '@ecool/react-native-video';
import NetWorkUtl from 'utl/NetWorkUtl';
import {Toast} from '@ecool/react-native-ui';
import NoDoublePress from '../../../../utl/NoDoublePress';
// import rootStore from 'store/RootStore';
import {inject, observer} from 'mobx-react';

let UGC = NativeModules.UGCModule;
const WIDTH = Dimensions.get('window').width;

@inject('commonStore')
@observer
export default class GoodsVideo extends Component {
    static propTypes = {
        videoObj: PropTypes.object.isRequired, // video对象
        isOtherModalOpen: PropTypes.bool // 是否有其它modal打开
    };

    static defaultProps = {
        isOtherModalOpen: false
    };

    constructor(props) {
        super(props);
        this.lookVideo = this.lookVideo.bind(this);
    }

    render() {
        let videoObj = this.props.videoObj;
        let imgSource = videoObj.coverUrl;
        return (
            <TouchableOpacity
                style={[styles.goodsImgItem, { position: 'relative' }]}
                activeOpacity={1}
                onPress={() => {
                    // 防止快速点击多次打开视频画面
                    NoDoublePress.onPress(this.lookVideo);
                    // this.lookVideo();
                }}
            >
                <View style={styles.goodsImg}>
                    <Image
                        source={{ uri: imgSource }}
                        defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                        style={styles.goodsImg}
                    />
                </View>
                <View
                    style={{
                        position: 'absolute',
                        width: 40,
                        height: 40,
                        left: (WIDTH - 60) / 6,
                        top: (WIDTH - 60) / 6,
                        transform: [{ translate: [-20, -20] }],
                        zIndex: 999
                    }}
                >
                    <Image source={require('gsresource/img/videoPlay.png')} />
                </View>
            </TouchableOpacity>
        );
    }

    lookVideo() {
        if (!this.props.commonStore.isModalOpen) {
            this.props.watchCallBack(this.props.goods, 2);
            let videoObj = this.props.videoObj;
            if (Platform.OS === 'ios') {
                NetWorkUtl.getNetWorkState().then((enable)=>{
                    if(enable){
                        UGCModule.autoPlay(videoObj.videoUrl, videoObj.coverUrl);
                    } else {
                        Toast.show('网络似乎不给力',2);
                    }
                });
            } else {
                UGC.play(videoObj.videoUrl, videoObj.coverUrl);
            }
        }
    }
}

const styles = StyleSheet.create({
    goodsImgItem: {
        width: (WIDTH - 60) / 3,
        height: (WIDTH - 60) / 3,
        marginRight: 5,
        marginLeft: 5,
        marginBottom: 10
    },
    goodsImg: {
        width: (WIDTH - 60) / 3,
        height: (WIDTH - 60) / 3
    }
});
