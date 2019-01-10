/**
 * author: wwj
 * Date: 2018/8/2
 * Time: 上午11:15
 * des: 编辑新增地址的store
 * @flow
 */

import { observable, computed, action, toJS } from 'mobx';
import DLFetch from '@ecool/react-native-dlfetch';
import I18n from '../../../../gsresource/string/i18n';
import RegUtil from '../../../../utl/RegUtil';
import StringUtl from 'utl/StringUtl';

export default class EditAddressStore {
    /**
     * 是否为新增界面
     * @param isAdd
     */
    @observable
    isAdd: boolean = true;

    @observable
    addressData: Object = {};

    @observable
    linkMan: string = '';

    @observable
    telephone: string = '';

    @observable
    postcode: string = '';

    @observable
    isDefault: number = 0;

    @observable
    addrAreaCode: Array<string>;

    @observable
    detailAddr: string = '';

    id: number;

    @action
    setIsAdd(isAdd: boolean) {
        this.isAdd = isAdd;
    }

    @action
    setDetail(detail: Object) {
        this.id = detail.recInfo.id;
        this.addressData = detail;
        this.linkMan = detail.recInfo.linkMan;
        this.telephone = detail.recInfo.telephone;
        this.isDefault = detail.recInfo.isDefault;
        this.detailAddr = detail.address.detailAddr;
        this.postcode = detail.recInfo.postcode;
        this.setInitializeAddrCode(detail.address);
    }

    /**
     * 初始化原本的省市区code数组，未选择过 则为空数组
     * 仅在第一次获取地址详情时设置
     */
    @action
    setInitializeAddrCode(address: Object) {
        if (address.provinceCode !== 0) {
            this.addrAreaCode = [];
            this.addrAreaCode.push(address.provinceCode + '');
            this.addrAreaCode.push(address.cityCode + '');
            this.addrAreaCode.push(address.countyCode + '');
        }
    }

    @action
    setLinkName(linkName: string) {
        this.linkMan = linkName;
    }

    @action
    setTelephone(tel: string) {
        this.telephone = tel;
    }

    @action
    setIsDefault(isDefault: number) {
        this.isDefault = isDefault;
    }

    @action
    setDetailAddr(addrDetail: string) {
        this.detailAddr = addrDetail;
    }

    @computed
    get getIsDefault(): boolean {
        return this.isDefault === 1;
    }

    saveAddrAndUse = (checkFunc: Function, requestCallback: Function) => {
        if (!this.checkRequiredItem(this.linkMan, checkFunc, '请填写联系人')) {
            return;
        }
        if (
            !this.checkRequiredItem(
                this.telephone,
                checkFunc,
                '请填写正确的手机号'
            )
        ) {
            return;
        }
        if (!RegUtil.isPhoneNumber(this.telephone)) {
            checkFunc('请填写正确的手机号');
            return;
        }
        if (this.postcode && (RegUtil.hasEmoji(this.postcode) || this.hasQuotationMark(this.linkMan))) {
            checkFunc('填写的邮编不能包含表情符或&、¥、$等特殊符号');
            return;
        }
        if (
            !this.checkRequiredItem(this.addrAreaCode, checkFunc, '请选择地区')
        ) {
            return;
        }
        if (
            !this.checkRequiredItem(
                this.detailAddr,
                checkFunc,
                '请填写详细地址'
            )
        ) {
            return;
        }
        if (RegUtil.hasEmoji(this.linkMan) || this.hasQuotationMark(this.linkMan)) {
            checkFunc('填写的姓名不能包含表情符或&、¥、$等特殊符号');
            return;
        }
        if (RegUtil.hasEmoji(this.detailAddr) || this.hasQuotationMark(this.detailAddr)) {
            checkFunc('填写的详细地址不能包含表情符或&、¥、$等特殊符号');
            return;
        }
        DLFetch.post('/spb/api.do', this.configUpdateAddrParams()).then(
            action(({ data }) => {
                // 成功 并根据id查询该地址详情
                this.queryAddressDetail(data.val, requestCallback);
            }),
            error => {
                requestCallback(false, error.message);
            }
        );
    };

    /**
     * 新增或修改地址
     */
    saveAddr = (checkFunc: Function, requestCallback: Function) => {
        if (!this.checkRequiredItem(this.linkMan, checkFunc, '请填写联系人')) {
            return;
        }
        if (
            !this.checkRequiredItem(
                this.telephone,
                checkFunc,
                '请填写正确的手机号'
            )
        ) {
            return;
        }
        if (!RegUtil.isPhoneNumber(this.telephone)) {
            checkFunc('请填写正确的手机号');
            return;
        }
        if (this.postcode && (RegUtil.hasEmoji(this.postcode) || this.hasQuotationMark(this.linkMan))) {
            checkFunc('填写的邮编不能包含表情符或&、¥、$等特殊符号');
            return;
        }
        if (
            !this.checkRequiredItem(this.addrAreaCode, checkFunc, '请选择地区')
        ) {
            return;
        }
        if (
            !this.checkRequiredItem(
                this.detailAddr,
                checkFunc,
                '请填写详细地址'
            )
        ) {
            return;
        }
        if (RegUtil.hasEmoji(this.linkMan) || this.hasQuotationMark(this.linkMan)) {
            checkFunc('填写的姓名不能包含表情符或&、¥、$等特殊符号');
            return;
        }
        if (RegUtil.hasEmoji(this.detailAddr) || this.hasQuotationMark(this.detailAddr)) {
            checkFunc('填写的详细地址不能包含表情符或&、¥、$等特殊符号');
            return;
        }
        DLFetch.post('/spb/api.do', this.configUpdateAddrParams()).then(
            action(({ data }) => {
                // 成功
                requestCallback(true, 0);
            }),
            error => {
                requestCallback(false, error.message);
            }
        );
    };

    checkRequiredItem(
        requiredItem: string | Array<string>,
        callback: Function,
        tipMsg: string
    ) {
        if (
            typeof requiredItem === 'string' &&
            StringUtl.isEmpty(requiredItem)
        ) {
            callback(tipMsg);
            return false;
        } else if (!requiredItem) {
            callback(tipMsg);
            return false;
        }
        return true;
    }

    configUpdateAddrParams = () => {
        let recInfo = {
            id: '',
            linkMan: this.linkMan,
            telephone: this.telephone,
            isDefault: this.isDefault,
            postcode: this.postcode
        };
        if (!this.isAdd) {
            Object.assign(recInfo, { id: this.addressData.recInfo.id });
        }
        let addressParams = {
            provinceCode:
                this.addrAreaCode && this.addrAreaCode.length > 0
                    ? this.addrAreaCode[0]
                    : 0,
            cityCode:
                this.addrAreaCode && this.addrAreaCode.length > 1
                    ? this.addrAreaCode[1]
                    : 0,
            countyCode:
                this.addrAreaCode && this.addrAreaCode.length > 2
                    ? this.addrAreaCode[2]
                    : 0,
            townCode: 0,
            detailAddr: this.detailAddr ? this.detailAddr.trim() : ''
        };
        let jsonParam = {
            actionType: 1, // 修改操作类型， 0 在原地址上修改， 1 停用旧收货地址，新增收货地址
            recInfo: recInfo,
            address: addressParams
        };
        return {
            apiKey: 'ec-spmdm-spUserManage-saveUserRecInfo',
            jsonParam: jsonParam
        };
    };

    /**
     * 删除收货地址
     */
    @action
    deleteAddr = (callback: Function) => {
        let id = this.id;
        DLFetch.post('/spb/api.do', {
            apiKey: 'ec-spmdm-spUserManage-deleteUserRecInfo',
            jsonParam: {
                id: id
            }
        }).then(
            action(({ data }) => {
                callback(true, id);
            }),
            error => {
                callback(
                    false,
                    error.message ? error.message : I18n.t('failure')
                );
            }
        );
    };

    /**
     * 查询收货地址详情
     */
    queryAddressDetail = (id: number, callback: Function) => {
        DLFetch.post('/spb/api.do', {
            apiKey: 'ec-spmdm-spUserManage-getUserRecInfoById',
            jsonParam: {
                id: id
            }
        }).then(
            action(({ data }) => {
                // 成功
                if (data) {
                    let addressData = data;
                    if (addressData.recInfo && addressData.address) {
                        this.setDetail(addressData);
                    }
                    callback(true, addressData ? addressData : null);
                } else {
                    callback(false, I18n.t('noData'));
                }
            }),
            error => {
                callback(
                    false,
                    error.message ? error.message : I18n.t('failure')
                );
            }
        );
    };

    hasQuotationMark = (str: string) => {
        return str.indexOf('\'') !== -1 || str.indexOf('"') !== -1;
    }
}
