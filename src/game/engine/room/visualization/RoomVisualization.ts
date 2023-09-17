import {RoomLayout} from '../RoomLayout';
import {Container} from '@pixi/display';
import {Point} from '../../../utils/point/Point';
import {MapData} from '../objects/map/MapData';
import {UiUtils} from '../../../utils/UiUtils';
import {Tile} from '../objects/map/Tile';
import {RoomObjectController} from '../../../core/room/object/RoomObjectController';
import {RoomLogic} from '../logic/RoomLogic';
import {Point3d} from '../../../utils/point/Point3d';
import {RoomPriority} from './RoomPriority';
import { Disposable } from '../../../core/room/Disposable';
import {Engine} from '../../../Engine';

export class RoomVisualization implements Disposable {
    container: Container;
    needsUpdate = false;
    private roomLayout: RoomLayout;
    private canvasFloor: Container;
    private canvasWall: Container;
    private canvasDoorTile: Container;
    private canvasDoorWall: Container;
    private canvasPointer: Container;

    constructor(room: RoomLayout) {
        this.roomLayout = room;

        this.container = new Container();
        this.canvasFloor = new Container();
        this.canvasWall = new Container();
        this.canvasDoorWall = new Container();
        this.canvasPointer = new Container();
        this.canvasDoorTile = new Container();

        this.container.addChild(this.canvasDoorTile);
        this.container.addChild(this.canvasWall);
        this.container.addChild(this.canvasDoorWall);
        this.container.addChild(this.canvasFloor);
        this.container.addChild(this.canvasPointer);

        this.container.x = Engine.getInstance().application.screenCords.x / 2;
        this.container.y = Engine.getInstance().application.screenCords.y / 2;

        this.canvasDoorTile.eventMode = 'dynamic';
        this.canvasFloor.eventMode = 'dynamic';

        const defaultPoint = new Point3d(1, 1, 1);

        this.canvasDoorTile.zIndex = RoomVisualization.calculateZIndex(
            defaultPoint,
            RoomPriority.DOOR_FLOOR
        );
        this.canvasFloor.zIndex = RoomVisualization.calculateZIndex(
            defaultPoint,
            RoomPriority.FLOOR
        );
        this.canvasPointer.zIndex = RoomVisualization.calculateZIndex(
            defaultPoint,
            RoomPriority.POINTER
        );
        this.canvasDoorWall.zIndex = RoomVisualization.calculateZIndex(
            defaultPoint,
            RoomPriority.DOOR_WALL
        );
        this.canvasWall.zIndex = RoomVisualization.calculateZIndex(
            defaultPoint,
            RoomPriority.WALL
        );

        this.container.eventMode = 'dynamic';

        this.container.sortableChildren = true;
    }

    dispose(): void {
        this.container.destroy();
    }

    render() {
        this.roomLayout.getWallPlane().visualization?.render();
        this.roomLayout.getFloorPlane().visualization?.render();
    }

    tileToLocal(x: number, y: number, z: number): Point {
        return new Point(
            (x - y) * MapData.tileWidth,
            (x + y) * MapData.tileHeight - z * MapData.tileHeight * 2
        );
    }

    static calculateZIndex(
        point: Point3d,
        priority: RoomPriority
    ): number {
        return (
            (point.x + point.y) * 1000000 +
            point.z * 10000 +
            10000000 * priority
        );
    }

    getTileByEvent(event: Event): Tile | undefined {
        const hitCtx = this.canvasFloor;
        const coords = UiUtils.getPosition(event, hitCtx);
        console.log(coords);
        return this.roomLayout
            .getFloorPlane()
            .getTilebyPosition(
                new Point(Math.floor(coords.x), Math.floor(coords.y))
            );
    }

    globalToTileWithHeight(x: number, y: number, z: number): Point {
        const offsetX = this.container.x;
        const offsetY = this.container.y - z * MapData.tileHeight * 2;

        const xminusy = (x - MapData.tileWidth - offsetX) / MapData.tileWidth;
        const xplusy = (y - offsetY) / MapData.tileWidth;

        const tileX = Math.floor((xminusy + xplusy) / 2);
        const tileY = Math.floor((xplusy - xminusy) / 2);

        return new Point(tileX, tileY);
    }

    flip() {
        const scale = this.container.scale.y == 1 ? -1 : 1;

        this.container.scale.y = scale;
    }

    zoom(scale: number) {
        if (scale < 0) {
            return;
        }

        this.container.scale.x = +scale;
        this.container.scale.y = +scale;
    }

    add(
        object: RoomObjectController<RoomVisualization, RoomLogic>,
        follow = false
    ) {
        console.log(object.visualization);

        if (!object) return;

        this.container.addChild(object.visualization.container);
    }

    getCanvasFloor(): Container {
        return this.canvasFloor;
    }

    getCanvasWall(): Container {
        return this.canvasWall;
    }

    getCanvasDoorWall(): Container {
        return this.canvasDoorWall;
    }

    getCanvasPointer(): Container {
        return this.canvasPointer;
    }
    getCanvasDoorTile(): Container {
        return this.canvasDoorTile;
    }

    get Container(): Container {
        return this.container;
    }
}
