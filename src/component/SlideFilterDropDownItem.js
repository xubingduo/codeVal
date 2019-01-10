/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2017-12-07 08:54:31
 * @desc [侧滑赛筛选的下拉组件]
 */
import React, { Component } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableHighlight,
    Dimensions,
    UIManager
} from 'react-native';
import PropTypes from 'prop-types';
import ModalDropdown from 'react-native-modal-dropdown';
import fonts from '../gsresource/ui/fonts';

const WINDOW_HEIGHT = Dimensions.get('window').height;
const DEFAULT_CONTAINER_MIN_HEIGHT = 120;

export default class SlideFilterDropDownItem extends Component {

    static propTypes = {
        // 数据源
        datas: PropTypes.arrayOf(PropTypes.object).isRequired,
        // 默认选中 当传入为number的时候当索引处理 当传入为string的的当title处理 默认为 0
        defaultSelected: PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.string
        ]),
        // 当数据发生改变的的时候的回调
        onSelectedChanged: PropTypes.func,
    }

    static defaultProps = {
        datas: [],
        defaultSelected: 0,
    }

    constructor(props) {
        super(props);

        this.state = {
            contentMaxHeight: WINDOW_HEIGHT
        };
    }

    measurePosition = (e) => {
        UIManager.measure(e.target, (x, y, width, height, left, top) => {
            this.setState({
                contentMaxHeight: WINDOW_HEIGHT - top - height - 40
            });
        });
    }

    onSelect = (index) => {
        if (this.props.onSelectedChanged) {
            this.props.onSelectedChanged(parseInt(index));
        }
    }

    render() {
        // 获取默认选中
        let currSelectedIndex = 0;
        if (typeof this.props.defaultSelected == 'number') {
            currSelectedIndex = this.props.defaultSelected;
        } else {
            currSelectedIndex = this.props.datas.indexOf(this.props.defaultSelected);
            currSelectedIndex !== -1 ? currSelectedIndex : 0;
        }

        // 转换数据成组件可以识别的数据
        let datas = this.props.datas.map((data) => {
            return data.title;
        });
        let dropdownHeight = datas.length * 36;
        dropdownHeight = Math.max(DEFAULT_CONTAINER_MIN_HEIGHT, Math.min(this.state.contentMaxHeight, dropdownHeight));

        return (
            <View
                style={styles.containerWrap}
                onLayout={this.measurePosition}
            >
                <TouchableHighlight style={{ flex: 1 }}>
                    <View style={styles.contentWrap}>
                        <View style={styles.textWrap}>
                            <ModalDropdown
                                // style={styles.textWrap}
                                dropdownStyle={[styles.dropdownStyle, { height: dropdownHeight }]}
                                dropdownTextStyle={styles.dropdownTextStyle}
                                options={datas}
                                defaultValue={datas[currSelectedIndex]}
                                onSelect={this.onSelect}
                            >
                                <View style={styles.textWrap}>
                                    <Text
                                        style={styles.text}
                                        numberOfLines={1}
                                    >
                                        {datas[currSelectedIndex]}
                                    </Text>
                                </View>
                            </ModalDropdown>
                        </View>
                        <Image
                            source={require('gsresource/img/arrowBottom.png')}
                        />
                    </View>
                </TouchableHighlight>

            </View>
        );
    }
}

const styles = StyleSheet.create({
    containerWrap: {
        width: 140,
        height: 36,
        margin: 9,
        backgroundColor: '#eeeeee',
    },

    contentWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        // justifyContent: 'space-around',
    },

    textWrap: {
        width: 100,
        height: 26,
        backgroundColor: '#fff',
        marginLeft: 5,
        marginRight: 15,
        flexDirection: 'row',
        alignItems: 'center',
    },

    text: {
        fontSize: fonts.font14,
        color: '#3d4245',
        alignSelf: 'center',
        width: '90%',
        backgroundColor: 'transparent'
    },

    dropdownStyle: {
        backgroundColor: 'rgba(74,74,74,0.9)',
        width: 100,
        height: 40,
    },

    dropdownTextStyle: {
        backgroundColor: 'rgba(74,74,74,0.9)',
        fontSize: fonts.font14,
        color: '#fff',
    }
});
