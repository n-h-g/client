import RoomObjectVisualization from '../../../../../core/room/object/RoomObjectVisualization';
import {RoomPlaneType} from '../RoomPlaneTypeEnum';
import RoomVisualization from '../../../visualization/RoomVisualization';
import MapData from '../MapData';
import {Tile} from '../Tile';
import {TilingSprite, ObservablePoint, Texture, Point, Graphics} from 'pixi.js';
import ImagePatterBase from '../../../../../../assets/images/room/content/floor_texture_64_2_floor_basic.png';
import {RoomObjectController} from '../../../../../core/room/object/RoomObjectController';
import {RoomPlane} from '../RoomPlane';
import {TileType} from '../TileTypeEnum';
import {IRoomMapObject} from '../../../../../core/room/object/map/IRoomMapObject';

export default class VisualizationPlane extends RoomObjectVisualization {
    private plane: RoomPlane;
    private imgPattern: HTMLImageElement;
    private useTexture = false;

    constructor(plane: RoomPlane) {
        super(0, 0, 0);

        this.plane = plane;
    }

    public getZIndex(): number {
        throw new Error('Method not implemented.');
    }

    render(): void {
        this.getCanvasImageSource().then((img: HTMLImageElement) => {
            this.plane.mapObjects.forEach(obj => {
                if (obj instanceof RoomObjectController) {
                    obj.visualization?.render();
                }
            });

            this.applyTexture(img);
        });
    }

    private getCanvas() {
        const roomV = this.plane.room.Visualization as RoomVisualization;

        switch (this.plane.type) {
            case RoomPlaneType.Floor:
                return roomV.getCanvasFloor();
            case RoomPlaneType.LeftWall:
            case RoomPlaneType.RightWall:
                return roomV.getCanvasWall();
        }
    }

    private async getCanvasImageSource() {
        const source = await this.loadImage(ImagePatterBase);
        return source;
    }

    private loadImage(url: string) {
        return new Promise<CanvasImageSource>(r => {
            const i = new Image();
            i.onload = () => r(i);
            i.src = url;
        });
    }

    private async applyTexture(img) {
        const ctx = new Graphics();
        const container = this.getCanvas();

        if (!this.useTexture) {
            return;
        }

        if (ctx == null) {
            return;
        }

        this.imgPattern = img;

        const pattern = null;

        if (this.imgPattern != undefined) {
            const canvas = document.createElement('canvas');
            const patternctx = canvas.getContext('2d');

            canvas.width = this.imgPattern.width * Math.sqrt(2);
            canvas.height = this.imgPattern.height * Math.sqrt(2);

            patternctx!.imageSmoothingEnabled = true;

            patternctx?.save();
            patternctx?.translate(45, 32);
            patternctx?.rotate((45 * Math.PI) / 180);
            patternctx?.drawImage(
                this.imgPattern,
                -this.imgPattern.width / 2,
                -this.imgPattern.height / 2
            );
            patternctx?.restore();

            const tcanvas = document.createElement('canvas');
            const tctx = tcanvas.getContext('2d');
            tctx!.imageSmoothingEnabled = false;
            tcanvas.width = MapData.tileWidth * 2;
            tcanvas.height = MapData.tileHeight * 2;

            tctx?.translate(45, 30);

            tctx!.drawImage(
                canvas,
                0,
                0,
                canvas.width,
                canvas.height,
                0,
                0,
                tcanvas.width,
                tcanvas.height
            );
            tctx!.drawImage(
                canvas,
                0,
                0,
                canvas.width,
                canvas.height,
                tcanvas.width / 2,
                -tcanvas.height / 2,
                tcanvas.width,
                tcanvas.height
            );
            tctx!.drawImage(
                canvas,
                0,
                0,
                canvas.width,
                canvas.height,
                tcanvas.width / 2,
                tcanvas.height / 2,
                tcanvas.width,
                tcanvas.height
            );
            tctx!.drawImage(
                canvas,
                0,
                0,
                canvas.width,
                canvas.height,
                -tcanvas.width / 2,
                tcanvas.height / 2,
                tcanvas.width,
                tcanvas.height
            );
            tctx!.drawImage(
                canvas,
                0,
                0,
                canvas.width,
                canvas.height,
                -tcanvas.width / 2,
                -tcanvas.height / 2,
                tcanvas.width,
                tcanvas.height
            );

            this.plane.room
                .getFloorPlane()
                .mapObjects.forEach((mapObject: IRoomMapObject) => {
                    if (mapObject instanceof Tile) {
                        if ((mapObject as Tile).type == TileType.Hole) return;

                        const tiled = new TilingSprite(
                            Texture.from(tcanvas) ?? Texture.WHITE
                        );
                        tiled.tilePosition = new ObservablePoint(
                            null,
                            null,
                            mapObject.position.getX(),
                            mapObject.position.getY()
                        );
                        tiled.width = MapData.tileWidth;
                        tiled.height = MapData.tileHeight;
                        tiled.x +=
                            mapObject.visualization!.offsetX +
                            MapData.tileWidth / 2 -
                            2;
                        tiled.y = mapObject.visualization!.offsetY! - 1;
                        container.addChild(tiled);
                    }
                });
        }
    }
}
