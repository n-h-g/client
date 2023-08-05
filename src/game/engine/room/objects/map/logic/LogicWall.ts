import { Wall } from '../Wall'
import { RoomObjectLogic } from '../../../../../core/room/object/RoomObjectLogic'

export default class LogicWall extends RoomObjectLogic {
    private wall: Wall

    constructor(wall: Wall) {
        super()

        this.wall = wall

        let canvas = this.wall.plane.room.Logic.getCanvasWallHit()
    }

    dispose(): void {
        throw new Error('Method not implemented.')
    }

    registerEvents(): void {
        setTimeout(() => {          
            this.wall.visualization.WallContext?.on('pointerdown', () => this.onClick());
            this.wall.visualization.WallContext?.on('pointerover', () => this.onHover());
        }, 200);
    }

    tick() : void {

    }

    public onClick(): void {
        
    }

    public onMove?(delta: number): void {

    }

    public onHover(): void {
        
    }
}