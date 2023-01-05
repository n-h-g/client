
import { ItemsData } from "../../../../core/communication/incoming/items/ItemsData";
import { EventManager } from "../../../../core/events/EventManager";
import { InventoryItemsEventData } from "../../../../engine/ui/events/data/inventory/InventoryItems";
import { UIEvents } from "../../../../engine/ui/events/UIEvents";
import { MessageHandler } from "../../../handler/MessageHandler";

export default class LoadInventoryItems extends MessageHandler {
    public handle(): void {
        let items: ItemsData = this.message;

        EventManager.emit<InventoryItemsEventData>(UIEvents.INVENTORY_ITEMS_ADDED, {
            items: items.data
        })
    }
    
}
