import Room from "../../../../engine/room/Room"
import Point3d from "../../../../utils/point/Point3d"
import { RoomObjectController } from "../RoomObjectController"
import { EntityLogic } from './EntityLogic'
import { EntityVisualization } from './EntityVisualization'

export abstract class Entity extends RoomObjectController<EntityVisualization, EntityLogic> {
    protected _name: string
    protected _room: Room

    public constructor(id: string, name: string, room: Room) {
        super(id, new Point3d(0, 0, 0), null, null)

        this._name = name
        this._room = room;
    }

    public get name(): string {
        return this._name
    }

    public get room(): Room {
        return this._room
    }
} 