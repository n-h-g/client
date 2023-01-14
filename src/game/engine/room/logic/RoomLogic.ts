import RoomLayout from "../RoomLayout"
import Room from "../Room"
import { IRoomLogic } from '../../../core/room/IRoomLogic'
import { Engine } from "../../../Engine"
import { InteractionEvent, Point } from "pixi.js"
import { Viewport } from "pixi-viewport"

export class RoomLogic implements IRoomLogic {
    private room: RoomLayout

    private canvasFloorHit: HTMLCanvasElement
    private canvasWallHit: HTMLCanvasElement


    constructor(room: RoomLayout) {
        this.room = room

        this.canvasFloorHit = this.room.createOrGetRoomCanvas("floorHit")
        this.canvasWallHit = this.room.createOrGetRoomCanvas("wallHit")
    }

    public dispose(): void {
        
    }

    public registerEvents(): void {
        let roomVisualization = this.room.Visualization;

        roomVisualization.getCanvasFloor().on('pointerover', this.onMouseOver.bind(this));
        roomVisualization.Container.on('pointerdown', this.onMouseClick.bind(this));
        roomVisualization.getCanvasFloor().on('pointerout', this.onMouseOut.bind(this));
        Engine.getInstance().application.viewport.on('drag-end', this.onCameraMove.bind(this));

        this.room.getFloorPlane().logic?.registerEvents()
        this.room.getWallPlane().logic?.registerEvents()
    }

    private onCameraMove(e: any) {
        let screen: Point = e.screen
        let viewport: Viewport = e.viewport

        let rect = viewport.getVisibleBounds()

        let out: boolean = false

        if(!this.room.Visualization.container) return;

        if(this.room.Visualization.container.x + this.room.Visualization.container.width < 0) {
            out = true
        }
    
        if(rect.x > window.innerWidth) {
            out = true
        }
        if(rect.y > window.innerHeight) {
            out = true
        }

    }

    private onMouseClick(e: any) {
        let room: Room = this.room.getRoom();
    }

    private onMouseOver(e: any) {
        let room: Room = this.room.getRoom();

        this.room.Visualization.getCanvasPointer().zIndex = 5;
        this.room.Visualization.Container.sortChildren()
    }

    private onMouseOut() {
        let room: Room = this.room.getRoom();

        this.room.Visualization.getCanvasPointer().zIndex = 3;
        this.room.Visualization.Container.sortChildren()
    }


    public tick(delta: number): void {
        this.room.getWallPlane().logic?.tick(delta)
        this.room.getFloorPlane().logic?.tick(delta)
    }

    public getCanvasFloorHit(): HTMLCanvasElement {
        return this.canvasFloorHit
    }

    public getCanvasWallHit(): HTMLCanvasElement {
        return this.canvasWallHit
    }
}