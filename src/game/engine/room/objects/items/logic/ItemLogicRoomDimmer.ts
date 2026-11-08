import {RoomDimmerStore} from '../../../dimmer/RoomDimmerStore';
import {Item} from '../Item';
import {ItemLogicMultiState} from './ItemLogicMultiState';

/**
 * A room dimmer (logicType furniture_roomdimmer, the moodlights: roomdimmer, dimmer_swtch...), as Nitro's
 * FurnitureRoomDimmerLogic:
 * - a double click opens the dimmer controller (it doesn't change the state);
 * - its data "state,preset,effect,color,brightness" (state 2 on, 1 off) is the light of the room: the furni shows
 *   on/off and the room is colored (RoomDimmerStore.onDimmerState);
 * - removed from the room, the room goes back to its colors.
 */
export class ItemLogicRoomDimmer extends ItemLogicMultiState {
    /** True if this dimmer colored the room (Nitro's _roomColorUpdated). */
    private roomColorUpdated = false;

    constructor(item: Item) {
        super(item);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onDoubleClick(spriteTag?: string) {
        RoomDimmerStore.getInstance().open(this.entity.id);
    }

    onLoad(): void {
        super.onLoad();
        this.onExtraData((this.entity as Item).extraData);
    }

    onExtraData(data: number | string | null): void {
        const parts = typeof data === 'string' ? data.split(',') : [];
        if (parts.length < 5) return;

        // Nitro's getStateFromDimmerData: 1 on, 0 off
        const state = parseInt(parts[0]) - 1 === 1 ? 1 : 0;
        const presetId = parseInt(parts[1]);
        const effectId = parseInt(parts[2]);
        const color = parts[3];
        const brightness = parseInt(parts[4]);

        // the furni shows on/off
        (this.entity.visualization as any)?.setState?.(state);

        RoomDimmerStore.getInstance().onDimmerState(this.entity.id, state, presetId, effectId, color, brightness);
        this.roomColorUpdated = true;
    }

    dispose(): void {
        if (this.roomColorUpdated) {
            RoomDimmerStore.getInstance().onDimmerRemoved(this.entity.id);
            this.roomColorUpdated = false;
        }

        super.dispose();
    }
}
