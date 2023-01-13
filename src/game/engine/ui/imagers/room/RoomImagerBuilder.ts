import { IRoomMapObject } from "../../../../core/room/object/map/IRoomMapObject";
import { RoomObjectController } from "../../../../core/room/object/RoomObjectController";
import { RoomObjectLogic } from "../../../../core/room/object/RoomObjectLogic";
import RoomObjectVisualization from "../../../../core/room/object/RoomObjectVisualization";
import Room from "../../../room/Room";

export class RoomImagerBuilder {

    private _room: Room

    private objects: RoomObjectController<RoomObjectVisualization, RoomObjectLogic>[]

    public constructor() {
        this.objects = []
    }

    public setRoom(room: Room) {
        this._room = new Room(room.name, room.getRoomInfo().roomModel, room.roomLayout.getDoorPosition(), room.id)
        return this;
    }

    public setObject(object: RoomObjectController<RoomObjectVisualization, RoomObjectLogic>) {
        this.objects.push(object)
    }

    public build() {
        for(let object of this.objects) {
            object.visualization.render()
        }
        this._room.roomLayout.Visualization.render()
        return this._room
    }
}