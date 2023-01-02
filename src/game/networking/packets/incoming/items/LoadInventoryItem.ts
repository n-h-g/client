
import { ItemsData } from "../../../../core/communication/incoming/items/ItemsData";
import { EventManager } from "../../../../engine/ui/events/EventManager";
import { InventoryItemsAdded } from "../../../../engine/ui/events/inventory/InventoryItemsAdded";
import { UIEvents } from "../../../../engine/ui/events/UIEvents";
import { MessageHandler } from "../../../handler/MessageHandler";

export default class LoadInventoryItems extends MessageHandler {
    public handle(): void {
        let items: ItemsData = this.message;

        EventManager.emit<InventoryItemsAdded>(UIEvents.INVENTORY_ITEMS_ADDED, {
            items: items.data
        })
    }
    
}
