/**
 * author: wwj
 * Date: 2018/8/23
 * Time: 下午2:51
 * des: 引导页的store
 * @flow
 */
import compareVersions from 'compare-versions';
import {RootStore} from './RootStore';
import {computed} from 'mobx';
import {Dimensions,} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import storage from '../utl/DLStorage';

const windowSize = Dimensions.get('window');
const windowWidth = windowSize.width;
const windowHeight = windowSize.height;

const LAST_STORAGE_VERSION = 'LASTSTORAGEVERSION';

export default class GuideStore {

    needShowGuideScreen: boolean = false;

    rootStore: RootStore;

    constructor(rootStore: RootStore) {
        this.rootStore = rootStore;
    }

    @computed get dataSource(): Array<{ key: string, image: number }> {
        // 加载资源
        let key = `${windowWidth}_${windowHeight}`;
        let dataSource = [];

        dataSource.push({
            key: 'guide1',
            image: require('gsresource/img/guideImg/guide1.png')
        });
        dataSource.push({
            key: 'guide2',
            image: require('gsresource/img/guideImg/guide2.png')
        });
        dataSource.push({
            key: 'guide3',
            image: require('gsresource/img/guideImg/guide3.png')
        });
        dataSource.push({
            key: 'guide4',
            image: require('gsresource/img/guideImg/guide4.png')
        });

        return dataSource;
    }

    needShow = async () => {
        try {
            const lastShowVersion = await storage.load({key: LAST_STORAGE_VERSION});
            if (!lastShowVersion) {
                // 如果缓存不存在，则显示引导页
                this.needShowGuideScreen = true;
            }
            const currentVersion = DeviceInfo.getVersion();
            const flag = compareVersions(lastShowVersion, currentVersion);
            if (flag < 0) {
                this.needShowGuideScreen = true;
            }
        } catch (e) {
            if (e.name === 'NotFoundError') {
                this.needShowGuideScreen = true;
            }
        }
        storage.save({key: LAST_STORAGE_VERSION, data: DeviceInfo.getVersion()});
    };

    /**
     * 进入App
     */
    enterApp = () => {
        this.rootStore.updateApp();
    };
}