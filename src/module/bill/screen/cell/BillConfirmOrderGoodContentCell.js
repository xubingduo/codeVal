/**
 * @author sml2
 * @date 2018/11/27.
 * @desc 店铺信息+货品SKU列表
 * @flow
 */
import React, {Component} from 'react';
import {View, Text, StyleSheet} from 'react-native';
import Image from 'component/Image';
import colors from 'gsresource/ui/colors';
import DocSvc from 'svc/DocSvc';
import NP from 'number-precision';
import {Observer, observer} from 'mobx-react';
import type {BillConfirmOrderGoodsSpuType} from '../../model/BillConfirmCellItemType';
import type {SKUType} from 'module/model/ShoppingCartModel';

const GROUP_CHILD = 2; // 童装按组模式

type Props = {
    spu: BillConfirmOrderGoodsSpuType,
}

const BillConfirmOrderGoodContentCell = (props: Props)=> {

    /**
     * 转换成童装数据
     */
    function convertChildGroupItems(skuItems: Array<SKUType>){
        let tmpItems: Array<any> = [];
        let index = -1;
        skuItems.forEach((sku: SKUType) => {
            let _skuItem = tmpItems[index];
            if (_skuItem && _skuItem.hasOwnProperty('spec2Name') && _skuItem.spec2Name === sku.spec2Name) {
                _skuItem.spec1.push({code: sku.spec1, value: sku.spec1Name});
                _skuItem.count++;
            } else {
                _skuItem = {};
                _skuItem.spec2Name = sku.spec2Name;
                _skuItem.spec1 = [{code: sku.spec1, value: sku.spec1Name}];
                _skuItem.skuPrice = sku.skuPrice;
                _skuItem.groupNum = sku.skuNum; // 组数
                _skuItem.count = 1; // 每组件数
                tmpItems[++index] = _skuItem;
            }
        });
        tmpItems.forEach((sku: Object) => {
            sku.skuNum = sku.groupNum * sku.count; // 总数
            // 天知道为什么尺码顺序不对，手动排个序
            sku.spec1.sort((a, b) => {
                return a.code - b.code;
            });
            // 显示的尺码名称
            if (sku.count === 1) {
                sku.spec1Name = sku.spec1[0].value;
            } else {
                sku.spec1Name = `${sku.spec1[0].value}-${sku.spec1[sku.count - 1].value}`;
            }
        });
        return tmpItems;
    }

    function renderGoodTitleView(){
        let row = props.spu;
        return (
            <View style={styles.titleView}>
                <View style={{width: 70, height: 70}}>
                    <Image
                        style={{width: '100%', height: '100%'}}
                        defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                        source={{uri: row.spuList && row.spuList.length > 0 ? DocSvc.docURLL(row.spuList.split(',')[0]) : ''}}
                    />
                </View>
                <View style={styles.goodTitleTextContainer}>
                    <View style={{flex: 1}}>
                        <Text style={{fontSize: 14, color: colors.normalFont}} numberOfLines={2}>{row.title}</Text>
                    </View>
                </View>
            </View>
        );
    }

    function renderTextLineView(subItem: SKUType, isChildGroup: boolean) {
        let items = [
            subItem.spec2Name,
            subItem.spec1Name,
            subItem.skuPrice,
            subItem.skuNum,
            (NP.times(subItem.skuPrice, subItem.skuNum)),
        ];
        if (isChildGroup) {
            // 童装
            items.splice(3, 0, subItem.groupNum);
        }
        return (
            <View style={{flexDirection: 'row', height: 30}}>
                {items.map((item, index) => {
                    return (
                        <View key={index} style={styles.textLineItemView}>
                            <Text style={{fontSize: 10, color: colors.normalFont}}>
                                {index === 2 || index === 4 ? '¥' + item : item}
                            </Text>
                        </View>
                    );
                })}
            </View>
        );
    }

    let spuRow = props.spu;
    // 标题栏
    let titleItems = ['颜色','尺码','单价','数量','价格'];
    // skus
    let skuItems = spuRow && spuRow.data ? spuRow.data : [];
    // 是否童装
    let isChildGroup = spuRow && spuRow.salesWayId === GROUP_CHILD;
    if (isChildGroup) {
        titleItems.splice(3, 0, '组数');
        // 童装需要转换数据结构
        skuItems = convertChildGroupItems(skuItems);
    }
    return (
        <View style={styles.container}>
            {renderGoodTitleView()}
            <View style={styles.titleItemsContainer}>
                <View style={styles.titleItemContent}>
                    {titleItems.map((item, index) => {
                        return (
                            <View key={index} style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                                <Text style={{fontSize: 10, color: colors.greyFont}}>{item}</Text>
                            </View>
                        );
                    })}
                </View>
                {skuItems.map((subItem, index) => {
                    return (
                        <View key={index} style={{backgroundColor: index % 2 === 0 ? colors.white : colors.evaluateBg}}>
                            {renderTextLineView(subItem, isChildGroup)}
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default observer(BillConfirmOrderGoodContentCell);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleView: {
        height: 86,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 20,
        paddingRight: 20
    },
    goodTitleTextContainer: {
        height: 70,
        justifyContent: 'space-between',
        flex: 1,
        marginLeft: 8
    },
    textLineItemView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleItemsContainer: {
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: 'white'
    },
    titleItemContent: {
        flexDirection: 'row',
        backgroundColor: colors.bg,
        paddingTop: 6,
        paddingBottom: 6
    },
});
