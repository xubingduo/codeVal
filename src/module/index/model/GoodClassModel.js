/**
 * @author Miao
 * @description 店铺内商品分类
 * @flow
 */

import {ListResponse} from 'model/base';

export interface GoodClass {
    id: number,
    code: string,
    name: string,
    docId: string,
    ecCaption: {
        docId: string
    },
    hasChild: 0 | 1, // 0无，1有
    subItems: GoodClass[]
}

export interface GoodClassResponse extends ListResponse<GoodClass> {}