import {EventManager} from '../../../../core/events/EventManager';
import {InventoryBadgesData} from '../../../../engine/events/ui/data/inventory/InventoryTabs';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The badges of the user for the inventory (the server sends all of them): {data: [...]}. */
export class InventoryBadges extends MessageHandler {
    handle(): void {
        EventManager.emit<InventoryBadgesData>(UIEvents.INVENTORY_BADGES, {badges: this.message?.data ?? []});
    }
}
