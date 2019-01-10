/**
 *@author xbu
 *@date 2018/08/21
 *@flow
 *@desc
 *
 */
import DLFetch from '@ecool/react-native-dlfetch';
const fetchSortList =(params: Object)=>{
    return DLFetch.post('/spg/api.do', {
        apiKey: 'ec-config-dresClassConfig-treeList',
        ...params
    });
};

// 热门市场推荐
const fetchSortHotMarket =(params: Object)=> {
    return DLFetch.post('/spg/api.do',{
        apiKey: 'ec-spadmin-spCatConfig-findCatConfig',
        ...params
    });
};

export default {
    fetchSortList,
    fetchSortHotMarket
};