/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-07 10:12:13
 * @desc [description]
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    TouchableWithoutFeedback,
    Text,
    StyleSheet,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { GridView } from '@ecool/react-native-ui';
import fonts from '../gsresource/ui/fonts';
import Image from './Image';

// 宽度
const CONTAINER_WIDTH = 300;
// 每个选项item的高度
const GRIDITEM_MARGIN = 18;

export default class SlideFilterGridItem extends Component {

    static propTypes = {
        // 是否支持多选
        enableMutil: PropTypes.bool,
        // 选中的结果改变
        onSelectChanged: PropTypes.func,
        // 默认选中
        defaultSelectedItems: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.number])),
        // 数据
        datas: PropTypes.arrayOf(PropTypes.object).isRequired,
        // 每行列数
        numberOFCol: PropTypes.number,
        // 是否可以控制展开
        enableExpand: PropTypes.bool,
        // 标题
        title: PropTypes.string,
        // 原始展开行数
        defaultExpandRow: PropTypes.number,
    };

    static defaultPropTypes = {
        enableMutil: true,
        defaultSelectedItems: [],
        numberOFCol: 2,
        enableExpand: false,
        defaultExpandRow: 1,
        onSelectChanged: () => null,
    };

    constructor(props) {
        super(props);
        // 如果可以控制展开 则默认状态为收缩所有item
        // 不可控制则默认显示所有数据
        const { datas, enableExpand, numberOFCol, defaultExpandRow} = this.props;
        this.enableExpandTemp = enableExpand;
        // 如果数据小于要展示的个数 则默认为不能进行展开
        if(datas.length <= numberOFCol * defaultExpandRow){
            this.enableExpandTemp = false;
        }
        this.state = {isExpand: !this.enableExpandTemp};
        // 每个item的宽度 根据列数自动计算
        this.GRIDITEM_WIDTH = (CONTAINER_WIDTH - (this.props.numberOFCol + 1) * GRIDITEM_MARGIN) / this.props.numberOFCol;
    }

    onItemDidSelected = (item) => {
        const { datas, enableMutil, onSelectChanged, defaultSelectedItems } = this.props;

        let isSelected = false;
        let selectedIndex = -1;
        defaultSelectedItems.forEach((curr, index) => {
            let innerItem = curr;
            if (typeof curr === 'number') {
                innerItem = datas[curr];
            }
            if (innerItem === item || innerItem.id === item.id) {
                isSelected = true;
                selectedIndex = index;
            }
        });
        let currSelectedItems = defaultSelectedItems;

        if (isSelected === false) {
            if (enableMutil === false) {
                currSelectedItems = [item];
            } else {
                currSelectedItems.push(item);
            }
        } else {
            currSelectedItems.splice(selectedIndex, 1);
        }

        if (onSelectChanged) {
            onSelectChanged(currSelectedItems);
        }
    };

    expandGridItem = () => {
        this.setState({isExpand: !this.state.isExpand});
    };

    /**
     * 渲染标题
     */
    renderTitle = (title) => {
        return (
            <View style={styles.itemTitleWrap}>
                <Text style={styles.itemTitleText}>{title}</Text>
                {
                    this.enableExpandTemp &&
                    <TouchableOpacity
                        hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                        onPress={() => {
                            this.expandGridItem();
                        }}
                    >
                        <Image
                            source={this.state.isExpand ? require('gsresource/img/arrowTop.png')
                                : require('gsresource/img/arrowBottom.png')}
                        />
                    </TouchableOpacity>
                }
            </View>
        );
    };

    /**
     * 渲染每个Item
     */
    renderItem = (item) => {
        const { datas, defaultSelectedItems } = this.props;

        let isSelected = false;
        defaultSelectedItems.forEach((curr) => {
            let innerItem = curr;
            if (typeof curr === 'number') {
                innerItem = datas[curr];
            }
            if (innerItem === item || innerItem.id === item.id) {
                isSelected = true;
            }
        });

        return (
            <TouchableWithoutFeedback onPress={() => this.onItemDidSelected(item)}>
                <View style={[isSelected ? styles.itemSelectedWrap : styles.itemNormalWrap, {width: this.GRIDITEM_WIDTH}]}>
                    <Text style={isSelected ? styles.itemTextSelected : styles.itemTextNormal} numberOfLines={1}>{item.typeName}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    render() {
        const { datas, numberOFCol, title, defaultExpandRow } = this.props;
        let expandStyle = Platform.OS === 'android' ?
            {marginBottom: 0, height: 48+GRIDITEM_MARGIN, flexWrap: 'nowrap'}
            : {marginBottom: GRIDITEM_MARGIN, height: 48, flexWrap: 'nowrap'};

        return (
            <View>
                {this.renderTitle(title)}
                <GridView
                    itemEnable={false}
                    numberOFCol={numberOFCol}
                    itemMarging={GRIDITEM_MARGIN}
                    items={datas}
                    renderItem={this.renderItem}
                    containerWidth={CONTAINER_WIDTH}
                    customItemStyle={{ height: 30 }}
                    containerStyle={datas.length <= numberOFCol * defaultExpandRow ? {} : (this.state.isExpand ? {} : expandStyle)}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    itemTitleWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 18,
        marginRight: 18,
        justifyContent: 'space-between',
    },

    itemTitleText: {
        fontSize: fonts.font14,
        color: '#9b9b9b',
    },

    itemNormalWrap: {
        flex: 1,
        width: 115,
        backgroundColor: '#eeeeee',
        justifyContent: 'center',
        alignContent: 'center',
    },

    itemSelectedWrap: {
        flex: 1,
        width: 115,
        backgroundColor: '#ff6699',
        justifyContent: 'center',
    },

    itemTextNormal: {
        fontSize: fonts.font12,
        color: '#3d4245',
        textAlign: 'center',
    },

    itemTextSelected: {
        fontSize: fonts.font12,
        color: '#ffffff',
        textAlign: 'center',
    },
});
