/**
 * @author GaoYuJian
 * @create date 2017/12/23
 * @desc
 */

import React from 'react';
import {View, TextInput, Keyboard, StyleSheet} from 'react-native';
import PropTypes from 'prop-types';
import colors from '/gsresource/ui/colors';
import I18n from '/gsresource/string/i18n';
import fonts from '/gsresource/ui/fonts';

const propTypes = {
    value: PropTypes.string,
    placeholder: PropTypes.string,
    onChangeText: PropTypes.func,
    editable: PropTypes.bool,
    style: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
    inputRef: PropTypes.func,
};

const defaultProps = {
    editable: true,
    placeholder:'请输入备注'
};

const RemarkView = (props) => {
    const {value, onChangeText, editable, style,placeholder,inputRef} = props;
    return (
        <View
            style={[styles.container, style]}
        >
            <TextInput
                ref={inputRef}
                style={styles.input}
                underlineColorAndroid={'transparent'}
                multiline={true}
                editable={editable}
                value={value}
                placeholder={placeholder}
                placeholderTextColor={colors.fontHint}
                onChangeText={onChangeText}
                iosonKeyPress={() => {
                    Keyboard.dismiss();
                }}
            />
        </View>
    );
};

RemarkView.propTypes = propTypes;
RemarkView.defaultProps = defaultProps;

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        height: 126,
        borderColor: colors.border,
        borderBottomWidth: 1,
    },
    input: {
        backgroundColor: colors.bg,
        flex: 1,
        textAlign: 'left',
        textAlignVertical: 'top',
        fontSize: fonts.font14,
        color: colors.normalFont,
        paddingTop: 7,
        paddingBottom: 7,
        paddingLeft: 13,
        paddingRight: 13,
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 4,
        marginTop: 11,
        marginBottom: 11,
        marginLeft: 15,
        marginRight: 15,
    },
});

export default RemarkView;