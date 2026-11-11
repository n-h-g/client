import {DoorbellEntryStore} from '../../../../engine/room/DoorbellEntryStore';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The user at the door of a room with the doorbell: {roomId, name, state} (locked, waiting, closed). */
export class DoorbellState extends MessageHandler {
    handle(): void {
        if (this.message?.roomId == null) return;

        DoorbellEntryStore.getInstance().update(this.message);
    }
}
