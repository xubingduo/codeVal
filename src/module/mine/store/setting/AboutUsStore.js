/**
 * author: wwj
 * Date: 2018/8/27
 * Time: 下午5:41
 * des: 关于我们
 * @flow
 */
import UserApiManager from '../../../../apiManager/UserApiManager';
import {action, observable} from 'mobx';

export default class AboutUsStore {
    // 联系电话
    @observable ecoolPhone = '';
    // 官方网址
    @observable ecoolWeb = '';
    // 公司logo
    @observable ecoolLogo = '';
    // 微信公众号
    @observable ecoolWeixin = '';
    // 微信客服
    @observable customWx = '';

    /**
     * 关于我们
     * @param callback
     */
    queryAboutUs = (callback: Function) => {
        UserApiManager.fetchAboutUsProvider()
            .then(action(({data}) => {
                if (data) {
                    this.ecoolPhone = data.ecoolPhone;
                    this.ecoolWeb = data.ecoolWeb;
                    this.ecoolLogo = data.ecoolLogo;
                    this.ecoolWeixin = data.ecoolWeixin;
                    this.customWx = data.customWx;
                }
                callback(true, 0);
            }), (error) => {
                callback(false, error.message);
            });
    };
}