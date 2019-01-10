/**
 * author: wwj
 * Date: 2018/8/15
 * Time: 上午10:09
 * des: 登录包裹界面   非首次打开app登录时 跳转到此登录页面
 */
import React, {Component} from 'react';
import LoginScreen from './LoginScreen';

export default class LoginWrapScreen extends Component{
    static navigationOptions = () => {

        return {
            header: (
                null
            ),
        };
    };

    render (){
        return (
            <LoginScreen />
        );
    }
}