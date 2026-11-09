import {RoomLayout} from '../RoomLayout';
import {Container} from '@pixi/display';
import {Graphics, Matrix, MSAA_QUALITY, Rectangle, RenderTexture, Renderer, Sprite, Texture} from 'pixi.js';
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

    /**
     * The floor, the walls, the stairs and the door: static, each one is drawn once in a texture (see
     * updateBakedPlanes). A big room has hundreds of tiles: drawn one by one they took most of the time of a frame.
     */
    private readonly bakedPlanes: {source: Container; sprite: Sprite | null}[];
    private planesDirty = true;
    private bakedResolution = 0;

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

        this.bakedPlanes = [this.canvasFloor, this.canvasWall, this.canvasDoorWall, this.canvasDoorTile, this.canvasStairs]
            .map(source => ({source, sprite: null}));

        // the background light colors what is drawn: the texture of a plane, else the plane itself
        this.light = new RoomLight(this.container, () => this.bakedPlanes.map(plane => plane.sprite ?? plane.source));

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
        for (const plane of this.bakedPlanes) plane.sprite?.texture.destroy(true);
        this.container.destroy();
    }

    async render(): Promise<void> {
        await Promise.all([
            this.roomLayout.getWallPlane().visualization?.render(),
            this.roomLayout.getFloorPlane().visualization?.render(),
        ]);

        this.markPlanesDirty();
    }

    /** The floor or the walls changed (e.g. a new wallpaper, a floor hole): their textures are drawn again. */
    markPlanesDirty(): void {
        this.planesDirty = true;
    }

    /**
     * Called at every frame (RoomLogic.tick): the planes are drawn again in their textures when they changed, or
     * when the resolution changed (the zoom, the density of the screen). The tiles and the walls stay in the room,
     * transparent: they are still hit by the mouse, they aren't drawn. Until all their images are loaded they are
     * drawn as before (a texture made before would miss them).
     */
    updateBakedPlanes(): void {
        const renderer = Engine.getInstance().application?.renderer as unknown as Renderer | undefined;
        if (!renderer || this.container.destroyed) return;

        const resolution = renderer.resolution * Math.max(1, Math.abs(this.container.scale.x));
        if (!this.planesDirty && resolution === this.bakedResolution) return;

        if (!this.bakedPlanes.every(plane => RoomVisualization.texturesReady(plane.source))) return;

        for (const plane of this.bakedPlanes) this.bakePlane(plane, renderer, resolution);

        this.planesDirty = false;
        this.bakedResolution = resolution;
        this.light.refreshPlanes();
    }

    private bakePlane(plane: {source: Container; sprite: Sprite | null}, renderer: Renderer, resolution: number): void {
        const source = plane.source;
        source.alpha = 1;

        // on whole pixels: the texture is drawn on the same pixels as the tiles (else it was resampled, blurred)
        const local = source.getLocalBounds(new Rectangle());
        const bounds = new Rectangle(Math.floor(local.x), Math.floor(local.y), 0, 0);
        const width = Math.ceil(local.x + local.width) - bounds.x;
        const height = Math.ceil(local.y + local.height) - bounds.y;
        const maxSize = RoomVisualization.maxTextureSize(renderer);

        // nothing to draw, or too big for a texture: the plane is drawn as before
        if (width <= 0 || height <= 0 || width * resolution > maxSize || height * resolution > maxSize) {
            if (plane.sprite) {
                plane.sprite.destroy({texture: true, baseTexture: true});
                plane.sprite = null;
            }
            return;
        }

        let texture = plane.sprite?.texture as RenderTexture | undefined;
        if (!texture || texture.width !== width || texture.height !== height || texture.resolution !== resolution) {
            texture?.destroy(true);
            texture = RenderTexture.create({width, height, resolution, multisample: renderer.multisample});
        }

        // blit: the antialiased (multisampled) drawing is resolved into the texture while it's bound; without it the
        // texture kept old data (e.g. a red floor)
        renderer.render(source, {
            renderTexture: texture,
            clear: true,
            transform: new Matrix(1, 0, 0, 1, -bounds.x, -bounds.y),
            blit: texture.framebuffer.multisample > MSAA_QUALITY.NONE,
        });

        if (!plane.sprite) {
            plane.sprite = new Sprite(texture);
            plane.sprite.eventMode = 'none';
            this.container.addChild(plane.sprite);
        } else if (plane.sprite.texture !== texture) {
            plane.sprite.texture = texture;
        }

        plane.sprite.position.set(source.x + bounds.x, source.y + bounds.y);
        plane.sprite.zIndex = source.zIndex;

        // still in the room for the mouse, not drawn (Pixi doesn't render a container with alpha 0)
        source.alpha = 0;
    }

    /** True if the images of all the tiles/walls of the container are loaded. */
    private static texturesReady(container: Container): boolean {
        const ready = (texture?: Texture | null) => !texture || texture === Texture.WHITE || texture.baseTexture.valid;

        for (const child of container.children) {
            if (!child.visible) continue;

            if (child instanceof Sprite && !ready(child.texture)) return false;

            if (child instanceof Graphics) {
                for (const data of child.geometry.graphicsData) {
                    if (!ready(data.fillStyle?.texture) || !ready(data.lineStyle?.texture)) return false;
                }
            }

            if (child instanceof Container && child.children.length && !RoomVisualization.texturesReady(child)) return false;
        }

        return true;
    }

    private static maxTextureSize(renderer: Renderer): number {
        const gl = renderer.gl;
        return gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : 4096;
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
