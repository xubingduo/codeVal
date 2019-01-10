/**
 *@author xbu
 *@date 2018/07/27
 *@desc 我的路由
 *
 */


import MineScreen from './screen/MineScreen';
import AddressListManagerScreen from './screen/addressManager/AddressListManagerScreen';
import EditAddressScreen from './screen/addressManager/EditAddressScreen';
import SettingScreen from './screen/setting/SettingScreen';
import AboutUsScreen from './screen/setting/AboutUsScreen';
import AccountInfoScreen from './screen/setting/AccountInfoScreen';
import ChangePhoneScreen from './screen/setting/ChangePhoneScreen';
import MedalScreen from './screen/MedalScreen';
import FocusShopScreen from './screen/FocusShopScreen';
import mineFavorGoodsScreen from './screen/mineFavorGoods/mineFavorGoodsScreen';
import GoodsListScreen from '../goods/screen/GoodsListScreen';
import DevScreen from './screen/setting/DevScreen';
import ShopOfTakenGoodsScreen from './screen/ShopOfTakenGoodsScreen';
import MySharedGoodsScreen from './screen/MySharedGoodsScreen';

export default {
    MineScreen: {
        screen: MineScreen,
    },
    AddressListManagerScreen: {
        screen: AddressListManagerScreen
    },
    EditAddressScreen: {
        screen: EditAddressScreen
    },
    SettingScreen: {
        screen: SettingScreen
    },
    AboutUsScreen: {
        screen: AboutUsScreen
    },
    AccountInfoScreen: {
        screen: AccountInfoScreen
    },
    ChangePhoneScreen: {
        screen: ChangePhoneScreen
    },
    MedalScreen: {
        screen: MedalScreen
    },
    FocusShopScreen: {
        screen: FocusShopScreen
    },
    mineFavorGoodsScreen: {
        screen: mineFavorGoodsScreen
    },
    GoodsListScreen: {
        screen: GoodsListScreen
    },
    DevScreen: {
        screen: DevScreen
    },
    ShopOfTakenGoodsScreen: {
        screen: ShopOfTakenGoodsScreen
    },
    MySharedGoodsScreen: {
        screen: MySharedGoodsScreen
    }
};