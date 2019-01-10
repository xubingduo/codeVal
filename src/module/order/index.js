/**
 *@author xbu
 *@date 2018/08/10
 *@desc   订单及其详情路由
 *
 */

import OrderListScreen from './screen/OrderListScreen';
import OrderDetailsScreen from './screen/OrderDetailsScreen';
import OrderTransportScreen from './screen/OrderTransportScreen';
import OrderReturnGoodsScreen from './screen/OrderReturnGoodsScreen';
import StoreEvaluateScreen from './screen/StoreEvaluateScreen';
import ReturnGoodsSubmitApplyScreen from './screen/ReturnGoodsSubmitApplyScreen';
import ReturnGoodsLogsScreen from './screen/ReturnGoodsLogsScreen';
import ReturnGoodsTransportScreen from './screen/ReturnGoodsTransportScreen';
import ReturnChooseGoodsListScreen from './screen/ReturnChooseGoodsListScreen';
import AfterSaleScreen from './screen/AfterSaleScreen';
import ChooseTransportScreen from './screen/ChooseTransportScreen';
import OverTimeReturnGoodsScreen from './screen/OverTimeReturnGoodsScreen';

export default {

    OrderListScreen: {
        screen: OrderListScreen,
    },
    OrderDetailsScreen: {
        screen: OrderDetailsScreen,
    },

    OrderTransportScreen: {
        screen: OrderTransportScreen
    },

    OrderReturnGoodsScreen: {
        screen: OrderReturnGoodsScreen
    },

    ReturnGoodsSubmitApplyScreen: {
        screen: ReturnGoodsSubmitApplyScreen
    },

    ReturnGoodsLogsScreen: {
        screen: ReturnGoodsLogsScreen
    },

    ReturnGoodsTransportScreen: {
        screen: ReturnGoodsTransportScreen
    },

    ReturnChooseGoodsListScreen: {
        screen: ReturnChooseGoodsListScreen
    },

    StoreEvaluateScreen: {
        screen: StoreEvaluateScreen
    },

    AfterSaleScreen: {
        screen: AfterSaleScreen
    },

    ChooseTransportScreen: {
        screen: ChooseTransportScreen
    },

    OverTimeReturnGoodsScreen: {
        screen: OverTimeReturnGoodsScreen
    }
};