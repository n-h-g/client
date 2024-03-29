import {Item, ITypeBodyPart} from '../gamedata/IAvatarGeometry';
import {GeometryItem} from './GeometryItem';

export class GeometryBodyPart {
    id: string;
    private items: Map<string, GeometryItem>;

    constructor(bodyPart: ITypeBodyPart) {
        this.id = bodyPart.id;
        this.items = new Map();

        if (bodyPart.items) this.loadItems(bodyPart.items);
    }

    getPartIds(): string[] {
        const ids: string[] = [];

        for (const part of this.items.values()) {
            if (!part) continue;

            ids.push(part.id);
        }

        return ids;
    }

    private loadItems(items: Item[]) {
        if (items && items.length > 0) {
            for (const item of items) {
                const newItem = new GeometryItem(item);

                this.items.set(newItem.id, newItem);
            }
        }
    }
}
