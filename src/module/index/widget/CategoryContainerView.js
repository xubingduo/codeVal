/**
 * @author [lyq]
 * @email
 * @create date 2018-12-07 10:00:16
 * @modify date 2018-12-07 10:00:16
 * @desc [首页主营类目选择弹框]
 * @flow
 */
import React, { Component } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Image from 'component/Image';
import { any, object } from 'prop-types';
import { colors } from 'gsresource/ui/ui';
import { runInAction } from 'mobx';
import isPhoneX from 'utl/PhoneUtl';
import { focusOnTypeList } from 'module/newest/util/mutationTypes';
import fonts from 'gsresource/ui/fonts';

export default class CategoryContainerView extends Component<any> {
    static propTypes = {
        defaultCategory: PropTypes.object.isRequired,
        categoryList: PropTypes.array.isRequired,
        cellItemSelectedCallBack: PropTypes.func.isRequired
    };

    renderItemCell = (item: Object) => {
        let textColor = colors.greyFont;
        if (this.props.defaultCategory) {
            textColor =
                item.item.codeValue === this.props.defaultCategory.codeValue
                    ? colors.activeBtn
                    : colors.greyFont;
        }
        return (
            <TouchableOpacity
                onPress={() => {
                    this.props.cellItemSelectedCallBack(item.item);
                }}
                style={{
                    height: 48,
                    marginHorizontal: 19,
                    justifyContent: 'center'
                }}
            >
                <Text
                    numberOfLines={1}
                    style={{
                        color: textColor,
                        fontSize: fonts.font14
                    }}
                >
                    {item.item.codeName}
                </Text>
            </TouchableOpacity>
        );
    };

    render() {
        return (
            <View
                style={{
                    width: 111 + 7 * 2,
                    height: '100%',
                    top: 28,
                    left: 9
                }}
            >
                <Image
                    style={{
                        position: 'absolute'
                    }}
                    source={require('gsresource/img/categoryListBack.png')}
                />
                <FlatList
                    showsVerticalScrollIndicator={false}
                    style={{
                        position: 'absolute',
                        left: 7,
                        top: 7 + 5,
                        width: 111,
                        height: 333 - 12
                    }}
                    data={this.props.categoryList}
                    keyExtractor={(item, index) => item.id.toString()}
                    renderItem={item => this.renderItemCell(item)}
                />
            </View>
        );
    }
}
