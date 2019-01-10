/**
 * @author sml2
 * @date 2018/1/22
 * @desc 上新
 * @flow
 */
import {Platform} from 'react-native';
import DLFetch from '@ecool/react-native-dlfetch';

// 手机号匹配推荐关注列表
const fetchMobileMatchRecomandFocusList = (params?: Object)=> {
    return DLFetch.post('/spg/api.do',{
        apiKey: 'ec-spadmin-spSuggFocus-findByPhone',
        ...params
    });
};

// 关注匹配推荐
const focusMatchRecomandFocusList = (params?: Object)=> {
    return DLFetch.post('/spb/api.do',{
        apiKey: 'ec-up-favorShop-addFavorShops',
        ...params
    });
};

export default {
    fetchMobileMatchRecomandFocusList,
    focusMatchRecomandFocusList,
};