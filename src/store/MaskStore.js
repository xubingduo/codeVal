/**
 *@author xbu
 *@date 2018/09/26
 *@flow
 *@desc  新手引导页面
 *
 */

import {observable, action, runInAction} from 'mobx';
import storage from '../utl/DLStorage';
import config from '../config/Config';
// 首页引导
const INDEX_SHOW = 'INDEXSHOW';
// 上新引导
const NEW_WEST = 'NEWESTSHOW';
// 我的引导
const MINE_SHOW = 'MINESHOW';

export default class MaskStore {
    constructor() {
        this.checkMaskIsTrue(INDEX_SHOW);
        this.checkMaskIsTrue(NEW_WEST);
        this.checkMaskIsTrue(MINE_SHOW);
    }

    //显示新人券
    @observable showCouponMask: boolean = false;

    // 首页引导
    @observable indexMask: boolean = false;
    // 上新引导
    @observable newestMask: boolean = false;
    // 我的引导
    @observable mineMask: boolean = false;

    // 首页点击事件
    @action
    indexShowAction = () => {
        this.showAction(INDEX_SHOW);
    };

    // 上新点击事件
    @action
    newestShowAction = () => {
        this.showAction(NEW_WEST);
    };

    // 我的点击事件
    @action
    mineShowAction = () => {
        this.showAction(MINE_SHOW);
    };

    // 公共方法
    @action
    showAction = async (keyName: string) => {
        const version = config.changeMask;
        try {
            const lastShowVersion = await storage.load({key: keyName});
            if (!lastShowVersion) {
                this.isTrue(keyName);
            }
        } catch (e) {
            if (e.name === 'NotFoundError') {
                this.isTrue(keyName);
            }
        }
        runInAction(() => {
            this.showCouponMask = true;
        });
        storage.save({key: keyName, data: version});
    };


    @action
    checkMaskIsTrue = async (keyName: string) => {
        try {
            const lastShowVersion = await storage.load({key: keyName});
            const version = config.changeMask;
            if (lastShowVersion) {
                if (version !== lastShowVersion) {
                    this.isFalse(keyName);
                } else {
                    this.isTrue(keyName);
                }
            } else {
                this.isFalse(keyName);
            }
        } catch (e) {
            if (e.name === 'NotFoundError') {
                this.isFalse(keyName);
            }
        }
    };

    isTrue = (key: string) => {
        runInAction(() => {
            switch (key) {
            case 'INDEXSHOW':
                this.indexMask = true;
                break;
            case 'NEWESTSHOW':
                this.newestMask = true;
                break;
            case 'MINESHOW':
                this.mineMask = true;
                break;
            }

        });
    };

    isFalse = (key: string) => {
        runInAction(() => {
            switch (key) {
            case 'INDEXSHOW':
                this.indexMask = false;
                break;
            case 'NEWESTSHOW':
                this.newestMask = false;
                break;
            case 'MINESHOW':
                this.mineMask = false;
                break;
            }
        });
    };

    @action
    renderCouponView = () => {
        this.showCouponMask = true;
    };

}
