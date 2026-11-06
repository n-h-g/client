import {RoomObjectVisualization} from '../../../../../core/room/object/RoomObjectVisualization';
import {MapData} from '../MapData';
import {WallType} from '../WallTypeEnum';
import {Point3d} from '../../../../../utils/point/Point3d';
import {ColorRGB} from '../../../../../utils/color/ColorRGB';
import {NormalType} from '../../../visualization/NormalTypeEnum';
import {RoomVisualizationColorData} from '../../../visualization/RoomVisualizationColorData';
import {Container, Graphics, Matrix} from 'pixi.js';
import {Wall} from '../Wall';
import {RoomPriority} from '../../../visualization/RoomPriority';

export class WallVisualization extends RoomObjectVisualization {
	wallCtx: Graphics;
    wallContext: Container;
    private wall: Wall;
    private doorContext: Container;
    /** All the graphics of this segment, destroyed when it's drawn again (e.g. a new wallpaper). */
    private drawn: Graphics[] = [];

    constructor(wall: Wall) {
        super(
            WallVisualization.calculateOffsetX(wall.position),
            WallVisualization.calculateOffsetY(wall.position),
            WallVisualization.calculateZIndex(wall.position)
        );

        this.wall = wall;
        this.wallHeight = MapData.wallHeight;
        this.extraHeight = WallVisualization.getExtraHeight(wall);

        const roomV = wall.plane.room.visualization;
        this.wallContext = roomV.getCanvasWall();
        this.doorContext = roomV.getCanvasDoorWall();
        this.wallCtx = null;

        this.wallContext.eventMode = 'dynamic';
    }

    getZIndex(): number {
        return RoomPriority.WALL;
    }

    private wallHeight: number;

    /** Height of the wall under this segment, down to the lowest floor (rooms with more levels). */
    private extraHeight: number;

    /**
     * In a room with more levels the wall of a raised floor keeps its top (the walls go up in steps), but under it
     * the wall must continue down to the lowest floor: otherwise there was a black hole under the higher segments.
     */
    private static getExtraHeight(wall: Wall): number {
        const lowest = Math.min(...wall.plane.room.getModelMatrix().flat().filter(height => height > 0));
        if (!Number.isFinite(lowest)) return 0;

        return Math.max(0, wall.position.z - lowest) * MapData.thickSpace * MapData.stairSteps;
    }

    render(): void {
        this.drawn.forEach(graphics => {
            if (!graphics.destroyed) graphics.destroy();
        });
        this.drawn = [];
        this.wallCtx = null;

        this.checkAndDraw();
    }

    /** The color of the wallpaper applied to the room (the default one without a wallpaper item). */
    private get color(): ColorRGB {
        return ColorRGB.getColorFromNumber(
            this.wall.plane.room.wallDecoration?.color ?? RoomVisualizationColorData.WALL_COLOR
        );
    }

    /**
     * The face of the wall: the pattern of the wallpaper applied to the room, tinted with the color of the face.
     * As in Nitro the wall textures are in screen pixels: 32 pixels per segment, sheared as the wall
     * (half a pixel down per pixel towards the outside), with the bottom of the texture on the floor line
     * so the patterns with a lower part (e.g. wall_half1) start from the floor.
     */
    private beginFaceFill(ctx: Graphics, color: string, isLeft: boolean): void {
        const texture = this.wall.plane.room.wallDecoration?.texture;

        if (!texture) {
            ctx.beginFill(color);
            return;
        }

        const floorLine = this.offsetY + this.wallHeight - MapData.wallBlankBottom - MapData.thickSpace;
        const matrix = new Matrix(isLeft ? -1 : 1, 0.5, 0, 1, this.offsetX, floorLine - texture.height);

        ctx.beginTextureFill({texture, color, matrix});
    }

    //TODO SET WALL OFFSET
    private static calculateOffsetX(position: Point3d): number {
        return (
            position.y * MapData.tileHeight -
            (position.x * MapData.tileWidth) / 2 +
            MapData.wallWidth -
            MapData.wallDepth
        );
    }

    private static calculateOffsetY(position: Point3d): number {
        return (
            (position.y * MapData.tileHeight) / 2 +
            (position.x * MapData.tileWidth) / 4 -
            position.z * MapData.thickSpace * MapData.stairSteps -
            MapData.wallHeight +
            MapData.wallDepth +
            MapData.wallBlankBottom
        );
    }

    private static calculateZIndex(position: Point3d): number {
        return 1 * position.x + 1 * position.y + 1 * position.z;
    }

    private checkAndDraw() {
        if (this.wallContext == null || this.doorContext == null) {
            return;
        }

        switch (this.wall.type) {
            default:
                return;

            case WallType.Left:
                this.drawWall(this.wallContext, true);
                break;

            case WallType.Right:
                this.drawWall(this.wallContext, false);
                break;

            case WallType.DoorLeft:
                this.drawDoorWall(this.doorContext, true);
                break;

            case WallType.DoorRight:
                this.drawDoorWall(this.doorContext, false);
                break;
        }
    }

    private drawWall(
        container: Container,
        isLeft: boolean,
        drawDepth = true
    ): Container {
        const ctx = new Graphics();

        const wallRight = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.LIGHT
        ).toHex();
        const wallLeft = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.MEDIUM
        ).toHex();
        const wallTop = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.DARK
        ).toHex();

        const fullHeightTick = this.wall.plane.room.hasFullHeightTick
            ? MapData.thickSpace *
              MapData.stepHeight *
              this.wall.position.z
            : 0;

        ctx.beginFill(wallTop); // top

        if (this.wall.corner) {
            ctx.moveTo(this.offsetX, this.offsetY + MapData.wallBlankTop);

            ctx.lineTo(
                this.offsetX +
                    (isLeft ? 0 : MapData.wallDepth - MapData.wallDepth),
                this.offsetY - MapData.wallDepth / 2
            );
        } else {
            ctx.moveTo(this.offsetX, this.offsetY + MapData.wallBlankTop);

            ctx.lineTo(
                this.offsetX + MapData.wallDepth * (isLeft ? -1 : 1),
                this.offsetY
            );
        }

        ctx.lineTo(
            this.offsetX + MapData.wallWidth * (isLeft ? -1 : 1),
            this.offsetY + MapData.wallBlankBottom
        );

        ctx.lineTo(
            this.offsetX +
                MapData.wallWidth * (isLeft ? -1 : 1) +
                (isLeft ? MapData.wallDepth : -MapData.wallDepth),
            this.offsetY +
                MapData.wallBlankBottom +
                (isLeft ? MapData.wallDepth / 2 : MapData.wallBlankTop)
        );

        ctx.closePath();
        //ctx.fillStyle = RoomVisualizationColorData.getNormal(this.color, NormalType.DARK).toString()
        ctx.endFill();

        // step of the walls towards a lower floor: the thickness of the higher segment is visible
        // (it was black), drawn like the end of the wall at the edge of the room
        const stepDrop = this.getStepDrop(isLeft);
        if (stepDrop > 0 && !this.wall.last) {
            const outerX = this.offsetX + MapData.wallWidth * (isLeft ? -1 : 1);
            const outerY = this.offsetY + MapData.wallBlankBottom;
            const innerX = outerX + (isLeft ? MapData.wallDepth : -MapData.wallDepth);
            const innerY = outerY + (isLeft ? MapData.wallDepth / 2 : MapData.wallBlankTop);

            ctx.beginFill(isLeft ? wallRight : wallLeft);
            ctx.moveTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
            ctx.lineTo(innerX, innerY + stepDrop);
            ctx.lineTo(outerX, outerY + stepDrop);
            ctx.closePath();
            ctx.endFill();
        }

        if (drawDepth) {
            ctx.beginFill(isLeft ? wallRight : wallLeft); // depth right
            //console.log(this.wall.plane.room.getMapSizeX())
            const last: boolean = this.wall.last;

            if (!last) {
                ctx.endFill();
            } else {
                ctx.moveTo(
                    this.offsetX +
                        MapData.wallWidth * (isLeft ? -1 : 1) +
                        (isLeft ? 0 : -MapData.wallDepth),
                    this.offsetY +
                        (MapData.wallBlankBottom +
                            (isLeft ? 0 : MapData.wallBlankTop))
                );

                ctx.lineTo(
                    this.offsetX + MapData.wallWidth * (isLeft ? -1 : 1),
                    this.offsetY +
                        (isLeft
                            ? this.wallHeight -
                              MapData.wallDepth / 2 +
                              (last ? 0 : -MapData.thickSpace)
                            : MapData.wallBlankBottom)
                );

                ctx.lineTo(
                    this.offsetX +
                        MapData.wallWidth * (isLeft ? -1 : 1) +
                        (isLeft ? MapData.wallDepth : 0),
                    this.offsetY +
                        this.wallHeight +
                        (last ? 0 : -MapData.thickSpace) +
                        (isLeft ? 0 : -MapData.wallBlankTop)
                );

                ctx.lineTo(
                    this.offsetX +
                        MapData.wallWidth * (isLeft ? -1 : 1) +
                        MapData.wallDepth * (isLeft ? 1 : -1),
                    this.offsetY +
                        (isLeft
                            ? MapData.wallBlankBottom + MapData.wallBlankTop
                            : this.wallHeight +
                              (last ? 0 : -MapData.thickSpace))
                );
            }

            ctx.closePath();

            //ctx.fillStyle = isLeft ? RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toString() : RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toString()
            ctx.endFill();
        }

        const wallColor = isLeft ? wallLeft : wallRight;

        this.beginFaceFill(ctx, wallColor, isLeft);
        ctx.moveTo(this.offsetX, this.offsetY + MapData.wallBlankTop);

        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + (MapData.wallBlankBottom + MapData.wallBlankTop)
        );
        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + this.wallHeight - MapData.thickSpace
        );
        ctx.lineTo(
            this.offsetX,
            this.offsetY +
                (this.wallHeight - MapData.wallBlankBottom) -
                MapData.thickSpace
        );
        ctx.closePath();

        //ctx.fillStyle = isLeft ? RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toString() : RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toString()
        ctx.endFill();

        container.addChild(ctx);
        this.drawn.push(ctx);

        this.wallCtx = ctx;

        if (this.extraHeight > 0) this.drawWallBelow(wallColor, isLeft);

        return container;
    }

    /**
     * Pixels the next segment of the wall is lower than this one (0 if it's not lower):
     * a left wall continues on the next row (x + 1), a right wall on the next column (y + 1).
     */
    private getStepDrop(isLeft: boolean): number {
        const matrix = this.wall.plane.room.getModelMatrix();
        const x = this.wall.position.x;
        const y = this.wall.position.y;
        const next = isLeft ? matrix[x + 1]?.[y] : matrix[x]?.[y + 1];

        if (!next) return 0;

        return Math.max(0, this.wall.position.z - next) * MapData.thickSpace * MapData.stairSteps;
    }

    /**
     * The wall under a segment of a raised floor, down to the lowest floor. It's drawn behind the floor
     * (the walls are drawn over it), so it only fills the hole where there is no floor.
     */
    private drawWallBelow(color: string, isLeft: boolean) {
        const below = new Graphics();
        const innerX = this.offsetX + (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1);
        const innerBottom = this.offsetY + this.wallHeight - MapData.thickSpace;
        const edgeBottom = this.offsetY + this.wallHeight - MapData.wallBlankBottom - MapData.thickSpace;

        this.beginFaceFill(below, color, isLeft);
        below.moveTo(this.offsetX, edgeBottom);
        below.lineTo(innerX, innerBottom);
        below.lineTo(innerX, innerBottom + this.extraHeight);
        below.lineTo(this.offsetX, edgeBottom + this.extraHeight);
        below.closePath();
        below.endFill();

        // just under the floor canvas (RoomVisualization.calculateZIndex of the origin with RoomPriority.FLOOR)
        below.zIndex = RoomPriority.FLOOR * 10000000 - 1;

        this.wall.plane.room.visualization.container.addChild(below);
        this.drawn.push(below);
    }

    private drawDoorWall(container: Container, isLeft: boolean): Container {
        const ctx = new Graphics();

        const wallRight = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.LIGHT
        ).toHex();
        const wallLeft = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.MEDIUM
        ).toHex();
        const wallTop = RoomVisualizationColorData.getNormal(
            this.color,
            NormalType.DARK
        ).toHex();

        //ctx.translate(0, MapData.thickSpace * MapData.stepHeight * this.wall.position.z);

        const doorHeight = Math.floor(MapData.wallHeight * 0.64);

        const wallColor = isLeft ? wallLeft : wallRight;

        this.beginFaceFill(ctx, wallColor, isLeft); // bottom
        ctx.moveTo(this.offsetX, this.offsetY + MapData.wallBlankTop);

        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + (MapData.wallBlankBottom + MapData.wallBlankTop)
        );
        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + this.wallHeight - doorHeight
        );
        ctx.lineTo(
            this.offsetX,
            this.offsetY +
                (this.wallHeight - doorHeight - MapData.wallBlankBottom)
        );
        ctx.closePath();

        //ctx.fillStyle = isLeft ? RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toString() : RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toString()
        ctx.endFill();

        ctx.beginFill(wallTop); // top
        ctx.moveTo(this.offsetX, this.offsetY + MapData.wallBlankTop);

        if (this.wall.corner) {
            ctx.lineTo(
                this.offsetX +
                    (isLeft ? 0 : MapData.wallDepth - MapData.wallDepth),
                this.offsetY - MapData.wallDepth / 2
            );
        } else {
            ctx.lineTo(
                this.offsetX + MapData.wallDepth * (isLeft ? -1 : 1),
                this.offsetY
            );
        }

        ctx.lineTo(
            this.offsetX + MapData.wallWidth * (isLeft ? -1 : 1),
            this.offsetY + MapData.wallBlankBottom
        );

        ctx.lineTo(
            this.offsetX +
                MapData.wallWidth * (isLeft ? -1 : 1) +
                MapData.wallDepth * (isLeft ? 1 : -1),
            this.offsetY +
                MapData.wallBlankBottom +
                (isLeft ? MapData.wallDepth / 2 : MapData.wallBlankTop)
        );

        ctx.closePath();

        //ctx.fillStyle = RoomVisualizationColorData.getNormal(this.color, NormalType.DARK).toString()
        ctx.endFill();

        container.addChild(ctx);
        this.drawn.push(ctx);

        return container;
        //todo draw wall ?
        //    this.drawWall(ctx, isLeft, false)
    }
}
