import {Point3d} from '../../../../utils/point/Point3d';
import {PointerVisualization} from './visualization/PointerVisualization';
import {PointerLogic} from './logic/PointerLogic';
import {RoomVisualization} from '../../visualization/RoomVisualization';
import {MapData} from './MapData';
import {RoomLayout} from '../../RoomLayout';
import {Container} from 'pixi.js';
import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';

export class Pointer extends RoomObjectController<
    PointerVisualization,
    PointerLogic
> {
    private room: RoomLayout;

    constructor(room: RoomLayout) {
        super('roomPointer');

        this.room = room;

        this.getCanvas().name = this.id;
        this.getCanvas().width = MapData.tileWidth;
        this.getCanvas().height = MapData.tileHeight;

        this.position = new Point3d(0, 0, 0);
        this.visualization = new PointerVisualization(this);
        this.logic = new PointerLogic(this);
    }

    getCanvas(): Container {
        return this.room.visualization.getCanvasPointer();
    }

    getRoomLayout(): RoomLayout {
        return this.room;
    }
}
