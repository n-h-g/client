import {RoomObjectController} from '../../../../../core/room/object/RoomObjectController';
import {RoomObjectLogic} from '../../../../../core/room/object/RoomObjectLogic';
import {RoomPlane} from '../RoomPlane';

export class LogicPlane extends RoomObjectLogic {
    private plane: RoomPlane;

    constructor(plane: RoomPlane) {
        super();

        this.plane = plane;
    }

    onMove?(delta: number): void {}

    onHover?(): void {}

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    registerEvents(): void {
        this.plane.mapObjects.forEach(obj => {
            if (obj instanceof RoomObjectController) {
                obj.logic?.registerEvents();
            }
        });
    }

    tick(delta: number): void {
        this.plane.mapObjects.forEach(obj => {
            if (obj instanceof RoomObjectController) {
                obj.logic?.tick(delta);
            }
        });
    }

    onClick(): void {}
}
