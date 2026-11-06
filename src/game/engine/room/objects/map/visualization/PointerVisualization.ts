import {TileType} from '../TileTypeEnum';
import {RoomObjectVisualization} from '../../../../../core/room/object/RoomObjectVisualization';
import {Pointer} from '../Pointer';
import {MapData} from '../MapData';
import {ColorRGB} from '../../../../../utils/color/ColorRGB';
import {Container, Graphics, Point} from 'pixi.js';
import {Tile} from '../Tile';
import { RoomPriority } from '../../../visualization/RoomPriority';
import { RoomVisualization } from '../../../visualization/RoomVisualization';
import { Point3d } from '../../../../../utils/point/Point3d';

export class PointerVisualization extends RoomObjectVisualization {
    private pointerWidth = 3;
    private pointerContext: Container;
    private pointerColor: ColorRGB = new ColorRGB(255, 255, 255);
    private pointerPosition = 0;
    private pointerAlpha = 1;
    private pointer: Pointer;

    constructor(pointer: Pointer) {
        super(
            pointer.position.x,
            pointer.position.y,
            pointer.position.z
        );

        this.pointer = pointer;
        this.pointerContext = pointer.getCanvas();
        // the pointer must not intercept the mouse events (the tile is picked by RoomLogic)
        this.pointerContext.eventMode = 'none';
        this.pointerContext.visible = false;
        this.render();
    }

    getZIndex(): number {
        return RoomPriority.POINTER;
    }

    render(): void {
        this.drawPointer(this.pointerContext);
    }

    updatePosition(tile: Tile) {
        // A tile's display container can have its own transform. Stair graphics
        // use one to draw the steps upward, but that transform is not a tile
        // coordinate and must not affect the pointer position.
        const xpos = tile.visualization!.offsetX;
        const ypos = tile.visualization!.offsetY;

        this.pointerContext.visible = true;

        this.pointer.position.x = tile.position.x;
        this.pointer.position.y = tile.position.y;
        this.pointer.position.z = tile.position.z;
        
        // Between the floor and the furni (like Habbo): just below the lowest z-index
        // a floor item or an avatar can have (tile 0,0 at height 0), so it's always over
        // the floor and the walls and always under furni and avatars.
        // the door tile is inside the wall: there the pointer goes under the walls (and under the avatar in the door)
        const isDoor = tile.type === TileType.Door;
        this.pointerContext.zIndex = isDoor
            ? (tile.plane.room.visualization as RoomVisualization).getDoorZIndex() - 1
            : RoomVisualization.calculateZIndex(
                new Point3d(0, 0, 0),
                RoomPriority.ROOM_ITEM
            ) - 1;

        this.pointerContext.x = xpos;
        this.pointerContext.y = ypos;
        this.pointerContext.parent.sortableChildren = true;
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
}
