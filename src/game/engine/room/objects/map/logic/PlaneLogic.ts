import {RoomObjectController} from '../../../../../core/room/object/RoomObjectController';
import {RoomObjectLogic} from '../../../../../core/room/object/RoomObjectLogic';
import { Furni } from '../../../../ui/imagers/items/Furni';
import {RoomPlane} from '../RoomPlane';

export class PlaneLogic extends RoomObjectLogic {
    private plane: RoomPlane;

    constructor(plane: RoomPlane) {
        super();

        this.plane = plane;

        //this.registerEvents();
    }

    onMove?(delta: number): void {}

    onHover(event?: any): void {
        const room = this.plane.room.getRoom();
        
        if (room.roomEntityRepository.isEntityRolling()) {
            const rollingEntity = room.roomEntityRepository.rollingEntity;
            
            if (rollingEntity && rollingEntity.visualization) {
                (rollingEntity.visualization.sprite as Furni).setIcon(true);
            }
        }
    }

    onMouseMove(event: any): void {
    const room = this.plane.room.getRoom();

     const floorCanvas = this.plane.room.visualization.getCanvasFloor();
    
    if (room.roomEntityRepository.isEntityRolling()) {
        const rollingEntity = room.roomEntityRepository.rollingEntity;
        
        if (rollingEntity && rollingEntity.visualization && (rollingEntity.visualization.sprite as Furni).icon) {
            
            const localPos = event.data.getLocalPosition(floorCanvas);
            
            rollingEntity.visualization.container.x = localPos.x;
            rollingEntity.visualization.container.y = localPos.y;
            
            rollingEntity.visualization.container.zIndex = 10000;
        }
    }
}

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    registerEvents(): void {
        this.plane.mapObjects.forEach(obj => {
            if (obj instanceof RoomObjectController) {
                obj.logic?.registerEvents();
            }
        });

        const floorCanvas = this.plane.room.visualization.getCanvasFloor();

        //floorCanvas.on('pointerover', () => this.onHover());
        //floorCanvas.on('pointerout', (event) => this.onMouseMove(event));
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
