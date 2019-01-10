/**
 * author: tuhui
 * Date: 2017/12/1
 * Time: 下午1:49
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    TouchableOpacity,
    Image,
    Text,
    FlatList,
    View
} from 'react-native';

import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import DateUtl from '../../utl/DateUtl';
import moment from 'moment/moment';
import I18n from 'gsresource/string/i18n';
import {Toast} from '@ecool/react-native-ui';

export default class MonthDate extends Component {

    static propTypes = {
        onConfirmMoment: PropTypes.func,
        onConfirm: PropTypes.func.isRequired,
        onCancel: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            year: new Date().getFullYear(),
            months: this.getMonthList(),
        };
    }

    substractMonth() {
        this.setState({
            year: this.state.year - 1,
        });
    }

    addMonth() {
        this.setState({
            year: this.state.year + 1,
        });
    }

    render() {
        return (
            <View style={styles.container}>

                <View style={{height: 360, backgroundColor: colors.white}}>
                    <View style={styles.header}>
                        <TouchableOpacity
                            onPress={this.substractMonth.bind(this)}
                            style={styles.arrow}
                        >
                            <Image
                                source={require('gsresource/img/previous.png')}
                                style={styles.arrowImage}
                            />
                        </TouchableOpacity>
                        <View style={{flexDirection: 'row'}}>
                            <Text style={styles.monthText}>
                                {this.state.year}{I18n.t('year')}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={this.addMonth.bind(this)} style={styles.arrow}>
                            <Image
                                source={require('gsresource/img/next.png')}
                                style={styles.arrowImage}
                            />
                        </TouchableOpacity>
                    </View>


                    <FlatList
                        extraData={this.state}
                        data={this.state.months}
                        keyExtractor={(item, index) => index.toString()}
                        ItemSeparatorComponent={this.renderSeparator}
                        renderItem={this.renderMonth.bind(this)}
                    />

                </View>


                <View>
                    <View style={{height: 0.5, backgroundColor: colors.divide}} />
                    <View style={{flexDirection: 'row'}}>
                        <TouchableOpacity onPress={this.onCancel.bind(this)} style={[styles.btn_bottom]}>
                            <Text style={{
                                fontSize: 16,
                                color: colors.white,
                            }}
                            >
                                {I18n.t('cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={this.onConfirm.bind(this)}
                            style={[styles.btn_bottom, {backgroundColor: colors.white}]}
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

    onCancel() {
        this.props.onCancel();
    }

    onConfirm() {

        if (!this.getSelectMonth()) {
            Toast.show(I18n.t('selectDateTips'));
            return;
        }


        this.props.onConfirm(moment(this.state.year + '-' + this.getSelectMonth(), 'YYYY-MM').format('YYYY-MM'),
            moment(this.state.year + '-' + this.getSelectMonth(), 'YYYY-MM').format('YYYY-MM-DD'),
            DateUtl.getMonthLastDay(this.state.year, this.getSelectMonth())
        );


        this.props.onConfirmMoment && this.props.onConfirmMoment(moment(this.state.year + '-' + this.getSelectMonth(), 'YYYY-MM').format('YYYY-MM-DD')
            , moment(this.state.year + '-' + this.getSelectMonth(), 'YYYY-MM').endOf('month'));
    }

    getSelectMonth() {
        for (let i = 0; i < this.state.months.length; i++) {
            if (this.state.months[i].select) {
                return this.state.months[i].month;
            }
        }
    }

    renderSeparator = () => {
        return <View style={{height: 0.5, backgroundColor: colors.divide}} />;
    };

    renderMonth = ({item, index}) => (
        <TouchableOpacity
            onPress={() => {
                for (let i = 0; i < this.state.months.length; i++) {
                    if (i == index) {
                        this.state.months[i].select = true;
                    } else {
                        this.state.months[i].select = false;
                    }
                }

                this.setState({
                    months: this.state.months,
                });

            }}
        >
            <View style={[styles.monthItem, {
                borderBottomColor: item.select === true ? colors.title : colors.transparent,
                borderBottomWidth: 1
            }]}
            >

                <Text style={{
                    fontSize: 16,
                    color: item.select === true ? colors.title : colors.normalFont,
                    textAlign: 'center'
                }}
                >{`${item.month}月`}</Text>

            </View>
        </TouchableOpacity>
    );

    getMonthList() {
        let month = new Array();
        for (var i = 1; i < 13; i++) {
            month.push({key: i, month: i, select: false});
        }

        return month;
    }
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        justifyContent: 'space-between',
        backgroundColor: colors.bg
    },
    arrow: {
        padding: 10
    },
    monthText: {
        fontSize: 14,
        fontWeight: '300',
        color: '#2d4150',
        margin: 10
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    arrowImage: {},
    monthItem: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    btn_bottom: {
        height: 50,
        backgroundColor: colors.unEnable,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});