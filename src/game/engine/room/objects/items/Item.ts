import IRoomObjectLogic from "../../../../core/room/object/IRoomObjectLogic";
import IRoomObjectVisualization from "../../../../core/room/object/IRoomObjectVisualization";
import IRoomItemObject from "../../../../core/room/object/items/IRoomItemObject";
import ItemLogic from "../../../../core/room/object/items/logic/ItemLogic";
import RoomObjectController from "../../../../core/room/object/RoomObjectController";
import Point3d from "../../../../utils/point/Point3d";
import { FurniSprite } from "../../../ui/imagers/items/FurniSprite";
import Room from "../../Room";
import ItemLogicBasic from "./logic/ItemLogicBasic";
import ItemLogicMultiState from "./logic/ItemLogicMultiState";
import ItemVisualizationAnimated from "./visualization/ItemVisualizationAnimated";
import { default as ItemVisualization, default as ItemVisualizationStatic } from "./visualization/ItemVisualizationStatic";

export default abstract class Item extends RoomObjectController implements IRoomItemObject {

    public room: Room | null
    public base: FurniSprite;
    public name: string;

    constructor(room: Room | null, id: string, name: string, position: Point3d, baseItem: FurniSprite) {

        super(id, position, null, null)

        this.base = baseItem;

        this.name = name;

        this.room = room;

        let visualization = this.getItemVisualizationFromType(this.base.furniBase.data.visualization.type)
        let logic = this.getItemLogicFromType(this.base.furniBase.data.logic.type)

        this.objectVisualization = (visualization);
        this.objectLogic = logic

        
    }

    private getItemVisualizationFromType(type: string) : ItemVisualization
    {
        switch(type) {

            default:
                case "furniture_static":
                    return new ItemVisualizationStatic(this);
                case "furniture_animated":
                    return new ItemVisualizationAnimated(this)

        }
    }

    private getItemLogicFromType(type: string) : ItemLogic {

        switch(type) {

            default:
                case "furniture_basic":
                    return new ItemLogicBasic(this);
                case "furniture_multistate":
                    return new ItemLogicMultiState(this)
        }

    }
}