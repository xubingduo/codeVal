/*
 * @Author: wengdongyang
 * @Date:   2018-08-02 13:41:33
 * @Desc:   存储服务
 * @Last Modified by:   wengdongyang
 * @Last Modified time: 2018-08-02 13:42:43
 * @flow
 */

import {AsyncStorage} from 'react-native';

export async function getStorage(key: string) {
    try {
        const value = await AsyncStorage.getItem(key);
        if (value !== null) {
            return Promise.resolve(JSON.parse(value));
        }
    } catch (err) {
        return '';
    }
}

export async function setStorage(key: string, val: any) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(val));
    } catch (error) {
        // Error saving data
    }
}

export async function removeStorage(key: string) {
    AsyncStorage.removeItem(key);
}

export async function clearStorage() {
    return AsyncStorage.clear();
}
