import { RoomPlaneType } from './RoomPlaneTypeEnum'
import LogicPlane from './logic/LogicPlane'
import VisualizationPlane from './visualization/VisualizationPlane'
import RoomLayout from '../../RoomLayout'
import { RoomObjectController } from '../../../../core/room/object/RoomObjectController'
import { IRoomMapObject } from '../../../../core/room/object/map/IRoomMapObject'

export abstract class RoomPlane extends RoomObjectController<VisualizationPlane, LogicPlane> {
    private _room: RoomLayout
    private _type: RoomPlaneType
    private _mapObjects: Array<IRoomMapObject> = new Array<IRoomMapObject>()

    constructor(room: RoomLayout, type: RoomPlaneType) {
        super('plane' + type)
        this._room = room
        this._type = type
        this.logic = new LogicPlane(this)
        this.visualization = new VisualizationPlane(this)
    }

    public addObject(obj: IRoomMapObject): void {
        this._mapObjects.push(obj)
    }

    public get mapObjects(): Array<IRoomMapObject> {
        return this._mapObjects
    }

    public get type(): RoomPlaneType {
        return this._type
    }

    public get room(): RoomLayout {
        return this._room
    }
}