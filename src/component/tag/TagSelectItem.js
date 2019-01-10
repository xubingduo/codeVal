import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    ViewPropTypes,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import colors from '../../gsresource/ui/colors';

TagSelectItem.propTypes = {
    label: PropTypes.string,
    onPress: PropTypes.func,
    itemStyle: ViewPropTypes.style,
    itemStyleSelected: ViewPropTypes.style,
    itemLabelStyle: PropTypes.any,
    itemLabelStyleSelected: PropTypes.any
};

TagSelectItem.defaultProps = {
    label: '',
    onPress: null,
    itemStyle: null,
    itemLabelStyle: null,
};

function TagSelectItem(props) {
    return (
        <TouchableOpacity
            style={[styles.inner, styles.itemStyle]}
            onPress={()=>{
                props.onPress(props.label);
            }}
        >
            <Text
                numberOfLines={1}
                style={[props.itemLabelStyle, styles.text]}
            >
                {props.label}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    inner: {
        borderWidth: 1,
        borderRadius: 4,
        height: 25,
        borderColor: colors.border1,
        paddingRight: 10,
        paddingLeft: 10,
        marginLeft: 10,
        marginTop: 10,
        paddingTop: 4,
        paddingBottom: 4,
        justifyContent: 'center',
    },
    text: {
        color: colors.greyFont
    }
});

export default TagSelectItem;
