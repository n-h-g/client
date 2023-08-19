import RoomLayout from '../RoomLayout'
import Room from '../Room'
import { IRoomLogic } from '../../../core/room/IRoomLogic'
import { Engine } from '../../../Engine'
import { Point, Sprite, Texture } from 'pixi.js'
import { Viewport } from 'pixi-viewport'
import { RoomPriority } from '../visualization/RoomPriority'
import RoomVisualization from '../visualization/RoomVisualization'
import Point3d from '../../../utils/point/Point3d'
import { UIComponent } from '../../ui/components/UIComponent'
import RoomUI from '../../ui/components/room/RoomUI'
import UiUtils from '../../../utils/UiUtils'
import RenderingUtils from '../../../utils/RenderingUtils'

export class RoomLogic implements IRoomLogic {
    private room: RoomLayout
    private canvasFloorHit: HTMLCanvasElement
    private canvasWallHit: HTMLCanvasElement

    constructor(room: RoomLayout) {
        this.room = room
        this.canvasFloorHit = this.room.createOrGetRoomCanvas('floorHit')

        if(Engine.getInstance().config.debugRoomClick)
            this.room.Visualization.Container.addChild(new Sprite(Texture.from(RenderingUtils.convertCanvasToImage(this.canvasFloorHit))));

        this.canvasWallHit = this.room.createOrGetRoomCanvas('wallHit')
    }

    public dispose(): void {
        
    }

    public registerEvents(): void {
        let roomVisualization = this.room.Visualization

        roomVisualization.getCanvasFloor().on('pointerover', this.onMouseOver.bind(this))
        roomVisualization.Container.on('pointerdown', this.onMouseClick.bind(this))
        roomVisualization.getCanvasFloor().on('pointerout', this.onMouseOut.bind(this))

        Engine.getInstance().application.viewport.on('drag-end', this.onCameraMove.bind(this))

        this.room.getFloorPlane().logic?.registerEvents()
        this.room.getWallPlane().logic?.registerEvents()
    }

    private onCameraMove(e: any) {
        let screen: Point = e.screen
        let viewport: Viewport = e.viewport
    }

    private onMouseClick(e: any) {
        let room: Room = this.room.getRoom()
    }

    private onMouseOver(e: any) {
        let room: Room = this.room.getRoom()

        this.room.Visualization.getCanvasPointer().zIndex = RoomVisualization.calculateZIndex(new Point3d(1, 1, 1), RoomPriority.POINTER)
    }

    private onMouseOut() {
        let room: Room = this.room.getRoom()

        this.room.Visualization.getCanvasPointer().zIndex = RoomVisualization.calculateZIndex(new Point3d(1, 1, 1), RoomPriority.DOOR_FLOOR_SELECT)
        this.room.Visualization.getCanvasPointer().visible = false
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