/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-22 08:45:24
 * @desc [空白视图]
 * @flow
*/
import React from 'react';
import {
    View,
    SafeAreaView,
    Image,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import fonts from '../gsresource/ui/fonts';
import colors from '../gsresource/ui/colors';


type PropTypes = {
    /**
     * 样式
     * 
     * @type {?Object}
     */
    style: ?Object,
    /**
     * 文本容器的样式
     * 
     * @type {?Object}
     */
    textWrapStyle: ?Object,
    /**
     * 文本的样式
     * 
     * @type {?Object}
     */
    textStyle: ?Object,
    /**
     * 空白视图的类型
     * 
     * @type {('LOADING' | 'ERROR' | 'NODATA')}
     * LOADING -> 正在加载
     * ERROR -> 错误
     * NODATA -> 没有数据
     */
    emptyViewType: 'LOADING' | 'ERROR' | 'NODATA',
    /**
     * 额外信息
     * 
     * @type {?Element}
     */
    extElement: ?Element,
    /**
     * 文本描述信息
     * 
     * @type {string}
     */
    desc: ?string,
    /**
     * 是否包含重新加载
     * 
     * @type {boolean}
     */
    containReload: boolean,
    /**
     * 处理重新加载的事件
     * 
     * @type {Function}
     */
    onReloadHandler: Function
}

const DEFAULT_NO_DATA_DESC = '暂无数据';
const DEFAULT_LOAD_ERROR_DESC = '页面出错了！';
const DEFAULT_RELOAD_TITLE = '刷新数据';

const EmptyView = (props: PropTypes) => {
    const {
        style,
        textWrapStyle,
        textStyle,
        desc,
        extElement,
        containReload,
        onReloadHandler,
        emptyViewType
    } = props;

    let imageSource = emptyViewType === 'LOADING' ? require('gsresource/img/loading.gif') : require('gsresource/img/noData.png');
    let descContent = desc;
    if (emptyViewType !== 'LOADING') {
        descContent = descContent ? descContent : (emptyViewType === 'ERROR' ? DEFAULT_LOAD_ERROR_DESC : DEFAULT_NO_DATA_DESC);
    }
    let imageStyle = emptyViewType === 'LOADING' ? { width: 119, height: 119 } : {};

    return (
        <SafeAreaView style={[styles.containerWrap, style]}>
            <Image
                style={[styles.image,imageStyle]}
                source={imageSource}
            />
            <View style={[styles.textWrap, textWrapStyle]}>
                {
                    // 如果用户传入了额外的节点 直接显示额外节点
                    extElement
                        ?
                        extElement
                        // 如果需要有重新加载的回调则通过 TouchableOpacity 包裹
                        :
                        <Text style={[styles.text, textStyle]}>{descContent}</Text>
                }
            </View>

            {
                containReload && onReloadHandler && emptyViewType !== 'LOADING'
                    ?
                    <TouchableOpacity
                        style={styles.reloadButton}
                        onPress={onReloadHandler}
                    >
                        <LinearGradient
                            colors={['#fd6339', '#ff392e']}
                            start={{ x: 0.0, y: 0.0 }}
                            end={{ x: 1.0, y: 0.0 }}
                            style={styles.reloadLinearGradient}
                        >
                            <Text style={styles.reloadButtonText}>{DEFAULT_RELOAD_TITLE}</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                    :
                    null
            }

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    containerWrap: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.bg,
    },

    textWrap: {
        marginTop: 8,
    },

    text: {
        fontSize: fonts.font14,
        color: '#b4b4b4'
    },

    image: {
        // width: 119,
        // height: 119,
    },

    reloadButton: {
        height: 39,
        width: Dimensions.get('window').width - 30,
        marginTop: 31,
        flexDirection: 'row',
        position: 'absolute',
        left: 15,
        bottom: 29,
    },

    reloadButtonText: {
        fontSize: 16,
        color: '#fff',
        backgroundColor: 'transparent',
        textAlign: 'center',
    },

    reloadLinearGradient: {
        flex: 1,
        borderRadius: 18.5,
        justifyContent: 'center'

    }
});

export default EmptyView;   