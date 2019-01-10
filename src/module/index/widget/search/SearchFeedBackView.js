import React from 'react';
import { TouchableOpacity, Image } from 'react-native';

export default function SearchFeedBackView({onPress}) {
    return (
        <TouchableOpacity
            style={{position: 'absolute', right: 30, bottom: 60}}
            onPress={onPress}
        >
            <Image style={{margin: 5}} source={require('gsresource/img/search_feedback.png')} />
        </TouchableOpacity>
    );
}