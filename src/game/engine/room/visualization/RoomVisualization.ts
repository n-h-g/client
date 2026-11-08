import {RoomLayout} from '../RoomLayout';
import {Container} from '@pixi/display';
import type {IPointData} from 'pixi.js';
import {TileType} from '../objects/map/TileTypeEnum';
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
import { Wall } from '../objects/map/Wall';

import {RoomLight} from './RoomLight';

export class RoomVisualization implements Disposable {
    container: Container;
    needsUpdate = false;
    private roomLayout: RoomLayout;
    private canvasFloor: Container;
    private canvasWall: Container;
    private canvasDoorTile: Container;
    private canvasDoorWall: Container;
    private canvasPointer: Container;
    private canvasStairs: Container;
    /** The light of the room dimmer (RoomLight): the whole room, or only the floor and the walls. */
    readonly light: RoomLight;

    constructor(room: RoomLayout) {
        this.roomLayout = room;

        this.container = new Container();
        this.canvasFloor = new Container();
        this.canvasWall = new Container();
        this.canvasDoorWall = new Container();
        this.canvasPointer = new Container();
        this.canvasDoorTile = new Container();
        this.canvasStairs = new Container();

        this.container.addChild(this.canvasDoorTile);
        this.container.addChild(this.canvasWall);
        this.container.addChild(this.canvasDoorWall);
        this.container.addChild(this.canvasFloor);
        this.container.addChild(this.canvasPointer);
        this.container.addChild(this.canvasStairs);

        this.light = new RoomLight(this.container, [
            this.canvasFloor, this.canvasWall, this.canvasDoorWall, this.canvasDoorTile, this.canvasStairs,
        ]);

        this.container.x = (Engine.getInstance().application.screenCoords.x - this.container.width) / 2;
        this.container.y = (Engine.getInstance().application.screenCoords.y / 2 - - this.container.height) / 2;

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
        // the steps rise towards the wall behind them: drawn with the floor, the wall covered their top
        this.canvasStairs.zIndex = this.canvasWall.zIndex + 1;

        this.container.eventMode = 'dynamic';

        this.container.sortableChildren = true;
    }

    dispose(): void {
        this.light.dispose();
        this.container.destroy();
    }

    async render(): Promise<void> {
        await Promise.all([
            this.roomLayout.getWallPlane().visualization?.render(),
            this.roomLayout.getFloorPlane().visualization?.render(),
        ]);
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

    /**
     * Finds the floor tile under the given global (screen) point using only the tiles geometry,
     * so furni and avatars drawn over the floor don't hide the tile under the mouse.
     * When more tiles overlap (different heights) the one in front (higher x + y) wins.
     */
    getTileAtGlobalPoint(global: IPointData): Tile | undefined {
        const local = this.canvasFloor.toLocal(global);

        const halfWidth = MapData.tileWidth / 2;
        const halfHeight = MapData.tileHeight / 2;

        let found: Tile | undefined;
        let foundDepth = -Infinity;

        for (const tile of this.roomLayout.getFloorPlane().getTiles()) {
            // the floor plane contains only tiles; holes (height 0 or under a floor hole furni) are not walkable
            if (tile?.type === undefined || tile.type == TileType.Hole || tile.coveredByFloorHole || !tile.visualization) continue;

            // the tile is a rhombus whose bounding box starts at (offsetX, offsetY)
            const centerX = tile.visualization.offsetX + halfWidth;
            const centerY = tile.visualization.offsetY + halfHeight;

            const distance =
                Math.abs(local.x - centerX) / halfWidth +
                Math.abs(local.y - centerY) / halfHeight;

            if (distance > 1) continue;

            const depth = tile.position.x + tile.position.y;

            if (depth > foundDepth) {
                found = tile;
                foundDepth = depth;
            }
        }

        return found;
    }

    getWallAtGlobalPoint(global: IPointData): Wall | undefined {
        const walls = this.roomLayout.getWallPlane().getWalls();
        // Wall graphics are drawn in room-local coordinates; containsPoint accounts
        // for the room's viewport transform and avoids treating floor tiles as walls.
        for (let i = walls.length - 1; i >= 0; i--) {
            const wall = walls[i];
            const graphics = wall.visualization.wallCtx;
            if (graphics?.containsPoint(global as any)) return wall;
        }
        return undefined;
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

    /**
     * z-index for what stands in the door (the avatar, the pointer): the door tile is inside the wall,
     * so they go under all the walls (wall over the door included) but over the floor.
     */
    getDoorZIndex(): number {
        return Math.min(this.canvasWall.zIndex, this.canvasDoorWall.zIndex) - 1;
    }

    getCanvasStairs(): Container {
        return this.canvasStairs;
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
