// 提取url参数
export function parseUrl(url) {
    let result = {};
    try {
        let query = url.split('?')[1];
        let queryArr = query.split('&');
        queryArr.forEach(function(item) {
            let value = item.split('=')[1];
            let key = item.split('=')[0];
            result[key] = value;
        });
    } catch (e) {}
    return result;
}
