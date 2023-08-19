import { ItemLogic } from '../../../../../core/room/object/items/logic/ItemLogic'
import { FurniSprite } from '../../../../ui/imagers/items/FurniSprite'
import Item from '../Item'
import ItemVisualizationAnimated from '../visualization/ItemVisualizationAnimated'

export default class ItemLogicMultiState extends ItemLogic {

    private state: number = 0

    constructor(item: Item) {
        super(item)
    }

    public registerEvents() {
        super.registerEvents()

        this._entity.visualization.container.on("dblclick", (event) => this.changeState())
    }

    public changeState() {
        let state = this.state;

        let item = this.entity as Item;

        if (this.state > item.base.getAnimations().length) {
            state = 0;
        }
        else {
            state++
        }

        (item.visualization.container as FurniSprite).setAnimation(state);

        this.entity.visualization.needsUpdate = true

        this.state = state;
    }

    public tick(delta: number) {
        super.tick(delta)

        let item = this.entity as Item;

        if (item.base.visualizationType === "furniture_animated") {
            if (this.frameTracker > (1000 * (100 / FurniSprite.FPS)) / FurniSprite.FPS) {
                this.frameTracker = 0;
                (this.entity.visualization as ItemVisualizationAnimated).render()
            }
        }

    }
}