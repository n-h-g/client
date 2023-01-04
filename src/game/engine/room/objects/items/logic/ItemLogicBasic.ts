import { ItemLogic } from "../../../../../core/room/object/items/logic/ItemLogic";
import Item from "../Item";

export default class ItemLogicBasic extends ItemLogic {

    constructor(item: Item) {
        super(item);
    }
    
    public tick(delta: number) { super.tick(delta) }

    public registerEvents() : void { }

}