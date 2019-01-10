/**
 * Created by sml2 on 2018/11/3.
 */
import React, { Component } from 'react';
import { View,Animated } from 'react-native';
import PropTypes from 'prop-types';

export default class ExpandAnimateView extends Component{
    static propTypes = {
        animatedEnable: PropTypes.bool,
        animateCompleteHandler: PropTypes.func,
    }

    constructor(props) {
        super(props);
        this.state = {
            sizeAnim:new Animated.Value(0.01),
        };
    }

    animate = ()=>{
        Animated.spring(this.state.sizeAnim, {
            toValue: 1, // Returns to the start
            velocity: 3, // Velocity makes it move
            tension: -10, // Slow
            // friction: 2, // Oscillate a lot
        }).start(()=>{
            this.setState({
                sizeAnim:new Animated.Value(0.01),
            },this.props.animateCompleteHandler);
        });
    }

    componentDidMount() {
        if(this.props.animatedEnable){
            this.animate();
        }
    }

    render() {
        return (
            <View {...this.props}>
                <Animated.View
                    style={[
                        {...this.props.style,},
                        {
                            transform: [
                                {
                                    scale: this.state.sizeAnim.interpolate({
                                        inputRange: [0,0.5, 1],
                                        outputRange: [1, 3.5,1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    {this.props.children}
                </Animated.View>
            </View>
        );
    }
}

