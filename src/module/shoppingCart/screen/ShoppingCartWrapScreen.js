/**
 * Created by hzecool on 2018/8/14
 * 购物车包裹界面 跳转到非tab页的时候跳转到此界面
 */

import React, {Component} from 'react';
import ShoppingCartScreen from './ShoppingCartScreen';
import colors from '../../../gsresource/ui/colors';
import ColorOnlyNavigationHeader from '../../../component/ColorOnlyNavigationHeader';
import DateUtl from '../../../utl/DateUtl';

export default class ShoppingCartWrapScreen extends Component {

    static navigationOptions = () => {
        console.log('navigationOptions '+DateUtl.currentTimeSSS());
        return {
            header: (
                <ColorOnlyNavigationHeader
                    backgroundColor={colors.white}
                />
            ),
        };
    };

    constructor(props){
        super(props);
        console.log('constructor '+DateUtl.currentTimeSSS());
    }

    componentDidMount(){
        console.log('componentDidMount '+DateUtl.currentTimeSSS());
    }

    render() {
        console.log('render '+DateUtl.currentTimeSSS());
        return (
            <ShoppingCartScreen
                navigation={this.props.navigation}
                inTab={false}
                onArrowClick={() => {
                    this.props.navigation.goBack();
                }}
            />
        );
    }
}
