import {EventManager} from '../../../../core/events/EventManager';
import {InventoryPetsData} from '../../../../engine/events/ui/data/inventory/InventoryTabs';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The pets of the user for the inventory (the server sends all of them): {data: [...]}. */
export class InventoryPets extends MessageHandler {
    handle(): void {
        EventManager.emit<InventoryPetsData>(UIEvents.INVENTORY_PETS, {pets: this.message?.data ?? []});
    }
}
