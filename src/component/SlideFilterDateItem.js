/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-06 08:59:23
 * @modify date 2017-12-06 08:59:23
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableWithoutFeedback,
} from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';
import momentLocale from 'moment/locale/zh-cn';
import { GridView } from '@ecool/react-native-ui';
import { DatePicker } from 'antd-mobile';
import fonts from '../gsresource/ui/fonts';

// 更新 monent 的语言
moment.updateLocale('zh-cn', momentLocale);

// 获取Items
const DATE_TITLES = ['今天', '昨天', '近7天', '近30天'];
// 宽度
const CONTAINER_WIDTH = 275;

export default class SlideFilterDateItem extends Component {

    static propTypes = {
        // 日期开始
        dateStart: PropTypes.string,
        // 日期结束
        dateEnd: PropTypes.string,
        // 在用户选择发生改变的时候的回调
        onDateSelectChanged: PropTypes.func,
        // 是否显示快捷选择时间
        showExt: PropTypes.bool,
    };

    dealDate = (item) => {
        let itemStart = null;
        let itemEnd = null;
        if (item == DATE_TITLES[0]) {
            // 今天
            itemStart = moment().format('YYYY-MM-DD');
            itemEnd = moment().format('YYYY-MM-DD');
        } else if (item == DATE_TITLES[1]) {
            // 昨天
            itemStart = moment().subtract(1, 'days').format('YYYY-MM-DD');
            itemEnd = moment().subtract(1, 'days').format('YYYY-MM-DD');
        } else if (item == DATE_TITLES[2]) {
            // 近7天
            itemStart = moment().subtract(7, 'days').format('YYYY-MM-DD');
            itemEnd = moment().format('YYYY-MM-DD');
        } else if (item == DATE_TITLES[3]) {
            // 近7天
            itemStart = moment().subtract(30, 'days').format('YYYY-MM-DD');
            itemEnd = moment().format('YYYY-MM-DD');
        }
        return { itemStart: itemStart, itemEnd: itemEnd };
    }

    onDateSelectChanged = (item) => {
        const { itemStart, itemEnd } = this.dealDate(item);
        const { onDateSelectChanged } = this.props;
        if (onDateSelectChanged) {
            onDateSelectChanged({ start: itemStart, end: itemEnd });
        }
    }

    onStartDateChanged = (date) => {
        const { onDateSelectChanged } = this.props;
        if (onDateSelectChanged) {
            onDateSelectChanged({
                start: moment(date).format('YYYY-MM-DD'),
                end: this.props.dateEnd
            });
        }
    }

    onEndDateChanged = (date) => {
        const { onDateSelectChanged } = this.props;
        if (onDateSelectChanged) {
            onDateSelectChanged({
                start: this.props.dateStart,
                end: moment(date).format('YYYY-MM-DD')
            });
        }
    }

    renderItem = (item) => {
        // 计算出当前Item的开始时间和结束时间
        const { itemStart, itemEnd } = this.dealDate(item);
        const { dateStart, dateEnd } = this.props;
        // 计算当前的Item是否需要标题为选中
        let isSelected = false;
        if (itemStart == dateStart && itemEnd == dateEnd) {
            isSelected = true;
        }
        return (
            <TouchableWithoutFeedback
                disable={isSelected}
                onPress={() => {
                    !isSelected && this.onDateSelectChanged(item);
                }}
            >
                <View style={isSelected ? styles.itemSelectedWrap : styles.itemNormalWrap}>
                    <Text style={isSelected ? styles.itemTextSelected : styles.itemTextNormal}>{item}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    render() {
        // 获取当前用户选择的日期
        const { dateStart, dateEnd, showExt } = this.props;
        // 获取开始和结束时间
        let start = moment(dateStart, 'YYYY-MM-DD').format('MM-DD');
        let end = moment(dateEnd, 'YYYY-MM-DD').format('MM-DD');
        return (
            <View>
                {
                    showExt && (
                        <GridView
                            itemEnable={false}
                            numberOFCol={3}
                            itemMarging={8}
                            items={DATE_TITLES}
                            renderItem={this.renderItem}
                            containerWidth={CONTAINER_WIDTH}
                            customItemStyle={{ height: 36 }}
                        />
                    )
                }

                <View style={styles.dateRangeWrap}>
                    <DatePicker
                        mode={'date'}
                        value={dateStart ? new Date(dateStart) : new Date()}
                        onOk={this.onStartDateChanged}
                        minDate={new Date(1970, 1, 1)}
                    >
                        <DateItem>{dateStart ? start : ''}</DateItem>
                    </DatePicker>
                    <Text style={styles.dateRangeText}>{'至'}</Text>
                    <DatePicker
                        mode={'date'}
                        value={dateEnd ? new Date(dateEnd) : new Date()}
                        onOk={this.onEndDateChanged}
                        minDate={new Date(1970, 1, 1)}
                    >
                        <DateItem>{dateEnd ? end : ''}</DateItem>
                    </DatePicker>
                </View>
            </View>
        );
    }
}


const DateItem = ({ onClick, children }) => {
    return (
        <TouchableWithoutFeedback
            onPress={onClick}
        >
            <View style={styles.dateRangeItem}>
                <Text style={styles.dateRangeItemText}>{children}</Text>
            </View>
        </TouchableWithoutFeedback>
    );
};

DateItem.propTypes = {
    onClick: PropTypes.func,
    children: PropTypes.string,
};

const styles = StyleSheet.create({
    itemNormalWrap: {
        flex: 1,
        width: 78,
        backgroundColor: '#eeeeee',
        justifyContent: 'center',
        borderRadius: 18,
    },

    itemSelectedWrap: {
        flex: 1,
        width: 78,
        backgroundColor: 'transparent',
        justifyContent: 'center',
        borderRadius: 18,
        borderColor: '#ff3b30',
        borderWidth: 1
    },

    itemTextNormal: {
        fontSize: fonts.font14,
        color: '#3d4245',
        textAlign: 'center',
    },

    itemTextSelected: {
        fontSize: fonts.font14,
        color: '#ff3b30',
        textAlign: 'center',
    },

    dateRangeWrap: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: '#eeeeee',
        height: 36,
        marginBottom: 20,
        marginLeft: 9,
        marginRight: 9,
        alignItems: 'center'
    },

    dateRangeItem: {
        width: 106,
        height: 26,
        backgroundColor: '#fff',
        marginLeft: 7,
        marginRight: 7,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },

    dateRangeItemText: {
        marginLeft: 10,
        fontSize: fonts.font14,
        color: '#3d4245',
        // alignSelf: 'center'
    },

    dateRangeText: {
        fontSize: fonts.font11,
        color: '#999999'
    }

});