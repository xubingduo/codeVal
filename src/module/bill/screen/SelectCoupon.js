/**
 * @Author: tt
 * @CreateDate:2018/10/16
 * @ModifyDate:2018/10/16
 * @desc 描述注释
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    Dimensions,
    View,
    Text, FlatList,
} from 'react-native';
import colors from '../../../gsresource/ui/colors';
import fonts from '../../../gsresource/ui/fonts';
import NavigationHeader from '../../../component/NavigationHeader';
import SelectCouponStore from '../store/SelectCouponStore';
import {observer, inject} from 'mobx-react';
import CouponItem, {CouponColorType, CouponType, ShowRightType} from '../../coupon/widget/CouponItem';
import Alert from '../../../component/Alert';
import Image from '../../../component/Image';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import TextButton from '../../../component/TextButton';

const {width, height} = Dimensions.get('window');
@observer
export default class SelectCoupon extends Component {

    static navigationOptions = ({navigation}) => {
        let params = navigation.state.params;
        let title = params && params.cardType === 3 ? '选择运费券' : '选择优惠券';
        return {
            header: (
                <NavigationHeader
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={title}
                    navigationRightItem={'不使用'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                    titleItemTextStyle={{color: colors.normalFont, fontSize: fonts.font18}}
                    itemTextStyle={{color: colors.normalFont}}
                    onRightClickHandler={() => {
                        navigation.state.params.unUseAny();
                    }}
                />
            ),
        };
    };

    getCardTypeTitle = ()=>{
        let params = this.props.navigation.state.params;
        return params && params.cardType === 3 ? '运费券' : '优惠券';
    }

    constructor(props) {
        super(props);
        this.store = new SelectCouponStore();
    }

    componentDidMount() {
        let isPlat = this.props.navigation.getParam('isPlat');
        let goods = this.props.navigation.getParam('goods');
        let coupons = this.props.navigation.getParam('selectedCoupon');
        let cardType = this.props.navigation.getParam('cardType');
        let platCouponParam = this.props.navigation.getParam('platCouponParam',{});

        if (coupons) {
            this.store.setSelectCoupons(coupons);
        }

        this.store.setCardType(cardType);
        this.store.setPlatCouponParam(platCouponParam);

        this.store.setGoods(goods);
        if (isPlat) {

            this.store.queryPlatCoupons()
                .then((data) => {

                }, (error) => {
                    Alert.alert(error.message);
                });
        } else {
            this.store.queryShopCoupons()
                .then((data) => {

                }, (error) => {
                    Alert.alert(error.message);
                });
        }

        this.props.navigation.setParams({
            unUseAny: this.unUseAny
        });
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {
                    (this.store.unavailableCoupons.length <= 0 &&
                        this.store.availableCoupons.length <= 0) ?
                        this.listEmptyView() :
                        <KeyboardAwareScrollView
                            style={{flex: 1}}
                            enableOnAndroid={true}
                        >
                            <FlatList
                                keyExtractor={(item, index) => index.toString()}
                                data={this.store.availableCouponsListShow}
                                renderItem={this.renderItem}
                            />


                            {
                                this.store.unavailableCouponsListShow.length > 0 &&

                                <View>
                                    <View style={{
                                        flexDirection: 'row',
                                        marginTop: 20,
                                        marginBottom: 10,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    >
                                        <View style={{
                                            width: 30,
                                            height: 1,
                                            backgroundColor: colors.divide,
                                            marginRight: 10
                                        }}
                                        />

                                        <Text style={{color: colors.normalFont}}>{'以下' + this.getCardTypeTitle() +'不适用'}</Text>

                                        <View style={{
                                            width: 30,
                                            height: 1,
                                            backgroundColor: colors.divide,
                                            marginLeft: 10
                                        }}
                                        />

                                    </View>

                                    <FlatList
                                        keyExtractor={(item, index) => index.toString()}
                                        data={this.store.unavailableCouponsListShow}
                                        renderItem={this.renderUnvailableItem}
                                    />
                                </View>
                            }


                        </KeyboardAwareScrollView>
                }

                {
                    this.store.hasCoupons && this.renderConfirm()
                }
            </SafeAreaView>
        );
    }

    renderConfirm = () => {
        return (
            <TextButton
                textWrapStyle={{
                    backgroundColor: colors.activeFont,
                    height: 50,
                    width: width,
                    justifyContent: 'center'
                }}
                textStyle={{color: colors.white}}
                text={'确定'}
                onPress={() => {
                    let callBack = this.props.navigation.getParam('resultCallBack');
                    callBack && callBack(this.store.getSelectedCoupon());
                    this.props.navigation.goBack();
                }}
            />
        );
    };


    //  当数据为空展示列表
    listEmptyView = () => {
        return (
            <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <Image source={require('gsresource/img/couponsNone.png')} />
                <Text style={{color: colors.greyFont, fontSize: fonts.font12, marginTop: 8}}>{'当前没有' + this.getCardTypeTitle()}</Text>
            </View>
        );
    };

    renderItem = ({item, index}) => {
        return (
            <CouponItem
                data={item}
                isChecked={item.checked}
                // showType={ShowRightType.showBtn}
                couponType={CouponType.myCoupon}
                showTitleIcon={true}
                onClickLookDetails={this.onItemClick}
            />
        );
    };

    renderUnvailableItem = ({item, index}) => {
        return (
            <CouponItem
                unAvlReason={item.unavlReason}
                color={colors.unEnable}
                data={item}
                couponType={CouponType.myCoupon}
                showTitleIcon={true}
            />
        );
    };

    onItemClick = (data) => {
        this.store.selectOne(data, (msg) => {
            if (msg) {
                Alert.alert(msg);
            }
        });
    };

    unUseAny = () => {
        this.store.selectOne(null);
        let callBack = this.props.navigation.getParam('resultCallBack');
        callBack && callBack();
        this.props.navigation.goBack();
    };
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.bg,
        flex: 1,
        justifyContent: 'center'
    }
});