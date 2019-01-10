/**
 *@author xbu
 *@date 2018/09/25
 *@desc 新手引导图
 *
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    Modal,
    TouchableOpacity,
    Dimensions,
    View,
    Image
} from 'react-native';
import OsType from 'utl/OsType';


import PropTypes from 'prop-types';
export let WIDTH = Dimensions.get('window').width;
export let HEIGHT = Dimensions.get('window').height;

export default class Mask extends Component {
    static propTypes = {
        type: PropTypes.string,
        isShow: PropTypes.bool,
        isAction: PropTypes.func,
        len: PropTypes.number,
    };

    constructor(props){
        super(props);
        this.state = {
            visable: true,
            index: 0,
        };
    }

    renderTop =()=> {
        return <View style={styles.top} />;
    };

    renderBotton =()=> {
        return <View style={styles.bottom} />;
    };

    renderCenter =()=> {
        return(
            <View style={styles.box}>
                <View style={styles.leftBox}>
                    <Image style={styles.leftBox} source={require('gsresource/img/maskImg/new/box.png')} />
                </View>
                <View style={styles.bottom} />
            </View>
        );
    };

    renderFixed =()=> {
        return (
            <View style={styles.fixed}>
                <Image source={require('gsresource/img/maskImg/new/new.png')} />
            </View>
        );

    };

    //  左上
    renderCenter2 =()=> {
        return(
            <View style={styles.boxLeftTop}>
                <View style={styles.bottom} />
                <View style={styles.boxLeftTopWidth}>
                    <Image style={styles.boxLeftTopWidth} source={require('gsresource/img/maskImg/new/box.png')} resizeMode={'cover'} />
                </View>
            </View>
        );
    };

    renderFixed2 =()=> {
        return (
            <View style={styles.fixed2}>
                <Image source={require('gsresource/img/maskImg/new/every.png')} />
            </View>
        );
    };

    //  左下
    renderTop2 =()=> {
        return <View style={[styles.top,styles.top2]} />;
    };

    renderFixed3 =()=> {
        return (
            <View style={styles.fixed3}>
                <Image source={require('gsresource/img/maskImg/popText.png')} />
            </View>
        );
    };


    // 首页引导
    indexTop =()=> {
        let index = this.state.index;
        if(index === 0 || index === 1){
            return this.renderTop();
        } else {
            return this.renderTop2();
        }
    };

    indexCenter =()=> {
        let index = this.state.index;
        if(index === 0){
            return this.renderCenter();
        } else if(index === 1 || index === 2) {
            return this.renderCenter2();
        }
    };

    indexBottomText =()=> {
        let index = this.state.index;
        if(index === 0){
            return this.renderFixed();
        } else if(index === 1) {
            return this.renderFixed2();
        } else {
            // return this.renderFixed3();
        }
    };

    // 我的引导页面
    mineTop =()=> {
        return <View style={[styles.top,styles.mineTop]} />;
    };

    mineCenter =()=> {
        return(
            <View style={styles.mineBox}>
                <Image source={require('gsresource/img/maskImg/mineBox.png')} style={styles.mineBox} />
            </View>
        );
    };

    mineFixed =()=> {
        return (
            <View style={styles.mineFixed}>
                <Image source={require('gsresource/img/maskImg/mineText.png')} />
            </View>
        );

    };


    render() {
        if(this.props.isShow || this.props.len <= 0 || this.state.visable === false){
            return null;
        }

        return (
            <TouchableOpacity
                onPress={this.nextImg}
                style={{position: 'absolute', width: '100%', height: '100%', zIndex: 10,}}
            >
                <View style={styles.container}>
                    {
                        this.props.type === 'index' ? this.indexTop() : this.mineTop()
                    }
                    {
                        this.props.type === 'index' ? this.indexCenter() : this.mineCenter()
                    }
                    {
                        this.renderBotton()
                    }
                    {
                        this.props.type === 'index' ? this.indexBottomText(): this.mineFixed()
                    }
                </View>
                <Modal
                    animationType='none'
                    transparent={true}
                    visible={this.state.visable}
                    style={[styles.container]}
                >
                    <TouchableOpacity style={{flex:1,}} onPress={this.nextImg} />
                    <View style={styles.tableBox} />
                </Modal>


            </TouchableOpacity>
        );
    }

    //方法
    componentDidMount() {
        this.setState({
            visable: !this.props.isShow
        });
    }

    // 点击展示下个图片
    nextImg =()=>{
        let index_des = this.state.index +1;
        let len = this.props.len;
        this.setState({
            index: index_des
        });

        if(len <= index_des){
            this.setState({
                visable: false
            });
            this.props.isAction();
        }
    };

}


const styles = StyleSheet.create({
    container: {
        width: WIDTH,
        height: HEIGHT,
    },

    top: {
        height: (WIDTH*0.45),
        backgroundColor: '#000',
        opacity: 0.6,
    },

    top2: {
        height: (WIDTH*0.45),
    },

    bottom: {
        flex: 1,
        backgroundColor: '#000',
        opacity: 0.6,
    },

    box: {
        width: '100%',
        height: 110,
        flexDirection: 'row',
    },

    leftBox: {
        width: (WIDTH / 2),
        height: 110,
    },

    fixed: {
        position: 'absolute',
        top: (WIDTH*0.45) + 130,
        left: '50%',
        zIndex: 10,
        width: 570/2,
        height: 400/2,
        marginLeft: -149,
        flex: 1,
    },


    //  左上
    boxLeftTop: {
        width: '100%',
        flexDirection: 'row',
    },

    boxLeftTopWidth: {
        width: (WIDTH / 2),
        height: 110,
    },

    fixed2: {
        position: 'absolute',
        top: 290,
        left: '50%',
        zIndex: 10,
        width: 412/2,
        marginLeft: -133,
    },

    //  左下
    fixed3: {
        position: 'absolute',
        top: 180 + (WIDTH / 2),
        left: '50%',
        zIndex: 10,
        width: 510/2,
        marginLeft: -133,
    },
    mineTop: {
        height: OsType() === 0 ? 132 : OsType() === 1 ? 160 : 160,
        width: WIDTH,
    },

    mineFixed: {
        position: 'absolute',
        top: 310,
        left: '50%',
        zIndex: 10,
        width: 386/2,
        height: 406/2,
        marginLeft: -90,
    },

    mineBox: {
        width: WIDTH,
        height: WIDTH * 0.365,
    },

    tableBox: {
        width: WIDTH,
        height: OsType() === 0 ? 49 : OsType() === 1 ? 83 : 83,
        backgroundColor: '#000',
        opacity: 0.6,
        bottom: 0,
    }

});

