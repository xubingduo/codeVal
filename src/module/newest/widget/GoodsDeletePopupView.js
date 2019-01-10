/**
 * @author [lyq]
 * @email
 * @create date 2018-12-07 09:51:21
 * @modify date 2018-12-07 09:51:21
 * @desc [删除商品反馈弹框]
 * @flow
 */
import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { PopupType } from '@ecool/react-native-ui/lib/popup';
import { Popup } from '@ecool/react-native-ui';
import topView from 'rn-topview';
import PropTypes from 'prop-types';
import fonts from 'gsresource/ui/fonts';
import { colors } from 'gsresource/ui/ui';
import isIphoneX from 'utl/PhoneUtl';

class GoodsDeletePopupViewContainer extends Component<any, any> {
    popup: Popup;

    static propTypes = {
        itemSelectedCallback: PropTypes.func.isRequired,
        dismiss: PropTypes.func.isRequired
    };

    constructor() {
        super();
    }

    show = () => {
        this.popup.show();
    };

    popviewHeight = () => {
        if (isIphoneX()) {
            return 231 + 34;
        } else {
            return 231;
        }
    };

    renderItemCell = info => {
        return (
            <TouchableOpacity
                style={{
                    width: '100%',
                    height: 44,
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onPress={() =>
                    this.props.itemSelectedCallback(
                        info.item.tendencyType ? info.item.tendencyType : 1
                    )
                }
            >
                <Text
                    style={{ fontSize: fonts.font14, color: colors.normalFont }}
                >
                    {info.item.title ? info.item.title : ''}
                </Text>
            </TouchableOpacity>
        );
    };

    renderSeparateView = () => {
        return (
            <View
                style={{
                    height: 1,
                    width: '100%',
                    backgroundColor: colors.divide
                }}
            />
        );
    };

    render() {
        return (
            <Popup
                ref={ref => (this.popup = ref)}
                popupType={PopupType.BOTTOM}
                height={this.popviewHeight()}
                contentBackgroundColor={'transparent'}
            >
                <View style={{ flex: 1, backgroundColor: 'white' }}>
                    <FlatList
                        ItemSeparatorComponent={this.renderSeparateView}
                        scrollEnabled={false}
                        showsVerticalScrollIndicator={false}
                        style={{
                            height: 132
                        }}
                        data={[
                            { tendencyType: 1, title: '本商品' },
                            { tendencyType: 2, title: '减少该类别推荐' },
                            { tendencyType: 3, title: '减少该版式推荐' },
                            { tendencyType: 4, title: '减少该风格推荐' }
                        ]}
                        keyExtractor={(item, index) => index.toString()}
                        renderItem={this.renderItemCell}
                    />
                    <View
                        style={{
                            height: 11,
                            backgroundColor: colors.bg
                        }}
                    />
                    <TouchableOpacity
                        style={{
                            height: 44,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                        onPress={() => {
                            this.props.itemSelectedCallback(-1);
                        }}
                    >
                        <Text
                            style={{
                                fontSize: fonts.font14,
                                color: colors.normalFont
                            }}
                        >
                            取消
                        </Text>
                    </TouchableOpacity>
                </View>
            </Popup>
        );
    }
}

/**
 *  显示弹框
 *
 */
const show = async (itemSelectedCallback: Function) => {
    let popup = null;
    await topView.set(
        <GoodsDeletePopupViewContainer
            ref={ref => (popup = ref)}
            itemSelectedCallback={item => {
                topView.remove();
                itemSelectedCallback(item);
            }}
            dismiss={() => {
                topView.remove();
            }}
        />
    );
    popup && popup.show();
};

export default {
    show
};
