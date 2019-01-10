/**
 * author: tuhui
 * Date: 2018/7/18
 * Time: 11:16
 * des:
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    View,
    SectionList, TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import {observer} from 'mobx-react';
import colors from '../../../../gsresource/ui/colors';
import Image from '../../../../component/Image';
import fonts from '../../../../gsresource/ui/fonts';
import NP from 'number-precision';
import DocSvc from '../../../../svc/DocSvc';
import NavigationSvc from '../../../../svc/NavigationSvc';
import StringUtl from '../../../../utl/StringUtl';
import ImageViewer from '../../../../component/ImageViewer';

const GROUP_CHILD = 2; // 童装按组模式

@observer
export default class BillingGoodsCell extends Component {

    static propTypes = {
        item: PropTypes.array,
        showTopMargin: PropTypes.bool,
    };

    render() {
        return (
            <View style={[styles.container]}>
                <SectionList
                    renderSectionHeader={this.renderSectionHeader}
                    sections={this.props.item}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderItem}
                />
                <View style={{backgroundColor: colors.white, height: 10}} />
            </View>
        );
    }

    keyExtractor = (item, index) => index.toString();

    renderSectionHeader = ({section, index}) => {
        return (
            <View style={{backgroundColor: colors.white, paddingLeft: 2}}>

                <View style={[{
                    flexDirection: 'row',
                    alignItems: 'center',
                    height: 90,
                    paddingLeft: 14
                }]}
                >

                    <ImageViewer
                        source={{uri: section.spuList && section.spuList.length > 0 ? DocSvc.docURLL(section.spuList.split(',')[0]) : ''}}
                        defaultSource={require('gsresource/img/dressDefaultPic90.png')}
                        style={{width: 70, height: 70, borderRadius: 2}}
                        docIDs={section.spuList.split(',')}
                        index={0}
                    />

                    <Text style={{
                        color: colors.normalFont,
                        fontSize: fonts.font14,
                        marginLeft: 6,
                        marginRight: 70
                    }}
                    >
                        {
                            section.title
                        }
                    </Text>

                </View>

                <View style={{
                    marginLeft: 14,
                    marginRight: 14,
                    height: 20,
                    flexDirection: 'row',
                    backgroundColor: colors.bg,
                    alignItems: 'center',
                    justifyContent: 'space-around'
                }}
                >
                    <Text style={styles.tag}>颜色</Text>
                    <Text style={styles.tag}>尺码</Text>
                    <Text style={styles.tag}>单价</Text>
                    {
                        this.props.item[0].salesWayId === GROUP_CHILD && <Text style={styles.tag}>组数</Text>
                    }
                    <Text style={styles.tag}>数量</Text>
                    <Text style={styles.tag}>价格</Text>

                </View>

            </View>
        );
    };

    renderItem = ({item, index}) => {
        return (
            <View style={{paddingLeft: 14, backgroundColor: colors.white}}>

                <View style={[{
                    marginRight: 14,
                    minHeight: 20,
                    flexDirection: 'row',
                    backgroundColor: colors.bg,
                    alignItems: 'center',
                    justifyContent: 'space-around'
                }, index % 2 === 0 ? {backgroundColor: colors.white} : {backgroundColor: colors.bg}]}
                >
                    <Text style={styles.sku}>{item.spec2Name}</Text>
                    <Text style={styles.sku}>{item.spec1Name}</Text>
                    <Text style={styles.sku}>{`¥${item.skuPrice}/件`}</Text>
                    {
                        this.props.item[0].salesWayId === GROUP_CHILD && <Text style={styles.sku}>{`x${item.groupNum}`}</Text>
                    }
                    <Text style={styles.sku}>{`x${item.skuNum}件`}</Text>
                    <Text style={styles.sku}>{`¥${NP.times(item.skuPrice, item.skuNum)}`}</Text>
                </View>
            </View>
        );
    };
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    tag: {
        flex: 1,
        textAlign: 'center',
        color: colors.greyFont,
        fontSize: fonts.font11
    },
    sku: {
        textAlign: 'center',
        flex: 1,
        color: colors.normalFont,
        fontSize: fonts.font11
    }
});