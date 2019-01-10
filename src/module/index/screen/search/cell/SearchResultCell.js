/**
 * author: wwj
 * Date: 2018/11/2
 * Time: 下午2:54
 * des: 商品或门店搜索结果的cell
 */
import React, {Component} from 'react';
import {View, StyleSheet, Text, FlatList,
    TouchableOpacity} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../../../../gsresource/ui/colors';
import fonts from '../../../../../gsresource/ui/fonts';
import SearchGoodsEmptyView from '../../../widget/SearchGoodsEmptyView';
import Image from '../../../../../component/Image';
import DividerLineH from '../../../../../component/DividerLineH';
import NoDoublePress from '../../../../../utl/NoDoublePress';

export default class SearchResultCell extends Component {

    static propTypes = {
        style: PropTypes.object,
        title: PropTypes.string.isRequired,
        onItemClick: PropTypes.func,
        itemView: PropTypes.any,
        sourceData: PropTypes.object,
        moreClick: PropTypes.func,
    };

    constructor(props) {
        super(props);

        this.state = {
            sourceData: this.props.sourceData
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            sourceData: nextProps.sourceData
        });
    }

    render() {
        return (
            <View style={[{flex: 1, backgroundColor: colors.white}, this.props.style]}>
                {/*{this.renderTitleHeader()}*/}
                <View style={{marginLeft: 10, marginRight: 10, backgroundColor: colors.bg, height: 1}} />
                <FlatList
                    style={{flex: 1}}
                    showsVerticalScrollIndicator={false}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={this.props.itemView}
                    data={this.state.sourceData}
                    ListEmptyComponent={this.renderEmpty}
                    ItemSeparatorComponent={this.renderDivider}
                    numColumns={1}
                    keyboardDismissMode={'on-drag'}
                />
                {this.props.sourceData && this.props.sourceData.length > 0 && this.renderMore()}
            </View>
        );
    }

    renderTitleHeader = () => {
        return (
            <View
                style={styles.titleHeader}
            >
                <View style={{width: 3, height: 14, backgroundColor: colors.activeFont, marginRight: 8}} />
                <Text style={styles.title}>{this.props.title}</Text>
            </View>
        );
    };

    /**
     * 无数据界面
     */
    renderEmpty = () => {
        return (
            <View style={{marginTop: 30, marginBottom: 30}}>
                <SearchGoodsEmptyView />
            </View>
        );
    };

    renderDivider = () => {
        return (
            <View
                style={{
                    backgroundColor: colors.divide,
                    height: 10
                }}
            />
        );
    };

    renderMore = () => {
        return (
            <TouchableOpacity
                style={{flex: 1}}
                onPress={() => {
                    if (this.props.moreClick) {
                        // 防止连续点击
                        NoDoublePress.onPress(this.props.moreClick);
                    }
                }}
            >
                <DividerLineH />
                <View
                    style={{flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingTop: 20, paddingBottom: 20}}
                >
                    <Image
                        source={require('gsresource/img/search.png')}
                    />
                    <Text style={{flex: 1, fontSize: fonts.font14, color: colors.greyFont, marginLeft: 5}}>{'查看更多'}</Text>
                    <Image
                        source={require('gsresource/img/arrowRight.png')}
                    />
                </View>
            </TouchableOpacity>
        );
    };
}

const styles = StyleSheet.create({
    titleHeader: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: fonts.font14,
        color: colors.activeFont,
    },
});