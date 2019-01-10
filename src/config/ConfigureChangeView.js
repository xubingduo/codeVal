/**
 * @author GaoYuJian
 * @create date 2018-11-08
 * @desc 切换配置环境
 */
import React, { Component } from 'react';
import {View, Button} from 'react-native';
import { ActionSheet } from '@ecool/react-native-ui';
import Config, {IS_INTERNAL_VERSION, setEnv} from 'config/Config';

/**
 * 渲染配置切换视图(只有IS_INTERNAL_VERSION为true时才渲染)
 */
export default class ConfigureChangeView extends Component {
    constructor() {
        super();

        const PRODUCT_ENVIRONMENT = Config.PRODUCT_ENVIRONMENT;
        this.state = {PRODUCT_ENVIRONMENT};
    }

    render () {
        if (!IS_INTERNAL_VERSION) {
            return null;
        }

        const params = {
            /**
             * 开发
             */
            dev: '开发环境',

            /**
             * 测试
             */
            test: '测试环境',

            /**
             * 审核
             */
            check: '审核环境',

            /**
             * 正式测试环境
             */
            productTest: 'spt北方机房',

            /**
             * 正式
             */
            product: '正式环境'
        };

        return (
            <View
                style={{position: 'absolute', left: 20, right: 20, bottom: 10, height: 40}}
            >
                <Button
                    title={params[this.state.PRODUCT_ENVIRONMENT]}
                    color={'pink'}
                    onPress={() => {
                        ActionSheet.showActionSheetWithOptions({
                            title: '切换环境',
                            options: [...Object.values(params), '取消'],
                            cancelButtonIndex: Object.values(params).length
                        }, (index) => {
                            if (index < Object.values(params).length) {
                                setEnv(Object.keys(params)[index]);
                                const PRODUCT_ENVIRONMENT = Config.PRODUCT_ENVIRONMENT;
                                this.setState({PRODUCT_ENVIRONMENT});
                            }
                        });
                    }}
                />
            </View>
        );
    }
}