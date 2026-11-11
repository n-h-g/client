import {DoorbellRequest, DoorbellStore} from '../../../../engine/room/DoorbellStore';
import {MessageHandler} from '../../../handler/MessageHandler';

/** Someone rang the doorbell of the room: {id, username, look}. */
export class DoorbellRequestMessage extends MessageHandler {
    handle(): void {
        const request: DoorbellRequest = this.message;
        if (request?.id == null) return;

        DoorbellStore.getInstance().add({id: request.id, username: request.username ?? '', look: request.look ?? ''});
    }
}
