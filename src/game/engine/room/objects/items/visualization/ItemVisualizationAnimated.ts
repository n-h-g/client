import ItemVisualization from '../../../../../core/room/object/items/visualization/ItemVisualization'
import Item from '../Item'

export default class ItemVisualizationAnimated extends ItemVisualization {
    private animation: number = 0

    constructor(item: Item) {
        super(item)
    }

    public async render() {
        super.render()
    }

    public setAnimation(animation: number) {

    }
}