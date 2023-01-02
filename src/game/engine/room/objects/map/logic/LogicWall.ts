import Wall from "../Wall"
import RoomLogic from "../../../logic/RoomLogic"
import RoomObjectLogic from "../../../../../core/room/object/RoomObjectLogic"
import VisualizationWall from "../visualization/VisualizationWall"
import Room from "../../../Room"
import { Graphics } from 'pixi.js'

export default class LogicWall extends RoomObjectLogic {

    private wall: Wall
    private hitContext: CanvasRenderingContext2D | null

    constructor(wall: Wall) {
        super()

        this.wall = wall

        let canvas = (this.wall.getPlane().getRoom().Logic as RoomLogic).getCanvasWallHit()
        this.hitContext = canvas.getContext("2d")
    }

    registerEvents(): void {
        setTimeout(() => {          
            (this.wall.visualization as VisualizationWall).WallContext?.on('pointerdown', () => this.onClick());
            (this.wall.visualization as VisualizationWall).WallContext?.on('pointerover', () => this.onHover());
        }, 200);
    }

    tick() : void {}

    public onClick(): void {
        
    }

    public onMove?(delta: number): void {
        throw new Error("Method not implemented.")
    }

    public onHover(): void {
        let room: Room | null = this.wall.getPlane().getRoom().getRoom();

        let wallCtx: Graphics = (this.wall.visualization as VisualizationWall).getWallCtx();       
    }
}