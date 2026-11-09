import {EventManager} from '../../../../core/events/EventManager';
import {BubbleAlertData} from '../../../../engine/events/ui/data/general/BubbleAlertData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** A notification of the server (e.g. a service back online): {data: the text}. */
export class BubbleAlert extends MessageHandler {
    handle(): void {
        const message: string = this.message?.data;
        if (!message) return;

        EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, {message});
    }
}
