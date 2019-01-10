/**
 * Created by sml2 on 2018/02/28.
 */
import React, { Component } from 'react';
import { View, Text,StyleSheet,Image,TouchableOpacity,Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react/native';
const WIDTH = Dimensions.get('window').width;

@observer
export default class ListViewTextArrowCell extends Component {
    static propTypes={
        /* 标题视图 */
        title:PropTypes.oneOfType([PropTypes.string,PropTypes.element]),
        /* 子标题文字style */
        titleTextStyle:PropTypes.object,
        /* 子标题视图 */
        subTitle:PropTypes.oneOfType([PropTypes.string,PropTypes.element]),
        /* 子标题文字style */
        subTitleTextStyle:PropTypes.object,
        /* 是否显示子视图 */
        subTitleHidden:PropTypes.bool,
        /* 内容 */
        value:PropTypes.any,

        valueNumberOfLines:PropTypes.number,
        /* 内容文字style */
        valueTextStyle:PropTypes.object,
        /* 是否显示箭头 */
        arrowHidden:PropTypes.bool,
        /* 能否点击 */
        tapEnable:PropTypes.bool,
        /* 点击回调 */
        tapHandler:PropTypes.func,
        /* 是否必须 是 将显示红色*星号 */
        isRequired:PropTypes.bool,
        /* 样式 */
        style:PropTypes.object,
        /* 样式 */
        leftViewContainerStyle:PropTypes.object,
        /* 辅助视图 如果设置将覆盖value的显示 */
        accessaryView:PropTypes.element,
        /* 点击透明度 */
        tapActiveOpacity:PropTypes.number,

    }

    static defaultProps={
        accessaryView:null,
        title:'title',
        titleTextStyle:null,
        subTitle:'subTitle',
        subTitleTextStyle:null,
        subTitleHidden:false,
        value:'value',
        valueNumberOfLines:1,
        valueTextStyle:null,
        arrowHidden:false,
        tapEnable:true,
        isRequired:false,
        style:null,
        tapActiveOpacity:0.3,
    }

    render(){
        return (
            <TouchableOpacity
                onPress={()=>{
                    if(this.props.tapHandler){
                        this.props.tapHandler();
                    }
                }}
                disabled={!this.props.tapEnable}
                activeOpacity={this.props.tapActiveOpacity}
            >
                <View style={[styles.container,this.props.style]}>
                    {this.renderLeftView()}
                    {this.renderRightView()}
                </View>
            </TouchableOpacity>
        );
    }

    renderLeftView(){
        let titleView = null;
        if(typeof(this.props.title) === 'string'){
            let isRequireText = this.props.isRequired ? '*' : ' ';
            titleView = (
                <View style={styles.titleViewContainer}>
                    <Text style={styles.necessaryTextStyle}>{isRequireText}</Text>
                    <Text style={[styles.leftContainerLeftText,this.props.titleTextStyle]}>{this.props.title}</Text>
                </View>
            );
        } else {
            titleView = (
                <View style={styles.titleViewContainer}>
                    <View style={{width:7}} />
                    {this.props.title}
                </View>
            );
        }
        
        
        let subTitleView = null;
        if(!this.props.subTitleHidden){
            if(typeof(this.props.subTitle) === 'string'){
                subTitleView = (
                    <View style={styles.leftViewSubTitleViewContainer}>
                        <Text style={[{fontSize:12,color:'#3d4245'},this.props.subTitleTextStyle]}>{this.props.subTitle}</Text>
                    </View>
                );
            } else {
                subTitleView = (
                    <View style={styles.leftViewSubTitleViewContainer}>
                        {this.props.subTitle}
                    </View>
                );
            }
        }

        return (
            <View style={[styles.leftViewContainer,this.props.leftViewContainerStyle]}>
                {titleView}
                {!this.props.subTitleHidden && subTitleView}
            </View>
        );
    }

    renderRightView(){
        let accessaryView = null;
        if(this.props.accessaryView){
            accessaryView = (
                <View style={styles.accessaryViewContent}>
                    {this.props.accessaryView}
                </View>
            );
        } else {
            accessaryView = (
                <View style={styles.accessaryViewContent}>
                    {!this.props.arrowHidden && <Image style={{marginLeft:8}} source={require('gsresource/img/arrowRight.png')} />}
                    <Text style={[styles.rightContainerLeftText,this.props.valueTextStyle]} numberOfLines={this.props.valueNumberOfLines}>{this.props.value}</Text>
                </View>
            );
        }

        return (
            <View style={styles.accessaryViewContainer}>
                {accessaryView}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flexDirection:'row',
        height:44,
        justifyContent:'space-between',
        backgroundColor:'white',
    },
    necessaryTextStyle:{
        color:'red',
        fontSize:14,
        width:6
    },
    leftContainerLeftText:{
        color:'#3d4245',
        fontSize:14,
        marginLeft:1,
    },
    rightContainerLeftText:{
        color:'#999999',
        fontSize:14,
    },
    accessaryViewContainer:{
        alignItems:'center',
        width:WIDTH * 0.5,
        height:'100%',
        flexDirection:'row-reverse',
        marginLeft:14
    },
    accessaryViewContent:{
        flexDirection:'row-reverse',
        marginRight:12,
        alignItems:'center',
        width:'90%',
        height:'100%',
    },
    leftViewContainer:{
        marginLeft:16,
        flexDirection:'row',
        alignItems:'center',
        height:'100%'
    },
    leftViewSubTitleViewContainer:{
        height:'80%',
        justifyContent:'center',
        marginLeft:20,
    },
    titleViewContainer:{
        flexDirection:'row',
        alignItems:'center',
        height:'80%'
    },

});






































