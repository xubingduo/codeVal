import React from 'react';
import {
    View,
    StyleSheet,
    Platform,
    ActivityIndicator
} from 'react-native';

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center'
    },
    wrapper: {
        width: '60%',
        height: 10,
        borderRadius: 5,
        borderColor: 'white',
        borderWidth: 2,
    },
    content: {
        position: 'absolute',
        height: '100%',
        backgroundColor: 'white'
    }
});

export default function Progress({progress}) {
    return (
        <View style={styles.container}>
            {
                Platform.OS === 'ios'
                    ? (
                        <View style={styles.wrapper}>
                            <View style={[styles.content, {width: `${progress * 100}%`}]} />
                        </View>)
                    : <ActivityIndicator animating={progress < 1} size='large' />
            }
        </View>
    );
}