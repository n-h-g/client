import {RoomObjectVisualization} from '../../../../../core/room/object/RoomObjectVisualization';
import {RoomPlaneType} from '../RoomPlaneTypeEnum';
import {MapData} from '../MapData';
import {Tile} from '../Tile';
import {TilingSprite, ObservablePoint, Texture, Point, Graphics, Matrix, BLEND_MODES, SCALE_MODES} from 'pixi.js';
import {RoomObjectController} from '../../../../../core/room/object/RoomObjectController';
import {RoomPlane} from '../RoomPlane';
import {TileType} from '../TileTypeEnum';
import ImagePatterBase from '../../../../../../assets/images/room/content/floor_texture_64_0_floor_basic.png';
import { RoomMapObject } from '../../../../../core/room/object/map/RoomMapObject';
import { RoomPriority } from '../../../visualization/RoomPriority';

export class PlaneVisualization extends RoomObjectVisualization {
    private plane: RoomPlane;
    private imgPattern: HTMLImageElement;
    public useTexture = false;

    constructor(plane: RoomPlane) {
        super(0, 0, 0);

        this.plane = plane;
    }

    getZIndex(): number {
        throw new Error('Method not implemented.');
    }

    render(): void {
        this.getCanvasImageSource().then((img: HTMLImageElement) => {
            this.plane.mapObjects.forEach(obj => {
                if (obj instanceof RoomObjectController)
                    obj.visualization?.render();
            });

            this.applyTexture(img);
        });

        this.plane.logic.registerEvents();
    }

    private getCanvas() {
        const roomV = this.plane.room.visualization;

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

    
    private applyTexture(img: HTMLImageElement) {
        const container = this.getCanvas();
        if (!this.useTexture || !img) return;

        const baseTexture = Texture.from(img);
        baseTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST;

        const floorWidth = 8000;
        const floorHeight = 8000;
        const tileSprite = new TilingSprite(baseTexture, floorWidth, floorHeight);
        
        tileSprite.x = -4000;
        tileSprite.y = -1000;

        const matrix = new Matrix();
        
        const textureScale = Math.SQRT1_2; 
        matrix.scale(textureScale, textureScale);
        
        matrix.rotate(Math.PI / 4); 
        matrix.scale(1, 0.5); 

        tileSprite.tileTransform.setFromMatrix(matrix);

        const mask = new Graphics();
        
        this.plane.room.getFloorPlane().mapObjects.forEach((mapObject: RoomMapObject) => {
            if (mapObject instanceof Tile && mapObject.type != TileType.Hole) {
                const ox = mapObject.visualization!.offsetX;
                const oy = mapObject.visualization!.offsetY;

                mask.beginFill(0xFFFFFF);
                mask.moveTo(ox + MapData.tileWidth / 2, oy);
                mask.lineTo(ox + MapData.tileWidth, oy + MapData.tileHeight / 2);
                mask.lineTo(ox + MapData.tileWidth / 2, oy + MapData.tileHeight);
                mask.lineTo(ox, oy + MapData.tileHeight / 2);
                mask.endFill();
            }
        });
        
        tileSprite.mask = mask;

        tileSprite.blendMode = BLEND_MODES.MULTIPLY;
        tileSprite.alpha = 0.5;
        tileSprite.interactiveChildren = false;

        tileSprite.zIndex = RoomPriority.FLOOR + 1;
        mask.zIndex = RoomPriority.FLOOR + 1;
        mask.interactive = true; 

        container.sortableChildren = true;

        container.addChild(mask);
        container.addChild(tileSprite);
        
    }
}
