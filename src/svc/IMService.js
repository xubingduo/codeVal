/**
 * @author [lyq]
 * @email
 * @create date 2018-10-13 15:06:02
 * @modify date 2018-10-13 15:06:02
 * @desc [IM消息客服]
 * @flow
 */
import { DLIMManagerLib } from '@ecool/react-native-dlimlib';
import UserApiManager from 'apiManager/UserApiManager';
import rootStore from 'store/RootStore';

//关注
async function fetchSellerIMTeamId(buyerId: number, salesUnitId: number) {
    try {
        let { data } = await UserApiManager.fetchSellerIMTeamId({
            buyerId: buyerId,
            salesUnitId: salesUnitId
        });

        return Promise.resolve(data);
    } catch (e) {
        return Promise.reject(e);
    }
}

/**
 * 检查im是否已经登录 若未登录则重新获取IM登录信息进行登录
 * @returns {Promise<void>}
 */
async function checkIMLoginStatus() {
    try{
        if (rootStore.userStore.user && rootStore.userStore.user.sessionId && // 判断相关IM登录信息是否存在
            (!rootStore.userStore.user.extProps ||
                !rootStore.userStore.user.extProps.im ||
                !rootStore.userStore.user.extProps.im.imAccid ||
                !rootStore.userStore.user.extProps.im.imToken)) {
            let {data} = await UserApiManager.fetchIMLoginInfo({
                sessionId: rootStore.userStore.sessionId
            });
            if (data && data.imToken && data.imAccid) {
                DLIMManagerLib.login(
                    data.imToken,
                    data.imAccid
                );
            }
        }
    }catch (e) {
        //
    }

}

/**
 * 携带商品信息到IM聊天界面
 * tid: 卖家tid
 * goodsInfo: {
 *      type: 3
 *      data: {
 *          goodsId: string,
 *          desc: string,
 *          price: string,
 *          imgUrl: string
 *      }
 *
 *  }
 */
const showIMScreenWithGoodsInfo = (tid: string, goodsInfo: Object) => {
    DLIMManagerLib.showChatScreenWithSession(tid, goodsInfo, true);
};

/**
 * 打开与卖家的聊天界面
 * @param tid 卖家tid
 */
const showIMScreen = (tid: string) => {
    DLIMManagerLib.showChatScreenWithSession(tid, null, true);
};

/**
 * 创建商品信息提示消息类型对象
 * @param goodsId
 * @param desc
 * @param price
 * @param imgUrl
 * @returns {{type: number, data: {goodId: string, desc: string, price: string, imgUrl: string}}}
 */
const createGoodsTipMsg = (
    goodsId: string,
    desc: string,
    price: string,
    imgUrl: string
): Object => {
    return {
        type: 2,
        data: {
            goodId: goodsId,
            desc: desc,
            price: price,
            imgUrl: imgUrl
        }
    };
};

export default {
    fetchSellerIMTeamId,
    showIMScreenWithGoodsInfo,
    showIMScreen,
    createGoodsTipMsg,
    checkIMLoginStatus,
};
