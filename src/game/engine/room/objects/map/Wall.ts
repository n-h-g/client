import {LogicWall} from './logic/LogicWall';
import {VisualizationWall} from './visualization/VisualizationWall';
import {WallType} from './/WallTypeEnum';
import {Point3d} from '../../../../utils/point/Point3d';
import {ColorRGB} from '../../../../utils/color/ColorRGB';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import {IRoomMapObject} from '../../../../core/room/object/map/IRoomMapObject';
import {WallPlane} from './WallPlane';

export class Wall
    extends RoomObjectController<VisualizationWall, LogicWall>
    implements IRoomMapObject
{
    private _plane: WallPlane;
    private type: WallType;
    private _color: ColorRGB;
    private corner: boolean;
    private last: boolean;

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

        this._plane = plane;

        this.type = type;
        this._color = color;

        this.corner = isCorner;
        this.last = isLast;

        this.position = position;
        this.visualization = new VisualizationWall(this);
        this.logic = new LogicWall(this);
    }

    get color(): ColorRGB {
        return this._color;
    }

    getType(): WallType {
        return this.type;
    }

    isCorner(): boolean {
        return this.corner;
    }

    isLast(): boolean {
        return this.last;
    }

    get plane(): WallPlane {
        return this._plane;
    }
}
