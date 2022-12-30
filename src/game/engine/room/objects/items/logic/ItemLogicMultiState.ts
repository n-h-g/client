import ItemLogic from "../../../../../core/room/object/items/logic/ItemLogic";
import Item from "../Item";

export default class ItemLogicMultiState extends ItemLogic {

    private animation: number = 0;

    constructor(item: Item) {
        super(item);

        this.registerEvents();

    }

    public registerEvents() {
        super.registerEvents();
        this.item.base.addListener("click", () => {
            //this.changeState()
        })
    }

    public changeState() {

        let animation = this.animation;

        if (this.animation > this.item.base.furniBase.getAnimations().length) {
            animation = 0;
            this.item.visualization!.needsUpdate = false;
        }
        else {
            animation++
        }

        this.item.base.setAnimation(animation)
        this.item.visualization!.needsUpdate = true;
        this.animation = animation;
    }

    public tick(delta: number) {

        if(this.item.visualization?.needsUpdate) {
            super.tick(delta);

            this.frameTracker += delta;

            if (this.item.base.furniBase.data.visualization.type === "furniture_animated") {

                if (this.frameTracker >= 100) {
                    this.item.visualization.render();
                    this.frameTracker = 0
                }
            }
        }
    }

}