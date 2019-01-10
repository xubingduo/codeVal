import React, {Component} from 'react';
import {StyleSheet, View, Image, Text, Alert, TouchableOpacity} from 'react-native';
import colors from '../../../../gsresource/ui/colors';
import fonts from '../../../../gsresource/ui/fonts';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import ImageButton from '../../../../component/ImageButton';


@observer
export default class AddressCell extends Component {

    static propsType = {
        item: PropTypes.object,
        screenMode: PropTypes.number,
        isEdited: PropTypes.bool.isRequired,
        // 选择地址时的监听
        onAddressItemSelect: PropTypes.func,
        // 编辑时item被选中监听
        onAddressItemCheck: PropTypes.func,
        // 点击item中的编辑icon时监听
        onAddressEditClick: PropTypes.func,
    };

    static defaultProps = {
        isEdited: false,
    };

    constructor(props) {
        super(props);
    }

    render(){
        let {item} = this.props;
        let {recInfo, address} = item;
        return(
            <TouchableOpacity
                style={styles.container}
                onPress={() => {
                    if (this.props.isEdited && this.props.onAddressItemCheck) {
                        this.props.onAddressItemCheck(!item.checked, recInfo.id);
                    }
                    // 选择地址
                    if (this.props.screenMode === 2 && this.props.onAddressItemSelect && !this.props.isEdited) {
                        this.props.onAddressItemSelect(true, recInfo.id);
                    }
                }}
            >
                {this.renderEditCheckbox({item})}
                <View style={styles.addressDetailContainer}>
                    <View style={styles.addressTop}>
                        <Text style={[styles.commonText, {fontSize: fonts.font18, maxWidth: 200}]}>{recInfo.linkMan}</Text>
                        <Text style={[styles.commonText, {fontSize: fonts.font14, marginLeft: 14}]}>{recInfo.telephone}</Text>
                        {this.showDefaultAddr()}
                    </View>
                    <Text style={[styles.commonText, {marginTop: 6}]}>{this.getAddress(address)}</Text>
                    <Text style={[styles.commonText, {marginTop: 6}]}>{address.detailAddr}</Text>
                </View>
                {this.renderEditView(item)}
                {this.renderSelectedAddrCheckbox(item)}
            </TouchableOpacity>
        );
    }

    /**
     * 编辑出现的checkbox
     */
    renderEditCheckbox = ({item}) => {
        if (this.props.isEdited) {
            return (
                <Image
                    style={styles.editCheckbox}
                    source={item.checked ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                />
            );
        }
    };

    /**
     * 编辑地址view
     */
    renderEditView = (item) => {
        if (this.props.screenMode !== 2 || (this.props.screenMode === 2 && this.props.isEdited)) {
            return (
                <ImageButton
                    hitSlop={{left: 20, right: 20, top: 20, bottom: 20}}
                    source={require('gsresource/img/addrEdit.png')}
                    onClick={() => {
                        if (this.props.onAddressEditClick) {
                            this.props.onAddressEditClick(item);
                        }
                    }}
                />
            );
        }
    };

    showDefaultAddr = () => {
        if (this.props.item.recInfo.isDefault === 1) {
            return (
                <View
                    style={styles.defaultTextView}
                >
                    <Text style={{fontSize: fonts.font12, color: colors.activeFont}}>默认</Text>
                </View>
            );
        }
    };

    renderSelectedAddrCheckbox = (item) => {
        if (this.props.screenMode === 2 && !this.props.isEdited) {
            return (
                <Image
                    source={item.selected ? require('gsresource/img/check.png') : require('gsresource/img/unCheck.png')}
                />
            );
        }
    };

    getAddress = (address) => {
        let {ecCaption} = address;
        return ecCaption.provinceCode +' '+ ecCaption.cityCode +' '+ ecCaption.countyCode +' '+ ecCaption.townCode;
    };
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 12,
        alignItems: 'center',
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.bg,
    },
    editCheckbox: {
        marginRight: 20
    },
    commonText: {
        fontSize: fonts.font12,
        color: colors.normalFont,
    },
    addressDetailContainer: {
        flex: 1,
        flexDirection: 'column',
        marginLeft: 0,
    },
    addressTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    defaultTextView: {
        paddingLeft: 4,
        paddingRight: 4,
        paddingTop: 2,
        paddingBottom: 2,
        borderWidth: 1,
        borderColor: colors.activeBtn,
        borderRadius: 2,
        marginLeft: 7,
    }
});