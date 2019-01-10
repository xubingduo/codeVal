/**
 *@author xbu
 *@date 2018/10/16
 *@desc  门店优惠券的领取
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
import {DLFlatList} from '@ecool/react-native-ui';
import CouponItem, {CouponColorType, CouponType, ShowRightType} from './CouponItem';
import Alert from '../../../component/Alert';
import {Toast} from '@ecool/react-native-ui/index';
import CouponStore from '../store/CouponStore';
import rootStore from 'store/RootStore';


const WIDTH = Dimensions.get('window').width;
export default class PopCoupon extends Component {

    static propTypes = {
        // 优惠券数据
        data: PropTypes.array,
        // 关闭modal 可以执行的 回调函数
        onDismiss: PropTypes.func,
    };

    static defaultPropTypes = {
        onDismiss: () => null,
    };

    constructor(props) {
        super(props);
        this.store = new CouponStore();
    }


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

    /**
     * 渲染视图
     */

    renderHeader = () => {
        return (
            <View style={{height: 38, justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                <Text
                    style={{flex: 1, color: colors.normalFont, fontSize: fonts.font16, textAlign: 'center'}}
                >优惠券</Text>
                <TouchableOpacity
                    style={{marginRight: 18}}
                    hitSlop={{left: 16, right: 16, top: 16, bottom: 16}}
                    onPress={this.dismiss}
                >
                    <Image source={require('gsresource/img/close.png')} />
                </TouchableOpacity>
            </View>
        );
    };

    renderBody = () => {
        return (
            <FlatList
                keyExtractor={(item, index) => index.toString()}
                renderItem={this.renderCell}
                data={this.props.data}
            />
        );
    };

    renderCell = ({item}) => {
        let data = {
            id: item.id,
            shopId: item.shopId,
            color: item.color,
            userGetFlag: 3,
            execNum: item.execNum,
            fulfilValue: item.fulfilValue,
            shopName: item.shopName,
            endDateStr: item.expiresDateStr,
            beginDateStr: item.effectiveDateStr,
            dims: item.dims,
            cardType: item.cardType,
            execOther: item.execOther,
            couponId: item.couponId,
            unitId: item.unitId
        };


        return (
            <CouponItem
                couponType={CouponType.couponCenter}
                data={data}
                showType={ShowRightType.showBtn}
                showTitleIcon={true}
                onClickBtn={() => {
                    this.clickCouponBtn(data);
                }}
            />
        );
    };

    // 领取优惠券
    clickCouponBtn = async (data) => {
        let obj = {
            jsonParam: {
                coupons: [
                    {
                        couponId: data.id,
                        couponUnitId: data.unitId,
                        hashKey: new Date().getTime().toString(),
                        receiveChannelType: 2,
                        receiveFrom: data.shopId
                    }
                ]
            }
        };
        try {
            await this.store.getCoupon(obj).then(datas => {
                let {data} = datas;
                if (data && data.rows) {
                    let {resultCode,resultMsg} = data.rows[0];
                    if (resultCode===0){
                        Toast.show('领取成功');
                        rootStore.billingConfirmStore.queryAvailableCouponCount();
                    } else {
                        Toast.show(resultMsg);
                    }
                }
            });
        } catch (e) {
            Toast.show(e.message);
        }
    };

    getModalHeight() {
        let height = this.props.data.length * 130 + 40;
        if (height > 480) {
            height = 480;
        }
        if (height < 200) {
            height = 200;
        }
        return height;
    }


    render() {
        return (
            <Popup
                ref={popup => (this.popup = popup)}
                popupType={'1'}
                backgroundColor={colors.couponStoreBg}
                width={WIDTH}
                height={this.getModalHeight()}
                onDismiss={this.onDismiss}
                enableAnim={false}
            >
                <View style={styles.container}>
                    {this.renderHeader()}
                    {this.renderBody()}
                </View>

            </Popup>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
