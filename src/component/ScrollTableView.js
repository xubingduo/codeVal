/**
 * author: tuhui
 * Date: 2018/7/13
 * Time: 08:50
 * des:
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    ScrollView,
    View, Image,
    FlatList,
} from 'react-native';
import PropsType from 'prop-types';

export default class ScrollTableView extends Component {

    static propTypes = {
        style: PropsType.any,
        /**
         * 左侧固定列表数据
         */
        dataFixed: PropsType.array,
        //左侧item render回调
        renderCellFixed: PropsType.fun,
        //左侧固定list宽度
        fixedWidth: PropsType.number,
        /**
         * 右侧可左右滑动列表数据
         */
        dataScroll: PropsType.array,
        //左侧item render回调
        renderCellScroll: PropsType.fun,
    };

    static defaultProps = {
        style: {},
        dataFixed: [],
        dataScroll: [],
    };

    render() {
        return (
            <View style={[styles.container, this.props.style]}>
                {
                    this.renderFixedList()
                }

                <ScrollView
                    horizontal={true}
                >

                    {
                        this.renderScrollList()
                    }

                </ScrollView>
            </View>
        );
    }


    /**
     * 左侧固定的列表
     */
    renderFixedList() {
        return (
            <FlatList
                style={{width: this.props.fixedWidth}}
                data={this.props.dataFixed}
                renderItem={this.props.renderCellFixed}
            />
        );
    }

    /**
     * 右侧可左右滑动列表
     */
    renderScrollList() {
        return (
            <FlatList
                data={this.props.dataScroll}
                renderItem={this.props.renderCellScroll}
            />
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row'
    }
});