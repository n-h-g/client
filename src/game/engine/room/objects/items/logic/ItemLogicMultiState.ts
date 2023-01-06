import { ItemLogic } from "../../../../../core/room/object/items/logic/ItemLogic";
import Item from "../Item";

export default class ItemLogicMultiState extends ItemLogic {
    private animation: number = 0;

    constructor(item: Item) {
        super(item);

        this.registerEvents();

    }

    public registerEvents() {
        super.registerEvents();
        this._item.base.addListener("click", () => {
            //this.changeState()
        })
    }

    public changeState() {

        let animation = this.animation;

        if (this.animation > this._item.base.furniBase.getAnimations().length) {
            animation = 0;
            this._item.visualization!.needsUpdate = false;
        }
        else {
            animation++
        }

        this._item.base.setAnimation(animation)
        this._item.visualization!.needsUpdate = true;
        this.animation = animation;
    }

    public tick(delta: number) {
        if (this._item.visualization?.needsUpdate) {
            super.tick(delta);

            this._frameTracker += delta;

            if (this._item.base.furniBase.data.visualization.type === "furniture_animated") {
                if (this._frameTracker >= 100) {
                    this._item.visualization.render();
                    this._frameTracker = 0
                }
            }
        }
    }
}