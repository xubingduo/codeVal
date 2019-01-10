/**
 * author: wwj
 * Date: 2018/8/31
 * Time: 上午11:26
 * des:
 */

import React, {Component} from 'react';
import {View, Text, Image, StyleSheet} from 'react-native';
import colors from '../../../gsresource/ui/colors';
import fonts from '../../../gsresource/ui/fonts';
import DocSvc from '../../../svc/DocSvc';

export default class MedalItem extends Component {
    render(){
        let {name, rem, logoDoc,useGray,logoGdoc} = this.props.item;
        return (
            <View
                style={styles.medalItemContainer}
            >
                <Image
                    style={{width: 68, height: 68}}
                    source={{uri: useGray ? DocSvc.originDocURL(logoGdoc) : DocSvc.originDocURL(logoDoc)}}
                />
                <View style={styles.contentContainer}>
                    <Text
                        style={styles.medalTitle}
                    >
                        {name}
                    </Text>
                    <View>
                        <Text style={styles.medalDesc}>{rem}</Text>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({

    medalItemContainer: {
        flexDirection: 'row',
        minHeight: 100,
        borderRadius: 5,
        paddingLeft: 18,
        paddingRight: 18,
        paddingTop: 10,
        paddingBottom: 10,
        backgroundColor: colors.white,
        alignItems: 'center',
        marginLeft: 14,
        marginRight: 14,
        marginTop: 5,
        marginBottom: 5,
    },

    contentContainer: {
        marginLeft: 20,
        flex: 1,
    },

    medalTitle: {
        fontSize: fonts.font24,
        fontWeight: 'bold',
        color: '#3d4245',
    },

    medalDesc: {
        fontSize: fonts.font14,
        color: colors.greyFont,
    },

});