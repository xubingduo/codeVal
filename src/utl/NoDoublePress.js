/**
 * author: wwj
 * Date: 2018/11/7
 * Time: 下午5:45
 * des:
 */
const NoDoublePress = {
    lastPressTime: 1,
    onPress(callback){
        let curTime = new Date().getTime();
        if (curTime - this.lastPressTime > 1000) {
            this.lastPressTime = curTime;
            callback();
        }
    },
};

export default NoDoublePress;