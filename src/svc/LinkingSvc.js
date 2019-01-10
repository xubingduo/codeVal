/**
 * @author sml2
 * @date 2018/11/19.
 * @desc 外链服务：由于首次启动app苹果会向指定的域名地址下载配置文件，若网络不稳定则可能失败。导致外链打开app不成功
 * @flow
 */

import React, {Component} from 'react';
import {Linking, Platform} from 'react-native';
import NavigationSvc from 'svc/NavigationSvc';

const HOST_ADDRESS = 'https://webdoc.hzecool.com/buyer/';
const MATCH_HOST = 'hzecool.com/buyer/';
const SPACE = ' ';

export const LinkType = {
    // 店铺首页Link前缀
    SHOPINDEX: 'ShopIndexScreen',
};

const startListner = () => {
    Linking.addEventListener('url', onRecieved);
};

const stopListner = () => {
    Linking.removeEventListener('url', onRecieved);
};

/**
 * 获取外链
 * @param code 参数code,将会作为打开app本地页面需要解析的参数。
 * @param type LinkType
 */
const getLinkURL = (code: string, type: $Values<typeof LinkType>) => {
    return HOST_ADDRESS + type + code + SPACE;
};

/**
 * 收到外链处理
 */
const onRecieved = (event: Object) => {
    global.dlconsole.log('外链 LinkType:' + event.url);
    let url = event.url;
    let screen;
    let params;

    try {
        if (url) {
            let strArr = url.split('/');
            global.dlconsole.log('外链 LinkType:' + JSON.stringify(strArr));
            if (strArr.length >= 2) {
                screen = strArr[strArr.length - 2];
                params = strArr[strArr.length - 1];
            }
        }

        if (screen && params) {
            global.dlconsole.log('外链 LinkType:' + event.url);
            NavigationSvc.push(screen, {tenantId: params});
        }
    } catch (e) {
        global.dlconsole.log('error LinkType:' + e.message);
    }
};

export default {
    startListner,
    stopListner,
    getLinkURL,
    onRecieved
};