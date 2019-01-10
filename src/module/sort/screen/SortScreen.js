/**
 * author: xbu
 * Date: 2018/7/17
 * Time: 08:40
 * des:  商品分类首页
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    SafeAreaView,
    View,
    Text,
    FlatList,
    SectionList,
    TouchableOpacity,
    Dimensions,
} from 'react-native';
import colors from '/gsresource/ui/colors';
import SortStore from '../store/SortStore';
import fonts from '/gsresource/ui/fonts';
import CommonSearch from '../../../component/CommonSearch';
import {observer} from 'mobx-react';
import Image from '../../../component/Image';
import SearchGoodsListScreen from '../../index/screen/search/SearchGoodsListScreen';
import {DLFlatList, RefreshState} from '@ecool/react-native-ui';
import Alert from '../../../component/Alert';
import UserActionSvc from 'svc/UserActionSvc';
import DocSvc from '../../../svc/DocSvc';
import ColorOnlyNavigationHeader from '../../../component/ColorOnlyNavigationHeader';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;
@observer
export default class SortScreen extends Component {
    constructor(props) {
        super(props);
        this.store = new SortStore();
        this.isTrue = true;
        this.state = {
            cell: 0,
            refreshCell: 0,
            listFreshState: 0,
        };
        this.type = 'hot';
    }

    // 左边list
    renderLRow =({item})=> {
        return (
            <TouchableOpacity onPress={() => this.cellAction(item)}>
                <View
                    style={[styles.listLeft, {backgroundColor: this.state.cell === item.index ? colors.white : colors.transparent}]}
                >
                    <View style={{position: 'relative'}}>
                        {
                            this.state.cell === item.index ? (<View style={styles.listActive} />) : null
                        }

                        <Text style={styles.listText}>{item.name}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    //SectionList 悬浮
    fixedHeader = ({section}) => {
        if(section.type === 'hot'){
            return null;
        }
        return (
            <TouchableOpacity
                style={styles.fixedHeader}
                onPress={()=>{
                    this.onClickGoStyleTow(section);
                }}
            >
                <Text style={styles.fixedFoodName}>{section.name }{'    '}</Text>
                <Image source={require('gsresource/img/arrowRight.png')} />
            </TouchableOpacity>
        );
    };

    //右边list
    renderSectionList = ({item}) => {
        let element = null;
        if (Array.isArray(item)) {
            element = item.map((el, i) => this.sectionItem(el, i));
        } else {
            element = this.sectionHotMarhetImg(item);
        }

        return (
            <View style={styles.listRightContainer}>
                {element}
            </View>
        );
    };

    // 热们市场
    sectionHotMarhetImg(item) {

        return (
            <TouchableOpacity
                style={styles.sectionItemImgBox}
                onPress={()=> this.goToAllSort(item)}
            >
                <View style={styles.sectionItemImg}>
                    <Image style={styles.sectionIImg} source={{uri: DocSvc.originDocURL(item.docId)}} defaultSource={require('gsresource/img/dressDefaultPic110.png')} />
                    <View style={styles.sectionMask} />
                    <Text style={styles.sectionText} numberOfLines={1}>{item.typeName}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // 商品分类
    sectionItem(item, i) {
        return (
            <TouchableOpacity style={styles.imgBox} key={i + 'child'} onPress={() => this.onClickGoStyleTow(item)}>
                <Image style={styles.imgWith} source={{uri: DocSvc.originDocURL(item.docId)}} defaultSource={require('gsresource/img/dressDefaultPic110.png')} />
                <Text style={styles.textName} numberOfLines={1}>{item.name}</Text>
            </TouchableOpacity>
        );
    }

    refreshingElement =() => {
        return (
            <DLFlatList
                style={{flex: 1, backgroundColor: colors.white,}}
                mode={'SectionList'}
                refreshState={this.state.listFreshState}
                listRef={(ref) => this.sectionList = ref}
                sections={this.store.getRightData}
                stickySectionHeadersEnabled={true}
                keyExtractor={(item, index) => index + 'right'}
                renderSectionHeader={this.fixedHeader}
                renderItem={this.renderSectionList}
                showsVerticalScrollIndicator={false}
                scrollToLocation={() => this.scrollToLocation()}
                ListEmptyComponent={this.listEmptyView}
                onFooterRefresh={this.onLoadMore}
                onHeaderRefresh={this.onHeadFresh}
                ListHeaderComponent={this.renderRightTop}
            />
        );
    };

    //公共头部
    renderRightTop =()=>{
        if(this.store.type === 'hot'){
            return null;
        }
        return(
            <TouchableOpacity
                style={[styles.fixedHeader,{borderBottomWidth:1, borderBottomColor: colors.border}]}
                onPress={this.getAllItem}
            >
                <Text style={{fontSize: fonts.font16,color: colors.normalFont}}>全部</Text>
                <Image source={require('gsresource/img/arrowRight.png')} />
            </TouchableOpacity>
        );
    };

    //右边空列表
    listEmptyView = () => {
        let el = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 1, 2].map((el, index) => {
            return (
                <View key={index} style={[styles.imgBox, {backgroundColor: colors.bg, height: 70, marginTop: 10, borderRadius: 8}]} />
            );
        });
        return (
            <View style={styles.boxRight}>
                <View style={styles.blockTop}>
                    <View style={styles.blockNei} />
                </View>
                <View style={styles.blockTop}>
                    <View style={styles.blockNei} />
                </View>
                <View style={styles.blockTop}>
                    <View style={styles.blockNei} />
                </View>

                <View style={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {el}
                </View>
            </View>
        );
    };

    //左边空列表
    listEmptyViewLeft() {
        let el = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 1, 1].map((el, index) => {
            return <View style={styles.block} key={index} />;
        });

        return (
            <View style={styles.leftBox}>{el}</View>
        );
    }

    render() {
        return (
            <SafeAreaView style={styles.container}>

                <CommonSearch
                    style={{
                        position: 'absolute',
                        borderRadius: 4,
                        left: 0,
                        right: 0,
                        backgroundColor: this.state.searchBarBackColor
                    }}
                    placeholder={'搜商品,店铺...'}
                    onClick={() => {
                        this.props.navigation.navigate(
                            'SearchHistoryScreen'
                        );
                    }}
                />
                <View style={styles.listContainer}>
                    <View style={{width: 108}}>
                        <FlatList
                            ref={(ref) => {
                                this.FlatList = ref;
                            }}
                            keyExtractor={(item, index) => index + 'left'}
                            style={{flex: 1}}
                            data={this.store.getLeftData}
                            renderItem={this.renderLRow}
                            ListEmptyComponent={this.listEmptyViewLeft}
                            showsVerticalScrollIndicator = {false}
                        />
                    </View>
                    {this.refreshingElement()}
                </View>
            </SafeAreaView>
        );
    }

    // methods
    componentDidMount() {
        // this.loadHotMarketData();
        this.loadData(this.state.refreshCell);
    }


    // 请求热门市场数据
    // async loadHotMarketData() {
    //     try {
    //         await this.store.requestGetHotMarket(this.type).then(() => {
    //             this.loadData(this.state.refreshCell);
    //         });
    //     } catch (e) {
    //         Alert.alert(e.message);
    //     }
    // }

    // 请求商品类别数据
    async loadData(index) {
        this.updateFreshState(RefreshState.HeaderRefreshing);
        try {
            await this.store.requestData(index).then((data) => {
                if(data[0] && data[0].subItems && !data[0].subItems.length){
                    this.isTrue = false;
                }
                this.updateFreshState(RefreshState.Idle);
            });
        } catch (e) {
            this.updateFreshState(RefreshState.Idle);
            Alert.alert(e.message);
        }
    }

    //加载更多
    onLoadMore = () => {};

    //页面下拉刷新
    onHeadFresh = () => {
        // this.loadHotMarketData();
        this.loadData(this.state.refreshCell);
    };

    // 改状态
    updateFreshState = (state) => {
        this.setState({
            listFreshState: state,
        });
    };

    //点击左边滚动
    cellAction = (item) => {
        let orgCell = this.state.cell;
        // let refreshCell= 0;
        // if(item.type === 'hot'){
        //     this.store.changeSortItem(item.index,item.type);
        //     refreshCell = item.index;
        //     this.type = 'hot';
        // } else {
        //     this.store.changeSortItem(item.indexId,item.type);
        //     refreshCell = item.indexId;
        //     this.type = 'item';
        // }

        // this.setState({
        //     cell: item.index,
        //     refreshCell: refreshCell
        // });
        this.setState({
            cell: item.index,
            refreshCell: item.index
        });
        this.store.changeSortItem(item.indexId);

        // if(this.store.hotMarketData.length){
        if(this.store.getRightData.length){
            if(this.isTrue){
                // let height = 0;
                let height = 84;
                // if(orgCell !== 0){
                //     height = 84;
                // }
                this.sectionList.scrollToLocation({
                    sectionIndex: 0,
                    animated:false,
                    itemIndex: 0,
                    viewOffset: height,
                    viewPosition:0
                });
            }
            this.isTrue = true;
        } else{
            this.isTrue = false;
        }
        // }
    };

    // 分列跳转
    onClickGoStyleTow = (options) => {
        UserActionSvc.track('GOODS_SORT_TYPE');
        if(options){
            this.props.navigation.navigate('SearchGoodsListScreen', {classAccodeLike: options.accode, classAccodeName: options.name});
        } else {
            Alert.alert(options);
        }
    };

    //查看全部
    getAllItem =()=> {
        let index = this.state.cell;
        let objArray = this.store.getLeftData;
        let options = objArray[index];
        if(options){
            this.onClickGoStyleTow(options);
        }
    };

    //热门市场
    goToAllSort =(options)=> {
        if(options != undefined){
            let names = options.typeName;
            let accode = '';
            let cityCode = options.scMarket.cityCode;
            let marketId = options.typeId;
            this.props.navigation.navigate('SearchGoodsListScreen', {classAccodeLike: accode, classAccodeName: names, cityCode: cityCode,marketId: marketId});
        }
    }

}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },

    listContainer: {
        flexDirection: 'row',
        flex: 1,
    },

    listLeft: {
        height: 40,
        justifyContent: 'center'
    },

    listText: {
        height: 25,
        lineHeight: 25,
        textAlign: 'center',
        color: colors.greyFont,
    },

    listActive: {
        width: 5,
        height: 25,
        backgroundColor: colors.activeBtn,
        position: 'absolute',
        top: 0,
    },


    // fixedHeader
    fixedHeader: {
        flex: 1,
        height: 40,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        paddingLeft: 10,
        marginRight: 15,
    },

    fixedFoodName: {
        color: colors.normalFont,
        fontSize: fonts.font14,
        fontWeight: '600',
    },

    //右边list
    listRightContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'flex-start',
    },

    imgBox: {
        width: (WIDTH - 108 - 4 * 12) / 3,
        marginLeft: 12,
    },

    imgWith: {
        width: (WIDTH - 108 - 4 * 12) / 3,
        height: (WIDTH - 108 - 4 * 12) / 3,
    },

    textName: {
        fontSize: fonts.font12,
        color: colors.normalFont,
        textAlign: 'center',
        fontWeight: '600',
        height: 40,
        lineHeight: 40,
    },

    sectionItemImgBox: {
        height: 117,
        flex: 1,
        marginLeft: 12,
        marginRight: 12,
    },

    sectionItemImg: {
        width: '100%',
        height: 107,
        borderRadius: 4,
        position: 'relative',
        overflow: 'hidden',
    },

    sectionIImg: {
        width: '100%',
        height: 107,
    },

    sectionMask: {
        position: 'absolute',
        backgroundColor: colors.bgBlack,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.2,
        zIndex: 10,
    },

    sectionText: {
        position: 'absolute',
        top: 10,
        left: 10,
        zIndex: 15,
        fontSize: 18,
        color: colors.white,
    },

    leftBox: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    block: {
        width: 68,
        height: 20,
        marginTop: 34,
        backgroundColor: colors.white,
    },

    boxRight: {
        backgroundColor: colors.white,
        height: HEIGHT,
    },

    blockTop: {
        marginTop: 20,
        marginLeft: 10,
        marginRight: 10,
        height: 107,
        backgroundColor: colors.bg,
    },

    blockNei: {
        height: 107,
        flex: 1,
        borderRadius: 8
    }

});
