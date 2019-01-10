/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2018-01-12 05:03:23
 * @desc [description]
 */
import React, {Component} from 'react';
import {Image, View, Platform} from 'react-native';
import PropTypes from 'prop-types';

class IOSImage extends Component {
    static propTypes = Image.propTypes;

    render() {
        const {source, ...restProps} = this.props;
        let cachedSource;
        if (typeof source === 'object') {
            cachedSource = Object.assign({}, source, {cache: 'force-cache'});
        } else {
            cachedSource = source;
        }
        return (
            <Image
                source={cachedSource}
                {...restProps}
            />
        );
    }
}


class AndroidImageView extends Component {
    static propTypes = Image.propTypes;

    render() {
        const {source, defaultSource, isShowActivity, ...restProps} = this.props;
        let cachedSource;
        if (typeof source === 'object') {
            cachedSource = Object.assign({}, source, {cache: 'force-cache'});
        } else {
            cachedSource = source;
        }
        return (
            <AndroidImage
                isShowActivity={isShowActivity}
                placeholderSource={defaultSource}
                source={cachedSource}
                {...restProps}
            />
        );
    }
}

class AndroidImage extends Component {

    static propTypes = {
        /**
         * 默认图片
         */
        defaultSource: PropTypes.oneOfType(
            [PropTypes.number,
                PropTypes.shape({
                    uri: PropTypes.string,
                    width: PropTypes.number,
                    height: PropTypes.number,
                    scale: PropTypes.number
                })
            ]
        ),
        ...Image.propTypes
    };

    constructor() {
        super();
        this.state = {
            isOnLoading: true,
            loadError: false,
        };
    }

    /**
     * 图片加载完成
     */
    onLoad = () => {
        this.setState({
            isOnLoading: false,
        });
    };

    onError = () => {
        this.setState({
            loadError: true,
        });
    };

    /**
     * 开始加载图片
     */
    onLoadStart = () => {
        this.setState({
            isOnLoading: true,
        });
    };

    render() {
        let defaultSource = this.props.defaultSource;
        // let showDefault = this.state.loadError || (defaultSource && this.state.isOnLoading);
        const {style, ...otherProps} = this.props;

        return (
            <View
                style={[style]}
            >
                <Image
                    resizeMothod={'cover'}
                    style={[style, {padding: 0, margin: 0}]}
                    onLoad={this.onLoad}
                    onError={this.onError}
                    onLoadStart={this.onLoadStart}
                    {...otherProps}
                />
                {
                    (this.state.loadError || (defaultSource && this.state.isOnLoading))
                    &&
                    <Image
                        style={[style, {padding: 0, margin: 0, position: 'absolute'}]}
                        source={this.props.defaultSource}
                        resizeMode={'cover'}
                    />
                }
            </View>
        );
    }
}

/**
 * 过滤掉Props中空的Image
 */
const filterEmptyImage = (Comp) => {
    return class NotEmptyImageComp extends Component {
        static propTypes = {
            defaultSource: PropTypes.oneOfType(
                [PropTypes.number,
                    PropTypes.shape({
                        uri: PropTypes.string,
                        width: PropTypes.number,
                        height: PropTypes.number,
                        scale: PropTypes.number
                    })
                ]
            ),
            ...Image.propTypes
        };

        render() {
            const {source, ...otherProps} = this.props;
            let newProps = otherProps;
            if (typeof source === 'number' || (source && source.uri && source.uri.length)) {
                newProps.source = source;
            } else {
                newProps.source = otherProps.defaultSource;
            }
            return (
                <Comp
                    {...newProps}
                />
            );
        }
    };
};


export default filterEmptyImage(Platform.select({
    ios: IOSImage,
    android: AndroidImageView
}));