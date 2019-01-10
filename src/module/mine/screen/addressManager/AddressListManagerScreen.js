import React, {Component} from 'react';
import {
    StyleSheet, View, SafeAreaView,
    TouchableOpacity, Text, Image, Alert,
    Dimensions, Platform, NativeModules,
} from 'react-native';
import {DLFlatList} from '@ecool/react-native-ui';
import {observer} from 'mobx-react';
import colors from '../../../../gsresource/ui/colors';
import fonts from '../../../../gsresource/ui/fonts';
import I18n from '../../../../gsresource/string/i18n';
import {RefreshState} from '@ecool/react-native-ui/lib/fresh';
import AddressListStore from '../../store/address/AddressListStore';
import AddressCell from '../../widget/addressManager/AddressCell';
import ImageButton from '../../../../component/ImageButton';
import TextButton from '../../../../component/TextButton';
import * as _ from 'lodash';
import ColorOnlyNavigationHeader from '../../../../component/ColorOnlyNavigationHeader';
import {Toast} from '@ecool/react-native-ui';
import ConfirmAlert from 'component/ConfirmAlert';
import UserActionSvc from 'svc/UserActionSvc';


/**
 *                screenMode: number = 1:管理地址模式  2:选择地址
 *                selectedId: number = 已经被选中的地址的id
 *            onSelectCallback: func = 当为选择地址模式时， 选中地址后的回调
 *  onSelectAddrDeleteCallback: func = 当选择地址模式时， 确认订单中的地址被删除后的回调
 */
@observer
export default class AddressListManagerScreen extends Component {
    static navigationOptions = ({navigation}) => {
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
        this.addressStore = new AddressListStore();
        this.state = {
            isEdited: false,
            listFreshState: RefreshState.Idle,
            screenMode: 1,
        };

    }

    componentWillMount() {
        this.setState({
            screenMode: this.props.navigation.getParam('screenMode', 1)
        });

        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageStart('收货地址列表');
        }
    }

    componentDidMount() {
        // this.beforeMount();
        if (this.state.screenMode === 2) {
            this.selectedId = this.props.navigation.getParam('selectedId', -1);
            this.queryListAndSelectDefaultAddr(this.props.navigation.getParam('selectedId', -1));
        } else {
            this.onHeadFresh();
        }
    }

    componentWillUnmount() {
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageEnd('收货地址列表');
        }
    }

    render(){
        return(
            <SafeAreaView style={styles.container}>
                {this.renderHeader()}
                <DLFlatList
                    style={{flex: 1}}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item})=>this.renderAddressItem({item})}
                    refreshState={this.state.listFreshState}
                    data={this.addressStore.getAddressList}
                    onHeaderRefresh={this.onHeadFresh}
                />
                {this.renderBottomButton()}
            </SafeAreaView>
        );
    }

    renderHeader = () => {
        return (
            <View
                style={styles.headerContainer}
            >
                <ImageButton
                    hitSlop={{left: 16, right: 16, top: 16, bottom: 16}}
                    onClick={()=>{
                        this.props.navigation.goBack();
                    }}
                    style={{marginRight: 8}}
                    source={require('gsresource/img/arrowLeftGrey.png')}
                />
                <Text
                    style={{fontSize: fonts.font18, color: colors.normalFont}}
                >
                    {this.state.screenMode === 2 ? I18n.t('receiveAddressSelect') : I18n.t('receiveAddressManager')}
                </Text>
                <TextButton
                    textStyle={this.state.isEdited? {color: colors.activeFont} : {color: colors.normalFont}}
                    text={this.state.isEdited ? '完成':'编辑'}
                    onPress={this.edit}
                />
            </View>
        );
    };

    /**
     * 
     * @param item
     * @returns {*}
     */
    renderAddressItem = ({item}) => {
        return (
            <AddressCell
                item = {item}
                screenMode={this.state.screenMode}
                onAddressItemCheck={(checked, itemId) => {
                    this.addressStore.updateCheckStatus(checked, itemId);
                }}
                onAddressItemSelect={(selected, itemId) => {
                    this.addressStore.updateSelectedStatus(selected, itemId);
                    this.goBackWithSelectedAddr();
                }}
                onAddressEditClick={(item) => {
                    this.props.navigation.navigate('EditAddressScreen', {
                        'id': item.recInfo.id,
                        isAdd: false,
                        saveCallback: this.state.screenMode === 1 ? this.onUpdateAddrCallback : this.onUpdateAddrAndUseCallback,
                        screenMode: this.state.screenMode,
                        onDeleteAddrCallback: this.onDeleteAddrCallback,
                    });
                }}
                isEdited={this.state.isEdited}
            />
        );
    };

    renderBottomButton = () => {
        // 编辑状态 按钮为 删除
        if (this.state.isEdited) {
            return (
                <TouchableOpacity
                    style={[
                        styles.bottomDeleteButton,
                        this.addressStore.isAnyAddrSelected
                            ? {backgroundColor: colors.activeBtn}
                            : {backgroundColor: colors.greyFont}
                    ]}
                    disabled={!this.addressStore.isAnyAddrSelected}
                    onPress={this.deleteAddress}
                >
                    <Text style={{fontSize: fonts.font14, color: colors.white}}>{I18n.t('delete')}</Text>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity
                    style={styles.bottomAddButton}
                    onPress={this.openAddAddress}
                >
                    <Text style={{fontSize: fonts.font14, color: colors.white}}>新建</Text>
                </TouchableOpacity>
            );
        }
    }

    /**
     * 跳转新增或修改地址界面
     */
    openAddAddress = () => {
        this.props.navigation.navigate('EditAddressScreen', {
            'isAdd': true,
            'saveCallback': this.state.screenMode === 1 ? this.onUpdateAddrCallback : this.onUpdateAddrAndUseCallback,
            'screenMode': this.state.screenMode,
            'onDeleteAddrCallback': this.onDeleteAddrCallback,
        });
    };

    /**
     * 批量删除地址
     */
    deleteAddress = () => {
        ConfirmAlert.alert('是否删除地址?', '', () => {
            Toast.loading();
            this.addressStore.batchDeleteAddr((ret, ext) =>{
                if (ret) {
                    UserActionSvc.track('USER_ADDRESS_DELETE');
                    this.addressStore.queryAddressList((ret, ext) => {
                    });
                    // 判断是否将确认订单中的地址删除
                    if (this.state.screenMode === 2 && this.selectedId !== -1) {
                        // 将删除的ids进行分割
                        if (ext) {
                            let idList = _.split(ext, ',');
                            if(_.indexOf(idList, this.selectedId.toString()) !== -1 && this.props.navigation.state.params.onSelectAddrDeleteCallback){
                                // 确认订单中的地址被删除回调
                                this.props.navigation.state.params.onSelectAddrDeleteCallback(true);
                            }
                        }
                    }
                    Toast.success('删除成功');
                } else {
                    Toast.show(ext);
                }
            });
        });
    };

    /**
     * 编辑
     */
    edit = () => {
        this.setState({
            isEdited: !this.state.isEdited,
        });
    };

    /**
     * 请求地址列表 并且选中一个地址 (选择地址模式时使用)
     */
    queryListAndSelectDefaultAddr = (selectedId) => {
        this.addressStore.queryAddressList((ret, ext) => {
            if (ret) {
                this.addressStore.setSelectedAddr(selectedId);
            }
        });
    };

    /**
     * 编辑地址界面 删除地址的回调
     */
    onDeleteAddrCallback = (deleteAddrId) => {
        this.addressStore.queryAddressList((ret, ext) => {
        });
        // 判断是否将确认订单中的地址删除
        if(deleteAddrId && deleteAddrId === this.selectedId && this.props.navigation.state.params.onSelectAddrDeleteCallback){
            // 确认订单中的地址被删除回调
            this.props.navigation.state.params.onSelectAddrDeleteCallback(true);
        }
    };

    /**
     * 新增地址或保存地址后 的回调函数
     */
    onUpdateAddrCallback = () => {
        this.addressStore.queryAddressList((ret, ext) => {
        });
    };

    /**
     * 新增地址或保存后直接使用该地址的回调函数
     * @param addrDetail
     */
    onUpdateAddrAndUseCallback = (addrDetail) => {
        this.goBackWithSelectedAddr(addrDetail, true);
    };

    /**
     * 选择地址后返回 , 是否为新增的地址
     * isAddAddress 如果是新增地址 返回确认订单页面需要判断是否要弹出设置默认地址界面
     */
    goBackWithSelectedAddr = (selectedAddr, isAddAddress) => {
        if (!selectedAddr) {
            isAddAddress = false;
            for(let i=0; i< this.addressStore.allAddressList.length; i++){
                if (this.addressStore.allAddressList[i].selected) {
                    selectedAddr = this.addressStore.allAddressList[i];
                    break;
                }
            }
        }
        this.props.navigation.goBack();
        if (selectedAddr && this.props.navigation.state.params.onSelectCallback) {
            this.props.navigation.state.params.onSelectCallback(selectedAddr, isAddAddress);
        }
    };

    onHeadFresh = () => {
        this.setState({
            listFreshState: RefreshState.HeaderRefreshing,
        });
        this.addressStore.queryAddressList((ret, ext)=> {
            if (!ret) {
                Toast.show(ext);
            }
            this.setState({
                listFreshState: RefreshState.Idle,
            });
        });
    }
}

const styles = StyleSheet.create({
    container:{
        flex: 1,
    },
    headerContainer: {
        width: Dimensions.get('window').width,
        height: 40,
        backgroundColor: colors.white,
        flexDirection: 'row',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderColor: '#d8d8d8',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 12,
        paddingRight: 4,
    },
    bottomAddButton: {
        backgroundColor: colors.activeBtn,
        alignItems: 'center',
        height: 45,
        justifyContent: 'center',
    },
    bottomDeleteButton: {
        backgroundColor: colors.greyFont,
        alignItems: 'center',
        height: 45,
        justifyContent: 'center'
    }
});