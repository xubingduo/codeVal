import './ReactotronConfig';
import {AppRegistry, TextInput, Text} from 'react-native';
import App from './App';
import {useStrict} from 'mobx';
import './src/utl/DLLog';
// import {Sentry, SentryLog} from 'react-native-sentry';
import {IS_STAND_APP} from './src/config/Config';

Text.defaultProps.allowFontScaling = false;
TextInput.defaultProps.allowFontScaling = false;

// IS_STAND_APP && Sentry.config('https://4378ddaee14745248e18e96cc7cd64f7@sentry.io/1262627',
//     {
//         deactivateStacktraceMerging: true,
//         logLevel: SentryLog.None,
//         disableNativeIntegration: false,
//         handlePromiseRejection: false
//     }).install();

useStrict(true);
IS_STAND_APP && dlconsole.start();
console.disableYellowBox = !__DEV__;
AppRegistry.registerComponent('EcoolB2BBuyer', () => App);
