import {RoomObjectVisualization} from '../../../../../core/room/object/RoomObjectVisualization';
import {Pointer} from '../Pointer';
import {MapData} from '../MapData';
import {ColorRGB} from '../../../../../utils/color/ColorRGB';
import {Container, Graphics, Point} from 'pixi.js';
import {Tile} from '../Tile';

export class VisualizationPointer extends RoomObjectVisualization {
    private pointerContext: Container;
    private pointerColor: ColorRGB = new ColorRGB(255, 255, 255);
    private pointerPosition = 0;
    private pointerAlpha = 1;
    private pointerWidth = 3;
    private pointer: Pointer;

    constructor(pointer: Pointer) {
        super(
            pointer.position.x,
            pointer.position.y,
            pointer.position.z
        );

        this.pointer = pointer;
        this.pointerContext = pointer.getCanvas();
        this.pointerContext.eventMode = 'dynamic';
        this.pointerContext.visible = false;
        this.render();
    }

    getZIndex(): number {
        return -1;
    }

    render(): void {
        this.drawPointer(this.pointerContext);
    }

    updatePosition(x: number, y: number, tile: Tile) {
        const xpos =
            (x - y) * (MapData.tileWidth / 2) + tile!.visualization!.offsetX;
        const ypos =
            (x + y) * (MapData.tileHeight / 2) + tile!.visualization!.offsetY;

        this.pointerContext.visible = true;

        this.pointer.position.x = tile.position.z;
        this.pointer.position.y = tile.position.y;

        this.pointerContext.x = xpos;
        this.pointerContext.y = ypos;
    }

    drawPointer(container: Container): Container {
        const ctx = new Graphics();

        const points = [
            new Point(MapData.tileWidth / 2, 0),
            new Point(MapData.tileWidth, MapData.tileHeight / 2),
            new Point(MapData.tileWidth / 2, MapData.tileHeight),
            new Point(0, MapData.tileHeight / 2),
        ];

        ctx.lineStyle(
            this.pointerWidth,
            this.pointerColor.toHex(),
            this.pointerAlpha,
            this.pointerPosition
        );
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.lineTo(points[3].x, points[3].y);
        ctx.lineTo(points[0].x, points[0].y);
        ctx.endFill();

        container.addChild(ctx);

        return container;
    }

    getPointerWidth(): number {
        return this.pointerWidth;
    }
}
