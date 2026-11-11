import {EventManager} from '../../../../core/events/EventManager';
import {NoticeData} from '../../../../engine/events/ui/data/general/NoticeData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** A message in a "Notice!" window (e.g. kicked or banned from a room): {message}. */
export class RoomNotice extends MessageHandler {
    handle(): void {
        const message: string = this.message?.message;
        if (!message) return;

        EventManager.emit<NoticeData>(UIEvents.NOTICE, {message});
    }
}
