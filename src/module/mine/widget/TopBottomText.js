/**
 * author: wwj
 * Date: 2018/8/21
 * Time: 上午9:47
 * des:
 */
import {
    Text,
    View,
} from 'react-native';
import fonts from '../../../gsresource/ui/fonts';
import React,{Component} from 'react';
import colors from '../../../gsresource/ui/colors';
import PropTypes from 'prop-types';

/**
 * 上标题，下数字 的组件
 */
export default class TopBottomText extends Component{

    static propTypes = {
        title: PropTypes.string,
        num: PropTypes.number,
        isLogin: PropTypes.bool,
        hidden: PropTypes.bool,
        // 对要显示的数字进行处理
        handleNumShowFun: PropTypes.func,
    };

    static defaultProps = {
        hidden: false,
        isLogin: false,
        title: '',
        num: 0,
        handleNumShowFun: null
    };

    constructor(props){
        super(props);
        this.state = {isLogin: this.props.isLogin};
    }

    componentWillReceiveProps(nextProps){
        this.setState({isLogin: nextProps.isLogin});
    }

    render(){
        let {isLogin, title, num, hidden, handleNumShowFun} = this.props;
        if (!isLogin) {
            num = 0;
        }
        if (hidden) {
            return (
                <View
                    style={{
                        alignItems: 'flex-start',
                        flex: 1,
                    }}
                />
            );
        }
        return (
            <View
                style={{
                    alignItems: 'flex-start',
                    flex: 1,
                }}
            >
                <Text
                    style={{
                        color: colors.greyFont,
                        fontSize: fonts.font12,
                    }}
                >{title}</Text>
                <Text
                    style={{
                        color: colors.normalFont,
                        fontSize: fonts.font12,
                        fontWeight: 'bold',
                        marginTop: 8}}
                >{handleNumShowFun ? handleNumShowFun(num) + ' ' : num.toString() + ' '}</Text>
            </View>
        );
    }
}