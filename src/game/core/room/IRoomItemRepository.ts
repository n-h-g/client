import Item from "../../engine/room/objects/items/Item";
import { IRepository } from "../IRepository";

export default interface RoomItemRepository extends IRepository<string, Item> {
    movingItem: Item | null
}