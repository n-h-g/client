import ItemVisualization from "../../../../../core/room/object/items/visualization/ItemVisualization";
import Item from "../Item";

export default class ItemVisualizationStatic extends ItemVisualization {
    constructor(item: Item) {
        super(item);
    }

    public async render(): Promise<void> {
        super.render()
    }
}