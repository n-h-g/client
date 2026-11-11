import {RoomVisualization} from '../../../visualization/RoomVisualization';
import {RoomObjectVisualization} from '../../../../../core/room/object/RoomObjectVisualization';
import {MapData} from '../MapData';
import {RoomVisualizationColorData} from '../../../visualization/RoomVisualizationColorData';
import {TileType} from '../TileTypeEnum';
import {Point3d} from '../../../../../utils/point/Point3d';
import {ColorRGB} from '../../../../../utils/color/ColorRGB';
import {NormalType} from '../../../visualization/NormalTypeEnum';
import {Container, Graphics, Matrix, ObservablePoint} from 'pixi.js';
import {Tile} from '../Tile';
import {RoomPriority} from '../../../visualization/RoomPriority';
import { PlaneVisualization } from './PlaneVisualization';

export class TileVisualization extends RoomObjectVisualization {
    private tile: Tile;
    private floorContext: Container;
    /** Steps: drawn over the walls (they rise towards the wall behind them). */
    private stairsContext: Container;
    private doorContext: Container;
    private useStroke = false;

    /**
     * Texture space -> room space of the floor pattern, as Nitro's floor planes: 32 pixels of the texture
     * per tile on both the sides (u along y, v along x), with the corner of the pattern on the top corner of
     * the tile 0,0. Every tile at any height starts on a corner of the pattern, so the floor is continuous.
     */
    private static readonly FLOOR_TEXTURE_MATRIX = new Matrix(1, 0.5, -1, 0.5, MapData.tileWidth / 2, 0);

    constructor(tile: Tile) {
        super(
            TileVisualization.calculateOffsetX(tile.position, tile.type),
            TileVisualization.calculateOffsetY(tile.position, tile.type),
            TileVisualization.calculateZIndex(tile.position, tile.type)
        );

        this.tile = tile;

        const roomV = tile.plane.room.visualization as RoomVisualization;
        this.floorContext = roomV.getCanvasFloor();
        this.doorContext = roomV.getCanvasDoorTile();
        this.stairsContext = roomV.getCanvasStairs();

        this.useStroke = !(tile.plane.visualization as PlaneVisualization).useTexture
    }

    getZIndex(): number {
        return RoomPriority.FLOOR;
    }

    render(): void {
        // drawn again with a new floor: the old graphics are replaced
        if (this.container && !this.container.destroyed) this.container.destroy();
        this.container = null;

        this.checkTypeAndDraw();
        // the furni can arrive before the floor is drawn
        this.setHidden(this.tile.coveredByFloorHole);
    }

    /** The color of the floor applied to the room (the default one without a floor item). */
    private get color(): ColorRGB {
        return ColorRGB.getColorFromNumber(
            this.tile.plane.room.floorDecoration?.color ?? RoomVisualizationColorData.TILE_COLOR
        );
    }

    /** The top of the tile: the pattern of the floor applied to the room, tinted with its color. */
    private beginTopFill(ctx: Graphics, color: string): void {
        const texture = this.tile.plane.room.floorDecoration?.texture;

        if (!texture) {
            ctx.beginFill(color);
            return;
        }

        ctx.beginTextureFill({texture, color, matrix: TileVisualization.FLOOR_TEXTURE_MATRIX});
    }

    /** A floor hole furni removes the tile from the floor: hidden (not destroyed), it comes back when the furni leaves. */
    setHidden(hidden: boolean): void {
        if (this.container) this.container.visible = !hidden;
    }

    private static calculateOffsetX(position: Point3d, type: TileType): number {
        return (
            position.y * MapData.tileHeight -
            (position.x * MapData.tileWidth) / 2
        );
    }

    private static calculateOffsetY(position: Point3d, type: TileType): number {
        return (
            (position.y * MapData.tileHeight) / 2 +
            (position.x * MapData.tileWidth) / 4 -
            (position.z +
                (type == TileType.Door && position.z == 0 ? 1 : 0)) *
                MapData.thickSpace *
                MapData.stairSteps
        );
    }

    private static calculateZIndex(position: Point3d, type: TileType): number {
        return (
            1 * position.x +
            1 * position.y +
            1 *
                (position.z + type == TileType.Door && position.z == 0
                    ? 1
                    : 0)
        );
    }

    private checkTypeAndDraw(): void {
        if (this.floorContext == null) return;

        switch (this.tile.type) {
            case TileType.Door:
                this.drawTile(this.doorContext, true);
                break;
            case TileType.Flat:
                this.drawTile(this.floorContext);
                break;
            case TileType.StairLeft:
                this.drawStair(this.stairsContext);
                break;
            case TileType.StairRight:
                this.drawStair(this.stairsContext, true);
                break;
            case TileType.StairCornerLeft:
                //this.drawStairCorner(this.floorContext)
                break;
            case TileType.StairCornerRight:
                //this.drawStairCorner(this.floorContext, true)
                break;
            case TileType.StairCornerFront:
                this.drawFrontCorner(this.stairsContext);
                break;
            default:
                return;
        }
    }

    private drawTile(container: Container, isDoor = false): Container {
        const ctx = new Graphics();
        ctx.eventMode = 'dynamic';

        // the edge of the floor (the room setting: thin to thick, MapData.thickSpace is the normal one)
        const floorThickness = this.tile.plane.room.floorThicknessPx;

        // the sides of the tile go down to the neighbour tile on that side: a raised floor (e.g. an upper
        // level of a house) is drawn as a solid block instead of a thin slab floating in the air
        const fullHeightTick = this.tile.plane.room.hasFullHeightTick
            ? MapData.thickSpace *
              MapData.stepHeight *
              (this.tile.position.z + (isDoor ? 1 : 0))
            : 0;
        const leftTick = Math.max(fullHeightTick, this.getSideDrop(1, 0));
        const rightTick = Math.max(fullHeightTick, this.getSideDrop(0, 1));

        const floorColor = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.LIGHT
        ).toHex();
        const leftColor = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.MEDIUM
        ).toHex();
        const rightColor = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.DARK
        ).toHex();

        if (this.useStroke) ctx.lineStyle(MapData.strokeDepth, leftColor);

        ctx.beginFill(leftColor);
        ctx.moveTo(this.offsetX, this.offsetY + MapData.tileHeight / 2);
        ctx.lineTo(
            this.offsetX + MapData.tileWidth / 2,
            this.offsetY + MapData.tileHeight
        );
        ctx.lineTo(
            this.offsetX + MapData.tileWidth / 2,
            this.offsetY +
                MapData.tileHeight +
                leftTick +
                floorThickness
        );
        ctx.lineTo(
            this.offsetX,
            this.offsetY +
                MapData.tileHeight / 2 +
                leftTick +
                floorThickness
        );

        ctx.closePath();
        ctx.endFill();
        ctx.beginFill(rightColor);
        ctx.moveTo(
            this.offsetX + MapData.tileWidth,
            this.offsetY + MapData.tileHeight / 2
        );
        ctx.lineTo(
            this.offsetX + MapData.tileWidth / 2,
            this.offsetY + MapData.tileHeight
        );
        ctx.lineTo(
            this.offsetX + MapData.tileWidth / 2,
            this.offsetY +
                MapData.tileHeight +
                rightTick +
                floorThickness
        );
        ctx.lineTo(
            this.offsetX + MapData.tileWidth,
            this.offsetY +
                MapData.tileHeight / 2 +
                rightTick +
                floorThickness
        );
        ctx.closePath();
        ctx.endFill();
        this.beginTopFill(ctx, floorColor);
        ctx.moveTo(
            this.offsetX + MapData.tileWidth / 2,
            this.offsetY //TopY
        );
        ctx.lineTo(
            this.offsetX + MapData.tileWidth,
            this.offsetY + MapData.tileHeight / 2
        );
        ctx.lineTo(
            this.offsetX + MapData.tileWidth / 2,
            this.offsetY + MapData.tileHeight
        );
        ctx.lineTo(
            this.offsetX, //LeftX
            this.offsetY + MapData.tileHeight / 2
        );

        ctx.closePath();
        ctx.endFill();

        this.container = ctx;
        container.addChild(ctx);
        return container;
    }

    /**
     * Height in pixels of the side of the tile towards the neighbour (x + dx, y + dy): the difference of height
     * with it. Outside the room / on a hole the side goes down to the lowest floor of the room
     * (so the rooms with a single level keep the thin border).
     */
    private getSideDrop(dx: number, dy: number): number {
        const matrix = this.tile.plane.room.getModelMatrix();
        const x = this.tile.position.x;
        const y = this.tile.position.y;

        let lowest = TileVisualization.lowestFloor.get(matrix);
        if (lowest === undefined) {
            lowest = Math.min(...matrix.flat().filter(height => height > 0));
            if (!Number.isFinite(lowest)) lowest = 0;
            TileVisualization.lowestFloor.set(matrix, lowest);
        }

        const neighbour = matrix[x + dx]?.[y + dy];
        const neighbourHeight = neighbour && neighbour > 0 ? neighbour : lowest;
        const difference = (matrix[x]?.[y] ?? 0) - neighbourHeight;

        return difference > 0 ? difference * MapData.thickSpace * MapData.stepHeight : 0;
    }

    private static lowestFloor = new WeakMap<number[][], number>();

    private drawStair(container: Container, isRight = false): Container {
        const ctx = new Graphics();

        ctx.eventMode = 'dynamic';

        const fullHeightTick = this.tile.plane.room.hasFullHeightTick
            ? MapData.thickSpace *
              MapData.stepHeight *
              this.tile.position.z
            : 0;
        let _offsetX = this.offsetX;
        ctx.pivot.x = 0.2;

        if (isRight) {
            ctx.scale.x = -1;
            ctx.scale.y = 1;
            _offsetX = -_offsetX - MapData.tileWidth;
        }

        ctx.transform.position = new ObservablePoint(
            () => {},
            1,
            0,
            -MapData.thickSpace * MapData.stepHeight
        );

        const floorColor = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.LIGHT
        ).toHex();
        let leftColor = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.MEDIUM
        ).toHex();
        let rightColor = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.DARK
        ).toHex();

        if (isRight) {
            leftColor = RoomVisualizationColorData.getNormal(
                this.color,
                NormalType.DARK
            ).toHex();
            rightColor = RoomVisualizationColorData.getNormal(
                this.color,
                NormalType.MEDIUM
            ).toHex();
        }

        const stairPoints = [
            {
                x: _offsetX + MapData.tileWidth / 2,
                y: this.offsetY,
            },
            {
                x: _offsetX,
                y: this.offsetY + MapData.tileHeight / 2,
            },
            {
                x: _offsetX + (MapData.tileWidth / 2 / 8) * 2,
                y:
                    this.offsetY +
                    MapData.tileHeight / 2 +
                    ((MapData.tileHeight - MapData.tileHeight / 2) / 8) * 2,
            },
            {
                x:
                    _offsetX +
                    MapData.tileWidth / 2 +
                    ((MapData.tileWidth - MapData.tileWidth / 2) / 8) * 2,
                y: this.offsetY + (MapData.tileHeight / 2 / 8) * 2,
            },
        ];

        const thickness = MapData.stepHeight * 2;

        ctx.eventMode = 'dynamic';

        if (this.useStroke) ctx.lineStyle(MapData.strokeDepth, 0x8a8a5c);

        this.container = ctx;

        for (let i = 0; i < MapData.stairSteps; i++) {
            const offsetX = (MapData.tileWidth / 2 / 8) * 2 * i;
            const offsetY =
                thickness + (thickness + (MapData.tileHeight / 2 / 8) * 2) * i;
            const fullHeightTickStair = this.tile.plane.room.hasFullHeightTick
                ? MapData.thickSpace * (MapData.stairSteps - i)
                : MapData.thickSpace;

            ctx.beginFill(floorColor);
            ctx.moveTo(stairPoints[0].x + offsetX, stairPoints[0].y + offsetY);
            ctx.lineTo(stairPoints[1].x + offsetX, stairPoints[1].y + offsetY);
            ctx.lineTo(stairPoints[2].x + offsetX, stairPoints[2].y + offsetY);
            ctx.lineTo(stairPoints[3].x + offsetX, stairPoints[3].y + offsetY);
            ctx.lineTo(stairPoints[0].x + offsetX, stairPoints[0].y + offsetY);
            ctx.closePath();
            ctx.endFill();

            ctx.beginFill(leftColor);
            ctx.moveTo(stairPoints[1].x + offsetX, stairPoints[1].y + offsetY);
            ctx.lineTo(
                stairPoints[1].x + offsetX,
                stairPoints[1].y +
                    fullHeightTick +
                    offsetY +
                    fullHeightTickStair
            );
            ctx.lineTo(
                stairPoints[2].x + offsetX,
                stairPoints[2].y +
                    fullHeightTick +
                    offsetY +
                    fullHeightTickStair
            );
            ctx.lineTo(stairPoints[2].x + offsetX, stairPoints[2].y + offsetY);
            ctx.closePath();
            ctx.endFill();

            ctx.beginFill(rightColor);
            ctx.moveTo(stairPoints[3].x + offsetX, stairPoints[3].y + offsetY);
            ctx.lineTo(
                stairPoints[3].x + offsetX,
                stairPoints[3].y +
                    fullHeightTick +
                    offsetY +
                    fullHeightTickStair
            );
            ctx.lineTo(
                stairPoints[2].x + offsetX,
                stairPoints[2].y +
                    fullHeightTick +
                    offsetY +
                    fullHeightTickStair
            );
            ctx.lineTo(stairPoints[2].x + offsetX, stairPoints[2].y + offsetY);
            ctx.closePath();
            ctx.endFill;
        }

        container.addChild(ctx);

        return container;
    }

    private drawFrontCorner(container: Container) {
        const ctx = new Graphics();

        const fullHeightTick = this.tile.plane.room.hasFullHeightTick
            ? MapData.thickSpace *
              MapData.stepHeight *
              this.tile.position.z
            : 0;
        ctx.transform.position = new ObservablePoint(
            () => {},
            1,
            0,
            -MapData.thickSpace * MapData.stepHeight
        );

        const blockPointLeft = [
            {
                x: this.offsetX + MapData.tileWidth / 2,
                y: this.offsetY + 0,
            },
            {
                x:
                    this.offsetX +
                    MapData.tileWidth / 2 -
                    (MapData.tileWidth / 2 / 8) * 2,
                y: this.offsetY + (MapData.tileHeight / 2 / 8) * 2,
            },
            {
                x: this.offsetX + MapData.tileWidth / 2,
                y: this.offsetY + (MapData.tileHeight / 2 / 8) * 2 * 2,
            },
        ];

        const blockPointRight = [
            {
                x: this.offsetX + MapData.tileWidth / 2,
                y: this.offsetY + 0,
            },
            {
                x:
                    this.offsetX +
                    MapData.tileWidth / 2 +
                    (MapData.tileWidth / 2 / 8) * 2,
                y: this.offsetY + (MapData.tileHeight / 2 / 8) * 2,
            },
            {
                x: this.offsetX + MapData.tileWidth / 2,
                y: this.offsetY + (MapData.tileHeight / 2 / 8) * 2 * 2,
            },
        ];

        const thickness = MapData.stepHeight * 2;

        for (let i = 0; i < MapData.stairSteps; i++) {
            const offsetX = -((MapData.tileWidth / 2 / 8) * 2 * i);
            const offsetY =
                thickness + (thickness + (MapData.tileHeight / 2 / 8) * 2) * i;
            const fullHeightTickStair = this.tile.plane.room.hasFullHeightTick
                ? MapData.thickSpace * (MapData.stairSteps - i)
                : MapData.thickSpace;

            ctx.beginFill(0x989865);
            ctx.moveTo(
                blockPointLeft[0].x + offsetX,
                blockPointLeft[0].y + offsetY
            );
            ctx.lineTo(
                blockPointLeft[1].x + offsetX,
                blockPointLeft[1].y + offsetY
            );
            ctx.lineTo(
                blockPointLeft[2].x,
                blockPointLeft[2].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                blockPointLeft[2].x,
                blockPointLeft[0].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.closePath();

            ctx.beginFill(0x6f6f49);
            ctx.moveTo(
                blockPointLeft[1].x + offsetX,
                blockPointLeft[1].y + offsetY
            );
            ctx.lineTo(
                blockPointLeft[1].x + offsetX,
                blockPointLeft[1].y +
                    fullHeightTick +
                    offsetY +
                    fullHeightTickStair
            );
            ctx.lineTo(
                blockPointLeft[2].x,
                blockPointLeft[2].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i +
                    fullHeightTick +
                    fullHeightTickStair
            );
            ctx.lineTo(
                blockPointLeft[2].x,
                blockPointLeft[2].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.closePath();

            ctx.beginFill(0x989865);
            ctx.moveTo(
                blockPointRight[0].x - offsetX,
                blockPointRight[0].y + offsetY
            );
            ctx.lineTo(
                blockPointRight[1].x - offsetX,
                blockPointRight[1].y + offsetY
            );
            ctx.lineTo(
                blockPointRight[2].x,
                blockPointRight[2].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                blockPointRight[2].x,
                blockPointRight[0].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.closePath();

            ctx.beginFill(0x6f6f49);
            ctx.moveTo(
                blockPointRight[1].x - offsetX,
                blockPointRight[1].y + offsetY
            );
            ctx.lineTo(
                blockPointRight[1].x - offsetX,
                blockPointRight[1].y +
                    fullHeightTick +
                    offsetY +
                    fullHeightTickStair
            );
            ctx.lineTo(
                blockPointRight[2].x,
                blockPointRight[2].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i +
                    fullHeightTick +
                    fullHeightTickStair
            );
            ctx.lineTo(
                blockPointRight[2].x,
                blockPointRight[2].y +
                    offsetY +
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );

            ctx.closePath();
        }

        return ctx;
    }

    drawStairCorner(ctx: CanvasRenderingContext2D, isRight = false) {
        let _offsetX = this.offsetX;
        ctx.save();
        ctx.translate(0, -MapData.thickSpace * MapData.stepHeight);

        if (isRight) {
            ctx.scale(-1, 1);
            _offsetX = -_offsetX - MapData.tileWidth;
        }

        let floorColor: string, leftColor: string;

        floorColor = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.LIGHT
        ).toString();

        if (isRight) {
            leftColor = RoomVisualizationColorData.getNormal(
                this.color,
                NormalType.DARK
            ).toString();
        } else {
            leftColor = RoomVisualizationColorData.getNormal(
                this.color,
                NormalType.MEDIUM
            ).toString();
        }

        const cornerPoints = [
            {
                x: _offsetX + MapData.tileWidth,
                y: this.offsetY + MapData.tileHeight / 2,
            },
            {
                x:
                    _offsetX +
                    MapData.tileWidth -
                    (MapData.tileWidth / 2 / 8) * 2 -
                    1,
                y:
                    this.offsetY +
                    MapData.tileHeight / 2 -
                    (MapData.tileHeight / 2 / 8) * 2 -
                    1,
            },
            {
                x:
                    _offsetX +
                    MapData.tileWidth -
                    (MapData.tileWidth / 2 / 8) * 4,
                y: this.offsetY + MapData.tileHeight / 2,
            },
            {
                x:
                    _offsetX +
                    MapData.tileWidth -
                    (MapData.tileWidth / 2 / 8) * 2,
                y:
                    this.offsetY +
                    MapData.tileHeight / 2 +
                    (MapData.tileHeight / 2 / 8) * 2,
            },
        ];

        const thickness = MapData.stepHeight * 2;

        for (let i = 0; i < MapData.stairSteps; i++) {
            const offsetX = -((MapData.tileWidth / 2 / 8) * 2 * i); //((((this.tileWidth / 2) / 8) * 2) * i)
            const offsetY =
                thickness + (thickness + (MapData.tileHeight / 2 / 8) * 2) * i;

            ctx.fillStyle = floorColor;
            ctx.beginPath();
            ctx.moveTo(
                cornerPoints[0].x + offsetX,
                cornerPoints[0].y + offsetY
            );
            ctx.lineTo(
                cornerPoints[1].x +
                    offsetX -
                    (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[1].y +
                    offsetY -
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                cornerPoints[2].x +
                    offsetX -
                    (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[2].y +
                    offsetY -
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                cornerPoints[3].x + offsetX,
                cornerPoints[3].y + offsetY
            );
            ctx.lineTo(
                cornerPoints[0].x + offsetX,
                cornerPoints[0].y + offsetY
            );
            ctx.closePath();
            ctx.fill();

            ctx.fillStyle = leftColor;
            ctx.beginPath();
            ctx.moveTo(
                cornerPoints[3].x + offsetX,
                cornerPoints[3].y + offsetY
            );
            ctx.lineTo(
                cornerPoints[2].x +
                    offsetX -
                    (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[2].y +
                    offsetY -
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                cornerPoints[2].x +
                    offsetX -
                    (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[2].y +
                    offsetY -
                    (MapData.tileHeight / 2 / 8) * 2 * i +
                    MapData.thickSpace
            );
            ctx.lineTo(
                cornerPoints[3].x + offsetX,
                cornerPoints[3].y + offsetY + MapData.thickSpace
            );
            ctx.closePath();
            ctx.fill();

            if (isRight && i == 0) continue;

            ctx.fillStyle = floorColor;
            ctx.beginPath();
            ctx.moveTo(
                cornerPoints[1].x +
                    offsetX -
                    (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[1].y +
                    offsetY -
                    (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                cornerPoints[1].x +
                    offsetX -
                    (MapData.tileWidth / 2 / 8) * 2 * i +
                    MapData.thickSpace,
                cornerPoints[1].y +
                    offsetY -
                    (MapData.tileHeight / 2 / 8) * 2 * i -
                    (MapData.tileHeight / 2 / 8) * 2
            );
            ctx.lineTo(
                cornerPoints[1].x +
                    offsetX -
                    (MapData.tileWidth / 2 / 8) * 2 * i +
                    MapData.thickSpace,
                cornerPoints[1].y +
                    offsetY -
                    (MapData.tileHeight / 2 / 8) * 2 * i +
                    (MapData.tileHeight / 2 / 8) * 2
            );
            ctx.fill();
        }

        ctx.restore();

        return ctx;
    }
}
