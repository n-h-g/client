import {TileLogic} from './logic/TileLogic';
import {TileVisualization} from './visualization/TileVisualization';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import {TileType} from './TileTypeEnum';
import {Point3d} from '../../../../utils/point/Point3d';
import {ColorRGB} from '../../../../utils/color/ColorRGB';
import {FloorPlane} from './FloorPlane';

export class Tile extends RoomObjectController<TileVisualization, TileLogic> {
    type: TileType;
    color: ColorRGB;
    plane: FloorPlane;
    /**
     * True while a floor hole furni (hole3, ...) stands on the tile: the tile is removed from the floor
     * (not drawn, not hoverable) as long as the furni is there.
     */
    coveredByFloorHole = false;

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
        this.visualization = new TileVisualization(this);
        this.logic = new TileLogic(this);
    }
}
