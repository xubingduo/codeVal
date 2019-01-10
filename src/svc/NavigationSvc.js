/**
 * @author GaoYuJian
 * @create date 2018/5/31
 * @desc
 */
import { NavigationActions, StackActions } from 'react-navigation';

let _navigator;

function setTopLevelNavigator(navigatorRef) {
    _navigator = navigatorRef;
}

function navigate(routeName, params) {
    if (_navigator) {
        _navigator.dispatch(
            NavigationActions.navigate({
                routeName,
                params,
            })
        );
    }
}

function push(routeName, params) {
    if (_navigator) {
        const pushAction = StackActions.push({
            routeName: routeName,
            params: params,
        });
        _navigator.dispatch(pushAction);
    }
}

function popToTop() {
    if (_navigator) {
        _navigator.dispatch(StackActions.popToTop());
    }
}

function pop() {
    if (_navigator) {
        _navigator.dispatch(StackActions.pop());
    }
}

// add other navigation functions that you need and export them

export default {
    navigate,
    popToTop,
    pop,
    setTopLevelNavigator,
    push,
};
