import Repository from "../../core/Repository";
import IRoomService from "../../core/room/IRoomService";
import Item from "./objects/items/Item";

export default class RoomItemRepository extends Repository<string, Item>{

    private items: Map<string, Item> = new Map()

    public movingItem: Item | null = null;


    public tick(delta: number) {
        this.items.forEach((item: Item) => {
            item.logic?.tick(delta)
        })
    }

}