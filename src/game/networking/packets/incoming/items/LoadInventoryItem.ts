import {ItemsData} from '../../../../core/communication/incoming/items/ItemsData';
import {EventManager} from '../../../../core/events/EventManager';
import {InventoryItemsEventData} from '../../../../engine/events/ui/data/inventory/InventoryItems';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

export default class LoadInventoryItems extends MessageHandler {
    public handle(): void {
        const items: ItemsData = this.message;

        EventManager.emit<InventoryItemsEventData>(
            UIEvents.INVENTORY_ITEMS_ADDED,
            {
                items: items.data,
            }
        );

}
