/**
 * @author YiJunJie
 * @email eric.hz.jj@gmail.com
 * @create date 2018-05-03 02:51:56
 * @modify date 2018-05-03 02:51:56
 * @desc [消息中心]
 * @flow
 */
import { observable, runInAction, computed, Iterator, action } from 'mobx';
import MessageApiManager from 'apiManager/MessageApiManager';
import { RootStore } from 'store/RootStore';

const DEFAULT_PAGE_SIZE = 15;

export const NotifyType = {
    LOGISTICS: 1,
    ACTIVITY: 2
};

class MessageCenterStore {
    // 物流交易消息未读消息数
    @observable
    logisticsUnreadMessageCount: number = 0;

    // 活动通知消息未读消息数
    @observable
    activityNofifyUnreadMessageCount: number = 0;

    //IM客服消息未读数
    @observable
    imUnreadMessageCount: number = 0;

    //智齿客服消息未读数
    @observable
    sobotUnreadMessageCount: number = 0;

    // 消息
    @observable
    messages: Map<string, Object> = new Map();

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    // 总消息未读消息数
    @computed
    get unreadMessageCount(): number {
        return (
            this.logisticsUnreadMessageCount +
            this.activityNofifyUnreadMessageCount +
            this.imUnreadMessageCount +
            this.sobotUnreadMessageCount
        );
    }

    /**
     * 获取未读消息数
     */
    @action
    syncUnreadMessageCount = async (type: ?number) => {
        let params = {};
        if (type) {
            if (type === NotifyType.LOGISTICS) {
                params.tagOneIn = '90,91,94,99,100';
            } else if (type === NotifyType.ACTIVITY) {
                params.tagOneIn = '300,301,302';
            }
        } else {
            //默认全部
            params.tagOneIn = '90,91,94,99,100,300,301,302';
        }

        try {
            let { data } = await MessageApiManager.fetchUnreadMessageCount(
                params
            );
            global.dlconsole.log('获取未读数：' + data.val);
            if (type) {
                if (type === NotifyType.LOGISTICS) {
                    runInAction(
                        () => (this.logisticsUnreadMessageCount = data.val)
                    );
                } else if (type === NotifyType.ACTIVITY) {
                    runInAction(
                        () => (this.activityNofifyUnreadMessageCount = data.val)
                    );
                }
            }
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 更新未读消息
     */
    updateUnreadMessageState = async (id?: string, type: number) => {
        try {
            let params = {};
            if (id) {
                params.msgIds = id;
            }

            await MessageApiManager.updateUnreadMessageState(params);
            await this.syncUnreadMessageCount(type);
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 同步消息列表
     */
    syncMessageList = async (
        isReload: boolean = true,
        type: number,
        params: Object = {}
    ) => {
        let innerParams = { ...params };
        let pageNo = 1;
        if (isReload === false) {
            // 计算页数
            let havePage = Math.floor(this.messages.size / DEFAULT_PAGE_SIZE);
            pageNo = havePage + pageNo;
            this.messages.size % DEFAULT_PAGE_SIZE > 0 && pageNo++;
        }

        let jsonParam = {};
        if (type === NotifyType.LOGISTICS) {
            jsonParam = { bizType: 0, tagOneIn: '90,91,94,99,100' };
        } else if (type === NotifyType.ACTIVITY) {
            jsonParam = { bizType: 0, tagOneIn: '300,301,302' };
        }

        innerParams.pageSize = DEFAULT_PAGE_SIZE;
        innerParams.pageNo = pageNo;
        innerParams.jsonParam = jsonParam;
        try {
            let { data } = await MessageApiManager.fetchMessageList(
                innerParams
            );
            runInAction(() => {
                isReload && this.messages.clear();
                data.dataList &&
                    data.dataList.forEach(element => {
                        // 添加消息单缓存
                        this.messages.set(element.id, element);
                    });
            });
        } catch (error) {
            return Promise.reject(error);
        }
    };

    /**
     * 消息中心显示的消息列表
     */
    @computed
    get dataSource(): Iterable<Object> {
        return this.messages.values();
    }

    /**
     * 是否没有更多数据
     */
    @computed
    get isNoMoreData(): boolean {
        let size = this.messages.size;
        return size === 0 && size % DEFAULT_PAGE_SIZE > 0;
    }

    @action
    updateAllState = async (type: number) => {
        try {
            await MessageApiManager.updateAllUnreadMessageState({
                jsonParam: { bizType: 0 }
            });
            this.syncMessageList(true, type);
            this.syncUnreadMessageCount(type);
        } catch (error) {
            return Promise.reject(error);
        }
    };
}

export default MessageCenterStore;
