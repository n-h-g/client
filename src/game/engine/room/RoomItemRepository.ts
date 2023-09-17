import {Repository} from '../../core/Repository';
import {Item} from './objects/items/Item';

export class RoomItemRepository extends Repository<string, Item> {
    movingItem: Item;

    constructor() {
        super();
    }

    tick(delta: number) {
        this.getAll().forEach((item: Item) => {
            item.logic.tick(delta);
        });
    }
}
