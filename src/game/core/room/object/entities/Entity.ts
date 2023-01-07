import Room from "../../../../engine/room/Room"
import Point3d from "../../../../utils/point/Point3d"
import { RoomObjectController } from "../RoomObjectController"
import { EntityLogic } from './EntityLogic'
import { EntityVisualization } from './EntityVisualization'
import { Moveable } from "./Moveable"
import { Rotatable } from "./Rotatable"

export abstract class Entity extends RoomObjectController<EntityVisualization, EntityLogic>{
    protected _name: string
 
    public constructor(id: string, name: string) {
        super(id, new Point3d(0, 0, 0), null, null)
        this._name = name
    }

    public get name(): string {
        return this._name
    }

    public set name(name: string) {
        this._name = name
    }

} 