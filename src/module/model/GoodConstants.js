/**
 * @author sml2
 * @date 2018/12/13.
 * @desc 货品常量
 * @flow
 */

export const GoodQueryType = {
    // 普通搜索 默认
    normal:0,
    // 关注上新
    focusNew:1,
    // 推荐上新（全局）
    recommandNew:2,
    // 爆款
    hot:3,
    // （平台）不考虑登录情况的普通搜索（推荐列表 keyWords:{“specialFlag”:[1]}），
    plat:4,
    // 我（买家）的收藏。
    collect:5,
    // 今日上新（全局）（不掺杂热度和推荐，今日零点到现在）
    todayNew:6,
    // 包邮搜索
    freeFee:7,
};


