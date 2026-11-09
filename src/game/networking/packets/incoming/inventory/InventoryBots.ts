import {EventManager} from '../../../../core/events/EventManager';
import {InventoryBotsData} from '../../../../engine/events/ui/data/inventory/InventoryTabs';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The bots of the user for the inventory (the server sends all of them): {data: [...]}. */
export class InventoryBots extends MessageHandler {
    handle(): void {
        EventManager.emit<InventoryBotsData>(UIEvents.INVENTORY_BOTS, {bots: this.message?.data ?? []});
    }
}
