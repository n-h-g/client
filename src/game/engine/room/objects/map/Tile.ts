import LogicTile from './logic/LogicTile'
import VisualizationTile from './visualization/VisualizationTile'
import { RoomObjectController } from '../../../../core/room/object/RoomObjectController'
import { TileType } from './TileTypeEnum'
import Point3d from '../../../../utils/point/Point3d'
import { ColorRGB } from '../../../../utils/color/ColorRGB'
import { FloorPlane } from './FloorPlane'

export class Tile extends RoomObjectController<VisualizationTile, LogicTile> {
    private _type: TileType
    private _color: ColorRGB
    private _plane: FloorPlane

    constructor(plane: FloorPlane, id: string, position: Point3d, type: TileType, color: ColorRGB) {
        super(id, position, null, null)

        this._plane = plane
        this._type = type
        this._color = color
        this.visualization = new VisualizationTile(this)
        this.logic = new LogicTile(this)
    }

    public get color(): ColorRGB {
        return this._color
    }

    public get type(): TileType {
        return this._type
    }

    public get plane(): FloorPlane {
        return this._plane
    }

    public set type(type: TileType) {
        this._type = type
    }
}