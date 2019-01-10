/**
 * @author miao
 * @description 为搜索框添加推荐列表，用该组件包裹搜索框组件
 */
import React, {Component} from 'react';
import {StyleSheet, View, Text, ScrollView, Keyboard, TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';

import DividerLineH from './DividerLineH';

import StringUtl from 'utl/StringUtl';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';

@observer
export default class WithRecommendSearchList extends Component {
    static propTypes = {
        isRecommendVisiable: PropTypes.bool,
        onRecommendItemClick: PropTypes.func,
        recommendList: PropTypes.array,
        text: PropTypes.string
    }

    static defaultProps = {
        text: '',
        recommendList: [],
        onRecommendItemClick: () => null,
        isRecommendVisiable: false
    }

    constructor() {
        super();
        this.state = {
            searchBarHeight: 0,
        };
    }

    _onLayout = ({nativeEvent: {layout: {width, height}}}) => {
        this.setState({searchHeight: height});
    }

    onScrollViewTaped = () => {
        Keyboard.dismiss();
    }

    renderRecommend = () => {
        return this.props.isRecommendVisiable && (
            <View
                style={[styles.recommendContainer, {top: this.state.searchHeight + 1}]}
                onStartShouldSetResponderCapture={this.onScrollViewTaped}
            >
                <ScrollView bounces={false}>
                    {
                        this.props.recommendList && this.props.recommendList.map(item => this._renderItem(item))
                    }
                </ScrollView>
            </View>
        );
    }

    _renderItem = (item) => {
        const _text = StringUtl.getRestExceptStr(item.text, this.props.text);
        return (
            <View key={item.text}>
                <TouchableOpacity
                    style={styles.recommendCell}
                    onPress={() => this.props.onRecommendItemClick(item.text)}
                    activeOpacity={1}
                >
                    <Text style={{fontSize: fonts.font14, color: colors.normalFont}}>
                        {
                            _text.isExist
                                ? (
                                    <React.Fragment>
                                        <Text style={{color: colors.greyFont}}>{_text.left}</Text>
                                        {this.props.text}
                                        <Text style={{color: colors.greyFont}}>{_text.right}</Text>
                                    </React.Fragment>
                                )
                                : item.text
                        }
                        
                    </Text>
                </TouchableOpacity>
                <DividerLineH />
            </View>
        );
    }

    render() {
        return (
            <React.Fragment>
                <View onLayout={this._onLayout}>{this.props.children}</View>
                <DividerLineH />
                {this.renderRecommend()}
                <DividerLineH />
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    recommendContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        zIndex: 30
    },
    recommendCell: {
        height: 45,
        paddingLeft: 19,
        justifyContent: 'center',
        backgroundColor: colors.white,
    }
});