import {EventManager} from '../../../../core/events/EventManager';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/**
 * Purchase completed: the message is the bought item (the inventory and the credits arrive with their own packets).
 */
export class BuyItem extends MessageHandler {
    handle(): void {
        EventManager.emit(UIEvents.CATALOG_ITEM_BOUGHT, this.message);
    }
}
