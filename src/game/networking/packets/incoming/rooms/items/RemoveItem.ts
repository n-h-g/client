import { ItemData } from "../../../../../core/communication/incoming/items/ItemsData";
import { Engine } from "../../../../../Engine";
import RoomVisualization from "../../../../../engine/room/visualization/RoomVisualization";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class RemoveItem extends MessageHandler {

    public handle() {
        let item: ItemData = this.message;

        let currentRoom = Engine.getInstance().roomService?.CurrentRoom;
        let itemToRemove = Engine.getInstance().roomService?.CurrentRoom?.roomItemRepository.get(item.id);

        if (!itemToRemove) {
            return;
        }

        currentRoom?.roomLayout.Visualization.Container.removeChild(itemToRemove?.base);
        itemToRemove?.base.destroy();
        Engine.getInstance().roomService?.CurrentRoom?.roomItemRepository.delete(item.id);
    }
}
