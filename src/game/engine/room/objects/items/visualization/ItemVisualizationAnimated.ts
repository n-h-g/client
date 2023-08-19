import ItemVisualization from '../../../../../core/room/object/items/visualization/ItemVisualization'
import { FurniSprite } from '../../../../ui/imagers/items/FurniSprite'
import Item from '../Item'

export default class ItemVisualizationAnimated extends ItemVisualization {

    private animation: number = 0

    constructor(item: Item) {
        super(item)
    }

    public async render() {
        if(this.needsUpdate) {
            this.setAnimation(this.animation + 1)
        }

        super.render()
    }

    public setAnimation(animation: number) {
        let item = this.entity as Item

        let container = item.visualization.container as FurniSprite

        container.nextFrame()

        this.entity.visualization.draw()
    }
}