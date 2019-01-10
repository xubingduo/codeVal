/**
 * author: wwj
 * Date: 2018/8/2
 * Time: 下午1:42
 * des:
 * @flow
 */

export type RecInfoType = {
    id: number,
    userId: number,
    addrId: number,
    linkMan: string,
    telephone: string,
    isDefault: number,
}

export type AddressType = {
    id: number,
    provinceCode: number,
    cityCode: number,
    countyCode: number,
    townCode: number,
    detailAddr: string,
}

export type AddressDetailType = {
    recInfo: RecInfoType,
    address: AddressType,
}