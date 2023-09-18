import {RoomPlaneType} from './RoomPlaneTypeEnum';
import {Point3d} from '../../../../utils/point/Point3d';
import {PlaneLogic} from './logic/PlaneLogic';
import {PlaneVisualization} from './visualization/PlaneVisualization';
import {RoomLayout} from '../../RoomLayout';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import { RoomMapObject } from '../../../../core/room/object/map/RoomMapObject';

export abstract class RoomPlane extends RoomObjectController<
    PlaneVisualization,
    PlaneLogic
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
        this.logic = new PlaneLogic(this);
        this.visualization = new PlaneVisualization(this);
    }

    addObject(obj: RoomMapObject): void {
        this.mapObjects.push(obj);
    }
}
