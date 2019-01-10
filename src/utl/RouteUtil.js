/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-15 02:07:33
 * @desc [路由工具类型]
 * @flow
*/

/**
 * 设置路由路径 
 * 注：只要导航跳转的时候都需要添加
 * 如：this.props.navigation.navigate('OrderBillDetaillScreen', {...RouteUtil.put(this.props)});
 */
const put = (navigation: Object) => {
    const { params, key, routeName } = navigation.state;
    let keys = null;
    // 当参数不存在的时候
    if (typeof params === 'undefined') {
        keys = [];
    } else {
        keys = params.RouteKeys;
    }
    // 处理空数据的情况
    if (typeof keys === 'undefined'
        || keys.length === 0) {
        keys = [];
    } else {
        keys = keys.slice();
    }
    keys.push({ key, routeName });
    return { RouteKeys: keys };
};

/**
 * 返回到指定的页面
 * 如：RouteUtil.goBackTo('OrderBillHistoryScreen',this.props);
 */
const goBackTo = (target: string, navigation: Object) => {
    const routeKeys = navigation.state.params.RouteKeys;
    let key = null;
    for (let index = 0; index < routeKeys.length; index++) {
        const routeKey = routeKeys[index];
        if (routeKey.routeName === target) {
            if (index + 1 < routeKeys.length) {
                key = routeKeys[index + 1].key;
            }
            break;
        }
    }
    navigation.goBack(key);
};

/**
 * 从指定页面返回
 * @param target
 * @param navigation
 */
function goBackFrom(target: string, navigation: Object) {
    const routeKeys = navigation.state.params.RouteKeys;
    for (let item of routeKeys) {
        if (item.routeName === target) {
            navigation.goBack(item.key);
            return;
        }
    }
}

/**
 * 获取上个页面路由
 * @param target
 * @param navigation
 */
function previousRouteName(target: string, navigation: Object): string {
    const routeKeys = navigation.state.params.RouteKeys;
    for (let index = 0; index < routeKeys.length; index++) {
        const item = routeKeys[index];
        if (item.routeName === target) {
            if (index === 0) {
                return item.routeName;
            } else {
                const previousItem = routeKeys[index - 1];
                return previousItem.routeName;
            }
        }
    }

    return '';
}

/**
 * 导航堆栈中是否包含路由
 * @param target
 * @param navigation
 */
function includesRouteName(target: string, navigation: Object): boolean {
    const routeKeys = navigation.state.params.RouteKeys;
    return routeKeys.find((item) => item.routeName === target) !== undefined;
}


/**
 * 为Screnn 提供自动添加路由的导航方法
 * 
 * @param {*} WrappedComponent 
 */
export const navigateWrapper = (WrappedComponent: any) => {
    return class Wapper extends WrappedComponent<{}> {
        static displayName = `HOC(${getDisplayName(WrappedComponent)})`

        /**
         * 跳转到对应的页面
         */
        navigate = (target: string, params: Object) => {
            this.props.navigation.navigate(target, { ...params, ...put(this.props.navigation) });
        }

        /**
         * 跳转转到指定页面
         * 
         * @static
         */
        static navigate = (navigation: Object, target: string, params: Object) => {
            navigation.navigate(target, { ...params, ...put(navigation) });
        }

        /**
         * 返回到指定的页面
         */
        goBackTo = (target: string) => {
            goBackTo(target, this.props.navigation);
        }

        /**
         * 从指定的页面返回
         */
        goBackFrom = (target: string) => {
            goBackFrom(target, this.props.navigation);
        }

        /**
         * 获取上个页面路由
         */
        previousRouteName = (target: string) => {
            previousRouteName(target, this.props.navigation);
        }

        render() {
            return super.render();
        }
    };
};

const getDisplayName = (WrappedComponent) => {
    return WrappedComponent.displayName || WrappedComponent.name || 'Component';
};

export default {
    put,
    goBackTo,
    goBackFrom,
    previousRouteName,
    includesRouteName,
};