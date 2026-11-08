import type {FederatedPointerEvent} from 'pixi.js';
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
    // ms between the two clicks of a double click (200 was too short: a normal double click was missed)
    private readonly DOUBLE_CLICK_THRESHOLD = 400;

    constructor(item: Item) {
        super(item);
    }

    changeState() {
        const item = this.entity as Item;
        const animations = item.base.getAnimations();
        
        if (!animations || animations.length === 0) return;

        // offline mode only: online the server sends the new state (UpdateEntity)
        const visualization = this.entity.visualization as any;
        visualization.setState((visualization.state + 1) % animations.length);
    }
    
    onClick(event?: FederatedPointerEvent) {
        // single click: the preview, like the other furni; double click: next state
        super.onClick();

        const now = Date.now();
        const diff = now - this.lastClickTime;

        if (diff > 0 && diff < this.DOUBLE_CLICK_THRESHOLD) {

            // after the walk of this click (RoomLogic, the same pointerdown): as Nitro the use comes last, else the
            // walk to the tile under the mouse cancels it on the server (e.g. a teleport the user walks to)
            const spriteTag = this.getSpriteTag(event);
            setTimeout(() => this.onDoubleClick(spriteTag), 0);
            this.lastClickTime = 0;
        } else {
            this.lastClickTime = now;
        }
    }

    /**
     * The tag of the layer under the mouse (Nitro's spriteTag, e.g. 'activate' on a dice), '' if none.
     */
    protected getSpriteTag(event?: FederatedPointerEvent): string {
        const furni = this.entity.visualization?.sprite as Furni | undefined;

        return event?.global && typeof furni?.getSpriteTagAt === 'function' ? furni.getSpriteTagAt(event.global) : '';
    }

    /**
     * @param spriteTag the tag of the layer double clicked, undefined from the "use" button of the preview.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDoubleClick(spriteTag?: string) {
        if(!Engine.getInstance().config.offlineMode)
        {
            Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
                OutgoingPacket.RoomUseItemEvent,
                {
                    id: this.entity.id,
                }
            );
        } else {
            this.changeState();
        }
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
