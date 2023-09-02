import { ItemVisualization } from '../../../../../core/room/object/items/visualization/ItemVisualization'
import Item from '../Item'

export class ItemVisualizationStatic extends ItemVisualization {
    constructor(item: Item) {
        super(item);
    }

    public async render(): Promise<void> {
        await super.render()
    }
}