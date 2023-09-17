import {ItemVisualization} from '../../../../../core/room/object/items/visualization/ItemVisualization';
import {Item} from '../Item';

export class ItemVisualizationAnimated extends ItemVisualization {

    constructor(item: Item) {
        super(item);
    }

    async render() {
        await super.render();
    }

    nextFrame(): void {}

    setAnimation(animation: number) {
        this.entity.visualization.draw();
    }
}
