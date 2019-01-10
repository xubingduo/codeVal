/**
 *@author xbu
 *@date 2018/07/20
 *@desc 相同的搜索
 *
 */

import React, { Component } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    TextInput,
} from 'react-native';

import colors from '/gsresource/ui/colors';
import PropTypes from 'prop-types';
import SearchView from '../component/SearchView';

export default class CommonSearch extends Component{
    constructor(props){
        super(props);
        this.state={
            text: '',
        };
    }

    static propTypes = {
        placeholder: PropTypes.string,
        onTextChange: PropTypes.func,
        autoFocus: PropTypes.bool,
        onSubmitEditing: PropTypes.func,
        onClick: PropTypes.func,
        style: PropTypes.object,
    };

    render() {
        return(
            <View style={[styles.searchBox]}>
                <View style={styles.box}>
                    <SearchView
                        style={this.props.style}
                        hint={this.props.placeholder}
                        onTextChange={(e) => {
                            this.setState({
                                text: e
                            });
                        }}
                        onClick={() => {
                            this.props.onClick && this.props.onClick();
                        }}
                        isTextInput={false}
                        onSubmitEditing={()=>{
                            this.props.onSubmitEditing && this.props.onSubmitEditing(this.state.text);
                        }}
                    />


                    {this.renderInputClearImg()}
                </View>

                {/*<TouchableOpacity style={styles.searchMsg} onPress={() => {this.props.OnclickMsg();}}>*/}
                {/*<Image source={require('gsresource/img/msgDisable.png')}/>*/}
                {/*</TouchableOpacity>*/}
            </View>
        );
    }

    renderInputClearImg = () => {
        if (this.state.text) {
            return (
                <TouchableOpacity
                    hitSlop={{left: 10, right: 10, top: 10, bottom: 10}}
                    style={{marginRight: 16, marginLeft: 16}}
                    onPress={() => {
                        this.setState({text: ''});
                    }}
                >
                    <Image
                        source={require('gsresource/img/delete.png')}

                    />
                </TouchableOpacity>
            );
        }
    };
}


const styles = StyleSheet.create({
    searchBox: {
        flexDirection: 'row',
        height: 44,
        alignItems: 'center',
        paddingLeft: 15,
        paddingRight: 15,
        backgroundColor: colors.white,
    },

    box: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: colors.bg,
        alignItems: 'center',
        borderRadius: 4,
        justifyContent: 'space-between',
        flex: 1,
    },
});


