/**
 * author: wwj
 * Date: 2018/9/3
 * Time: 上午10:24
 * des:
 */
import React, {Component} from 'react';
import {View} from 'react-native';
import ConsultToSellerStore from '../../store/shopIndex/ConsultToSellerStore';
import Alert from '../../../../component/Alert';
import {Toast} from '@ecool/react-native-ui';
import colors from '../../../../gsresource/ui/colors';
import NavigationHeader from '../../../../component/NavigationHeader';

/**
 *            mobile: number = 手机号
 *          sellerId: number = 咨询的卖家租户id
 *          shopName: string = 卖家店铺名称
 *      sellerUnitId: number = 咨询的卖家单元id
 */
export default class ConsultToSellerScreen extends Component {

    static navigationOptions = ({ navigation }) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{ color: colors.normalFont }}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={navigation.state.params.shopName}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            )
        };
    };

    constructor(props){
        super(props);
        this.store = new ConsultToSellerStore();
        this.mobile = this.props.navigation.state.params.mobile;
        this.sellerId = this.props.navigation.state.params.sellerId;
        this.sellerUnitId = this.props.navigation.state.params.sellerUnitId;
    }

    componentDidMount(){
        Toast.loading();
        this.store.consultToSeller(this.mobile, this.sellerId, this.sellerUnitId, (ret, ext) => {
            let msg = '消息已发送，等待卖家联系您';
            if (ext) {
                msg = ext;
            }
            Toast.dismiss();
            Alert.alert(msg);
        });
    }

    render() {
        return (
            <View />
        );
    }
}