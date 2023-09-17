import {ItemVisualization} from '../../../../../core/room/object/items/visualization/ItemVisualization';
import Item from '../Item';

export class ItemVisualizationAnimated extends ItemVisualization {
    private animation = 0;
    private _lastAnimation = 0;
    private _currentFrame = 0;

    constructor(item: Item) {
        super(item);
    }

    public async render() {
        await super.render();
    }

    public nextFrame(): void {}

    public setAnimation(animation: number) {
        const item = this.entity as Item;
        this.entity.visualization.draw();
    }
}
