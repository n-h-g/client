import Point3d from "../../../../utils/point/Point3d";
import { FurniSprite } from "../../../ui/imagers/items/FurniSprite";
import Room from "../../Room";
import Item from "./Item";

export default class FloorItem extends Item {

    constructor(id: string = "", name: string = "", position: Point3d = new Point3d(0, 0, 0), baseItem: FurniSprite = null) {
        super(id, name, position, baseItem);
    }
}