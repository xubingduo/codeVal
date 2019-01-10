/**
 * author: tuhui
 * Date: 2017/12/1
 * Time: 下午1:48
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {LocaleConfig} from 'react-native-calendars';
import colors from '/gsresource/ui/colors';
import {Toast} from '@ecool/react-native-ui';
import StringUtl from '../../utl/DateUtl';


LocaleConfig.locales['zh'] = {
    monthNames: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    monthNamesShort: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
    dayNames: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
    dayNamesShort: ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
};

LocaleConfig.defaultLocale = 'zh';
import PropTypes from 'prop-types';
import moment from 'moment/moment';
import I18n from 'gsresource/string/i18n';

export default class SingleDate extends Component {

    static propTypes = {
        onConfirmMoment: PropTypes.func,
        onConfirm: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {};
        this.onDayPress = this.onDayPress.bind(this);
    }

    render() {
        return (
            <View style={styles.container}>

                <Calendar
                    maxDate={moment().format('YYYY-MM-DD')}
                    onDayPress={this.onDayPress}
                    style={styles.calendar}
                    hideExtraDays
                    markedDates={{[this.state.selected]: {selected: true}}}
                />
                <View>
                    <View style={{height: 0.5, backgroundColor: colors.divide}} />


                    <View style={{flexDirection: 'row',}}>

                        <TouchableOpacity style={[styles.btn_bottom]} onPress={this.onCancel}>
                            <Text style={{
                                fontSize: 16,
                                color: colors.white,
                            }}
                            >
                                {I18n.t('cancel')}
                            </Text>

                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.btn_bottom, {backgroundColor: colors.white}]}
                            onPress={this.onConfirm}
                        >
                            <Text style={{
                                fontSize: 16,
                                color: colors.redBtn,
                            }}
                            >
                                {I18n.t('confirm')}
                            </Text>
                        </TouchableOpacity>
                    </View>


                </View>
            </View>
        );
    }

    onDayPress(day) {
        this.setState({
            selected: day.dateString
        });
    }

    onCancel = () => {
        this.props.onCancel();
    };

    onConfirm = () => {

        if (!this.state.selected) {
            Toast.show(I18n.t('selectDateTips'));
            return;
        }

        this.props.onConfirmMoment && this.props.onConfirmMoment(moment(this.state.selected).startOf('days'), moment(this.state.selected).endOf('days'));
        this.props.onConfirm(this.state.selected + ' ' + StringUtl.getWeekFromDate(this.state.selected), this.state.selected, this.state.selected);
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
        justifyContent: 'space-between'
    },
    btn_bottom: {
        height: 50,
        backgroundColor: colors.unEnable,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendar: {
        // height: 100
    }
});