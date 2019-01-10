/**
 * author: wwj
 * Date: 2018/9/13
 * Time: 下午2:59
 * des:
 */
import React, { Component } from 'react';
import {
    StyleSheet,
    View,
    FlatList,
    Image,
    Dimensions,
    Text,
    TouchableOpacity,
    Platform
} from 'react-native';
import PropTypes from 'prop-types';
import { Popup } from '@ecool/react-native-ui';
import fonts from '../../../gsresource/ui/fonts';
import colors from '../../../gsresource/ui/colors';
import isIphoneX from 'utl/PhoneUtl';

const WIDTH = Dimensions.get('window').width;
const HEIGHT = isIphoneX() ? 234 : 200;
export default class SwitchUrlBottomSheet extends Component {
    static propTypes = {
        source: PropTypes.array.isRequired,
        title: PropTypes.string,
        checkedUrl: PropTypes.string,
        onItemSelected: PropTypes.func,
        onDismiss: PropTypes.func
    };

    static defaultProps = {
        onItemSelected: null
    };

    constructor(props) {
        super(props);
        this.state = { checkedUrl: this.props.checkedUrl };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({ checkedUrl: nextProps.checkedUrl });
    }

    show = () => {
        this.popup.show();
    };

    dismiss = () => {
        this.popup.dismiss();
    };

    render() {
        return (
            <Popup
                ref={popup => (this.popup = popup)}
                popupType={'1'}
                backgroundColor={colors.white}
                width={WIDTH}
                height={HEIGHT}
            >
                <View
                    style={{
                        flex: 1,
                        flexDirection: 'column',
                        backgroundColor: colors.white
                    }}
                >
                    <View
                        style={{
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <Text style={{ color: colors.greyFont }}>
                            {this.props.title}
                        </Text>
                    </View>
                    <View style={{ flexDirection: 'column' }}>
                        {this.props.source.map((item, index) => {
                            return this.renderOptionItem(item, index);
                        })}
                    </View>
                    <TouchableOpacity
                        style={{
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        onPress={this.dismiss}
                    >
                        <Text
                            style={{
                                fontSize: fonts.font14,
                                color: colors.greyFont
                            }}
                        >
                            取消
                        </Text>
                    </TouchableOpacity>
                </View>
            </Popup>
        );
    }

    renderOptionItem = (content, index) => {
        let isChecked = content.value === this.state.checkedUrl;
        return (
            <TouchableOpacity
                key={index}
                style={{
                    height: 60,
                    flexDirection: 'row',
                    alignItems: 'center'
                }}
                onPress={index => {
                    this.props.onItemSelected &&
                        this.props.onItemSelected(content.value);
                }}
            >
                <View style={{ marginLeft: 60, alignItems: 'center', flex: 1 }}>
                    <Text
                        style={
                            isChecked
                                ? styles.optionActiveItemText
                                : styles.optionItemText
                        }
                    >
                        {content.name}
                    </Text>
                </View>
                <View
                    style={{
                        height: 60,
                        width: 60,
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    {isChecked && (
                        <Image source={require('gsresource/img/check.png')} />
                    )}
                </View>
            </TouchableOpacity>
        );
    };
}

const styles = StyleSheet.create({
    optionItemText: {
        fontSize: fonts.font16,
        color: colors.normalFont
    },
    optionActiveItemText: {
        fontSize: fonts.font16,
        color: colors.activeFont
    }
});
