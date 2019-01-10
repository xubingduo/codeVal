/**
 * author: tuhui
 * Date: 2018/7/10
 * Time: 20:36
 * des:主页item
 */


import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Image from '../../component/Image';
import PropTypes from 'prop-types';
import fonts from '../../gsresource/ui/fonts';
import colors from '../../gsresource/ui/colors';
import {observer, inject} from 'mobx-react';
import {Keyboard} from 'react-native';

@inject('shoppingCartStore')
@observer
export default class TabItem extends Component {

    static propTypes = {
        index: PropTypes.number,
        text: PropTypes.string.isRequired,
        image: PropTypes.any.isRequired,
        checked: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        //this.keyboardWillShow = this.keyboardWillShow.bind(this);
        //this.keyboardWillHide = this.keyboardWillHide.bind(this);
        this.state = {
            isVisible: true
        };
    }

    componentDidMount() {
        //this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow);
        //this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide);
    }

    componentWillUnmount() {
        //this.keyboardWillShowSub.remove();
        //this.keyboardWillHideSub.remove();
    }

    keyboardWillShow = event => {
        this.setState({
            isVisible: false
        });
    };

    keyboardWillHide = event => {
        this.setState({
            isVisible: true
        });
    };

    render() {
        if (this.state.isVisible) {
            return (
                <View style={styles.container}>
                    <Image
                        source={this.props.image}
                    />

                    <Text
                        style={[styles.textStyle, this.props.checked ? {color: colors.activeFont} : {color: colors.normalFont}]}
                    >
                        {this.props.text}
                    </Text>

                    {
                        this.props.shoppingCartStore.getAllCountShow !== '0' && this.props.index === 3 &&
                        <View style={{
                            paddingTop: 1,
                            paddingBottom: 1,
                            paddingLeft: 3,
                            paddingRight: 3,
                            borderRadius: 20,
                            position: 'absolute', right: -4, top: 1, backgroundColor: colors.activeBtn
                        }}
                        >
                            <Text style={{
                                color: colors.white,
                                fontSize: fonts.font10
                            }}
                            >{this.props.shoppingCartStore.getAllCountShow}</Text>
                        </View>
                    }

                </View>
            );
        } else {
            return null;
        }

    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    textStyle: {
        marginTop: 6,
        fontSize: fonts.font11
    }
});