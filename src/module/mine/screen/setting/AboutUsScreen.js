/**
 * author: wwj
 * Date: 2018/8/8
 * Time: 上午10:55
 * des:
 */
import React, {Component} from 'react';
import {observer} from 'mobx-react';
import {
    StyleSheet, SafeAreaView, View,
    ScrollView, TouchableOpacity, Text, Platform, NativeModules,
    TextInput,
} from 'react-native';
import {Toast} from '@ecool/react-native-ui';
import colors from '../../../../gsresource/ui/colors';
import I18n from '../../../../gsresource/string/i18n';
import NavigationHeader from '../../../../component/NavigationHeader';
import ImageTextWithArrowView from '../../../../component/ImageTextWithArrowView';
import DividerLineH from '../../../../component/DividerLineH';
import fonts from '../../../../gsresource/ui/fonts';
import AboutUsStore from '../../store/setting/AboutUsStore';
import Image from '../../../../component/Image';
import DocSvc from '../../../../svc/DocSvc';

@observer
export default class AboutUsScreen extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            header: (
                <NavigationHeader
                    titleItemTextStyle={{color: colors.normalFont}}
                    navigation={navigation}
                    backgroundColor={colors.white}
                    navigationTitleItem={I18n.t('aboutUs')}
                    statusBarStyle={'dark-content'}
                    themeStyle={'default'}
                />
            ),
        };
    };

    constructor(props) {
        super(props);
        this.store = new AboutUsStore();
    }

    beforeMount() {
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageStart('关于我们');
        }
    }

    componentDidMount(){
        this.beforeMount();
        Toast.loading();
        this.store.queryAboutUs((ret, ext) => {
            Toast.dismiss();
        });
    }

    componentWillUnmount() {
        if (Platform.OS === 'android'){
            NativeModules.DLStatisticsModule.onPageEnd('关于我们');
        }
    }

    render (){
        console.log(DocSvc.originDocURL(this.store.ecoolLogo));
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.topAvatarContainer}>
                    <Image
                        style={styles.avatar}
                        // defaultSource={require('gsresource/img/aboutusLogo.png')}
                        source={{uri: DocSvc.originDocURL(this.store.ecoolLogo)}}
                    />
                </View>
                <ImageTextWithArrowView
                    textName={I18n.t('weChatOfficialAccount')}
                    text1Style={{marginLeft: 10}}
                    arrowShow={false}
                    textValue={this.store.ecoolWeixin}
                    text2Style={{color: colors.greyFont}}
                    withOutTouchView={true}
                    selectable={true}
                />
                <DividerLineH />
                <ImageTextWithArrowView
                    textName={I18n.t('weChatCustomerService')}
                    text1Style={{marginLeft: 10}}
                    arrowShow={false}
                    textValue={this.store.customWx}
                    text2Style={{color: colors.greyFont}}
                    withOutTouchView={true}
                    selectable={true}
                />
                <DividerLineH />
                <ImageTextWithArrowView
                    textName={I18n.t('officialWebsite')}
                    text1Style={{marginLeft: 10}}
                    arrowShow={false}
                    textValue={this.store.ecoolWeb}
                    text2Style={{color: colors.greyFont}}
                    withOutTouchView={true}
                    selectable={true}
                />
                <DividerLineH />
                <ImageTextWithArrowView
                    textName={I18n.t('officialPhone')}
                    text1Style={{marginLeft: 10}}
                    arrowShow={false}
                    textValue={this.store.ecoolPhone}
                    text2Style={{color: colors.greyFont}}
                    withOutTouchView={true}
                    selectable={true}
                />
            </SafeAreaView>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor:colors.bg,
        flex:1
    },

    topAvatarContainer: {
        paddingTop: 40,
        paddingBottom: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatar: {
        width: 106,
        height: 106,
    },
});