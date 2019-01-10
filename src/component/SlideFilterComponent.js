/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-05 03:35:11
 * @desc [侧滑筛选条件配置组件]
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Text,
    Switch
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Popup } from '@ecool/react-native-ui';
import SlideFilterDateItem from './SlideFilterDateItem';
import SlideFilterDropDownItem from './SlideFilterDropDownItem';
import SlideFilterGridItem from './SlideFilterGridItem';
import colors from '../gsresource/ui/colors';

import GoodsSlideFilterStore from '../module/index/store/GoodsSlideFilterStore';
import {Toast} from '@ecool/react-native-ui';
import { observer, Observer } from 'mobx-react';
import { toJS } from 'mobx';
import fonts from '../gsresource/ui/fonts';
import SlideFilterPriceItem from './SlideFilterPriceItem';

/**
 * 过滤的类型
 */
export const FilterType = {
    // 日期
    DateType: 0,
    // 下拉列表选择
    DropDownType: 1,
    // checkBox开关
    CheckBoxType: 2,
    // 多选
    MutilSelectType: 3,
    // 单选
    RadioType: 4,
    // 价格区间
    PriceType: 5
};

@observer
export default class SlideFilterComponent extends Component {

    static propTypes = {
        // 数据源
        dataSource: PropTypes.shape({
            // 包含选项的筛选类型
            datas: PropTypes.arrayOf(PropTypes.shape({
                // key
                key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
                // 标题
                title: PropTypes.string,
            })),
            // // 筛选类型  目前用到 单选或者多选
            // filterType: PropTypes.oneOf([
            //     FilterType.MutilSelectType,
            //     FilterType.RadioType
            // ]),
            // 选择结果 或 默认选中
            result: PropTypes.oneOfType([
                // 下拉刷新的情况
                PropTypes.number,
                // CheckBox
                PropTypes.bool,
                // 单选或多选
                PropTypes.arrayOf(PropTypes.number),
                // 日期
                PropTypes.shape({
                    // 开始时间 YYYY-MM-DD
                    start: PropTypes.string,
                    // 结束时间 YYYY-MM-DD
                    end: PropTypes.string
                }),
            ]),
        }),
        // 在用户点击确定的按钮的时候的回调
        onValueChanged: PropTypes.func,
        // 每个筛选的样式
        itemStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
        // 隐藏的时候的回调
        onDismiss: PropTypes.func,
        // 默认选中的
        defaultSelectedResult: PropTypes.object,
    }

    static defaultPropTypes = {
        onValueChanged: () => null,
        itemStyle: { paddingTop: 5, paddingBottom: 5 },
        onDismiss: () => null
    };

    constructor(props) {
        super(props);
        this.slideFilterStore = new GoodsSlideFilterStore(props.dataSource, this.props.defaultSelectedResult);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.dataSource !== nextProps.dataSource) {
            this.slideFilterStore.updateOriginalDataSource(nextProps.dataSource);
            this.slideFilterStore.cleanCache();
        }
    }

    /**
     * 显示侧滑菜单
     */
    show = () => {
        this.slideFilterStore.loadCache();
        this.popup.show();
    }

    dismiss = () => {
        this.popup.dismiss();
    }

    /**
     * 重置
     */
    reset = () => {
        this.slideFilterStore.reset();
    }

    /**
     * 确定
     */
    confirm = () => {
        // 确定筛选数据是否符合要求 不符合要求则进行提示
        let {canDismiss, message} = this.slideFilterStore.canPopupDismiss();
        if (!canDismiss) {
            Toast.show(message);
            return;
        }
        this.popup.dismiss(() => {
            let result = this.slideFilterStore.confirm();
            this.props.onValueChanged && this.props.onValueChanged(result);
        });
    };

    /**
     * 隐藏的时候的回调
     */
    onDismiss = () => {
        this.props.onDismiss && this.props.onDismiss();
        this.slideFilterStore.reset();
    }

    /**
     * 用户选这开始时间和结束 或 结束时间 发生了该表
     * @param item
     * @param startDate
     * @param endDate
     */
    onDateSelectDidChanged = (item, start, end) => {
        this.slideFilterStore.update(item, { start, end });
    }

    /**
     * 下拉选择发生了改变
     * @param item
     * @param index
     * @param value
     * @private
     */
    onDropDownMenuSelecteDidChanged = (item, index) => {
        this.slideFilterStore.update(item, index);
    }

    /**
     * 单选或多选的结果发生改变的时候的回调
     * @param item
     * @param resultItems
     */
    onSelectChanged = (item, resultItems) => {
        // let items = resultItems.map((innerItem) => innerItem.key);
        this.slideFilterStore.update(item, resultItems);
    }

    /**
     * CheckBox 选中的状态发生改变
     * 
     * @param item
     */
    onCheckBoxChanged = (item) => {
        let oldValue = item.result ? item.result : false;
        this.slideFilterStore.update(item, !oldValue);
    }


    /**
     * 渲染标题
     */
    renderTitle = (title) => {
        return (
            <View style={styles.itemTitleWrap}>
                <Text style={styles.itemTitleText}>{title}</Text>
            </View>
        );
    }

    /**
     * 渲染Item
     */
    renderItem = ({ item }) => {
        //  选择视图
        let content = null;
        // 样式
        let wrapStyle = {marginBottom: 7};

        // 多选或者单选的情况
        if(item.filterType === FilterType.MutilSelectType){
            {
                content = (
                    <Observer>
                        {
                            () =>
                                (
                                    <SlideFilterGridItem
                                        title={item.typeName}
                                        enableExpand={item.enableExpand}
                                        defaultExpandRow={1}
                                        keyExtractor={(item, index) => index.toString()}
                                        numberOFCol={3}
                                        enableMutil={item.filterType === FilterType.MutilSelectType}
                                        datas={item.datas?toJS(item.datas) : []}
                                        defaultSelectedItems={item.result ? toJS(item.result) : []}
                                        onSelectChanged={(resultItems) => {
                                            this.onSelectChanged(item, resultItems);
                                        }}
                                    />
                                )
                        }
                    </Observer>
                );
            }
        }

        // 价格区间
        if (item.filterType === FilterType.PriceType) {
            {
                content = (
                    <Observer>
                        {
                            () =>(
                                <SlideFilterPriceItem
                                    title={item.typeName}
                                    defaultSelectedItems={item.result ? toJS(item.result) : []}
                                    datas={item.datas?toJS(item.datas): []}
                                    onSelectChanged={(resultItems) => {
                                        this.onSelectChanged(item, resultItems);
                                    }}
                                />
                            )
                        }
                    </Observer>
                );
            }
        }

        return (
            <View style={[wrapStyle, this.props.itemStyle]}>
                {/*{this.renderTitle(item.typeName)}*/}
                {content}
            </View>
        );
    }

    /**
     * 渲染底部视图
     */
    renderFooter = () => {
        return (
            <View style={styles.footerWrap}>
                {/*重置按钮*/}
                <TouchableOpacity style={styles.footerBtn} onPress={this.reset}>
                    <View
                        style={styles.resetBtnGradient}
                    >
                        <Text style={styles.footerResetWrapText}>{'重置'}</Text>
                    </View>
                </TouchableOpacity>
                {/*确定按钮*/}
                <TouchableOpacity style={styles.footerBtn} onPress={this.confirm}>
                    <View
                        style={styles.confirmBtnGradient}
                    >
                        <Text style={styles.footerConfirmWrapText}>{'确定'}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    };

    render() {
        return (
            <Popup
                ref={(popup) => this.popup = popup}
                popupType={'3'}
                backgroundColor='#F8F8F8'
                width={300}
                onDismiss={this.onDismiss}
            >
                <View style={styles.containerWrap}>
                    <FlatList
                        keyExtractor={(item, index) => index.toString()}
                        style={styles.contentWrap}
                        data={this.slideFilterStore.showDataSource.slice()}
                        renderItem={this.renderItem}
                    />
                    {this.renderFooter()}
                </View>
            </Popup>
        );
    }
}

const styles = StyleSheet.create({

    containerWrap: {
        flex: 1,
        flexDirection: 'column',
    },

    contentWrap: {
        flexGrow: 1
    },

    footerWrap: {
        flexDirection: 'row',
        height: 44,
    },

    footerBtn: {
        width: 150,
        height: 44,
    },

    resetBtnGradient: {
        paddingRight: 0.5,
        left: 0,
        flex: 1,
        backgroundColor: colors.border,
        justifyContent: 'center'
    },

    confirmBtnGradient: {
        paddingLeft: 0.5,
        right: 0,
        flex: 1,
        backgroundColor: colors.activeBtn,
        justifyContent: 'center'
    },

    footerResetWrapText: {
        fontSize: fonts.font14,
        textAlign: 'center',
        backgroundColor: 'transparent',
        color: colors.greyFont,
    },

    footerConfirmWrapText: {
        fontSize: fonts.font14,
        textAlign: 'center',
        backgroundColor: 'transparent',
        color: colors.white,
    },

    itemTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 18,
    },

    itemTitleText: {
        fontSize: fonts.font14,
        color: '#9b9b9b',
    }
});