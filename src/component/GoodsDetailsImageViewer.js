/**
 * @author GaoYuJian && xbu
 * @create date 2018/10/26
 * @desc 单击展示大图的图片组件
 */
import React, {Component} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ActivityIndicator,
    StyleSheet,
    CameraRoll,
    Platform,
    InteractionManager
} from 'react-native';
import PropTypes from 'prop-types';
import Image from 'component/Image';
import BigImageViewer from 'react-native-image-zoom-viewer';
import FastImage from 'react-native-fast-image';
import DocSvc from 'svc/DocSvc';
import RNFetchBlob from 'rn-fetch-blob';
import {Toast} from '@ecool/react-native-ui';

const propTypes = {
    // 图片ids
    docIDs: PropTypes.arrayOf(PropTypes.string),

    // 大图展示初始位置
    index: PropTypes.number,

    onPress: PropTypes.func,

    // modal展示回调
    onShowModal: PropTypes.func,

    ...Image.propTypes
};

const defaultProps = {
    index: 0,
};

export default class ImageViewer extends Component {
    constructor(props) {
        super();
        this.state = {visible: false, currentIndex: props.index};
    }

    // 回调方法给外部提供
    exportMethods = () => {
        const {docIDs, index, onPress, onShowModal, source, defaultSource, style, resizeMode} = this.props;
        if (docIDs && docIDs.length > 0) {
            this.setState({visible: true});
            DocSvc.preloadImages(docIDs.map((item) => item));
        }
        if (onPress) {
            onPress();
        }
    };

    render() {
        const {docIDs, index, onPress, onShowModal, source, defaultSource, style, resizeMode,hideCallback} = this.props;
        return (
            <Modal
                visible={this.state.visible}
                transparent={true}
                onShow={() => {
                    InteractionManager.runAfterInteractions(() => {
                        if (onShowModal) {
                            onShowModal();
                        }
                    });
                }}
                onRequestClose={() => {
                    this.setState({visible: false});
                    hideCallback && hideCallback();
                }}
            >
                <BigImageViewer
                    index={index}
                    imageUrls={docIDs && docIDs.map((item) => {
                        return {url: item};
                    })}
                    previewImageUrls={docIDs && docIDs.map((item) => {
                        return {url: item};
                    })}
                    fetchImage={Platform.OS === 'ios' ? FastImage.loadImage : undefined}
                    renderImage={(props) => {
                        const CustomerImage = Platform.OS === 'ios' ? FastImage : Image;
                        return (<CustomerImage {...props} />);
                    }}
                    loadingRender={() => <ActivityIndicator size='small' color='white' />}
                    enableImageZoom={true}
                    failImageSource={source}
                    saveToLocalByLongPress={true}
                    onClick={() => {
                        this.setState({visible: false});
                    }}
                    onLongPress={() => {
                        //Toast.show('changan');
                    }}
                    onSave={(url) => {
                        if (Platform.OS === 'android') {
                            RNFetchBlob
                                .config({
                                    fileCache: true,
                                    appendExt: 'jpg'
                                })
                                .fetch('GET', url)
                                .then((res) => {
                                    CameraRoll.saveToCameraRoll(res.path())
                                        .then(
                                            () => {
                                                Toast.show('保存成功');
                                            }
                                        )
                                        .catch((err) => {
                                            if (err.message === '用户拒绝访问') {
                                                Toast.show('请到设置开启照片权限');
                                            } else {
                                                Toast.show(err.message);
                                            }

                                        });
                                });
                        } else {
                            CameraRoll.saveToCameraRoll(url)
                                .then(
                                    () => {
                                        Toast.show('保存成功');
                                    }
                                )
                                .catch((err) => {
                                    if (err.message === '用户拒绝访问') {
                                        Toast.show('请到设置开启照片权限');
                                    } else {
                                        Toast.show(err.message);
                                    }
                                });
                        }
                    }}
                />
            </Modal>
        );
    }
}

ImageViewer.propTypes = propTypes;
ImageViewer.defaultProps = defaultProps;