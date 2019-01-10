/**
 * @author Miao
 * @description 基础模型
 * @flow
 */

/**
 *  列表接口返回
 */
export interface ListResponse <T> {
    data: {
        total: number,
        count: number,
        rows: T[]
    }
}

/**
 *  回调函数
 */
export interface Callback {
    (isSuccess: boolean, ext?: string): void
}