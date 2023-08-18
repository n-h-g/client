import RoomLayout from '../RoomLayout'
import { Container } from '@pixi/display'
import Point from '../../../utils/point/Point'
import MapData from '../objects/map/MapData'
import UiUtils from '../../../utils/UiUtils'
import { Tile } from '../objects/map/Tile'
import { IRoomVisualization } from '../../../core/room/IRoomVisualization'
import { RoomObjectController } from '../../../core/room/object/RoomObjectController'
import { RoomLogic } from '../logic/RoomLogic'
import Point3d from '../../../utils/point/Point3d'
import { RoomPriority } from './RoomPriority'

export default class RoomVisualization implements IRoomVisualization {
    private roomLayout: RoomLayout
    private canvasFloor: Container
    private canvasWall: Container
    private canvasDoorTile: Container
    private canvasDoorWall: Container
    private canvasPointer: Container
    public container: Container
    
    public needsUpdate: boolean = false

    constructor(room: RoomLayout) {
        this.roomLayout = room

        this.container = new Container()
        this.canvasFloor = new Container()
        this.canvasWall = new Container()
        this.canvasDoorWall = new Container()
        this.canvasPointer = new Container()
        this.canvasDoorTile = new Container()

        this.container.addChild(this.canvasDoorTile)
        this.container.addChild(this.canvasWall)
        this.container.addChild(this.canvasDoorWall)
        this.container.addChild(this.canvasFloor)
        this.container.addChild(this.canvasPointer)

        this.container.x = window.innerWidth / 2
        this.container.y = window.innerHeight / 2

        this.canvasDoorTile.interactive = true
        this.canvasFloor.interactive = true

        let defaultPoint = new Point3d(1, 1, 1)

        this.canvasDoorTile.zIndex = RoomVisualization.calculateZIndex(defaultPoint, RoomPriority.DOOR_FLOOR)
        this.canvasFloor.zIndex = RoomVisualization.calculateZIndex(defaultPoint, RoomPriority.FLOOR)
        this.canvasPointer.zIndex = RoomVisualization.calculateZIndex(defaultPoint, RoomPriority.POINTER)
        this.canvasDoorWall.zIndex = RoomVisualization.calculateZIndex(defaultPoint, RoomPriority.DOOR_WALL)
        this.canvasWall.zIndex = RoomVisualization.calculateZIndex(defaultPoint, RoomPriority.WALL)

        this.container.interactive = true

        this.container.sortableChildren = true
    }

    public dispose(): void {
        this.container.destroy()
    }

    public render() {
        this.roomLayout.getWallPlane().visualization?.render()
        this.roomLayout.getFloorPlane().visualization?.render()
    }

    public tileToLocal(x: number, y: number, z: number): Point {
        return new Point((x - y) * MapData.tileWidth, (x + y) * MapData.tileHeight - (z * MapData.tileHeight * 2))
    }

    public static calculateZIndex(point: Point3d, priority: RoomPriority): number {
        return ((point.getX() + point.getY()) * (1000000) + (point.getZ() * (10000))) + 10000000 * priority
    }

    public getTileByEvent(event: Event): Tile | undefined {
        let hitCtx = this.canvasFloor
        let coords = UiUtils.getPosition(event, hitCtx)
        console.log(coords)
        return this.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.floor(coords.x), Math.floor(coords.y)))
    }

    public globalToTileWithHeight(x: number, y: number, z: number): Point {
        const offsetX = this.container.x
        const offsetY = this.container.y - (z * MapData.tileHeight * 2)

        const xminusy = (x - MapData.tileWidth - offsetX) / MapData.tileWidth
        const xplusy = (y - offsetY) / MapData.tileWidth

        const tileX = Math.floor((xminusy + xplusy) / 2)
        const tileY = Math.floor((xplusy - xminusy) / 2)

        return new Point(tileX, tileY)
    }

    public flip() {
        let scale = this.container.scale.y == 1 ? -1 : 1

        this.container.scale.y = scale
    }

    public zoom(scale: number) {
        if (scale < 0) {
            return
        }

        this.container.scale.x = +scale
        this.container.scale.y = +scale
    }

    public add(object: RoomObjectController<RoomVisualization, RoomLogic>, follow: boolean = false) {
        console.log(object.visualization)

        if (!object) return

        this.container.addChild(object.visualization.container)
    }

    public getCanvasFloor(): Container {
        return this.canvasFloor
    }

    public getCanvasWall(): Container {
        return this.canvasWall
    }

    public getCanvasDoorWall(): Container {
        return this.canvasDoorWall
    }

    public getCanvasPointer(): Container {
        return this.canvasPointer
    }
    public getCanvasDoorTile(): Container {
        return this.canvasDoorTile
    }

    public get Container(): Container {
        return this.container
    }
} 