import { ItemLogic } from '../../../../../core/room/object/items/logic/ItemLogic'
import FurniImager from '../../../../ui/imagers/items/FurniImager'
import Item from '../Item'
import { ItemVisualizationAnimated } from '../visualization/ItemVisualizationAnimated'

export default class ItemLogicMultiState extends ItemLogic {

    private state: number = 0

    constructor(item: Item) {
        super(item)
    }

    public registerEvents() {
        super.registerEvents()
        this.entity.visualization.container.on("dblclick", (event) => this.changeState())
    }

    public changeState() {
        console.log('changed state');
        let state = this.state;

        let item = this.entity as Item;

        if (this.state > item.base.getAnimations().length) {
            state = 0;
        }
        else {
            state++
        }

        //(item.visualization.container as FurniSprite).setAnimation(state);
        

        //this.entity.visualization.needsUpdate = true

        this.state = state;
    }

    public tick(delta: number) {
        super.tick(delta)

        let item = this.entity as Item;

        this.frameTracker += delta

        if (item.base.visualizationType === "furniture_animated") {

            if (this.frameTracker > (1000 * (100 / FurniImager.FPS)) / FurniImager.FPS) {
                this.frameTracker = 0;
                //(this.entity.visualization as ItemVisualizationAnimated).frame = (this.entity.visualization as ItemVisualizationAnimated).frame + 1;
                //(this.entity.visualization as ItemVisualizationAnimated).draw()
            }
        }

    }
}