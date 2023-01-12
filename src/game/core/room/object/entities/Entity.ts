import { Engine } from "../../../../Engine"
import Room from "../../../../engine/room/Room"
import Point3d from "../../../../utils/point/Point3d"
import { RoomObjectController } from "../RoomObjectController"
import { EntityLogic } from './EntityLogic'
import { EntityVisualization } from './EntityVisualization'
import { Moveable } from "../IMoveable"
import { IRotatable } from "../IRotatable"
import RoomObjectVisualization from "../RoomObjectVisualization"

export abstract class Entity extends RoomObjectController<EntityVisualization, EntityLogic>{
    protected _name: string
 
    public constructor(id: string, name: string) {
        super(id, new Point3d(0, 0, 0), null, null)

        let doorPosition = Engine.getInstance().roomService.CurrentRoom.roomLayout.getDoorPosition()

        this.position = new Point3d(doorPosition.getX(), doorPosition.getY(), 0)
        this._name = name
    }

    public dispose(): void {
        super.dispose()
    }

    public get name(): string {
        return this._name
    }

    public set name(name: string) {
        this._name = name
    }

} 