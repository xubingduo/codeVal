/**
 * author: wwj
 * Date: 2018/11/28
 * Time: 上午9:21
 * des:
 */

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    View,
    TouchableWithoutFeedback,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput
} from 'react-native';
import { GridView } from '@ecool/react-native-ui';
import {Toast} from '@ecool/react-native-ui';
import fonts from '../gsresource/ui/fonts';
import colors from '../gsresource/ui/colors';
import * as _ from 'lodash';
import NumberUtl from '../utl/NumberUtl';

const MIN_PRICE = '0';
const MAX_PRICE = '-1'; // 返回-1时 即没有最大价格

export default class SlideFilterPriceItem extends Component<any> {

    static propTypes = {
        title: PropTypes.string,
        // 选中的结果改变
        onSelectChanged: PropTypes.func,
        // 默认选中
        defaultSelectedItems: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.number])),
        // 数据
        datas: PropTypes.arrayOf(PropTypes.object).isRequired,
        // 每行列数
        numberOFCol: PropTypes.number,
    };

    static defaultPropTypes = {
        defaultSelectedItems: [],
        numberOFCol: 3,
        onSelectChanged: () => null,
    };

    constructor(props) {
        super(props);
        this.lowPrice = '';
        this.heightPrice = '';
    }

    componentDidMount() {

    }

    onItemDidSelected = (item, custom) => {
        const { datas, onSelectChanged, defaultSelectedItems } = this.props;

        let isSelected = false;
        let selectedIndex = -1;
        defaultSelectedItems.forEach((curr, index) => {
            let innerItem = curr;
            if (typeof curr === 'number') {
                innerItem = datas[curr];
            }
            if (innerItem === item || innerItem.typeValue === item.typeValue) {
                isSelected = true;
                selectedIndex = index;
            }
        });
        let currSelectedItems = defaultSelectedItems;

        if (isSelected === false) {
            currSelectedItems = [item];
        } else {
            currSelectedItems.splice(selectedIndex, 1);
        }
        // 自定义的价格 不在现有选项之中
        if (custom) {
            currSelectedItems = [item];
        }

        if (onSelectChanged) {
            onSelectChanged(currSelectedItems);
        }
    };

    initDefaultCustomPrice = () => {
        const { datas, defaultSelectedItems } = this.props;
        let hasCustomPrice = true;
        // 有上次选的价格
        if (defaultSelectedItems && defaultSelectedItems.length > 0) {
            // 判断是否是自定义的价格区间
            let lastPriceValue = defaultSelectedItems[0].typeValue;
            for(let i=0; i<datas.length; i++){
                if (datas[i].typeValue === lastPriceValue) {
                    // 上次的价格是选项中的 则不填充自定义区间价格
                    hasCustomPrice = false;
                    break;
                }
            }
            let priceRange = _.split(lastPriceValue, ',');
            if (hasCustomPrice && priceRange.length > 1) {
                this.lowPrice = priceRange[0];
                this.heightPrice = priceRange[1] === '-1' ? '' : priceRange[1];
            } else {
                this.lowPrice = '';
                this.heightPrice = '';
            }
        } else {
            this.lowPrice = '';
            this.heightPrice = '';
        }
    };

    onLowPriceChanged = (text) => {
        if(!NumberUtl.isNumber(text)){
            return;
        }
        this.lowPrice = text;
        if (!text) {
            text = '';
        }
        let item = {
            typeValue: text + ',' + (this.heightPrice ? this.heightPrice : MAX_PRICE)
        };
        this.onItemDidSelected(item, true);
    };

    onHeightPriceChanged = (text) => {
        if(!NumberUtl.isNumber(text)){
            return;
        }
        this.heightPrice = text;
        if (!text) {
            text = MAX_PRICE;
        }
        let item = {
            typeValue: (this.lowPrice ? this.lowPrice : MIN_PRICE) + ',' + text
        };
        this.onItemDidSelected(item, true);
    };

    /**
     * 渲染标题
     */
    renderTitle = (title) => {
        return (
            <View style={styles.itemTitleWrap}>
                <Text style={styles.itemTitleText}>{title}</Text>
            </View>
        );
    };

    /**
     * 渲染每个Item
     */
    renderItem = (item) => {
        const { datas, defaultSelectedItems } = this.props;
        let isSelected = false;
        defaultSelectedItems.forEach((curr) => {
            let innerItem = curr;
            if (typeof curr === 'number') {
                innerItem = datas[curr];
            }
            if (innerItem === item || innerItem.typeValue === item.typeValue) {
                isSelected = true;
            }
        });

        return (
            <TouchableWithoutFeedback onPress={() => this.onItemDidSelected(item)}>
                <View style={[isSelected ? styles.itemSelectedWrap : styles.itemNormalWrap, {width: this.GRIDITEM_WIDTH}]}>
                    <Text style={isSelected ? styles.itemTextSelected : styles.itemTextNormal} numberOfLines={1}>{item.typeName}</Text>
                </View>
            </TouchableWithoutFeedback>
        );
    };

    renderInput = () => {
        this.initDefaultCustomPrice();
        return (
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.inputWrap}
                    placeholder={'最低价'}
                    placeholderTextColor={colors.unEnable}
                    keyboardType='numeric'
                    underlineColorAndroid='transparent'
                    value={this.lowPrice}
                    onChangeText={(text) => {
                        this.onLowPriceChanged(text);
                    }}
                />
                <Text style={{textAlign: 'center'}}>{'—'}</Text>
                <TextInput
                    style={styles.inputWrap}
                    placeholder={'最高价'}
                    placeholderTextColor={colors.unEnable}
                    keyboardType='numeric'
                    underlineColorAndroid='transparent'
                    value={this.heightPrice}
                    onChangeText={(text) => {
                        this.onHeightPriceChanged(text);
                    }}
                />
            </View>
        );
    };

    render() {
        const { datas, title } = this.props;
        return (
            <View>
                {this.renderTitle(title)}
                <GridView
                    itemEnable={false}
                    numberOFCol={3}
                    itemMarging={18}
                    items={datas}
                    renderItem={this.renderItem}
                    containerWidth={300}
                    customItemStyle={{height: 30}}
                />
                {this.renderInput()}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    itemTitleWrap: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 18,
        marginRight: 18,
        justifyContent: 'space-between',
    },

    itemTitleText: {
        fontSize: fonts.font14,
        color: '#9b9b9b',
    },

    itemNormalWrap: {
        flex: 1,
        width: 115,
        backgroundColor: '#eeeeee',
        justifyContent: 'center',
        alignContent: 'center',
    },

    itemSelectedWrap: {
        flex: 1,
        width: 115,
        backgroundColor: '#ff6699',
        justifyContent: 'center',
    },

    itemTextNormal: {
        fontSize: fonts.font12,
        color: '#3d4245',
        textAlign: 'center',
    },

    itemTextSelected: {
        fontSize: fonts.font12,
        color: '#ffffff',
        textAlign: 'center',
    },

    inputContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignContent: 'center',
        alignItems: 'center',
        marginLeft: 18,
        marginRight: 18,
    },

    inputWrap: {
        paddingTop: 5,
        paddingBottom: 5,
        width: 115,
        backgroundColor: '#eeeeee',
        justifyContent: 'center',
        alignContent: 'center',
        textAlign: 'center',
        fontSize: fonts.font12,
    },
});