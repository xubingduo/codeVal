/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品图片列表
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-21 11:56:34
 */
import React, {Component} from 'react';
import {
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    View,
    Text,
    Platform,
    NativeModules,
    TouchableWithoutFeedback
} from 'react-native';


import PropTypes from 'prop-types';
import NavigationSvc from 'svc/NavigationSvc';
import DocSvc from 'svc/DocSvc';

import Image from 'component/Image';
import GoodsImage from './GoodsImage';
import GoodsVideo from './GoodsVideo';
// import {GoodsImage, GoodsVideo} from './ImageVideo';
const WIDTH = Dimensions.get('window').width;

export default class ImageVideoList extends Component {
    static propTypes = {
        isOtherModalOpen: PropTypes.bool,// 是否有modal打开
        imageVideoList: PropTypes.array,// 图片列表
        goods: PropTypes.object.isRequired,// goods
        watchCallBack: PropTypes.func,
        goToUrl: PropTypes.func, // 去详情页面
    };
    static defaultProps = {
        isOtherModalOpen: false
    };

    constructor(props) {
        super(props);
        this.state = {
            swiperIndex: 0// 默认显示第一个
        };
    }

    watchCallback = (i) => {
        this.props.goToUrl && this.props.goToUrl(i);
        this.props.watchCallBack && this.props.watchCallBack();
    };

    render() {
        let imageVideoList = this.props.imageVideoList;
        let videoList = imageVideoList.filter((el) => {
            return el.typeId === 3;
        });
        let imgList = imageVideoList.filter((el) => {
            return el.typeId === 1;
        });
        let finalImgList;
        if (videoList.length === 1) {
            finalImgList = imgList.filter((el, index) => {
                return index < 8;
            });
        } else {
            finalImgList = imgList.filter((el, index) => {
                return index < 9;
            });
        }
        // console.log(imgList)
        return (
            <View>
                {/*商品图部分*/}
                <View style={styles.goodsImgBox}>
                    {
                        videoList.length === 1 &&
                        <GoodsVideo
                            videoObj={videoList[0]}
                            // isOtherModalOpen={this.props.isOtherModalOpen}
                            goods={this.props.goods}
                            watchCallBack={this.props.watchCallBack}
                        />
                    }
                    {
                        finalImgList.length >= 1 &&
                        finalImgList.map((e, i) => {
                            return (
                                <TouchableOpacity
                                    key={i.toString()}
                                    onPress={() => this.watchCallback(i)}
                                >
                                    <Image
                                        source={{uri: DocSvc.docURLL(e.docId)}}
                                        defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                                        resizeMode={'cover'}
                                        style={styles.goodsImg}
                                    />
                                </TouchableOpacity>
                            );
                        })
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    goodsImgBox: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 10
    },
    goodsImg: {
        width: (WIDTH - 60) / 3,
        height: (WIDTH - 60) / 3,
        marginRight: 5,
        marginLeft: 5,
        marginBottom: 10
    }
});