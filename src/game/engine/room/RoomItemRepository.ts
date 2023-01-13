import { Repository } from '../../core/Repository';
import Item from "./objects/items/Item";

export class RoomItemRepository extends Repository<string, Item>{
    private _movingItem: Item

    constructor() {
        super()
    }

    public get movingItem(): Item {
        return this._movingItem
    }

    public set movingItem(item: Item) {
        this._movingItem = item
    }

    public tick(delta: number) {
        this.map.forEach((item: Item) => {
            item.logic.tick(delta)
        })
    }
}