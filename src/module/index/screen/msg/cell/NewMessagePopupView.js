/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2018-02-02 11:49:46
 * @desc [消息中心Popup (有新的订单)]
 * @flow
 */

import React, { Component } from 'react';
import { PanResponder, Animated, TouchableOpacity } from 'react-native';
import { Popup } from '@ecool/react-native-ui';
import { PopupType } from '@ecool/react-native-ui/lib/popup';
import topView from 'rn-topview';
import MsgCell from './MsgCell';

const POPUP_HEIGHT = 180;

/**
 * 容器
 */
class NewMessagePopupViewContainer extends Component<any, any> {
    /**
     * 包含动画的容器
     */
    popup: Popup;
    /**
     * 手势处理
     */
    panResponder: PanResponder;
    /**
     * 定时器
     */
    timer: any;

    constructor() {
        super();

        this.state = {
            anim: new Animated.Value(0)
        };
    }

    componentWillMount() {
        this.panResponder = PanResponder.create({
            // 要求成为响应者：
            onStartShouldSetPanResponder: this.onStartShouldSetPanResponder,
            onMoveShouldSetPanResponder: this.onMoveShouldSetPanResponder,

            onPanResponderGrant: this.onPanResponderGrant,
            onPanResponderMove: this.onPanResponderMove,
            onPanResponderRelease: this.onPanResponderRelease
        });
    }

    componentDidMount() {
        this.timer = setTimeout(() => {
            this.popup && this.popup.dismiss(this.props.onDismiss);
        }, 3000);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    onStartShouldSetPanResponder = () => {
        return true;
    };

    onMoveShouldSetPanResponder = () => {
        return true;
    };

    onPanResponderGrant = () => {
        console.log('开始手势');
    };

    onPanResponderMove = (_: any, gestureState: any) => {
        if (-gestureState.dy > 0) {
            Animated.timing(this.state.anim, {
                toValue: gestureState.dy,
                duration: 0
            }).start();
        }
    };

    onPanResponderRelease = (_, gestureState: any) => {
        if (-gestureState.dy > POPUP_HEIGHT / 3.0) {
            this.popup.dismiss(this.props.onDismiss);
        } else {
            Animated.timing(this.state.anim, {
                toValue: 0,
                duration: 250
            }).start();
        }
    };

    /**
     * 显示
     */
    show = () => {
        this.popup.show();
    };

    render() {
        return (
            <Popup
                ref={ref => (this.popup = ref)}
                popupType={PopupType.TOP}
                height={POPUP_HEIGHT}
                onPress={this.props.onDismiss}
                contentBackgroundColor={'transparent'}
            >
                <Animated.View
                    style={[{ transform: [{ translateY: this.state.anim }] }]}
                    // {...this.panResponder.panHandlers}
                >
                    <TouchableOpacity
                        onPress={() => {
                            // this.props.onPress && this.props.onPress();
                            this.popup.dismiss(this.props.onDismiss);
                        }}
                        activeOpacity={0.8}
                    >
                        <MsgCell
                            item={this.props.item}
                            showDetailButton={true}
                            detailButtonClick={() => {
                                this.props.onPress && this.props.onPress();
                                this.popup.dismiss(this.props.onDismiss);
                            }}
                        />
                    </TouchableOpacity>
                </Animated.View>
            </Popup>
        );
    }
}

/**
 *  显示消息
 *
 * @param {*} item 消息页面配置信息
 * @param {*} onPress 点击Cell 的回调
 */
const show = async (item: Object, onPress: ?Function) => {
    let popup = null;
    await topView.set(
        <NewMessagePopupViewContainer
            ref={ref => (popup = ref)}
            onDismiss={() => {
                topView.remove();
            }}
            onPress={onPress}
            item={item}
        />
    );
    popup && popup.show();
};

export default {
    show
};
