import {RoomDimmerPreset, RoomDimmerStore} from '../../../../../engine/room/dimmer/RoomDimmerStore';
import {MessageHandler} from '../../../../handler/MessageHandler';

/**
 * The presets of a room dimmer (Nitro's RoomDimmerPresetsMessageEvent), sent only to a user with rights: the
 * dimmer controller opens.
 */
export class RoomDimmerPresets extends MessageHandler {
    handle(): void {
        const data = this.message;
        if (!data?.id) return;

        const presets: RoomDimmerPreset[] = (data.presets ?? []).map((preset: any) => ({
            id: Number(preset.id),
            color: String(preset.color ?? '#000000').toUpperCase(),
            brightness: Number(preset.brightness ?? RoomDimmerStore.MAX_BRIGHTNESS),
            backgroundOnly: !!preset.backgroundOnly,
        }));

        RoomDimmerStore.getInstance().onPresets(String(data.id), Number(data.selected ?? 1), presets);
    }
}
