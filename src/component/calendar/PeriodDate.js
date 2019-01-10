/**
 * author: tuhui
 * Date: 2017/12/1
 * Time: 下午1:49
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    View,
    Text
} from 'react-native';
import {Toast} from '@ecool/react-native-ui';

import {Calendar} from 'react-native-calendars';
import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import moment from 'moment';
import I18n from 'gsresource/string/i18n';
import DateUtl from '../../utl/DateUtl';
import StringUtl from '../../utl/StringUtl';
import fonts from '../../gsresource/ui/fonts';

export default class PeriodDate extends Component {

    static propTypes = {
        style: PropTypes.any,
        onConfirmMoment: PropTypes.func,
        onConfirm: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            startDate: '',
            endDate: '',
            selectStart: true,
            marketDate: {}
        };
        this.onDayPress = this.onDayPress.bind(this);
    }

    render() {
        return (
            <View style={[styles.container, this.props.style]}>

                <Calendar
                    maxDate={moment().format('YYYY-MM-DD')}
                    markingType={'period'}
                    onDayPress={this.onDayPress}
                    style={styles.calendar}
                    hideExtraDays
                    markedDates={this.state.marketDate}
                />
                <View>
                    <View style={{height: 0.5, backgroundColor: colors.divide}} />
                    <View style={{flexDirection: 'row',}}>
                        <TouchableOpacity style={[styles.btn_bottom]} onPress={this.onCancel}>
                            <Text style={{
                                fontSize: fonts.font16,
                                color: colors.white,
                            }}
                            >
                                {I18n.t('cancel')}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn_bottom, {backgroundColor: colors.white}]}
                            onPress={this.onConfirm}
                        >
                            <Text style={{
                                fontSize: fonts.font16,
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


    computedSelectDate() {

        let markDate = {};

        let dateDiffArr = DateUtl.dateDiff(this.state.startDate, this.state.endDate);

        for (let i = 0; i < dateDiffArr.length; i++) {

            let item = dateDiffArr[i].toString();

            let a = {[item]: {selected: true, marked: true, color: colors.redBtn}};

            Object.assign(markDate, a);
        }

        let realMarketDate = Object.assign({
            [this.state.startDate]: {selected: true, startingDay: true, color: colors.redBtn},
            [this.state.endDate]: {selected: true, endingDay: true, color: colors.redBtn},
        }, markDate);


        this.setState({
            marketDate: realMarketDate,
        });
    }


    onDayPress(day) {
        let dayStr = day.dateString;
        this.checkDateSort(dayStr);

        this.timeoutId = setTimeout(() => {
            this.computedSelectDate();
        }, 200);
    }

    componentWillUnmount() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    checkDateSort(dayStr) {
        if (this.state.startDate.length === 0) {
            //开始时间没有  直接赋值给开始时间
            this.setState({
                startDate: dayStr,
                endDate: ''
            });

            //如果结束时间有  并且小于开始时间  把结束时间去掉
            if (this.state.endDate.length !== 0) {
                if (DateUtl.comparerDate(this.state.startDate, this.state.endDate)) {
                    this.setState({
                        endDate: '',
                    });
                }
            }
        } else {

            //开始时间有 但是时间一样  就消除开始时间
            if (dayStr === this.state.startDate) {
                this.setState({
                    startDate: '',
                });
                return;
            }

            //开始时间有  结束时间没有
            if (this.state.endDate.length === 0) {
                if (DateUtl.comparerDate(this.state.startDate, dayStr)) {
                    //开始时间  大于结束时间  互换
                    let temp = this.state.startDate;
                    this.setState({
                        startDate: dayStr,
                        endDate: temp,
                    });
                } else {
                    //开始时间 小于或等于结束时间 直接赋值给结束时间
                    this.setState({
                        endDate: dayStr,
                    });
                }
            } else {
                //结束时间有  但是两次一样的 消除结束时间
                if (this.state.endDate === dayStr) {
                    this.setState({
                        endDate: '',
                    });
                    return;
                }

                //结束时间已经有了
                if (DateUtl.comparerDate(this.state.startDate, dayStr)) {
                    this.setState({
                        startDate: dayStr,
                    });
                } else if (DateUtl.comparerDate(dayStr, this.state.endDate)) {
                    this.setState({
                        endDate: dayStr,
                    });
                } else {
                    this.setState({
                        endDate: dayStr,
                    });
                }
            }
        }
    }

    onCancel = () => {
        this.props.onCancel();
    };

    onConfirm = () => {
        if (StringUtl.isNull(this.state.startDate)) {
            Toast.show(I18n.t('pleaseSelectStartDate'), 2);
            return;
        }

        if (StringUtl.isNull(this.state.endDate)) {
            Toast.show(I18n.t('pleaseSelectFinishDate'), 2);
            return;
        }

        if (this.props.onConfirmMoment) {
            this.props.onConfirmMoment(moment(this.state.startDate).startOf('days'), moment(this.state.endDate).endOf('days'));
        }

        if (this.props.onConfirm) {
            this.props.onConfirm(this.state.startDate + ' ' + I18n.t('to') + ' ' + this.state.endDate, this.state.startDate, this.state.endDate);
        }
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