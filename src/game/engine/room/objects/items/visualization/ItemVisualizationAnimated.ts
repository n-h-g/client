import ItemVisualization from "../../../../../core/room/object/items/visualization/ItemVisualization";
import Item from "../Item";

export default class ItemVisualizationAnimated extends ItemVisualization {
    constructor(item: Item) {
        super(item)
    }

    public render() {
        this._entity.base.nextFrame();
        super.render()
    }

}