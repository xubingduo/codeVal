/**
 * author: tuhui
 * Date: 2018/7/10
 * Time: 20:07
 * des:
 */
import { createBottomTabNavigator } from 'react-navigation';
import React from 'react';
import TabItem from './TabItem';
import colors from '../../gsresource/ui/colors';
import I18n from 'gsresource/string/i18n';
import { DeviceEventEmitter, StatusBar } from 'react-native';
import IndexScreen from '../index/screen/IndexScreen';
import MineScreen from '../mine/screen/MineScreen';
import ShoppingCartScreen from '../shoppingCart/screen/ShoppingCartScreen';
import SortScreen from '../sort/screen/SortScreen';
import ColorOnlyNavigationHeader from '../../component/ColorOnlyNavigationHeader';
import NewestScreen from '../newest/screen/NewestScreen/NewestScreen';
import AuthService from 'svc/AuthService';
import UserActionSvc from '../../svc/UserActionSvc';

const MainTab = createBottomTabNavigator(
    {
        IndexScreen: {
            screen: IndexScreen
        },
        NewestScreen: {
            screen: NewestScreen
        },
        SortScreen: {
            screen: SortScreen
        },
        ShoppingCartScreen: {
            screen: ShoppingCartScreen
        },
        MineScreen: {
            screen: MineScreen
        }
    },
    {
        navigationOptions: ({ navigation }) => ({
            tabBarIcon: ({ focused, tintColor }) => {
                const { routeName } = navigation.state;

                let iconName;
                let checked = false;
                let image;
                let index = 0;

                if (routeName === 'IndexScreen') {
                    iconName = I18n.t('home');
                    checked = focused;
                    index = 0;
                    image = checked
                        ? require('gsresource/img/index.png')
                        : require('gsresource/img/indexDisable.png');
                } else if (routeName === 'NewestScreen') {
                    iconName = I18n.t('newest');
                    checked = focused;
                    index = 1;
                    image = checked
                        ? require('gsresource/img/sort.png')
                        : require('gsresource/img/sortDisable.png');
                } else if (routeName === 'SortScreen') {
                    iconName = I18n.t('class');
                    checked = focused;
                    index = 2;
                    image = checked
                        ? require('gsresource/img/sort1.png')
                        : require('gsresource/img/sort1Disable.png');
                } else if (routeName === 'ShoppingCartScreen') {
                    iconName = I18n.t('shoppingCart');
                    checked = focused;
                    index = 3;
                    image = checked
                        ? require('gsresource/img/shoppingCart.png')
                        : require('gsresource/img/shoppingCartDisable.png');
                } else if (routeName === 'MineScreen') {
                    iconName = I18n.t('mine');
                    checked = focused;
                    index = 4;
                    image = checked
                        ? require('gsresource/img/mine.png')
                        : require('gsresource/img/mineDisable.png');
                }

                return (
                    <TabItem
                        index={index}
                        checked={checked}
                        text={iconName}
                        image={image}
                    />
                );
            },
            tabBarOnPress: () => {
                if (!AuthService.isShopAuthed()) {
                    return;
                }
                const { routeName } = navigation.state;
                UserActionSvc.track(routeName);
                navigation.navigate(routeName);
            }
        }),
        tabBarOptions: {
            showLabel: false,
            style: {
                backgroundColor: colors.white
            }
        }
    }
);

MainTab.navigationOptions = ({ navigation }) => {
    let { routeName } = navigation.state.routes[navigation.state.index];

    if (routeName === 'IndexScreen') {
        return {
            header: (
                <StatusBar
                    translucent={true}
                    backgroundColor='transparent'
                    barStyle={'dark-content'}
                />
            )
        };
    } else if (routeName === 'SortScreen') {
        return {
            header: (
                <ColorOnlyNavigationHeader
                    statusBarStyle={'dark-content'}
                    backgroundColor={colors.white}
                />
            )
        };
    } else if (routeName === 'ShoppingCartScreen') {
        return {
            header: (
                <ColorOnlyNavigationHeader
                    statusBarStyle={'dark-content'}
                    backgroundColor={colors.white}
                />
            )
        };
    } else if (routeName === 'MineScreen') {
        DeviceEventEmitter.emit('mineScreenrefresh');
        return {
            header: (
                <StatusBar
                    translucent={true}
                    backgroundColor='transparent'
                    barStyle={'light-content'}
                />
            )
        };
    } else if (routeName === 'NewestScreen') {
        return {
            header: (
                <ColorOnlyNavigationHeader
                    statusBarStyle={'dark-content'}
                    backgroundColor={colors.white}
                />
            )
        };
    }
};

export default MainTab;
