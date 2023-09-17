import {RoomObjectVisualization} from '../../../../../core/room/object/RoomObjectVisualization';
import {MapData} from '../MapData';
import {WallType} from '../WallTypeEnum';
import {Point3d} from '../../.././../../utils/point/Point3d';
import {ColorRGB} from '../../../../../utils/color/ColorRGB';
import {NormalType} from '../../../visualization/NormalTypeEnum';
import {RoomVisualizationColorData} from '../../../visualization/RoomVisualizationColorData';
import {Container, Graphics} from 'pixi.js';
import {Wall} from '../Wall';
import {RoomPriority} from '../../../visualization/RoomPriority';

export class VisualizationWall extends RoomObjectVisualization {
	wallCtx: Graphics;
    wallContext: Container;
    private wall: Wall;
    private doorContext: Container;
    private color: ColorRGB = ColorRGB.getColorFromNumber(
        RoomVisualizationColorData.WALL_COLOR
    );

    constructor(wall: Wall) {
        super(
            VisualizationWall.calculateOffsetX(wall.position),
            VisualizationWall.calculateOffsetY(wall.position),
            VisualizationWall.calculateZIndex(wall.position)
        );

        this.wall = wall;

        const roomV = wall.plane.room.visualization;
        this.wallContext = roomV.getCanvasWall();
        this.doorContext = roomV.getCanvasDoorWall();
        this.wallCtx = null;

        this.wallContext.eventMode = 'dynamic';
    }

    getZIndex(): number {
        return RoomPriority.WALL;
    }

    render(): void {
        this.checkAndDraw();
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
                            ? MapData.wallHeight -
                              MapData.wallDepth / 2 +
                              (last ? 0 : -MapData.thickSpace)
                            : MapData.wallBlankBottom)
                );

                ctx.lineTo(
                    this.offsetX +
                        MapData.wallWidth * (isLeft ? -1 : 1) +
                        (isLeft ? MapData.wallDepth : 0),
                    this.offsetY +
                        MapData.wallHeight +
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
                            : MapData.wallHeight +
                              (last ? 0 : -MapData.thickSpace))
                );
            }

            ctx.closePath();

            //ctx.fillStyle = isLeft ? RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toString() : RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toString()
            ctx.endFill();
        }

        const wallColor = isLeft ? wallLeft : wallRight;

        ctx.beginFill(wallColor);
        ctx.moveTo(this.offsetX, this.offsetY + MapData.wallBlankTop);

        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + (MapData.wallBlankBottom + MapData.wallBlankTop)
        );
        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + MapData.wallHeight - MapData.thickSpace
        );
        ctx.lineTo(
            this.offsetX,
            this.offsetY +
                (MapData.wallHeight - MapData.wallBlankBottom) -
                MapData.thickSpace
        );
        ctx.closePath();

        //ctx.fillStyle = isLeft ? RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toString() : RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toString()
        ctx.endFill();

        container.addChild(ctx);

        this.wallCtx = ctx;

        return container;
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

        ctx.beginFill(wallColor); // bottom
        ctx.moveTo(this.offsetX, this.offsetY + MapData.wallBlankTop);

        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + (MapData.wallBlankBottom + MapData.wallBlankTop)
        );
        ctx.lineTo(
            this.offsetX +
                (MapData.wallWidth - MapData.wallDepth) * (isLeft ? -1 : 1),
            this.offsetY + MapData.wallHeight - doorHeight
        );
        ctx.lineTo(
            this.offsetX,
            this.offsetY +
                (MapData.wallHeight - doorHeight - MapData.wallBlankBottom)
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

        return container;
        //todo draw wall ?
        //    this.drawWall(ctx, isLeft, false)
    }
}
