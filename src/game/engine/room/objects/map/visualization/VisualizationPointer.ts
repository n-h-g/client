import RoomObjectVisualization from '../../../../../core/room/object/RoomObjectVisualization'
import Pointer from '../Pointer'
import MapData from '../MapData'
import { ColorRGB } from '../../../../../utils/color/ColorRGB'
import { Color, Container, Graphics, Point } from 'pixi.js'
import { Tile } from '../Tile'

export default class VisualizationPointer extends RoomObjectVisualization {
    private pointerContext: Container
    private pointerColor: ColorRGB = new ColorRGB(255, 255, 255)
    private pointerPosition: number = 0
    private pointerAlpha: number = 1
    private pointerWidth = 3

    constructor(pointer: Pointer) {
        super(pointer.position.getX(), pointer.position.getY(), pointer.position.getZ())

        this.pointerContext = pointer.getCanvas()
        this.pointerContext.eventMode = 'dynamic'
        this.pointerContext.visible = false
        this.render()
    }

    public getZIndex(): number {
        return -1
    }

    render(): void {
        this.drawPointer(this.pointerContext)
    }

    public updatePosition(x: number, y: number, tile: Tile) {
        let xpos = ((x - y) * (MapData.tileWidth / 2)) + tile!.visualization!.offsetX
        let ypos = ((x + y) * (MapData.tileHeight / 2)) + tile!.visualization!.offsetY

        this.pointerContext.visible = true

        this.pointerContext.x = xpos
        this.pointerContext.y = ypos
    }

    public getPointerWidth(): number {
        return this.pointerWidth
    }

    drawPointer(container: Container): Container {
        const ctx = new Graphics()

        const points = [
            new Point(MapData.tileWidth / 2, 0),
            new Point(MapData.tileWidth, MapData.tileHeight / 2),
            new Point(MapData.tileWidth / 2, MapData.tileHeight),
            new Point(0, MapData.tileHeight / 2)
        ]

        ctx.lineStyle(this.pointerWidth, this.pointerColor.toHex(), this.pointerAlpha, this.pointerPosition)
        ctx.moveTo(points[0].x, points[0].y)
        ctx.lineTo(points[1].x, points[1].y)
        ctx.lineTo(points[2].x, points[2].y)
        ctx.lineTo(points[3].x, points[3].y)
        ctx.lineTo(points[0].x, points[0].y)
        ctx.endFill()

        container.addChild(ctx)

        return container
    }
}