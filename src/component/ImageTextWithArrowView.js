import React, {
    Component
} from 'react';
import {
    Text,
    StyleSheet,
    Image,
    View,
    TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import colors from '/gsresource/ui/colors';
import fonts from '/gsresource/ui/fonts';

/**
 *  左边图片加文字  右边文字箭头的item
 */
export default class ImageTextWithArrowView extends Component {

    static propTypes = {
        imageSource:PropTypes.oneOfType([
            PropTypes.number,
            PropTypes.object
        ]),
        textName: PropTypes.string.isRequired,
        textValue: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.number,
        ]),
        onArrowClick: PropTypes.func,
        editMode: PropTypes.bool.isRequired,
        mustItem: PropTypes.bool.isRequired,
        itemStyle: PropTypes.any,
        arrowShow: PropTypes.bool.isRequired,
        arrowShowOnly: PropTypes.bool.isRequired,
        numberOfLines: PropTypes.number,
        withOutTouchView: PropTypes.bool,
        text1Style: PropTypes.any,
        text2Style: PropTypes.any,
        selectable: PropTypes.bool,
    };

    static defaultProps = {
        editMode: true,
        mustItem: false,
        arrowShow: true,
        arrowShowOnly: false,
        selectable: false,
        numberOfLines: 1
    };

    render() {
        if (this.props.editMode) {
            if (this.props.withOutTouchView) {
                return (
                    <View style={[styles.container, this.props.itemStyle]}>
                        <View style={styles.imageText}>
                            {this.renderImage()}
                            {this.renderName()}
                        </View>
                        <View style={styles.item}>
                            <Text style={[styles.text2, {marginRight: 10}, this.props.text2Style]}
                                numberOfLines={this.props.numberOfLines}
                                selectable={this.props.selectable}
                            >{this.props.textValue}</Text>

                            {this.renderArrow()}
                        </View>
                    </View>
                );
            } else {
                return (
                    <TouchableOpacity style={[styles.container, this.props.itemStyle]}
                        onPress={this.props.onArrowClick}
                    >
                        <View style={styles.imageText}>
                            {this.renderImage()}
                            {this.renderName()}
                        </View>
                        <View style={styles.item}>
                            <Text style={[styles.text2, {marginRight: 10}, this.props.text2Style]}
                                numberOfLines={this.props.numberOfLines}
                            >{this.props.textValue}</Text>

                            {this.renderArrow()}
                        </View>
                    </TouchableOpacity>
                );
            }

        } else if (this.props.arrowShowOnly) {
            return (
                <View style={[styles.container, this.props.itemStyle]}>
                    <View style={styles.imageText}>
                        {this.renderImage()}
                        <Text style={[styles.text1, {marginLeft: 24}]}>{this.props.textName}</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={[styles.text2, {marginRight: 15}, this.props.text2Style]}
                            numberOfLines={this.props.numberOfLines}
                        >{this.props.textValue}</Text>
                    </View>
                    {this.renderArrow()}
                </View>
            );
        } else {
            return (
                <View style={[styles.container, this.props.itemStyle]}>
                    <View style={styles.imageText}>
                        {this.renderImage()}
                        <Text style={[styles.text1, {marginLeft: 24}]}>{this.props.textName}</Text>
                    </View>
                    <View style={styles.item}>
                        <Text style={[styles.text2, {marginRight: 15}, this.props.text2Style]}
                            numberOfLines={this.props.numberOfLines}
                        >{this.props.textValue}</Text>
                    </View>
                </View>
            );
        }
    }

    renderImage() {
        if(this.props.imageSource) {
            return (
                <Image style={{marginLeft:26,alignItems:'center'}} source={this.props.imageSource} />
            );
        }
    }

    renderName() {
        if (this.props.mustItem) {
            return (
                <Text style={{color: colors.title, marginLeft: 24}}>
                    *
                    <Text style={[styles.text1]}>{this.props.textName}</Text>
                </Text>
            );

        } else {
            return (
                <Text style={[styles.text1, {marginLeft: 24}, this.props.text1Style]}> {this.props.textName}</Text>
            );

        }
    }

    renderArrow() {
        if (this.props.arrowShow) {
            return (
                <Image
                    style={[styles.arrowImg, {marginRight: 18}]}
                    source={require('gsresource/img/arrowRight.png')}
                />
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        height: 46,
        flexDirection: 'row',
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    imageText:{
        flexDirection:'row',
        justifyContent:'flex-end',
        alignItems:'center',
    },

    item: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    text1: {
        fontSize: fonts.font14,
        color: colors.normalFont,
    },
    text2: {
        textAlign: 'right',
        fontSize: fonts.font14,
        color: colors.normalFont,
    },

    arrowImg: {
        alignItems: 'center',
        justifyContent: 'flex-end',
    }
});