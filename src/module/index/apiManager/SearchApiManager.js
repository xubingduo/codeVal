/**
 * @author sml2
 * @date 2018/1/22
 * @desc
 * @flow
 */

import DLFetch from '@ecool/react-native-dlfetch';

const submitSearchFeedback =(params: Object)=>{
    return DLFetch.post('/spb/api.do', {
        apiKey: 'ec-spup-upBuyerSearchFeedback-createFull',
        ...params
    });
};

export default {
    submitSearchFeedback,
};