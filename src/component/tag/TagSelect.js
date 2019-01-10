import React from 'react';
import PropTypes from 'prop-types';
import {
    View,
    ViewPropTypes,
    StyleSheet,
    ScrollView
} from 'react-native';

import TagSelectItem from './TagSelectItem';
import colors from '../../gsresource/ui/colors';

class TagSelect extends React.Component {
    static propTypes = {
        data: PropTypes.any,
        containerStyle: ViewPropTypes.style,
        itemStyle: ViewPropTypes.style,
        itemLabelStyle: ViewPropTypes.style,
        onPress: PropTypes.func,
    };

    static defaultProps = {
        data: [],
        itemLabelStyle: {},
        containerStyle: {},
        itemStyle: {}
    };

    render() {
        const data = this.props.data.slice();
        return (
            <ScrollView keyboardDismissMode={'on-drag'}>
                <View
                    style={[
                        styles.container,
                        this.props.containerStyle
                    ]}
                >
                    {data.map((i,index) => {
                        return (
                            <TagSelectItem
                                key={index.toString()}
                                label={i}
                                {...this.props}
                                onPress={this.props.onPress}
                            />
                        );
                    })}
                </View>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        flex: 1,
    }
});

export default TagSelect;
