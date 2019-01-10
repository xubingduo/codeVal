/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-05 03:35:11
 * @desc [侧滑筛选条件配置组件]
 */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Text,
    Image,
    Dimensions,
} from 'react-native';

import { Popup } from '@ecool/react-native-ui';
import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';
import PropTypes from 'prop-types';

const WIDTH = Dimensions.get('window').width;
export default class orderCancelComponent extends Component {

    static propTypes = {
        onDismiss: PropTypes.func,
        confirmOrder: PropTypes.func,
        data: PropTypes.array,
        ShowTitle: PropTypes.number,
        names: PropTypes.string,
    };

    static defaultProps = {
        // 订单头部
        ShowTitle: 1,
        names: '取消订单',
    };

    constructor(props) {
        super(props);
        this.state = {
            index: -1,
            options: null,
            isTrue: true,
        };
    }


    /**
     * 显示侧滑菜单
     */
    show = () => {
        this.popup.show();
    };

    dismiss = () => {
        this.popup.dismiss();
    };

    /**
     * 确定
     */
    confirm = () => {
        if(this.state.index === -1){
            this.props.confirmOrder();
            return;
        }

        this.popup.dismiss(() => {
            let listObj = null;
            this.props.data.forEach((el,index1) => {
                if(index1 === this.state.index){
                    listObj = el;
                }
            });
            this.props.confirmOrder(this.state.options,listObj);
            this.setState({
                isTrue: false
            });
        });
    };

    setOptions =(data)=>{
        this.setState({
            options: data
        });
    };

    /**
     * 隐藏的时候的回调
     */
    onDismiss = () => {
        if(this.state.isTrue){
            this.setState({
                index: -1
            });
        }
        this.props.onDismiss && this.props.onDismiss();
    };

    cancle =() => {
        this.setState({
            isTrue: true,
            index: -1
        });
    };


    /**
     * 渲染底部视图
     */
    renderFooter = () => {
        return (
            <View style={styles.footerWrap}>
                {/*确定按钮*/}
                <TouchableOpacity style={[styles.footerBtn,styles.activeBtn]} onPress={this.confirm}>
                    <Text style={{color: colors.white,fontSize: fonts.font14}}>确定</Text>
                </TouchableOpacity>
            </View>
        );
    };

    //要渲染的部分
    flatListItem = (item) => {
        let el = this.props.data.map((el,index1) => {
            let img = this.state.index === index1 ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png');
            let bg = this.state.index === index1 ? colors.bg : colors.white;
            return(
                <TouchableOpacity
                    style={[styles.checkBox,{backgroundColor: bg}]}
                    key={index1}
                    onPress={()=> {
                        this.setState({
                            index : index1
                        });
                    }}
                >
                    <Image source={img} />
                    <Text style={styles.checkBoxText}>{this.props.ShowTitle ===1 ? el.codeName : el.name}</Text>
                </TouchableOpacity>
            );
        });


        return <View>{el}</View>;
    };

    renderTitle = () =>{
        return(
            this.props.ShowTitle === 1 ? (<View>
                <Text style={styles.cancelTitle}>{this.props.names}</Text>
                <Text style={styles.cancelDesc}>请选择{this.props.names}原因</Text>
            </View>) : (<Text style={styles.returnTitle}>请选择物流</Text>)
        );
    };


    render() {
        return (
            <Popup
                ref={(popup) => this.popup = popup}
                popupType={'1'}
                backgroundColor={'#fff'}
                width={WIDTH}
                height={375}
                onDismiss={this.onDismiss}
            >
                <View style={styles.containerWrap}>
                    <FlatList
                        data={[{key: 'a'}]}
                        ListHeaderComponent={this.renderTitle}
                        renderItem={({item}) => this.flatListItem(item)}
                    />
                    {this.renderFooter()}
                </View>
            </Popup>
        );
    }
}

const styles = StyleSheet.create({

    containerWrap: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: '#fff',
    },

    footerWrap: {
        flexDirection: 'row',
        height: 44,
    },

    footerBtn: {
        flex: 1,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor:  colors.activeBtn,
        borderRadius: 2,
    },

    //内容区
    cancelTitle: {
        height: 38,
        lineHeight: 38,
        textAlign: 'center',
        fontSize: fonts.font12,
        color: colors.greyFont,
    },
    cancelDesc: {
        color: colors.goodFont,
        fontSize: fonts.font12,
        paddingBottom: 12,
        paddingLeft: 15,
    },

    checkBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.border1,
        paddingLeft: 15,
        paddingRight: 15,
        paddingTop: 8,
        paddingBottom: 8,
    },

    checkBoxText: {
        fontSize: fonts.font14,
        color: colors.detailsFont,
        paddingLeft: 20,
    },

    returnTitle: {
        fontSize: fonts.font14,
        color: colors.normalFont,
        textAlign: 'center',
        lineHeight: 40,
    }

});