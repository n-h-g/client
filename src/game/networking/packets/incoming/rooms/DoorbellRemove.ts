import {DoorbellStore} from '../../../../engine/room/DoorbellStore';
import {MessageHandler} from '../../../handler/MessageHandler';

/** A request at the doorbell was answered (by someone else) or the user went away: {id}. */
export class DoorbellRemove extends MessageHandler {
    handle(): void {
        if (this.message?.id == null) return;

        DoorbellStore.getInstance().remove(this.message.id);
    }
}
