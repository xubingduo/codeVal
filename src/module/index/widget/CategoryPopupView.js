/**
 * @author [lyq]
 * @email
 * @create date 2018-12-07 09:51:21
 * @modify date 2018-12-07 09:51:21
 * @desc [首页主营类目选择弹框容器]
 * @flow
 */
import React, { Component } from 'react';
import { View, Text, TouchableWithoutFeedback, Platform } from 'react-native';
import { PopupType } from '@ecool/react-native-ui/lib/popup';
import { Popup } from '@ecool/react-native-ui';
import CategoryContainerView from 'module/index/widget/CategoryContainerView';
import topView from 'rn-topview';
import PropTypes from 'prop-types';
import isPhoneX from 'utl/PhoneUtl';

class CategoryPopupView extends Component<any, any> {
    popup: Popup;

    static propTypes = {
        defaultCategory: PropTypes.object.isRequired,
        categoryList: PropTypes.array.isRequired,
        itemSelectedCallback: PropTypes.func.isRequired,
        dismiss: PropTypes.func.isRequired
    };

    constructor() {
        super();
    }

    show = () => {
        this.popup.show();
    };

    render() {
        return (
            <Popup
                enableAnim={false}
                ref={ref => (this.popup = ref)}
                popupType={PopupType.TOP}
                height={333 + 28 + 20 + 7}
                contentBackgroundColor={'transparent'}
            >
                <TouchableWithoutFeedback onPress={() => this.props.dismiss()}>
                    <View style={{ flex: 1 }}>
                        <CategoryContainerView
                            defaultCategory={this.props.defaultCategory}
                            categoryList={this.props.categoryList}
                            cellItemSelectedCallBack={item => {
                                this.props.itemSelectedCallback(item);
                            }}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </Popup>
        );
    }
}

/**
 *  显示弹框
 *
 */
const show = async (
    defaultItem: Object,
    categoryList: Array<any>,
    itemSelectedCallback: Function
) => {
    let popup = null;
    await topView.set(
        <CategoryPopupView
            ref={ref => (popup = ref)}
            defaultCategory={defaultItem}
            categoryList={categoryList}
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
