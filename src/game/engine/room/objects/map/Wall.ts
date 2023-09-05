import LogicWall from './logic/LogicWall'
import VisualizationWall from './visualization/VisualizationWall'
import { WallType } from './/WallTypeEnum'
import { Point3d } from '../../../../utils/point/Point3d'
import { ColorRGB } from '../../../../utils/color/ColorRGB'
import { RoomObjectController } from '../../../../core/room/object/RoomObjectController'
import { IRoomMapObject } from '../../../../core/room/object/map/IRoomMapObject'
import { WallPlane } from './WallPlane'

export class Wall extends RoomObjectController<VisualizationWall, LogicWall> implements IRoomMapObject {
    private _plane: WallPlane
    private _type: WallType
    private _color: ColorRGB
    private _corner: boolean
    private _last: boolean

    constructor(plane: WallPlane, id: string, position: Point3d, type: WallType,
                isCorner: boolean, isLast: boolean, color: ColorRGB) {
        super(id)

        this._plane = plane
        this._type = type
        this._color = color
        this._corner = isCorner
        this._last = isLast;
        this.position = position
        this.visualization = new VisualizationWall(this)
        this.logic = new LogicWall(this)
    }

    public get color(): ColorRGB {
        return this._color
    }

    public get type(): WallType {
        return this._type
    }

    public get corner(): boolean {
        return this._corner
    }

    public get last(): boolean {
        return this._last
    }

    public get plane(): WallPlane {
        return this._plane
    }
    
    /**
    * @deprecated Use property "type"
    */
    public getType(): WallType {
        return this._type
    }

    /**
    * @deprecated Use property "corner"
    */
    public isCorner(): boolean {
        return this._corner
    }

    /**
    * @deprecated Use property "last"
    */
    public isLast(): boolean {
        return this._last
    }
}