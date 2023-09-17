import {RoomPlaneType} from './RoomPlaneTypeEnum';
import Point3d from '../../../../utils/point/Point3d';
import LogicPlane from './logic/LogicPlane';
import VisualizationPlane from './visualization/VisualizationPlane';
import RoomLayout from '../../RoomLayout';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import {IRoomMapObject} from '../../../../core/room/object/map/IRoomMapObject';

export abstract class RoomPlane extends RoomObjectController<
    VisualizationPlane,
    LogicPlane
> {
    private _room: RoomLayout;
    private _type: RoomPlaneType;
    private objectList: Array<IRoomMapObject> = new Array<IRoomMapObject>();

    constructor(room: RoomLayout, type: RoomPlaneType) {
        super('plane' + type);
        this._room = room;
        this._type = type;
        this.position = new Point3d(0, 0, 0);
        this.logic = new LogicPlane(this);
        this.visualization = new VisualizationPlane(this);
    }

    public addObject(obj: IRoomMapObject): void {
        this.objectList.push(obj);
    }

    public get mapObjects(): Array<IRoomMapObject> {
        return this.objectList;
    }

    public get type(): RoomPlaneType {
        return this._type;
    }

    public get room(): RoomLayout {
        return this._room;
    }
}
