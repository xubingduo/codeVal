/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   商品图片列表
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-21 11:56:34
 */
import React, {Component} from 'react';
import {StyleSheet, Dimensions} from 'react-native';
import PropTypes from 'prop-types';
import ImageViewer from 'component/ImageViewer';
import DocSvc from 'svc/DocSvc';

const WIDTH = Dimensions.get('window').width;

export default class GoodsImage extends Component {
    static propTypes = {
        imageList: PropTypes.array.isRequired,// img列表对象
        imageObj: PropTypes.object.isRequired,// img对象
        eq: PropTypes.number.isRequired,// 当前对象是第几个
        isOtherModalOpen: PropTypes.bool// 是否有其它modal打开
    };

    static defaultProps = {
        isOtherModalOpen: false
    };

    render() {
        let imageObj = this.props.imageObj;
        let eq = this.props.eq;
        let imgSource = DocSvc.docURLL(imageObj.docId);
        const docIDs = this.props.imageList.filter(item => item.typeId === 1).map(item => {
            return item.docId;
        });

        return (
            <ImageViewer
                source={{uri: imgSource}}
                defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                resizeMode={'cover'}
                style={styles.goodsImg}
                docIDs={docIDs}
                index={eq}
                onShowModal={() => {
                    if (!this.props.isOtherModalOpen) {
                        this.props.watchCallBack(this.props.goods, 2);
                    }
                }}
            />
        );
    }
}

const styles = StyleSheet.create({
    goodsImg: {
        width: (WIDTH - 60) / 3,
        height: (WIDTH - 60) / 3,
        marginRight: 5,
        marginLeft: 5,
        marginBottom: 10
    }
});