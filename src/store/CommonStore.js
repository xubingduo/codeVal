/**
 * @flow
 * 保存应用的全局上下文信息
 */
import { observable, action } from 'mobx';

export class CommonStore {
    @observable
    isModalOpen: boolean = false;

    @action
    showModal() {
        this.isModalOpen = true;
    }

    @action
    hideModal() {
        this.isModalOpen = false;
    }
}

export default new CommonStore();
