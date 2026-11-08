import {Engine} from '../../../../../Engine';
import {OutgoingPacket} from '../../../../../networking/packets/outgoing/OutgoingPacket';
import {Item} from '../Item';
import {ItemLogicMultiState} from './ItemLogicMultiState';

/**
 * A dice (logicType furniture_dice, as Nitro's FurnitureDiceLogic): the server decides, the client asks.
 * - a double click on the dice (layer tag 'activate'), or on a closed dice: roll it (DICE_ACTIVATE);
 * - a double click on its base (layer tag 'deactivate'): close it (DICE_OFF).
 * A dice without tags alternates roll and close. The roll is the animation of the state -1.
 */
export class ItemLogicDice extends ItemLogicMultiState {
    /** The state of a closed dice: 0, or 100 for some dice. */
    private static readonly CLOSED_STATES = [0, 100];

    /** Without tags: the last double click rolled it (the next one closes it). */
    private lastActivate = false;

    constructor(item: Item) {
        super(item);
    }

    onDoubleClick(spriteTag?: string) {
        const state = (this.entity.visualization as any)?.state ?? 0;
        const closed = ItemLogicDice.CLOSED_STATES.includes(state);

        let activate: boolean;

        if (spriteTag === undefined) {
            // the "use" button of the preview: roll
            activate = true;
        } else if (!this.hasTags()) {
            activate = !this.lastActivate || closed;
            this.lastActivate = activate;
        } else if (spriteTag === 'activate' || closed) {
            activate = true;
        } else if (spriteTag === 'deactivate') {
            activate = false;
        } else {
            return;
        }

        Engine.getInstance()?.networkingManager?.packetManager?.applyOut(
            activate ? OutgoingPacket.RoomDiceActivateEvent : OutgoingPacket.RoomDiceOffEvent,
            {id: this.entity.id}
        );
    }

    /** True if some layer of the furni has a tag (Nitro's _noTags is the opposite). */
    private hasTags(): boolean {
        const base = (this.entity as Item).base;
        const layers = base?.getLayerCount?.() ?? 0;

        for (let layer = 0; layer < layers; layer++) {
            if (base.getLayer(layer)?.tag) return true;
        }

        return false;
    }
}
