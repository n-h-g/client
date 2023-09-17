import {Wall} from '../Wall';
import {RoomObjectLogic} from '../../../../../core/room/object/RoomObjectLogic';

export class LogicWall extends RoomObjectLogic {
    private wall: Wall;

    constructor(wall: Wall) {
        super();

        this.wall = wall;

        const canvas = this.wall.plane.room.Logic.getCanvasWallHit();
    }

    dispose(): void {
        throw new Error('Method not implemented.');
    }

    registerEvents(): void {
        this.wall.visualization.WallContext?.on('pointerdown', () =>
            this.onClick()
        );
        this.wall.visualization.WallContext?.on('pointerover', () =>
            this.onHover()
        );
    }

    tick(): void {}

    onClick(): void {}

    onMove?(delta: number): void {}

    onHover(): void {
        this.wall.plane.room.getPointer().logic.hidePointer();
    }
}
