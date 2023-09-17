import {RoomPlaneType} from './RoomPlaneTypeEnum';
import {Point3d} from '../../../../utils/point/Point3d';
import {LogicPlane} from './logic/LogicPlane';
import {VisualizationPlane} from './visualization/VisualizationPlane';
import {RoomLayout} from '../../RoomLayout';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import { RoomMapObject } from '../../../../core/room/object/map/RoomMapObject';

export abstract class RoomPlane extends RoomObjectController<
    VisualizationPlane,
    LogicPlane
> {
    room: RoomLayout;
    type: RoomPlaneType;
    mapObjects: Array<RoomMapObject>;

    constructor(room: RoomLayout, type: RoomPlaneType) {
        super('plane' + type);
        this.room = room;
        this.type = type;
		this.mapObjects = new Array();
        this.position = new Point3d(0, 0, 0);
        this.logic = new LogicPlane(this);
        this.visualization = new VisualizationPlane(this);
    }

    addObject(obj: RoomMapObject): void {
        this.mapObjects.push(obj);
    }
}
