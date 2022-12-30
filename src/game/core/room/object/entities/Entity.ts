import Room from "../../../../engine/room/Room";
import Point3d from "../../../../utils/point/Point3d";
import RoomObjectController from "../RoomObjectController";
import EntityLogic from "./EntityLogic";
import EntityVisualization from "./EntityVisualization";
import IRoomEntity from "./IEntity";

export default abstract class Entity extends RoomObjectController implements IRoomEntity {

    protected name: string;
    protected room: Room;

    /**
     * Override the RoomObjectController properties
     */
    public _visualization: EntityVisualization | null = null;
    public _logic: EntityLogic | null = null;

    public constructor(id: string, name: string, room: Room) {
        super(id, new Point3d(0, 0, 0), null, null)

        this.name = name
        this.room = room;
    }

    public get Name(): string { return this.name; }
    public get Room(): Room | null { return this.room; }

    public get visualization(): EntityVisualization | null{
        return this._visualization;
    }

    public get logic(): EntityLogic | null {
        return this._logic;
    }

    public set visualization(visualization: EntityVisualization | null) {
        this._visualization = visualization;
    } 
    public set logic(logic: EntityLogic | null) {
        this._logic = logic;
    }
} 