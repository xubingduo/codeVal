/**
 * @author Yunliang Miao
 * @flow
 */
import React, { Component } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

import colors from 'gsresource/ui/colors';
import fonts from 'gsresource/ui/fonts';
import DocSvc from 'svc/DocSvc';

type Props = {
    rem: string, // 评论内容
    platBuyerName: string, // 买手名称
    platBuyerHeadPic: string, // 头像
    isTagVisiable?: boolean
}

export default function CellBottomItem(props: Props) {
    const { isTagVisiable } = props;
    const extraContainerStyle = isTagVisiable ? {} : {top: 0};
    const extraWrapperStyle = isTagVisiable ? {} : {paddingTop: 0};
    return (
        <View style={[styles.container, extraContainerStyle]}>
            <View style={[styles.wrapper, extraWrapperStyle]}>
                {
                    isTagVisiable &&
                    <View style={styles.tagContainer}>
                        {/* <Image source={{uri: props.platBuyerHeadPic}} style={styles.avatar} /> */}
                        {/* <Text style={styles.tagText}>买手说</Text> */}
                        <Image source={require('gsresource/img/buyerComment.png')} />
                    </View>
                }
                <View style={styles.content}>
                    {props.platBuyerHeadPic !== '' && <Image source={{uri: DocSvc.docURLS(props.platBuyerHeadPic)}} style={styles.avatar} />}
                    <Text style={styles.text}><Text style={styles.activeText}>#{props.platBuyerName}#</Text>{props.rem}</Text>
                </View>
            </View>
        </View>
    );
}

CellBottomItem.defaultProps = {
    platBuyerName: '买手说',
    isTagVisiable: true
};

const styles = StyleSheet.create({
    container: {
        zIndex: 2,
        top: -4,
        backgroundColor: 'transparent',
        marginBottom: 6
    },
    wrapper: {
        paddingTop: 14,
    },
    tagContainer: {
        position: 'absolute',
        left: 11,
        flexDirection: 'row',
        alignItems: 'center',
        width: 76,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.normalFont,
        zIndex: 2
    },
    // tagText: {
    //     color: colors.white,
    //     fontSize: fonts.font12
    // },
    content: {
        paddingTop: 25,
        paddingBottom: 13,
        paddingHorizontal: 14,
        backgroundColor: colors.white,
        flexDirection: 'row',
        minHeight: 86,
        alignItems: 'center'
    },
    text: {
        fontSize: fonts.font12,
        color: colors.normalFont,
        flex: 1
    },
    activeText: {
        color: colors.activeFont
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 8
    }
});