import Tile from "../Tile"
import RoomVisualization from "../../../visualization/RoomVisualization"
import RoomObjectVisualization from "../../../../../core/room/object/RoomObjectVisualization"
import MapData from "../MapData"
import RoomVisualizationColorData from "../../../visualization/RoomVisualizationColorData"
import TileType from "../TileTypeEnum"

import Point3d from "../../.././../../utils/point/Point3d"
import ColorRGB from "../../../../../utils/color/ColorRGB"
import NormalType from "../../../visualization/NormalTypeEnum"

import * as PIXI from "pixi.js"
import { Container } from '@pixi/display'
import { Graphics } from '@pixi/graphics'
import { ObservablePoint } from '@pixi/math'

export default class VisualizationTile extends RoomObjectVisualization {

    private tile: Tile
    private floorContext: Container
    private doorContext: Container

    private color: ColorRGB = ColorRGB.getColorFromNumber(0x969664)
    private strokeColor: ColorRGB = ColorRGB.getColorFromNumber(0x7E7E52)
    private useStroke: boolean = true

    private doorTileContext: Container

    private stairsContext: Graphics | null;

    constructor(tile: Tile) {
        super(VisualizationTile.calculateOffsetX(tile.position, tile.getType()),
            VisualizationTile.calculateOffsetY(tile.position, tile.getType()),
            VisualizationTile.calculateZIndex(tile.position, tile.getType()))

        this.tile = tile

        this.stairsContext = null;

        let roomV = (tile.getPlane().getRoom().Visualization as RoomVisualization)
        this.floorContext = roomV.getCanvasFloor()
        this.doorContext = roomV.getCanvasDoorFloor()
        this.doorTileContext = roomV.getCanvasDoorTile();
    }


    private static calculateOffsetX(position: Point3d, type: TileType): number {
        return (position.getY() * MapData.tileHeight) - (position.getX() * MapData.tileWidth) / 2
    }

    private static calculateOffsetY(position: Point3d, type: TileType): number {
        return (position.getY() * MapData.tileHeight) / 2 + (position.getX() * MapData.tileWidth) / 4 - ((position.getZ() + (type == TileType.DoorTile ? 1 : 0)) * MapData.thickSpace * MapData.stairSteps)
    }

    private static calculateZIndex(position: Point3d, type: TileType): number {
        return (1 * position.getX()) + (1 * position.getY()) + (1 * (position.getZ() + type == TileType.DoorTile ? 1 : 0))
    }

    public render(): void {
        this.checkTypeAndDraw()

    }
    private checkTypeAndDraw(): void {

        if (this.floorContext == null) {
            return
        }

        switch (this.tile.getType()) {

            case TileType.DoorTile:
            case TileType.Door:
                this.drawTile(this.doorTileContext, true)
                break
            case TileType.Flat:
                this.drawTile(this.floorContext)
                break
            case TileType.StairLeft:
                this.drawStair(this.floorContext)
                break

            case TileType.StairRight:
                this.drawStair(this.floorContext, true)
                break

            case TileType.StairCornerLeft:
                //this.drawStairCorner(this.floorContext)
                break

            case TileType.StairCornerRight:
                //this.drawStairCorner(this.floorContext, true)
                break

            case TileType.StairCornerFront:
                this.drawFrontCorner(this.floorContext)
                break

            default:
                return
        }
    }

    private drawTile(container: Container, isDoor: boolean = false): Container {

        const ctx = new Graphics();
        ctx.interactive = true;
        let roomV = (this.tile.getPlane().getRoom().Visualization as RoomVisualization)

        let fullHeightTick = this.tile.getPlane().getRoom().HasFullHeightTick ? MapData.thickSpace * MapData.stepHeight * (this.tile.position.getZ() + (isDoor ? 1 : 0)) : 0


        let floorColor = RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toHex()
        let leftColor = RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toHex()
        let rightColor = RoomVisualizationColorData.getNormal(this.color, NormalType.DARK).toHex()


        if (this.useStroke)
            ctx.lineStyle(MapData.strokeDepth, leftColor);

        //thick left
        ctx.beginFill(leftColor);
        ctx.moveTo(this.getOffsetX(), this.getOffsetY() + MapData.tileHeight / 2);
        ctx.lineTo(this.getOffsetX() + MapData.tileWidth / 2, this.getOffsetY() + MapData.tileHeight);
        ctx.lineTo(
            this.getOffsetX() + MapData.tileWidth / 2,
            this.getOffsetY() +
            MapData.tileHeight +
            fullHeightTick +
            MapData.thickSpace
        );
        ctx.lineTo(
            this.getOffsetX(),
            this.getOffsetY() +
            MapData.tileHeight / 2 +
            fullHeightTick +
            MapData.thickSpace
        );

        ctx.closePath();
        ctx.endFill();
        //thick right
        ctx.beginFill(rightColor);
        ctx.moveTo(this.getOffsetX() + MapData.tileWidth, this.getOffsetY() + MapData.tileHeight / 2);
        ctx.lineTo(this.getOffsetX() + MapData.tileWidth / 2, this.getOffsetY() + MapData.tileHeight);
        ctx.lineTo(
            this.getOffsetX() + MapData.tileWidth / 2,
            this.getOffsetY() +
            MapData.tileHeight +
            fullHeightTick +
            MapData.thickSpace
        );
        ctx.lineTo(
            this.getOffsetX() + MapData.tileWidth,
            this.getOffsetY() +
            MapData.tileHeight / 2 +
            fullHeightTick +
            MapData.thickSpace
        );
        ctx.closePath();
        //ctx.fillStyle = RoomVisualizationColorData.getNormal(this.color, NormalType.DARK).toString()
        ctx.endFill();



        ctx.beginFill(floorColor); // floor color
        ctx.moveTo(
            this.getOffsetX() + MapData.tileWidth / 2, //TopX
            this.getOffsetY()//TopY
        );
        ctx.lineTo(
            this.getOffsetX() + MapData.tileWidth, //RightX
            this.getOffsetY() + MapData.tileHeight / 2 //RightY
        );
        ctx.lineTo(
            this.getOffsetX() + MapData.tileWidth / 2, //BottomX
            this.getOffsetY() + MapData.tileHeight //BottomY
        );
        ctx.lineTo(
            this.getOffsetX(), //LeftX
            this.getOffsetY() + MapData.tileHeight / 2  //LeftY
        );

        ctx.closePath();

    

        ctx.endFill();

    
        this.container = ctx;
        
        container.addChild(ctx);
        return container;
    }

    private drawStair(container: Container, isRight: boolean = false): Container {

        const ctx = new Graphics();
        ctx.interactive = true;

        let fullHeightTick = this.tile.getPlane().getRoom().HasFullHeightTick ? MapData.thickSpace * MapData.stepHeight * this.tile.position.getZ() : 0

        let _offsetX = this.getOffsetX()

        ctx.pivot.x = 0.2;


        if (isRight) {
            ctx.scale.x = -1;
            ctx.scale.y = 1;
            _offsetX = -_offsetX - MapData.tileWidth;
        }

        ctx.transform.position = new ObservablePoint(() => {}, 1, 0, -MapData.thickSpace * MapData.stepHeight);

        let floorColor = RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toHex()
        let leftColor = RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toHex()
        let rightColor = RoomVisualizationColorData.getNormal(this.color, NormalType.DARK).toHex()

        if (isRight) {
            leftColor = RoomVisualizationColorData.getNormal(this.color, NormalType.DARK).toHex()
            rightColor = RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toHex()
        }


        let stairPoints = [{
            x: _offsetX + MapData.tileWidth / 2,
            y: this.getOffsetY()
        },
        {
            x: _offsetX,
            y: this.getOffsetY() + MapData.tileHeight / 2
        },
        {
            x: _offsetX + (MapData.tileWidth / 2 / 8) * 2,
            y: this.getOffsetY() +
                MapData.tileHeight / 2 +
                ((MapData.tileHeight - MapData.tileHeight / 2) / 8) * 2
        },
        {
            x: _offsetX +
                MapData.tileWidth / 2 +
                ((MapData.tileWidth - MapData.tileWidth / 2) / 8) * 2,
            y: this.getOffsetY() + (MapData.tileHeight / 2 / 8) * 2
        }
        ];

        let thickness = MapData.stepHeight * 2;

        ctx.interactive = true;
        //ctx.buttonMode = true;

        if(this.useStroke)
            ctx.lineStyle(MapData.strokeDepth, 0x8a8a5c);

        this.container = ctx;

        for (let i = 0; i < MapData.stairSteps; i++) {
            let offsetX = (MapData.tileWidth / 2 / 8) * 2 * i;
            let offsetY = thickness + (thickness + (MapData.tileHeight / 2 / 8) * 2) * i;
            let fullHeightTickStair = (this.tile.getPlane().getRoom().HasFullHeightTick ? (MapData.thickSpace * (MapData.stairSteps - i)) : MapData.thickSpace)

            //ctx.fillStyle = floorColor;
            ctx.beginFill(floorColor);
            ctx.moveTo(stairPoints[0].x + offsetX, stairPoints[0].y + offsetY);
            ctx.lineTo(stairPoints[1].x + offsetX, stairPoints[1].y + offsetY);
            ctx.lineTo(stairPoints[2].x + offsetX, stairPoints[2].y + offsetY);
            ctx.lineTo(stairPoints[3].x + offsetX, stairPoints[3].y + offsetY);
            ctx.lineTo(stairPoints[0].x + offsetX, stairPoints[0].y + offsetY);
            ctx.closePath();
            ctx.endFill();

            //thickness l
            //ctx.fillStyle = leftColor;
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

            //thickness r
            //ctx.fillStyle = rightColor;
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
            ctx.endFill
        }


        container.addChild(ctx);

        return container;
    }

    drawFrontCorner(container: Container) {

        const ctx = new Graphics();

        let fullHeightTick = this.tile.getPlane().getRoom().HasFullHeightTick ? MapData.thickSpace * MapData.stepHeight * this.tile.position.getZ() : 0
        //ctx.translate(0, -MapData.thickSpace * MapData.stepHeight /** (parseInt(_z) + 1)*/ );
        ctx.transform.position = new ObservablePoint(() => {}, 1, 0, -MapData.thickSpace * MapData.stepHeight /** (parseInt(_z) + 1)*/);

        let blockPointLeft = [{
            x: this.getOffsetX() + MapData.tileWidth / 2,
            y: this.getOffsetY() + 0
        },
        {
            x: this.getOffsetX() + MapData.tileWidth / 2 - (MapData.tileWidth / 2 / 8) * 2,
            y: this.getOffsetY() + (MapData.tileHeight / 2 / 8) * 2
        },
        {
            x: this.getOffsetX() + MapData.tileWidth / 2,
            y: this.getOffsetY() + (MapData.tileHeight / 2 / 8) * 2 * 2
        }
        ];

        let blockPointRight = [{
            x: this.getOffsetX() + MapData.tileWidth / 2,
            y: this.getOffsetY() + 0
        },
        {
            x: this.getOffsetX() + MapData.tileWidth / 2 + (MapData.tileWidth / 2 / 8) * 2,
            y: this.getOffsetY() + (MapData.tileHeight / 2 / 8) * 2
        },
        {
            x: this.getOffsetX() + MapData.tileWidth / 2,
            y: this.getOffsetY() + (MapData.tileHeight / 2 / 8) * 2 * 2
        }
        ];

        let thickness = MapData.stepHeight * 2;


        for (let i = 0; i < MapData.stairSteps; i++) {
            let offsetX = -((MapData.tileWidth / 2 / 8) * 2 * i);
            let offsetY = thickness + (thickness + (MapData.tileHeight / 2 / 8) * 2) * i;
            let fullHeightTickStair = (this.tile.getPlane().getRoom().HasFullHeightTick ? (MapData.thickSpace * (MapData.stairSteps - i)) : MapData.thickSpace)


            ctx.beginFill(0x989865);
            ctx.moveTo(blockPointLeft[0].x + offsetX, blockPointLeft[0].y + offsetY);
            ctx.lineTo(blockPointLeft[1].x + offsetX, blockPointLeft[1].y + offsetY);
            ctx.lineTo(
                blockPointLeft[2].x,
                blockPointLeft[2].y + offsetY + (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                blockPointLeft[2].x,
                blockPointLeft[0].y + offsetY + (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.closePath();

            //thickness l l
            ctx.beginFill(0x6F6F49);
            ctx.moveTo(blockPointLeft[1].x + offsetX, blockPointLeft[1].y + offsetY);
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
                blockPointLeft[2].y + offsetY + (MapData.tileHeight / 2 / 8) * 2 * i
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
                blockPointRight[2].y + offsetY + (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                blockPointRight[2].x,
                blockPointRight[0].y + offsetY + (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.closePath();

            //thickness r r
            ctx.beginFill(0x6F6F49); // stair thick right
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
                blockPointRight[2].y + offsetY + (MapData.tileHeight / 2 / 8) * 2 * i
            );

            ctx.closePath();
        }

        return ctx;
    }

    drawStairCorner(ctx: CanvasRenderingContext2D, isRight: boolean = false) {
        let fullHeightTick = this.tile.getPlane().getRoom().HasFullHeightTick ? MapData.thickSpace * MapData.stepHeight * this.tile.position.getZ() : 0
        let _offsetX = this.getOffsetX()
        ctx.save();
        ctx.translate(0, -MapData.thickSpace * MapData.stepHeight);

        if (isRight) {
            ctx.scale(-1, 1);
            _offsetX = -_offsetX - MapData.tileWidth;
        }

        let floorColor, leftColor;

        floorColor = RoomVisualizationColorData.getNormal(this.color, NormalType.LIGHT).toString()

        if (isRight) {
            leftColor = RoomVisualizationColorData.getNormal(this.color, NormalType.DARK).toString()
        } else {
            leftColor = RoomVisualizationColorData.getNormal(this.color, NormalType.MEDIUM).toString()
        }

        let cornerPoints = [{
            x: _offsetX + MapData.tileWidth,
            y: this.getOffsetY() + MapData.tileHeight / 2
        },
        {
            x: _offsetX + MapData.tileWidth - (MapData.tileWidth / 2 / 8) * 2 - 1,
            y: this.getOffsetY() + MapData.tileHeight / 2 - (MapData.tileHeight / 2 / 8) * 2 - 1
        },
        {
            x: _offsetX + MapData.tileWidth - (MapData.tileWidth / 2 / 8) * 4,
            y: this.getOffsetY() + MapData.tileHeight / 2
        },
        {
            x: _offsetX + MapData.tileWidth - (MapData.tileWidth / 2 / 8) * 2,
            y: this.getOffsetY() + MapData.tileHeight / 2 + (MapData.tileHeight / 2 / 8) * 2
        }
        ];

        let thickness = MapData.stepHeight * 2;

        for (let i = 0; i < MapData.stairSteps; i++) {
            let offsetX = -((MapData.tileWidth / 2 / 8) * 2 * i); //((((this.tileWidth / 2) / 8) * 2) * i)
            let offsetY = thickness + (thickness + (MapData.tileHeight / 2 / 8) * 2) * i;

            ctx.fillStyle = floorColor;
            ctx.beginPath();
            ctx.moveTo(cornerPoints[0].x + offsetX, cornerPoints[0].y + offsetY);
            ctx.lineTo(
                cornerPoints[1].x + offsetX - (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[1].y + offsetY - (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                cornerPoints[2].x + offsetX - (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[2].y + offsetY - (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(cornerPoints[3].x + offsetX, cornerPoints[3].y + offsetY);
            ctx.lineTo(cornerPoints[0].x + offsetX, cornerPoints[0].y + offsetY);
            ctx.closePath();
            ctx.fill();

            //thickness l
            ctx.fillStyle = leftColor;
            ctx.beginPath();
            ctx.moveTo(cornerPoints[3].x + offsetX, cornerPoints[3].y + offsetY);
            ctx.lineTo(
                cornerPoints[2].x + offsetX - (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[2].y + offsetY - (MapData.tileHeight / 2 / 8) * 2 * i
            );
            ctx.lineTo(
                cornerPoints[2].x + offsetX - (MapData.tileWidth / 2 / 8) * 2 * i,
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

            if (isRight && i == 0) {
                continue;
            }

            //DrawSmallAngles
            ctx.fillStyle = floorColor;
            ctx.beginPath();
            ctx.moveTo(
                cornerPoints[1].x + offsetX - (MapData.tileWidth / 2 / 8) * 2 * i,
                cornerPoints[1].y + offsetY - (MapData.tileHeight / 2 / 8) * 2 * i
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

    public get FloorContext(): Container { return this.floorContext; }
}