/**
 * author: wwj
 * Date: 2018/8/23
 * Time: 下午2:06
 * des: 引导页
 */
import React, {Component} from 'react';
import {StyleSheet, View,
    Dimensions, FlatList,
    StatusBar, TouchableOpacity,
    Image
} from 'react-native';
import PropTypes from 'prop-types';
import GuideStore from '../../../store/GuideStore';
const windowSize = Dimensions.get('window');
const windowWidth = windowSize.width;
const windowHeight = windowSize.height;

export default class GuideScreen extends Component {

    static propTypes = {
        guideStore: PropTypes.instanceOf(GuideStore),
    }
    /**
     * 进入App
     */
    enterApp = () => {
        this.props.guideStore.needShowGuideScreen = false;
        this.props.guideStore.enterApp();
    };

    render() {
        return (
            <View
                style={styles.container}
            >
                <FlatList
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    style={styles.container}
                    data={this.props.guideStore.dataSource}
                    renderItem={this.renderItem}
                />
            </View>
        );
    }

    renderItem = ({ item }) => {
        const dataSource = this.props.guideStore.dataSource;
        return (
            <View style={{flex: 1}}>
                <StatusBar
                    hidden
                />
                <TouchableOpacity
                    disabled={item.key !== dataSource[dataSource.length - 1].key}
                    activeOpacity={1}
                    onPress={this.enterApp}
                >
                    <Image
                        style={styles.item}
                        source={item.image}
                        resizeMode={'cover'}
                    />
                </TouchableOpacity>
            </View>
        );
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    item: {
        width: windowWidth,
        height: windowHeight,
        backgroundColor: '#fff'
    }
});