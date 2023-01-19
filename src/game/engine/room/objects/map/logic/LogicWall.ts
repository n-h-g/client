import Room from "../../../Room"
import { Graphics } from 'pixi.js'
import { Wall } from '../Wall'
import { RoomObjectLogic } from '../../../../../core/room/object/RoomObjectLogic'

export default class LogicWall extends RoomObjectLogic {
    private wall: Wall
    private hitContext: CanvasRenderingContext2D | null

    constructor(wall: Wall) {
        super()

        this.wall = wall

        let canvas = this.wall.plane.room.Logic.getCanvasWallHit()
        this.hitContext = canvas.getContext("2d")
    }

    dispose(): void {
        throw new Error("Method not implemented.")
    }

    registerEvents(): void {
        setTimeout(() => {          
            this.wall.visualization.WallContext?.on('pointerdown', () => this.onClick());
            this.wall.visualization.WallContext?.on('pointerover', () => this.onHover());
        }, 200);
    }

    tick() : void {}

    public onClick(): void {
        
    }

    public onMove?(delta: number): void {

    }

    public onHover(): void {
        let room: Room | null = this.wall.plane.room.getRoom();

        let wallCtx: Graphics = this.wall.visualization.getWallCtx();
    }
}