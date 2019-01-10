/**
 * author: wwj
 * Date: 2018/11/13
 * Time: 下午1:52
 * des:
 */
import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import PropTypes from 'prop-types';
import colors from '../../../../gsresource/ui/colors';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh/index';
import TextButton from '../../../../component/TextButton';
import fonts from '../../../../gsresource/ui/fonts';
import SortTextArrow from '../../../../component/SortTextArrow';

export const OrderByType = {
    DEFAULT: '',
    READ: 'viewNum',
    LIKE: 'praiseNum',
    WHOLESALEPRICE: 'pubPrice',
};

export default class SearchSortView extends Component {

    static propTypes = {
        defaultSortClick: PropTypes.func.isRequired,
        readSortClick: PropTypes.func.isRequired,
        likeSortClick: PropTypes.func.isRequired,
        priceSortClick: PropTypes.func.isRequired,
        // 是否开启筛选按钮
        hasFilter: PropTypes.bool.isRequired,
        filterBtnClick: PropTypes.func,
    };

    render() {
        return (
            <View style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
                backgroundColor: colors.white,
                height: 40
            }}
            >
                <TextButton
                    textStyle={this.state.orderBy === OrderByType.DEFAULT ? styles.sortSeletedText : styles.sortNormalText}
                    text={'默认'}
                    onPress={() => {
                        if (this.props.defaultSortClick) {
                            this.props.defaultSortClick();
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.readSta = sta}
                    textStyle={this.state.orderBy === OrderByType.READ ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.READ ? 0 : this.readSta.state.sort}
                    text={'阅读量'}
                    onSortChange={(sort) => {
                        if (this.props.readSortClick) {
                            this.props.readSortClick(sort);
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.likeSta = sta}
                    textStyle={this.state.orderBy === OrderByType.LIKE ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.LIKE ? 0 : this.likeSta.state.sort}
                    text={'点赞数'}
                    onSortChange={(sort) => {
                        if (this.props.likeSortClick) {
                            this.props.likeSortClick(sort);
                        }
                    }}
                />

                <SortTextArrow
                    ref={(sta) => this.priceSta = sta}
                    textStyle={this.state.orderBy === OrderByType.WHOLESALEPRICE ? styles.sortSeletedText : styles.sortNormalText}
                    sort={this.state.orderBy !== OrderByType.WHOLESALEPRICE ? 0 : this.priceSta.state.sort}
                    text={'批发价'}
                    onSortChange={(sort) => {
                        if (this.props.priceSortClick) {
                            this.props.priceSortClick(sort);
                        }
                    }}
                />

                {this.props.hasFilter &&
                <TextButton
                    textStyle={{color: colors.normalFont, fontSize: 14}}
                    text={'筛选'}
                    onPress={() => {
                        if (this.props.filterBtnClick) {
                            this.props.filterBtnClick();
                        }
                    }}
                />
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    sortNormalText: {
        color: colors.normalFont,
        fontSize: fonts.font14,
    },

    sortSeletedText: {
        color: colors.activeFont,
        fontSize: fonts.font14,
    },
});