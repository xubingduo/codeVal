/**
 * @author sml2
 * @date 2018/11/16
 * @desc 搜索反馈
 * @flow
 */
import React, { Component } from 'react';
import { View, Text, SafeAreaView,TouchableOpacity,StyleSheet,TextInput,Keyboard,ScrollView } from 'react-native';
import NavigationHeader from 'component/NavigationHeader';
import colors from 'gsresource/ui/colors';
import RemarkView from 'component/RemarkView';
import ConfigListDictApiManager from 'apiManager/ConfigListDictApiManager';
import {Toast} from '@ecool/react-native-ui';
import Alert from 'component/Alert';
import SearchApiManager from '../../apiManager/SearchApiManager';

type Prop = {
    navigation: Object,
};

type State = {
    content: string,
    items: Array<{title: string,selected: boolean}>
}

type FeedBackItemType = {
    title: string,
    codeValue: number,
    id: number,
    selected: boolean,
}

export default class SearchFeedBackScreen extends Component<Prop,State> {
    state: State;

    inputRef: Object;

    static navigationOptions = ({navigation}: Object) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'搜索反馈'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    constructor(props: Prop) {
        super(props);
        this.state = {
            content:'',
            items:[],
        };
    }

    componentDidMount() {
        this.fetchLabels();
        if(this.inputRef){
            this.inputRef.focus();
        }
    }
    
    /**
     * 加载设定的标签
     */
    fetchLabels = ()=>{
        ConfigListDictApiManager.fetchSearchFeedbackLabels().then((result)=>{
            let rows = result.data && result.data.rows ? result.data.rows : [];
            let items = rows.map((row)=>{
                let item = {};
                item.selected = false;
                item.codeValue = row.codeValue;
                item.title = row.codeName;
                item.id = row.id;
                return item;
            });
            this.setState({
                items: items,
            });
        }).catch((error)=>{
            Alert.alert(error.message);
        });
    }

    onCinfromClick = ()=>{
        const searchKeyWords = this.props.navigation.getParam('keyWord', '');
        let selectedItem;
        for(let i = 0;i < this.state.items.length;i++){
            let row = this.state.items[i];
            if(row.selected){
                selectedItem = row;
            }
        }
        if(!selectedItem){
            Toast.show('请选择一个反馈标签',2);
            return;
        }
        Toast.loading();
        SearchApiManager.submitSearchFeedback({
            jsonParam:{
                typeIds:selectedItem.codeValue,
                rem:this.state.content,
                searchKeyWords
            },
        }).then(()=>{
            Toast.success('提交成功',2);
            this.props.navigation.goBack();
        }).catch((error)=>{
            Toast.dismiss();
            Alert.alert(error.message);
        });
    }

    onInputTextChanged = (text: string)=>{
        this.setState({
            content:text,
        });
    }

    onSelectBtnClick = (item: {title: string,selected: boolean})=>{
        let items = this.state.items;
        for(let i = 0;i < items.length;i++){
            let row = items[i];
            row.selected = false;
        }
        item.selected = true;
        this.setState({
            items:items,
        });
    }

    render(){
        return(
            <SafeAreaView style={styles.container}>
                <ScrollView
                    keyboardDismissMode={'on-drag'}
                    style={styles.container}
                >
                    <View style={styles.selectBtnContainer}>
                        {this.state.items.map((item,index)=>{
                            let textBgBorderColor = item.selected ? colors.activeBtn : colors.greyFont;
                            let textBgColor = item.selected ? colors.activeBtn : colors.bg;
                            let textColor = item.selected ? 'white' : colors.greyFont;
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[styles.selectTouch,{borderColor:textBgBorderColor,backgroundColor:textBgColor}]}
                                    onPress={()=>{
                                        this.onSelectBtnClick(item);
                                    }}
                                >
                                    <Text style={[styles.selectBtnText,{color:textColor}]}>{item.title}</Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                    <View style={styles.inputContainer}>
                        <RemarkView
                            inputRef={(ref)=>{
                                this.inputRef = ref;
                            }}
                            placeholder={'填写对搜索的意见补充'}
                            value={this.state.content}
                            onChangeText={this.onInputTextChanged}
                        />
                    </View>
                </ScrollView>
                <TouchableOpacity
                    style={styles.comfirmTouch}
                    onPress={this.onCinfromClick}
                >
                    <Text style={{fontSize:14, color:'white'}}>提交</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

}


const styles = StyleSheet.create({
    container: {
        flex:1,
        backgroundColor:colors.bg,
    },
    comfirmTouch:{
        height:49,
        backgroundColor:colors.activeBtn,
        alignItems:'center',
        justifyContent:'center',
    },
    selectBtnText:{
        padding:2,
        paddingLeft:10,
        paddingRight:10,
        fontSize:14,
    },
    selectTouch:{
        borderWidth:1,
        marginBottom:15,
        marginRight:8,
    },
    selectBtnContainer:{
        flexDirection:'row',
        flexWrap:'wrap',
        paddingLeft:12,
        paddingRight:10,
        paddingTop:20,
        marginBottom: 20,
        backgroundColor: colors.white
    },
    inputContainer:{
        backgroundColor:'white',
        height:120,
        width:'100%'
    }
});
