import { ItemData } from "../../../../../core/communication/incoming/items/ItemsData";
import ItemVisualization from "../../../../../core/room/object/items/visualization/ItemVisualization";
import { Engine } from "../../../../../Engine";
import FloorItem from "../../../../../engine/room/objects/items/FloorItem";
import WallItem from "../../../../../engine/room/objects/items/WallItem";
import Room from "../../../../../engine/room/Room";
import { ItemType } from "../../../../../engine/ui/imagers/items/FurniImager";
import { FurniSprite } from "../../../../../engine/ui/imagers/items/FurniSprite";
import Point3d from "../../../../../utils/point/Point3d";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class AddItem extends MessageHandler {
    public handle() {
        let itemData: ItemData = this.message;

        let currentRoom: Room | null | undefined = Engine.getInstance().roomService?.CurrentRoom;

        if (!currentRoom) return;

        if (currentRoom.roomItemRepository.has(itemData.id)) return;

        let type: ItemType = itemData.item_type as ItemType
        Engine.getInstance().userInterfaceManager?.furniImager.loadFurniSprite(type, itemData.baseName).then((sprite: FurniSprite) => {
            sprite.start()
            let item = type === ItemType.FloorItem ? new FloorItem(null, itemData.id, itemData.name, new Point3d(itemData.x, itemData.y, itemData.y), sprite) : new WallItem(null, itemData.id, itemData.name, new Point3d(itemData.x, itemData.y, itemData.z), sprite);
            currentRoom?.roomItemRepository.add(item.id, item);
            (item.visualization as ItemVisualization)?.updatePosition()
        }).catch((err) => console.log(err));
    }
}
