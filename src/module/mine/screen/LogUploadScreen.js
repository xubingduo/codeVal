// /**
//  * Created by song
//  * on 2017/12/8 16:09
//  *
//  */
//
// import React, { Component } from 'react';
// import { StyleSheet, View } from 'react-native';
// import colors from '../../../../../gsresource/ui/colors';
// import TextWithArrowView from '../../../../component/TextWithArrowView';
// import NavigationHeader from '../../../../component/NavigationHeader';
// import { Toast } from '@ecool/react-native-ui';
// import Realm from 'realm';
// import { fetch } from 'fetch';
// import { ActionSheet } from '@ecool/react-native-ui';
// import { zip } from 'react-native-zip-archive';
// import RNFS from 'react-native-fs';
// import Alert from 'component/Alert';
// import { Platform } from 'react-native';
// import DeviceInfo from 'react-native-device-info';
// import { inject } from 'mobx-react';
// import PropTypes from 'prop-types';
// import LogFileUpload from '../../../../utl/DLShopDiaryLog';
//
// const propTypes = {
//     userStore: PropTypes.object
// };
//
// @inject('userStore')
// class LogUploadScreen extends Component {
//     constructor(props) {
//         super(props);
//         this.state = {
//             log: null
//         };
//         let user = this.props.userStore.user;
//         LogFileUpload.setParams(user ? user.deviceNo : '', user ? user.uniCode : '');
//     }
//
//     static navigationOptions = ({ navigation }) => {
//         return {
//             header: (
//                 <NavigationHeader
//                     navigation={navigation}
//                     backgroundColor={colors.white}
//                     navigationTitleItem={'上传日志'}
//                     statusBarStyle={'dark-content'}
//                     themeStyle={'default'}
//                     titleItemTextStyle={{ color: colors.font1, fontSize: 18 }}
//                     itemTextStyle={{ color: colors.font1 }}
//                 />
//             )
//         };
//     };
//
//     render() {
//         return (
//             <View style={logStyle.container}>
//                 <View style={{ height: 10 }}/>
//                 <TextWithArrowView
//                     textName={'上传日志'}
//                     onArrowClick={this.onUploadLogClick.bind(this)}
//                     editMode={true}
//                 />
//                 <View style={{ height: 1 }}/>
//                 <TextWithArrowView
//                     textName={'上传本地库'}
//                     onArrowClick={this.onUploadLocalClick.bind(this)}
//                     editMode={true}
//                 />
//             </View>
//         );
//     }
//
//     /**
//      * 上传日志
//      */
//     onUploadLogClick() {
//         dlconsole.allLogFileMessages((err, result) => {
//             if (result.length === 0) {
//                 Toast.show('当前没有日志信息', 2);
//             } else {
//                 // 手动排序,系统sort()在安卓上有bug
//                 for (let i = 0, len = result.length; i < len; i++) {
//                     for (let j = 0; j < result.length; j++) {
//                         let obj1 = JSON.parse(JSON.stringify(result[i]));
//                         let obj2 = JSON.parse(JSON.stringify(result[j]));
//                         let name1 = parseFloat(obj1.fileName.replace(obj1.type, '').replace(/-/g, ''));
//                         let name2 = parseFloat(obj2.fileName.replace(obj2.type, '').replace(/-/g, ''));
//                         if (name1 < name2) {
//                             result[j] = obj1;
//                             result[i] = obj2;
//                         }
//                     }
//                 }
//                 let options = [];
//                 for (let i = 0; i < result.length; i++) {
//                     let row = result[i];
//                     if (row.fileName.indexOf('log') === -1 && row.fileName.indexOf('zip') === -1) continue;
//                     Object.assign(row, { id: i });
//                     options.push(row.fileName.split('.')[0]);
//                 }
//                 options.push('取消');
//                 ActionSheet.showActionSheetWithOptions(
//                     {
//                         title: '选择日志上传',
//                         options: options,
//                         cancelButtonIndex: options.length - 1
//                     },
//                     index => {
//                         if (index < options.length - 1) {
//                             this.uploadLogFile(result[index]);
//                         }
//                     }
//                 );
//             }
//         });
//     }
//
//     /**
//      * 上传日期文件
//      *  item LogFileMessageItem
//      */
//     uploadLogFile(item) {
//         setTimeout(() => {
//             Toast.loading();
//             dlconsole.uploadLogFileForDate(item.fileName.split('.')[0], (error, result) => {
//                 if (result) {
//                     Toast.success('上传成功', 2);
//                 } else {
//                     Toast.fail('上传失败', 2);
//                 }
//             });
//         }, 300);
//     }
//
//     /**
//      * 本地库
//      */
//     onUploadLocalClick() {
//         Toast.loading();
//         let user = this.props.userStore.user;
//         let sourcePath = Realm.defaultPath;
//         let zipPath = RNFS.DocumentDirectoryPath + '/db.zip';
//         zip(sourcePath, zipPath)
//             .then(path => {
//                 let formData = new FormData();
//                 let file = { uri: 'file://' + path, type: 'application/octet-stream', name: 'db.zip' };
//                 formData.append('file', file);
//                 let productType = Platform.OS === 'ios' ? 'sspdios' : 'sspdandroid';
//                 formData.append('productType', productType);
//
//                 /**
//                  * 设备型号
//                  */
//                 formData.append('device', DeviceInfo.getBrand());
//                 /**
//                  * mac地址 传用户手机号
//                  */
//                 formData.append('mac', user ? user.deviceNo : '');
//                 /**
//                  * 客户编号
//                  */
//                 formData.append('sn', user ? user.uniCode : '');
//                 /**
//                  * 系统版本
//                  */
//                 formData.append('osVersion', DeviceInfo.getSystemVersion());
//                 /**
//                  * 产品版本
//                  */
//                 formData.append('productVersion', DeviceInfo.getVersion());
//
//                 return fetch(logUploadUrl, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'multipart/form-data'
//                     },
//                     body: formData
//                 })
//                     .then(response => response.text())
//                     .then(responseData => {
//                         Toast.dismiss(() => {
//                             Toast.success('上传成功', 2);
//                         });
//                     })
//                     .catch(error => {
//                         Toast.dismiss(() => {
//                             Toast.fail('上传失败', 2);
//                         });
//                     });
//             })
//             .catch(error => {
//                 Toast.dismiss();
//                 Alert.alert(error.message);
//             });
//     }
// }
//
// const logUploadUrl = 'http://log.hzdlsoft.com:8081/clog/clog';
// const logStyle = StyleSheet.create({
//     container: {
//         flex: 1,
//         flexDirection: 'column',
//         backgroundColor: colors.bg
//     }
// });
//
// LogUploadScreen.propTypes = propTypes;
// export default LogUploadScreen;
