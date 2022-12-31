import IRoomVisualization from "../../../core/room/IRoomVisualization"
import RoomLayout from "../RoomLayout"
import { Container } from '@pixi/display'
import Point from "../../../utils/point/Point"
import MapData from "../objects/map/MapData"
import UiUtils from "../../../utils/UiUtils"
import Tile from "../objects/map/Tile"
import { Engine } from '../../../Engine'
import Avatar from '../../ui/imagers/avatars/Avatar'
import { Direction } from '../../../core/objects/Direction'

export default class RoomVisualization implements IRoomVisualization {

    private roomLayout: RoomLayout

    private canvasFloor: Container
    private canvasWall: Container
    private canvasDoorFloor: Container
    private canvasDoorWall: Container

    private canvasPointer: Container
    private canvasDoorTile: Container

    public container: Container

    public needsUpdate: boolean = false;

    constructor(room: RoomLayout) {
        this.roomLayout = room
   
        this.container = new Container();

        this.canvasFloor = new Container();
        this.canvasDoorFloor = new Container();
        this.canvasWall = new Container();
        this.canvasDoorWall = new Container();
        this.canvasPointer = new Container();
        this.canvasDoorTile = new Container();
        

        this.container.addChild(this.canvasDoorTile);
        this.container.addChild(this.canvasDoorFloor) 
        this.container.addChild(this.canvasWall)
        this.container.addChild(this.canvasDoorWall) 
        this.container.addChild(this.canvasFloor)
        this.container.addChild(this.canvasPointer) 

        this.container.x = window.innerWidth / 2
        this.container.y = window.innerHeight / 2
        
        this.canvasDoorFloor.interactive = true;
        this.canvasFloor.interactive = true;

        this.canvasDoorFloor.zIndex = 1;
        this.canvasFloor.zIndex = 4;
        this.canvasPointer.zIndex = 3;
        this.canvasDoorWall.zIndex = 4;
        this.canvasWall.zIndex = 4;

        this.container.interactive = true

        Engine.getInstance().application?.stage.addChild(this.container);
    }


    public render() {
        this.roomLayout.getWallPlane().visualization?.render()
        this.roomLayout.getFloorPlane().visualization?.render()
    }

    public tileToLocal(x: number, y: number, z: number): Point {
        return new Point((x - y) * MapData.tileWidth, (x + y) * MapData.tileHeight - (z * MapData.tileHeight * 2));
    }

    /**
     * Get a tile by event
     * @param event 
     * @returns 
     */
    public getTileByEvent(event: Event): Tile | undefined{
        let hitCtx = this.canvasFloor;
        let coords = UiUtils.getPosition(event, hitCtx);
        console.log(coords);
        return this.roomLayout.getFloorPlane().getTilebyPosition(new Point(Math.floor(coords.x), Math.floor(coords.y)));
    }

    /**
     * Transform a global position to a local tile
     * @param x 
     * @param y 
     * @param z 
     * @returns 
     */
    public globalToTileWithHeight(x: number, y: number, z: number): Point {
        const offsetX = this.container.x;
        const offsetY = this.container.y - (z * MapData.tileHeight * 2);

        const xminusy = (x - MapData.tileWidth - offsetX) / MapData.tileWidth;
        const xplusy = (y - offsetY) / MapData.tileWidth

        const tileX = Math.floor((xminusy + xplusy) / 2);
        const tileY = Math.floor((xplusy - xminusy) / 2);

        return new Point(tileX, tileY);
    }

    /**
     * Flip the room visualization
     */
    public flip() {
        let scale = this.container.scale.y == 1 ? -1 : 1 ;

        this.container.scale.y = scale;
    }

    /**
     * Zoom the room from 0-infinity
     * @param scale 
     */
    public zoom(scale: number) {
        if(scale < 0) {
            return;
        }
        
        this.container.scale.x = +scale;
        this.container.scale.y = +scale;
    }

    public getCanvasFloor() : Container {
        return this.canvasFloor
    }

    public getCanvasWall() : Container {
        return this.canvasWall
    }

    public getCanvasDoorFloor() : Container {
        return this.canvasDoorFloor
    }

    public getCanvasDoorWall() : Container {
        return this.canvasDoorWall
    }

    public getCanvasPointer() : Container {
        return this.canvasPointer
    }
    public getCanvasDoorTile() : Container {
        return this.canvasDoorTile
    }

    public get Container() : Container {
        return this.container;
    }
} 