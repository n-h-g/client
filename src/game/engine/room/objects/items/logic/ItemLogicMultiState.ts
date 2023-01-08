import { ItemLogic } from "../../../../../core/room/object/items/logic/ItemLogic";
import Item from "../Item";

export default class ItemLogicMultiState extends ItemLogic {

    constructor(item: Item) {
        super(item);
    }

    public registerEvents() {
        super.registerEvents();
    }

    public changeState() {

        /*let animation = this.animation;

        if (this.animation > item.base.getAnimations().length) {
            animation = 0;
            this.entity.visualization.needsUpdate = false;
        }
        else {
            animation++
        }

        item.visualization.setAnimation(animation)
        this._item.visualization!.needsUpdate = true;
        this.animation = animation;*/
    }

    public tick(delta: number) {
        /*if (this._item.visualization?.needsUpdate) {
            super.tick(delta);

            this._frameTracker += delta;

            if (this._item.base.furniBase.data.visualization.type === "furniture_animated") {
                if (this._frameTracker >= 100) {
                    this._item.visualization.render();
                    this._frameTracker = 0
                }
            }
        }*/
    }
}