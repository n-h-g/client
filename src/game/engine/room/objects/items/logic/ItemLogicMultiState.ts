import {ItemLogic} from '../../../../../core/room/object/items/logic/ItemLogic';
import { Engine } from '../../../../../Engine';
import { OutgoingPacket } from '../../../../../networking/packets/outgoing/OutgoingPacket';
import { Furni } from '../../../../ui/imagers/items/Furni';
import {FurniImager} from '../../../../ui/imagers/items/FurniImager';
import {Item} from '../Item';
import { ItemVisualizationAnimated } from '../visualization/ItemVisualizationAnimated';

export class ItemLogicMultiState extends ItemLogic {
    private state = 0;

    private lastClickTime = 0;
    private readonly DOUBLE_CLICK_THRESHOLD = 200;

    constructor(item: Item) {
        super(item);
    }

    registerEvents() {
        super.registerEvents();
    }

    changeState() {
        let state = this.state;

        const item = this.entity as Item;

        if (this.state > item.base.getAnimations().length) {
            state = 0;
        } else {
            state++;
        }
        

        (this.entity.visualization.sprite as Furni).setAnimation(state);

        this.state = state;
    }
    
    onClick() {
        const now = Date.now();
        const diff = now - this.lastClickTime;

        if (diff > 0 && diff < this.DOUBLE_CLICK_THRESHOLD) {

            this.onDoubleClick();
            this.lastClickTime = 0;
        } else {
            this.lastClickTime = now;
        }
    }

    onDoubleClick() {
        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
            OutgoingPacket.RoomUseItemEvent,
            {
                id: this.entity.id,
            }
        );
    }

    tick(delta: number) {
    super.tick(delta);

    const item = this.entity as Item;
    this.frameTracker += delta;

    if (item.base.visualizationType === 'furniture_animated') {

        const frameDuration = 1000 / FurniImager.FPS;

        if (this.frameTracker >= frameDuration) {
            this.frameTracker = 0;
            
            (this.entity.visualization as ItemVisualizationAnimated).nextFrame();
        }
    }
}
}
