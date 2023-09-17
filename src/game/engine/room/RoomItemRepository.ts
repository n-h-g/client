import {Repository} from '../../core/Repository';
import {Item} from './objects/items/Item';

export class RoomItemRepository extends Repository<string, Item> {
    private _movingItem: Item;

    constructor() {
        super();
    }

    get movingItem(): Item {
        return this._movingItem;
    }

    set movingItem(item: Item) {
        this._movingItem = item;
    }

    tick(delta: number) {
        this.getAll().forEach((item: Item) => {
            item.logic.tick(delta);
        });
    }
}
