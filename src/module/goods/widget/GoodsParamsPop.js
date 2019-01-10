/**
 *@author xbu
 *@date 2018/10/16
 *@desc  商品参数
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    TouchableOpacity,
    Image,
    FlatList
} from 'react-native';

import {Popup} from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import PropTypes from 'prop-types';



const WIDTH = Dimensions.get('window').width;
export default class GoodsParamsPop extends Component {
    static propTypes = {
        // 优惠券数据
        data: PropTypes.object,
        // 关闭modal 可以执行的 回调函数
        onDismiss: PropTypes.func,
        date: PropTypes.string,
        code: PropTypes.string
    };

    static defaultPropTypes = {
        data: {},
        date: '',
        code: '',
        onDismiss: () => null,
    };


    /**
     * 显示侧滑菜单
     */
    show = () => {
        this.popup.show();
    };

    dismiss = () => {
        this.popup.dismiss();
    };

    /**
     * 确定
     */
    confirm = () => {
        this.popup.dismiss(() => {

        });
    };

    /**
     * 隐藏的时候的回调
     */
    onDismiss = () => {
        this.props.onDismiss && this.props.onDismiss();
    };


    renderCell = () => {
        let data = this.props.data;
        console.log(data);

        return (
            <View>
                {
                    data.fabric ? (
                        <View style={styles.goodsBox}>
                            <Text style={styles.goodsTitle}>材质</Text>
                            <Text style={styles.goodsFonts} numberOfLines={1}>{data.fabric}{' '}</Text>
                        </View>
                    ) : null
                }
                {
                    data.brandId ? (
                        <View style={styles.goodsBox}>
                            <Text style={styles.goodsTitle}>品牌</Text>
                            <Text style={styles.goodsFonts} numberOfLines={1}>{data.brandId}{' '}</Text>
                        </View>
                    ) : null
                }
                {
                    data.season ? (
                        <View style={styles.goodsBox}>
                            <Text style={styles.goodsTitle}>季节</Text>
                            <Text style={styles.goodsFonts} numberOfLines={1}>{data.season}{' '}</Text>
                        </View>
                    ) : null
                }
                {/*{*/}
                {/*this.props.date ? (*/}
                {/*<View style={styles.goodsBox}>*/}
                {/*<Text style={styles.goodsTitle}>上架时间</Text>*/}
                {/*<Text style={styles.goodsFonts} numberOfLines={1}>{moment(this.props.date).format('YYYY-MM-DD')}{' '}</Text>*/}
                {/*</View>*/}
                {/*) : null*/}
                {/*}*/}
                {
                    data.classId ? (
                        <View style={styles.goodsBox}>
                            <Text style={styles.goodsTitle}>类别</Text>
                            <Text style={styles.goodsFonts} numberOfLines={1}>{data.classId}{' '}</Text>
                        </View>
                    ) : null
                }
                {
                    this.props.code ? (
                        <View style={styles.goodsBox}>
                            <Text style={styles.goodsTitle}>款号</Text>
                            <Text style={styles.goodsFonts} numberOfLines={1}>{this.props.code}{' '}</Text>
                        </View>
                    ) : null
                }

                {
                    data.theme ? (
                        <View style={styles.goodsBox}>
                            <Text style={styles.goodsTitle}>风格</Text>
                            <Text style={styles.goodsFonts} numberOfLines={1}>{data.theme}{' '}</Text>
                        </View>
                    ) : null
                }

            </View>
        );
    };

    /**
     * 渲染底部视图
     */
    renderFooter = () => {
        return (
            <TouchableOpacity style={styles.footerBtn} onPress={this.confirm}>
                <Text style={{color: colors.white,fontSize: fonts.font14}}>确定</Text>
            </TouchableOpacity>
        );
    };


    renderBody = () => {
        return (
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderCell}
                data={[{data: 1}]}
            />
        );
    };



    render() {
        return (
            <Popup
                ref={(popup) => this.popup = popup}
                popupType={'1'}
                backgroundColor={'#fff'}
                width={WIDTH}
                height={380}
                onDismiss={this.onDismiss}
            >
                <View style={styles.container}>
                    {this.renderBody()}
                    {this.renderFooter()}
                </View>

            </Popup>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    goodsBox: {
        minHeight: 50,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
        marginLeft: 15,
    },

    goodsTitle: {
        fontSize: 14,
        color: colors.greyFont,
        width: 80,
    },

    goodsFonts: {
        fontSize: 14,
        color: colors.normalFont,
        fontWeight: '600',
        width: (WIDTH -110),
    },

    footerBtn: {
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:  colors.activeBtn,
        borderRadius: 2,
    },

});
