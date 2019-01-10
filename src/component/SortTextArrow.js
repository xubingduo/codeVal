/**
 * author: tuhui
 * Date: 2018/7/24
 * Time: 10:36
 * des:排序的 左边文字 右边上下箭头
 */

import React, {Component} from 'react';
import {
    StyleSheet, Text,
    TouchableOpacity,
    View
} from 'react-native';
import PropTypes from 'prop-types';
import Image from './Image';
import colors from '../gsresource/ui/colors';

export default class SortTextArrow extends Component {

    static propTypes = {
        text: PropTypes.string,
        /**
         * 0不排序 -1降序 1升序
         */
        sort: PropTypes.number,
        /**
         * 整体样式
         */
        style: PropTypes.object,
        /**
         * 文字样式
         */
        textStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        //排序改变回调
        onSortChange: PropTypes.func,
    };

    static defaultProps = {
        style: {},
        textStyle: {},
        sort: 0
    };

    constructor(props) {
        super(props);
        this.state = ({
            sort: 0,
        });
    }

    componentWillReceiveProps(nextProps){
        this.setState({
            sort: nextProps.sort,
        });
    }

    componentDidMount() {
        this.setState({
            sort: this.props.sort,
        });
    }

    render() {
        return (
            <TouchableOpacity
                style={styles.container}
                onPress={() => {
                    if (this.state.sort === -1) {
                        this.setState({
                            sort: 1
                        });
                    } else {
                        this.setState({
                            sort: -1
                        });
                    }

                    this.timeoutId = setTimeout(() => {
                        this.props.onSortChange &&
                        this.props.onSortChange(this.state.sort);
                    }, 100);
                }}
            >
                <Text style={[styles.text, this.props.textStyle]}>
                    {this.props.text}
                </Text>

                <View style={{marginLeft: 2, alignItems: 'center'}}>
                    {
                        (this.state.sort === 1) &&
                        <Image source={require('gsresource/img/sortUp.png')} />
                    }
                    {
                        (this.state.sort === -1) &&
                        <Image source={require('gsresource/img/sortDown.png')} />
                    }

                </View>
            </TouchableOpacity>
        );
    }

    componentWillUnmount(){
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
}


const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    text: {
        color: colors.normalFont,
        fontSize: 14
    }
});