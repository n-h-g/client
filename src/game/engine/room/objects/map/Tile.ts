import {LogicTile} from './logic/LogicTile';
import {VisualizationTile} from './visualization/VisualizationTile';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import {TileType} from './TileTypeEnum';
import {Point3d} from '../../../../utils/point/Point3d';
import {ColorRGB} from '../../../../utils/color/ColorRGB';
import {FloorPlane} from './FloorPlane';

export class Tile extends RoomObjectController<VisualizationTile, LogicTile> {
    type: TileType;
    color: ColorRGB;
    plane: FloorPlane;

    constructor(
        plane: FloorPlane,
        id: string,
        position: Point3d,
        type: TileType,
        color: ColorRGB
    ) {
        super(id);

        this.plane = plane;
        this.type = type;
        this.color = color;
        this.position = position;
        this.visualization = new VisualizationTile(this);
        this.logic = new LogicTile(this);
    }
}
