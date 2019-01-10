/**
 * @author YiJunJie @xbu
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-05 03:35:11
 * @desc  分享组件
 */
import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    SectionList,
    TouchableOpacity,
    Text,
    Dimensions,
    Image
} from 'react-native';

import { Popup } from '@ecool/react-native-ui';
import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import PropTypes from 'prop-types';
import { GridView } from '@ecool/react-native-ui';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
export default class SliderShare extends Component {
    static propTypes = {
        // 选中的item 有两个参数回调
        chooseItemCallback: PropTypes.func,
        // 弹框消失可以执行的方法
        onDismiss: PropTypes.func,
    };

    static defaultPropTypes = {
        onValueChanged: () => null,
        onDismiss: () => null,
        chooseItemCallback: () => null,
    };

    constructor(props) {
        super(props);
        this.state = {
            uri: '',
            data: [{ title: '分享到', data: ['item1']}],
            datCell:[
                {
                    key: 1,
                    name: '微信',
                    img: require('gsresource/img/weixin.png'),
                },
                {
                    key: 2,
                    name: '朋友圈',
                    img: require('gsresource/img/weixinFriend.png'),
                }
            ]
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
    confirm = (data,key) => {
        if(this.props.goodsPopShow) {
            this.takeToImage(data,key);
        } else {
            this.popup.dismiss(() => {
                this.props.chooseItemCallback && this.props.chooseItemCallback(data,key,this.state.uri);
            });
        }

    };

    /**
     * 隐藏的时候的回调
     */
    onDismiss = () => {
        this.props.onDismiss && this.props.onDismiss();
    };

    /**
     * 渲染底部视图
     */
    renderFooter = () => {
        return (
            <View style={styles.footerWrap}>
                {/*确定按钮*/}
                <TouchableOpacity
                    style={styles.footerBtn}
                    onPress={this.dismiss}
                >
                    <Text style={{ color: colors.white, fontSize: fonts.font14 }}>取消</Text>
                </TouchableOpacity>
            </View>
        );
    };

    // 头部
    sectionListHeader = (title) => {
        return(
            <View style={styles.header}>
                <Text style={{color: colors.normalFont, fontSize: fonts.font16}}>{title}</Text>
            </View>
        );
    };

    sectionListItem1 =(data) => {
        return (
            <View style={styles.common}>
                <Image source={data.img} />
                <Text style={styles.shareText}>{data.name}</Text>
            </View>
        );
    };

    renderBox = () => {
        return(
            <GridView
                numberOFCol={3}
                itemMarging={3}
                items={this.state.datCell}
                renderItem={this.sectionListItem1}
                customItemStyle={{height: 100,alignItems: 'center', justifyContent: 'center'}}
                containerWidth={WIDTH - 40}
                onItemDidClick={this.confirm}
            />
        );
    };


    render() {
        return (
            <Popup
                ref={popup => (this.popup = popup)}
                popupType={'1'}
                backgroundColor={colors.activeBtn}
                width={WIDTH}
                onDismiss={this.onDismiss}
            >
                <View style={styles.containerWrap}>
                    <SectionList
                        renderSectionHeader={({ section: { title } }) => (this.sectionListHeader(title))}
                        sections={this.state.data}
                        keyExtractor={(item, index) => item + index}
                        renderItem={this.renderBox}
                        style={{flex: 1}}
                    />
                    {this.renderFooter()}
                </View>

            </Popup>
        );
    }
}

const styles = StyleSheet.create({
    containerWrap: {
        backgroundColor: '#fff',
        paddingLeft: 28,
        paddingRight: 28,
        flex: 1,
        width:WIDTH,
        height:260,
        position: 'relative'
    },


    footerBtn: {
        height: 37,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.activeBtn,
        borderRadius: 37,
        marginBottom: 12,
    },

    header: {
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderE,
    },

    common: {
        alignItems: 'center',
    },

    shareText: {
        color: colors.greyFont,
        fontSize: fonts.font12,
        paddingTop: 10
    },


});
