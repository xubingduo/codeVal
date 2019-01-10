/**
 * @author sml2
 * @date 2018/12/13.
 * @desc 货品推荐cell
 * @flow
 */
import React, { Component } from 'react';
import { View, Text, FlatList,TouchableOpacity,StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import Image from 'component/Image';
import ImageViewer from 'component/ImageViewer';
import colors from 'gsresource/ui/colors';
import {GoodModel} from 'module/model/GoodModel';
import DocSvc from 'svc/DocSvc';
import NavigationSvc from 'svc/NavigationSvc';
import GoodsListStore from '../../store/GoodsListStore';

type Props = {
    item: GoodModel,
    onAddToOrderClick: Function,
    onToDetailClick: Function,
    store: GoodsListStore,
}

export default class GoodListRecommandCell extends Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render(){
        const {item} = this.props;
        let docContents = item && item.docContent ? JSON.parse(item.docContent) : null;
        let source = docContents && docContents.length > 0 ? DocSvc.docURLL(docContents[0].docId) : '';
        let docIds = docContents ? docContents.map(item => item.docId) : '';
        return(
            <View>
                <View style={styles.container}>
                    <View style={styles.cotnentView}>
                        <View style={{width:110,height:110}}>
                            <ImageViewer
                                source={{uri: source}}
                                defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                                style={{width:'100%',height:'100%', borderRadius: 2}}
                                docIDs={docIds}
                                index={0}
                            />
                        </View>
                        <TouchableOpacity
                            style={{marginLeft:9,flex:1}}
                            onPress={this.props.onToDetailClick}
                        >
                            <Text style={styles.titleText} numberOfLines={2}>{item.title}</Text>
                            <View style={{flexDirection:'row', alignItems:'center'}}>
                                <View style={{flex:1,flexDirection:'row',alignItems:'center'}}>
                                    <Text style={styles.priceText} numberOfLines={1}>{'¥ ' + item.pubPrice}</Text>
                                    <Image style={{marginLeft:16}} source={require('gsresource/img/watch.png')} />
                                    <Text style={styles.viewNumText} numberOfLines={1}>{item.viewNum}</Text>
                                </View>
                                <TouchableOpacity
                                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                                    onPress={this.props.onAddToOrderClick}
                                    style={styles.AddToOrderTouch}
                                >
                                    <Text style={{fontSize:12, color:colors.activeBtn,fontWeight:'bold'}}>加入订单</Text>
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{height:1,backgroundColor:colors.borderE}} />
            </View>
        );
    }

}


const styles = StyleSheet.create({
    container: {
        backgroundColor:'white',
    },
    cotnentView: {
        margin:10,
        marginBottom:10,
        flexDirection:'row'
    },
    AddToOrderTouch:{
        height:25,
        justifyContent:'center',
        padding:4
    },
    titleText:{
        flex:1,
        fontSize:14,
        color:colors.normalFont
    },
    priceText:{
        fontSize:14,
        color:colors.activeBtn,
        fontWeight:'bold'
    },
    viewNumText:{
        marginLeft:4,
        maxWidth:100,
        paddingRight:16,
        color:colors.greyFont,
        fontSize:10
    },

});
