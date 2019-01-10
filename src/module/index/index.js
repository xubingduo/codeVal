/**
 * author: tuhui
 * Date: 2018/7/23
 * Time: 10:48
 * des:
 */

import React from 'react';
import SearchHistoryScreen from 'module/index/screen/search/SearchHistoryScreen';
import SearchGoodsListScreen from 'module/index/screen/search/SearchGoodsListScreen';
import SearchShopListScreen from 'module/index/screen/search/SearchShopListScreen';
import MsgScreen from 'module/index/screen/msg/MsgScreen';
import ShopIndexScreen from 'module/index/screen/shopIndex/ShopIndexScreen'; // 推荐门店-店铺首页
import ShopGoodsCategoryScreen from 'module/index/screen/shopIndex/ShopGoodsCategoryScreen';
import FreeShippingScreen from './screen/FreeShippingScreen';
import NewestScreen from 'module/newest/screen/NewestScreen/NewestScreen';
import ConsultationScreen from 'module/index/screen/ConsultationScreen';
import ShopListScreen from 'module/index/screen/ShopListScreen';
import OrderDetailsScreen from 'module/order/screen/OrderDetailsScreen';
import ConsultToSellerScreen from 'module/index/screen/shopIndex/ConsultToSellerScreen';
import ShopDetailScreen from 'module/index/screen/shopIndex/ShopDetailScreen';
import SearchFeedBackScreen from 'module/index/screen/search/SearchFeedBackScreen';
import ShopMedalIntroductionScreen from 'module/index/screen/shopIndex/ShopMedalIntroductionScreen';
import InviteOpenShopScreen from 'module/index/screen/shopIndex/InviteOpenShopScreen';
import ActivityNotifyScreen from 'module/index/screen/msg/ActivityNotifyScreen';
import TodayNewArrivalScreen from 'module/index/screen/TodayNewArrivalScreen';

export default {
    SearchHistoryScreen: {
        screen: SearchHistoryScreen
    },
    SearchGoodsListScreen: {
        screen: SearchGoodsListScreen
    },
    SearchShopListScreen: {
        screen: SearchShopListScreen
    },
    MsgScreen: {
        screen: MsgScreen
    },
    ShopIndexScreen: {
        screen: ShopIndexScreen,
        path: 'ShopIndex/:shopId',
    },
    ShopGoodsCategoryScreen: {
        screen: ShopGoodsCategoryScreen
    },
    FreeShippingScreen: {
        screen: FreeShippingScreen
    },
    HomePageNewestScreen: {
        screen: NewestScreen
    },
    ConsultationScreen: {
        screen: ConsultationScreen
    },
    ShopListScreen: {
        screen: ShopListScreen
    },
    OrderDetailsScreen: {
        screen: OrderDetailsScreen
    },
    ConsultToSellerScreen: {
        screen: ConsultToSellerScreen
    },
    InviteOpenShopScreen: {
        screen: InviteOpenShopScreen
    },
    ActivityNotifyScreen: {
        screen: ActivityNotifyScreen
    },
    ShopDetailScreen: {
        screen: ShopDetailScreen
    },
    ShopMedalIntroductionScreen: {
        screen: ShopMedalIntroductionScreen
    },
    SearchFeedBackScreen: {
        screen: SearchFeedBackScreen
    },
    TodayNewArrivalScreen: {
        screen: TodayNewArrivalScreen
    }
};
