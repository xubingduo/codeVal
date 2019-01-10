/**
 * @Author: tt
 * @CreateDate:2018/11/8
 * @ModifyDate:2018/11/8
 * @desc 描述注释
 */

import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    Switch,
    View,
} from 'react-native';
import colors from '../../../../gsresource/ui/colors';
import SwitchUrlBottomSheet from '../../widget/SwitchUrlBottomSheet';
import NavigationHeader from '../../../../component/NavigationHeader';
import ImageTextWithArrowView from '../../../../component/ImageTextWithArrowView';
import {Toast} from '@ecool/react-native-ui/index';
import DLFetch from '@ecool/react-native-dlfetch/index';
import Config from '../../../../config/Config';
import fonts from '../../../../gsresource/ui/fonts';
import {getStorage, setStorage} from '../../../../svc/StorageSvc';
import {IS_AUTO_CHANGE_NET} from '../../../../config/Constant';
import DividerLineH from '../../../../component/DividerLineH';

const configServerUrls = [
    {name: '主服务器', value: Config.entranceServerUrl1},
    {name: '备用服务器', value: Config.entranceServerUrl2},
];

/**
 * 内部测试功能
 */
export default class DevScreen extends Component {
    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={'开发者设置'}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            )
        };
    };

    constructor(props) {
        super(props);
        this.state = {
            currentBaseUrl: DLFetch.getBaseUrl(),
            switchNetAuto: false
        };
        this.loadCache();
    }

    loadCache = async () => {
        try {
            let change = await getStorage(IS_AUTO_CHANGE_NET);
            dlconsole.log('load ' + change);
            if (change === undefined) {
                change = true;
            }
            this.setState({
                switchNetAuto: change,
            });
        } catch (e) {
            this.setState({
                switchNetAuto: true,
            });
        }
    };

    saveStorage = async (value) => {
        dlconsole.log('save ' + value);
        try {
            await setStorage(IS_AUTO_CHANGE_NET, value);
        } catch (e) {
            //
        }
    };

    render() {
        return (
            <View style={styles.container}>
                <ImageTextWithArrowView
                    text1Style={styles.itemText}
                    itemStyle={{paddingRight: 10}}
                    textName={'切换网络'}
                    onArrowClick={this.showSwitchNetworkDialog.bind(this)}
                    arrowShow={false}
                />

                <DividerLineH />

                <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    height: 50,
                    backgroundColor: colors.white
                }}
                >
                    <Text style={styles.itemText}>
                        是否自动切换网络
                    </Text>

                    <Switch
                        value={this.state.switchNetAuto}
                        onValueChange={(value) => {
                            this.setState({
                                switchNetAuto: value,
                            });
                            this.saveStorage(value);
                        }}
                    />
                </View>

                <SwitchUrlBottomSheet
                    ref={(ref) => this.switchNetSheet = ref}
                    source={configServerUrls}
                    title={'请选择切换的服务器'}
                    checkedUrl={this.state.currentBaseUrl}
                    onItemSelected={(url) => {
                        DLFetch.setBaseUrl(url);
                        this.setState({currentBaseUrl: url});
                        this.switchNetSheet && this.switchNetSheet.dismiss();
                        Toast.success('切换成功');
                    }}
                />
            </View>
        );
    }


    /**
     * 显示切换网络对话框
     */
    showSwitchNetworkDialog = () => {
        this.switchNetSheet && this.switchNetSheet.show();
    };
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bg,
    },
    itemText: {
        fontSize: fonts.font14,
        marginLeft: 10,
        color: colors.normalFont,
        borderColor: colors.bg
    }
});