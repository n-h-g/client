import { ItemsData } from "../../../../../core/communication/incoming/items/ItemsData";
import ItemVisualization from "../../../../../core/room/object/items/visualization/ItemVisualization";
import { Engine } from "../../../../../Engine";
import FloorItem from "../../../../../engine/room/objects/items/FloorItem";
import WallItem from "../../../../../engine/room/objects/items/WallItem";
import { ItemType } from "../../../../../engine/ui/imagers/items/FurniImager";
import { FurniSprite } from "../../../../../engine/ui/imagers/items/FurniSprite";
import Point3d from "../../../../../utils/point/Point3d";
import { MessageHandler } from "../../../../handler/MessageHandler";

export default class LoadRoomItems extends MessageHandler {
    public handle() {
        let items: ItemsData = this.message;

        for (let itemData of items.data) {

            if (parseInt(itemData.room_id) == -1) return;

            let room = Engine.getInstance().roomService?.CurrentRoom;

            if (room?.roomItemRepository.get(itemData.id) !== null) {
                return;
            }

            let type: ItemType = itemData.item_type as ItemType
            let base = Engine.getInstance().userInterfaceManager?.furniImager.loadFurniSprite(type, itemData.baseName).then((sprite: FurniSprite) => {
                sprite.start()
                let item = type === ItemType.FloorItem ? new FloorItem(null, itemData.id, itemData.name, new Point3d(itemData.x, itemData.y, itemData.z), sprite) : new WallItem(null, itemData.id, itemData.name, new Point3d(itemData.x, itemData.y, itemData.z), sprite);
                room?.roomItemRepository.add(item.id, item);
                (item.visualization as ItemVisualization).updatePosition()
            }).catch((err) => console.log(err));
        }
    }
}
