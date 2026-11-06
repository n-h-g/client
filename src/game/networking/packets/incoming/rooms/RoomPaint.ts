import {Engine} from '../../../../Engine';
import {MessageHandler} from '../../../handler/MessageHandler';

/** A wallpaper, floor or landscape applied to the room (Nitro's RoomPaintEvent): {type, value}. */
interface RoomPaintData {
    type: 'wallpaper' | 'floor' | 'landscape';
    value: string;
}

export class RoomPaint extends MessageHandler {
    handle(): void {
        const data: RoomPaintData = this.message;
        const room = Engine.getInstance()?.roomService?.currentRoom;

        if (!room || !data?.value) return;

        switch (data.type) {
            case 'wallpaper':
            case 'floor':
            case 'landscape':
                room.roomLayout.setDecorations({[data.type]: data.value});
                break;
        }
    }
}
