/**
 * author: tuhui
 * Date: 2018/7/24
 * Time: 15:25
 * des:
 */

import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    TouchableWithoutFeedback,
    SafeAreaView,
    Dimensions
} from 'react-native';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import Image from 'component/Image';
import PropTypes from 'prop-types';
import DocSvc from 'svc/DocSvc';

const WIDTH = Dimensions.get('window').width;

export default class MsgCell extends Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        cellClick: PropTypes.func,
        customerServiceClick: PropTypes.func,
        showDetailButton: PropTypes.bool,
        detailButtonClick: PropTypes.func
    };

    render() {
        return this.props.showDetailButton ? (
            <TouchableWithoutFeedback>
                {this.renderContent()}
            </TouchableWithoutFeedback>
        ) : (
            <TouchableOpacity
                style={styles.container}
                onPress={this.onCellClick}
            >
                {this.renderContent()}
            </TouchableOpacity>
        );
    }

    renderContent = () => {
        let unread = this.props.item.unread === 1;
        let body = this.props.item.body;
        let docId = body.docId;
        let singleDocId = '';
        if (docId) {
            let arrayDocs = docId.split(',');
            if (arrayDocs.length > 0) {
                singleDocId = arrayDocs[0];
            }
        }
        return (
            <View style={styles.container}>
                {/* // 顶部标题 红点 时间 */}
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        height: 36,
                        alignItems: 'center',
                        paddingLeft: 14,
                        paddingRight: 14
                    }}
                >
                    <View
                        style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                        <View
                            style={{
                                width: WIDTH * 0.5,
                                flexDirection: 'row',
                                alignItems: 'center'
                            }}
                        >
                            <Text
                                style={{
                                    fontSize: fonts.font14,
                                    color: colors.normalFont
                                }}
                                numberOfLines={1}
                            >
                                {body.title}
                            </Text>
                            {unread && (
                                <View
                                    style={{
                                        width: 6,
                                        height: 6,
                                        marginLeft: 3,
                                        backgroundColor: colors.activeFont,
                                        borderRadius: 5
                                    }}
                                />
                            )}
                        </View>
                    </View>

                    <Text
                        style={{
                            fontSize: fonts.font14,
                            color: colors.greyFont
                        }}
                    >
                        {this.props.item.time}
                    </Text>
                </View>
                {/* // 下方详细内容 */}
                <View
                    style={{
                        flexDirection: 'row',
                        width: '100%',
                        marginLeft: 16
                    }}
                >
                    <Image
                        style={{
                            width: 70,
                            height: 70,
                            borderRadius: 2
                        }}
                        source={{ uri: DocSvc.docURLS(singleDocId) }}
                        defaultSource={require('gsresource/img/dressDefaultPic110.png')}
                        resizeMode='cover'
                    />

                    <View
                        style={{
                            marginLeft: 8,
                            flex: 1,
                            marginRight: 30
                        }}
                    >
                        <Text
                            style={{
                                color: colors.normalFont,
                                fontSize: fonts.font12
                            }}
                            numberOfLines={2}
                        >
                            {body.text}
                        </Text>
                        {this.renderExtraText(body)}
                    </View>
                </View>
                {/* //底部立即查看按钮 */}
                {this.props.showDetailButton && (
                    <TouchableOpacity
                        style={styles.detailButton}
                        onPress={this.props.detailButtonClick}
                    >
                        <Text style={styles.detailText}>立即查看</Text>
                    </TouchableOpacity>
                )}

                {this.props.item.tagOne === '100' && (
                    <TouchableOpacity
                        onPress={this.onCustomerServiceClick}
                        style={{
                            borderRadius: 4,
                            borderColor: '#ff6699',
                            position: 'absolute',
                            borderWidth: 1,
                            width: 72,
                            height: 25,
                            bottom: 10,
                            right: 10,
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}
                    >
                        <Text
                            style={{
                                fontSize: fonts.font12,
                                color: '#ff6699'
                            }}
                        >
                            平台申诉
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    renderExtraText = body => {
        if (this.props.item.tagOne === '90') {
            /**来自卖家订单已发货*/
            return (
                <View
                    style={{
                        marginTop: 5,
                        width: '100%',
                        flex: 1
                    }}
                >
                    <Text
                        style={{
                            color: colors.greyFont,
                            fontSize: fonts.font12
                        }}
                    >
                        {`订单编号: ${body.billNo}`}
                    </Text>
                    <Text
                        style={{
                            color: colors.greyFont,
                            fontSize: fonts.font12,
                            marginTop: 5
                        }}
                    >
                        {`运单号: ${body.expressNo}`}
                    </Text>
                </View>
            );
        } else if (this.props.item.tagOne === '94') {
            /**来自卖家修改金额*/
            return (
                <View
                    style={{
                        marginTop: 20,
                        width: '100%'
                    }}
                >
                    <Text
                        style={{
                            color: colors.greyFont,
                            fontSize: fonts.font12
                        }}
                    >
                        {`订单号: ${body.billNo}`}
                    </Text>
                </View>
            );
        } else if (
            this.props.item.tagOne === '91' ||
            this.props.item.tagOne === '99' ||
            this.props.item.tagOne === '100'
        ) {
            /**来自卖家不同意退款，同意退款并发货，退款成功*/
            return (
                <View
                    style={{
                        marginTop: 10,
                        width: '100%'
                    }}
                >
                    <Text
                        style={{
                            color: colors.greyFont,
                            fontSize: fonts.font12
                        }}
                    >
                        {`退款单号: ${body.returnBillId}`}
                    </Text>
                </View>
            );
        }
    };

    onCellClick = () => {
        this.props.cellClick(this.props.item);
    };
    onCustomerServiceClick = () => {
        this.props.customerServiceClick(this.props.item);
    };
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 4,
        backgroundColor: colors.white,
        paddingBottom: 10
    },
    detailButton: {
        marginTop: 23,
        marginHorizontal: 15,
        height: 31,
        borderColor: colors.title,
        borderWidth: 1,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },
    detailText: {
        color: colors.title,
        fontSize: fonts.font12
    }
});
