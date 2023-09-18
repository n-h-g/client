import {WallLogic} from './logic/WallLogic';
import {WallVisualization} from './visualization/WallVisualization';
import {WallType} from './/WallTypeEnum';
import {Point3d} from '../../../../utils/point/Point3d';
import {ColorRGB} from '../../../../utils/color/ColorRGB';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import {WallPlane} from './WallPlane';
import { RoomMapObject } from '../../../../core/room/object/map/RoomMapObject';

export class Wall
    extends RoomObjectController<WallVisualization, WallLogic>
    implements RoomMapObject
{
    plane: WallPlane;
    type: WallType;
    color: ColorRGB;
    corner: boolean;
    last: boolean;

    constructor(
        plane: WallPlane,
        id: string,
        position: Point3d,
        type: WallType,
        isCorner: boolean,
        isLast: boolean,
        color: ColorRGB
    ) {
        super(id);

        this.plane = plane;
        this.type = type;
        this.color = color;
        this.corner = isCorner;
        this.last = isLast;
        this.position = position;
        this.visualization = new WallVisualization(this);
        this.logic = new WallLogic(this);
    }
}
