// @flow
import { type SKUType, type SPUType } from 'module/model/ShoppingCartModel';

type spuItem = SPUType & {data: Array<SKUType>}

type billCellItem = {
    spu: Array<spuItem>
}

export function transformSkusToGroup(item: billCellItem) {
    const sections = [];
    let index = -1;
    const skuItems = [];
    item.spu[0].data.forEach((sku: SKUType) => {
        let _skuItem = skuItems[index];
        if (_skuItem && _skuItem.hasOwnProperty('spec2Name') && _skuItem.spec2Name === sku.spec2Name) {
            _skuItem.spec1.push({code: sku.spec1, value: sku.spec1Name});
            _skuItem.count++;
        } else {
            _skuItem = {};
            _skuItem.spec2Name = sku.spec2Name;
            _skuItem.spec1 = [{code: sku.spec1, value: sku.spec1Name}];
            _skuItem.skuPrice = sku.skuPrice;
            _skuItem.groupNum = sku.skuNum; // 组数
            _skuItem.count = 1; // 每组件数
            skuItems[++index] = _skuItem;
        }
    });

    skuItems.forEach(sku => {
        sku.skuNum = sku.groupNum * sku.count; // 总数
        // 天知道为什么尺码顺序不对，手动排个序
        sku.spec1.sort((a, b) => {
            return a.code - b.code;
        });
        // 显示的尺码名称
        if (sku.count === 1) {
            sku.spec1Name = sku.spec1[0].value;
        } else {
            sku.spec1Name = `${sku.spec1[0].value}-${sku.spec1[sku.count - 1].value}`;
        }
    });

    const spu = { ...item.spu.slice()[0]};
    spu.data = skuItems;
    sections.push(spu);
    return sections;
}