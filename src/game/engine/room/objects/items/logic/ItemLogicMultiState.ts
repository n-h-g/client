import {ItemLogic} from '../../../../../core/room/object/items/logic/ItemLogic';
import {FurniImager} from '../../../../ui/imagers/items/FurniImager';
import {Item} from '../Item';

export class ItemLogicMultiState extends ItemLogic {
    private state = 0;

    constructor(item: Item) {
        super(item);
    }

    registerEvents() {
        super.registerEvents();
        //this.entity.visualization.container.on("dblclick", (event) => this.changeState())
    }

    changeState() {
        let state = this.state;

        const item = this.entity as Item;

        if (this.state > item.base.getAnimations().length) {
            state = 0;
        } else {
            state++;
        }

        //(item.visualization.container as FurniSprite).setAnimation(state);

        //this.entity.visualization.needsUpdate = true

        this.state = state;
    }

    tick(delta: number) {
        super.tick(delta);

        const item = this.entity as Item;

        this.frameTracker += delta;

        if (item.base.visualizationType === 'furniture_animated') {
            if (
                this.frameTracker >
                (1000 * (100 / FurniImager.FPS)) / FurniImager.FPS
            ) {
                this.frameTracker = 0;
                //(this.entity.visualization as ItemVisualizationAnimated).frame = (this.entity.visualization as ItemVisualizationAnimated).frame + 1;
                //(this.entity.visualization as ItemVisualizationAnimated).draw()
            }
        }
    }
}
