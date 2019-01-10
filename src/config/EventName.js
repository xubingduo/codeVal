const HomeEventName = [{
    key: 'IndexScreen',
    val: 'IndexScreen',
    des: '点击首页TAB'
}, {
    key: 'HOME_BANNER',
    val: 'HOME_BANNER',
    des: '首页-banner点击'
},{
    key: 'TODAY_NEW_SHOP',
    val: 'TODAY_NEW_SHOP',
    des: '今日上新门店'
}, {
    key: 'TODAY_NEW_GOODS',
    val: 'TODAY_NEW_GOODS',
    des: '今日新款'
}, {
    key: 'HOME_FREESHIPPING',
    val: 'HOME_FREESHIPPING',
    des: '包邮专区'
},{
    key: 'TODAY_HOT_GOODS',
    val: 'TODAY_HOT_GOODS',
    des: '今日爆款'
}, {
    key: 'HOME_SEARCH',
    val: 'HOME_SEARCH',
    des: '首页-搜索'
}, {
    key: 'HOME_RED_PACKET',
    val: 'HOME_RED_PACKET',
    des: '首页-红包'
}, {
    key: 'MSG_CENTER_CUSTOMER_SERVICE',
    val: 'MSG_CENTER_CUSTOMER_SERVICE',
    des: '消息中心-客服'
}, {
    key: 'HOME_SCAN',
    val: 'HOME_SCAN',
    des: '首页-扫一扫'
}, {
    key: 'HOME_MSG_CENTER',
    val: 'HOME_MSG_CENTER',
    des: '首页-消息中心'
}];

const NewestEventName = [{
    key: 'NewestScreen',
    val: 'NewestScreen',
    des: '点击上新TAB'
}, {
    key: 'NEWEST_CUSTOMER_SERVICE',
    val: 'NEWEST_CUSTOMER_SERVICE',
    des: '上新-客服'
}, {
    key: 'NEWEST_SCAN',
    val: 'NEWEST_SCAN',
    des: '上新-扫一扫'
}, {
    key: 'NEWEST_SEARCH',
    val: 'NEWEST_SEARCH',
    des: '上新-搜索'
}];

const SortEventName = [{
    key: 'SortScreen',
    val: 'SortScreen',
    des: '点击分类TAB'
}];

const MineEventName = [{
    key: 'MineScreen',
    val: 'MineScreen',
    des: '点击我的TAB'
}, {
    key: 'MINE_ORDER',
    val: 'MINE_ORDER',
    des: '我的订单'
}, {
    key: 'MINE_FAVOR_GOODS',
    val: 'MINE_FAVOR_GOODS',
    des: '我的收藏'
}, {
    key: 'MINE_GET_COUPON_CENTER',
    val: 'MINE_GET_COUPON_CENTER',
    des: '领券中心'
}, {
    key: 'MINE_FOCUS_SHOP',
    val: 'MINE_FOCUS_SHOP',
    des: '我关注的店铺'
}, {
    key: 'MINE_COUPONS',
    val: 'MINE_COUPONS',
    des: '我的卡券'
}, {
    key: 'MINE_MEDAL',
    val: 'MINE_MEDAL',
    des: '勋章介绍'
}, {
    key: 'MINE_SETTING',
    val: 'MINE_SETTING',
    des: '我的-设置'
},{
    key: 'MINE_TAKE_GOODS_SHOP',
    val:  'MINE_TAKE_GOODS_SHOP',
    des: '我的-拿货门店'
}];

const ShopEventName = [{
    key: 'SHOP_TOGGLE_FOCUS_ON',
    val: 'SHOP_TOGGLE_FOCUS_ON',
    des: '店铺-关注点击'
}, {
    key: 'SHOP_CUSTOMER_SERVICE',
    val: 'SHOP_CUSTOMER_SERVICE',
    des: '店铺首页-联系卖家'
}];

const GoodsEventName = [{
    key: 'GOODS_SORT_NORMAL',
    val: 'GOODS_SORT_NORMAL',
    des: '商品-排序-默认'
}, {
    key: 'GOODS_SORT_READER',
    val: 'GOODS_SORT_READER',
    des: '商品-排序-阅读'
}, {
    key: 'GOODS_SORT_STAR',
    val: 'GOODS_SORT_STAR',
    des: '商品-排序-点赞'
}, {
    key: 'GOODS_SORT_PRICE',
    val: 'GOODS_SORT_PRICE',
    des: '商品-排序-价格'
}, {
    key: 'GOODS_SORT_FILTRATE',
    val: 'GOODS_SORT_FILTRATE',
    des: '商品-排序-筛选'
}, {
    key: 'GOODS_SORT_EXPORT',
    val: 'GOODS_SORT_EXPORT',
    des: '商品-排序-爆款'
}, {
    key: 'GOODS_SORT_RECOMMEND',
    val: 'GOODS_SORT_RECOMMEND',
    des: '商品-排序-推荐'
}, {
    key: 'GOODS_SORT_FOCUS_ON',
    val: 'GOODS_SORT_FOCUS_ON',
    des: '商品-排序-关注'
},
// 
{
    key: 'GOODS_SORT_TYPE',
    val: 'GOODS_SORT_TYPE',
    des: '商品-排序-分类'
},
//
{
    key: 'GOODS_TOGGLE_STAR',
    val: 'GOODS_TOGGLE_STAR',
    des: '商品-点击star'
}, {
    key: 'GOODS_TOGGLE_FAVOR',
    val: 'GOODS_TOGGLE_FAVOR',
    des: '商品-收藏'
}, {
    key: 'GOODS_DELETE',
    val: 'GOODS_DELETE',
    des: '商品-删除'
}, {
    key: 'GOODS_BUY',
    val: 'GOODS_BUY',
    des: '商品-购买'
}];

const CartEventName = [{
    key: 'ShoppingCartScreen',
    val: 'ShoppingCartScreen',
    des: '点击购物车TAB'
}, {
    key: 'CART_GOODS_DELETE',
    val: 'CART_GOODS_DELETE',
    des: '购物车-删除商品'
}, {
    key: 'CART_GOODS_EDIT',
    val: 'CART_GOODS_EDIT',
    des: '购物车-编辑商品数量'
}, {
    key: 'CART_PAY',
    val: 'CART_PAY',
    des: '购物车-立即下单'
}];

const UserEventName = [{
    key: 'USER_EDIT_PHONE',
    val: 'USER_EDIT_PHONE',
    des: '用户-更换手机号'
}, {
    key: 'USER_ADDRESS_ADD',
    val: 'USER_ADDRESS_ADD',
    des: '用户-地址-新增'
}, {
    key: 'USER_ADDRESS_EDIT',
    val: 'USER_ADDRESS_EDIT',
    des: '用户-地址-修改'
}, {
    key: 'USER_ADDRESS_DELETE',
    val: 'USER_ADDRESS_DELETE',
    des: '用户-地址-删除'
}, {
    key: 'USER_EDIT_PHOTO',
    val: 'USER_EDIT_PHOTO',
    des: '用户-更换头像'
}, {
    key: 'USER_EDIT_NICKNAME',
    val: 'USER_EDIT_NICKNAME',
    des: '用户-更换昵称'
}, {
    key: 'USER_FOCUS_ON_SHOP',
    val: 'USER_FOCUS_ON_SHOP',
    des: '用户-关注的店铺'
}];

const OrderEventName = [{
    key: 'ORDER_LOOK_ALL',
    val: 'ORDER_LOOK_ALL',
    des: '查看-订单-all'
}, {
    key: 'ORDER_LOOK_WILL_PAY',
    val: 'ORDER_LOOK_WILL_PAY',
    des: '查看-订单-待付款'
}, {
    key: 'ORDER_LOOK_WILL_SEND',
    val: 'ORDER_LOOK_WILL_SEND',
    des: '查看-订单-待发货'
}, {
    key: 'ORDER_LOOK_WILL_GET',
    val: 'ORDER_LOOK_WILL_GET',
    des: '查看-订单-待收货'
}, {
    key: 'ORDER_LOOK_DID_GET',
    val: 'ORDER_LOOK_DID_GET',
    des: '查看-订单-完成'
}, {
    key: 'ORDER_LOOK_CANCEL',
    val: 'ORDER_LOOK_CANCEL',
    des: '查看-订单-退款退货'
}, {
    key: 'ORDER_CANCEL',
    val: 'ORDER_CANCEL',
    des: '订单-取消订单'
}, {
    key: 'ORDER_PAY',
    val: 'ORDER_PAY',
    des: '订单-立即支付'
}, {
    key: 'ORDER_SERVICE',
    val: 'ORDER_SERVICE',
    des: '订单-客服'
}, {
    key: 'ORDER_MATERIAL_FLOW',
    val: 'ORDER_MATERIAL_FLOW',
    des: '订单-物流'
}, {
    key: 'ORDER_AFTER_SALE',
    val: 'ORDER_AFTER_SALE',
    des: '订单-售后'
}, {
    key: 'ORDER_REMINDING_GOODS',
    val: 'ORDER_REMINDING_GOODS',
    des: '订单-提醒发货'
}, {
    key: 'ORDER_SURE_GOODS',
    val: 'ORDER_SURE_GOODS',
    des: '订单-确认收货'
}, {
    key: 'ORDER_EVALUATE',
    val: 'ORDER_EVALUATE',
    des: '订单-评价'
},];

const OtherEventName = [{
    key: 'OTHER_SERVICE',
    val: 'OTHER_SERVICE',
    des: '其他-客服'
}, {
    key: 'OTHER_SCAN',
    val: 'OTHER_SCAN',
    des: '其他-扫码'
}, {
    key: 'OTHER_SEARCH_GOODS',
    val: 'OTHER_SEARCH_GOODS',
    des: '其他-搜索-商品'
}, {
    key: 'OTHER_SEARCH_SHOP',
    val: 'OTHER_SEARCH_SHOP',
    des: '其他-搜索-店铺'
}];

const EventName = [
    ...ShopEventName,
    ...GoodsEventName,
    ...CartEventName,
    ...UserEventName,
    ...OrderEventName,
    ...OtherEventName,
    ...HomeEventName,
    ...NewestEventName,
    ...SortEventName,
    ...MineEventName,
];
export default EventName;