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
        this.wall.visualization.WallContext?.on('pointerdown', () => this.onClick());
        this.wall.visualization.WallContext?.on('pointerover', () => this.onHover());
    }

    tick() : void {

    }

    public onClick(): void {
        
    }

    public onMove?(delta: number): void {

    }

    public onHover(): void {
        this.wall.plane.room.getPointer().logic.hidePointer()
    }
}