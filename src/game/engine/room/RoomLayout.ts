import {Room} from './Room';
import {Point} from '../../utils/point/Point';
import {RoomVisualization} from './visualization/RoomVisualization';
import {RoomLogic} from './logic/RoomLogic';
import {FloorPlane} from './objects/map/FloorPlane';
import {ColorRGB} from '../../utils/color/ColorRGB';
import {WallPlane} from './objects/map/WallPlane';
import {Pointer} from './objects/map/Pointer';
import {MapData} from './objects/map/MapData';
import {PlaneDecoration, RoomDecorationLibrary} from './decoration/RoomDecorationLibrary';

export type RoomDecorationIds = {
    wallpaper: string | null;
    floor: string | null;
    landscape: string | null;
};

export class RoomLayout {
    private wrappedVisualization: RoomVisualization;
    private wrappedLogic: RoomLogic;
    private room: Room;
    private modelMatrix: number[][] = [];
    private colorsHash: ColorRGB[] = [];
    private floorPlane: FloorPlane;
    private wallPlane: WallPlane;
    private mapSizeX = 0;
    private mapSizeY = 0;
    private mapSizeZ = 0;
    private heighestPosition = new Point(0, 0);
    private doorPosition: Point;
    private zoom = 1;
    private fullHeightTick = false;
    private pointer: Pointer;

    /** Ids of the decorations applied with the wallpaper/floor/landscape items ("0.0" = default look). */
    private decorationIds: RoomDecorationIds = {wallpaper: null, floor: null, landscape: null};
    private wrappedFloorDecoration: PlaneDecoration | null = null;
    private wrappedWallDecoration: PlaneDecoration | null = null;

    /** The look of the room (its "Customize" settings, see setAppearance). */
    private wallsHidden = false;
    private wallThicknessLevel = 0;
    private floorThicknessLevel = 0;

    constructor(room: Room, model: string, doorPosition: Point) {
        this.room = room;

        this.doorPosition = doorPosition;

        this.parseModel(model);

        this.wrappedVisualization = new RoomVisualization(this);
        this.wrappedLogic = new RoomLogic(this);

        this.floorPlane = new FloorPlane(this);
        this.wallPlane = new WallPlane(this);

        this.prepareMapObjects();

        this.pointer = new Pointer(this);
    }

    private parseModel(model: string): void {
        const modelRows = model.split('/');

        this.mapSizeX = modelRows.length;
        this.mapSizeY = Math.max(...modelRows.map(el => el.length));

        for (let x = 0; x < this.mapSizeX; x++) {
            this.modelMatrix[x] = [];
            for (let y = 0; y < this.mapSizeY; y++) {
                const tile = modelRows[x]
                    .substring(y, y + 1)
                    .trim()
                    .toUpperCase()
                    .charAt(0);

                const height =
                    tile.toUpperCase() != tile.toLowerCase()
                        ? 10 + tile.charCodeAt(0) - 'A'.charCodeAt(0)
                        : parseInt(tile);

                this.modelMatrix[x][y] = height;

                if (height > this.mapSizeZ) {
                    this.mapSizeZ = height;
                    this.heighestPosition = new Point(x, y);
                }
            }
        }
    }

    private prepareMapObjects(): void {
        this.colorsHash.push(new ColorRGB(0, 0, 0));

        this.floorPlane.prepareTiles();
        this.wallPlane.prepareWalls();
    }

    getExtraHeight() {
        let extra =
            MapData.tileHeight * this.mapSizeZ -
            (MapData.tileHeight / 2) *
                (this.heighestPosition.x + this.heighestPosition.y);
        if (extra < 0) extra = 0;

        return extra;
    }

    getCanvasSize(): Point {
        const tileBorder = Math.sqrt(
            Math.pow(MapData.tileWidth / 2, 2) +
                Math.pow(MapData.tileHeight / 2, 2)
        );

        const X = this.mapSizeX * tileBorder;
        const Y = this.mapSizeY * tileBorder;

        const fixSpaces =
            -1 *
                (this.mapSizeX > this.mapSizeY
                    ? this.mapSizeX
                    : this.mapSizeY) -
            1;
        const heightExtra = this.getExtraHeight();

        return new Point(
            Math.floor(
                Y * Math.cos(Math.PI / 6) -
                    X * Math.cos(Math.PI / 6 + (2 * Math.PI) / 3)
            ) +
                (MapData.wallDepth + 1) * 2,
            Math.floor(
                Y * Math.sin(Math.PI / 6) +
                    X * Math.sin(Math.PI / 6 + (2 * Math.PI) / 3) -
                    MapData.tileHeight / 2 +
                    MapData.wallHeight -
                    MapData.thickSpace -
                    MapData.wallDepth +
                    heightExtra +
                    fixSpaces
            )
        );
    }

    createOrGetRoomCanvas(name: string): HTMLCanvasElement {
        const canvasId = `room-${this.room.id}-${name}`;
        let canvas = document.getElementById(canvasId) as HTMLCanvasElement;

        if (canvas == undefined) canvas = document.createElement('canvas');

        canvas.id = canvasId;

        const canvasSize = this.getCanvasSize();
        canvas.width = canvasSize.x;
        canvas.height = canvasSize.y;

        const roomOffset = this.getRoomOffset();
        canvas
            .getContext('2d')!
            .translate(roomOffset.x, roomOffset.y);
        canvas.getContext('2d')!.imageSmoothingEnabled = false;

        return canvas;
    }

    getRoomOffset(): Point {
        return new Point(
            ((this.mapSizeX - 1) * MapData.tileWidth) / 2 + MapData.wallDepth,
            MapData.wallHeight -
                MapData.thickSpace -
                MapData.wallDepth -
                MapData.wallBlankTop +
                this.getExtraHeight()
        );
    }

    getOffset(x: number, y: number, z: number): Point {
        return new Point(
            (y - x) * MapData.tileWidth,
            (x + y) * MapData.tileHeight - z * MapData.tileHeight * 2
        );
    }

    getUniqueColor(): ColorRGB {
        const color: ColorRGB = ColorRGB.getRandomColor();

        if (this.colorsHash.includes(color)) {
            return this.getUniqueColor();
        }

        this.colorsHash.push(color);
        return color;
    }

    /**
     * Applies the wallpaper/floor/landscape of the room (on entering, or when the owner applies one from
     * the inventory): the floor and the walls are drawn again with the new color and pattern.
     * The landscape is kept but not drawn: it's only visible through the windows.
     * @param ids the decorations that change, the missing ones stay as they are.
     */
    async setDecorations(ids: Partial<RoomDecorationIds>): Promise<void> {
        this.decorationIds = {...this.decorationIds, ...ids};

        const library = RoomDecorationLibrary.getInstance();
        await library.load();

        const floor = library.getFloor(this.decorationIds.floor);
        const wall = library.getWall(this.decorationIds.wallpaper);

        // the room was left while loading
        if (!this.visualization.container || this.visualization.container.destroyed) return;

        const floorChanged = !RoomLayout.samePlane(floor, this.wrappedFloorDecoration);
        const wallChanged = !RoomLayout.samePlane(wall, this.wrappedWallDecoration);

        this.wrappedFloorDecoration = floor;
        this.wrappedWallDecoration = wall;

        if (floorChanged) this.floorPlane.visualization?.redraw();
        if (wallChanged) this.wallPlane.visualization?.redraw();
    }

    /**
     * The look of the room (the "Customize" settings): the walls hidden, the thickness of the walls and of the floor
     * (-2 thinnest, -1 thin, 0 normal, 1 thick, as Habbo). The planes are drawn again when it changes.
     */
    setAppearance(hideWalls: boolean, wallThickness: number, floorThickness: number): void {
        const wallChanged = hideWalls !== this.wallsHidden || wallThickness !== this.wallThicknessLevel;
        const floorChanged = floorThickness !== this.floorThicknessLevel;

        this.wallsHidden = hideWalls;
        this.wallThicknessLevel = wallThickness;
        this.floorThicknessLevel = floorThickness;

        if (!this.visualization.container || this.visualization.container.destroyed) return;

        if (floorChanged) this.floorPlane.visualization?.redraw();
        if (wallChanged) this.wallPlane.visualization?.redraw();
    }

    get hideWalls(): boolean {
        return this.wallsHidden;
    }

    /** The thickness of the walls in pixels: 2, 4, 8 (normal, MapData.wallDepth), 16. */
    get wallThicknessPx(): number {
        return RoomLayout.thicknessPx(this.wallThicknessLevel);
    }

    /** The thickness of the edge of the floor in pixels: 2, 4, 8 (normal, MapData.thickSpace), 16. */
    get floorThicknessPx(): number {
        return RoomLayout.thicknessPx(this.floorThicknessLevel);
    }

    private static thicknessPx(level: number): number {
        return 8 * Math.pow(2, Math.max(-2, Math.min(1, Math.round(level || 0))));
    }

    private static samePlane(a: PlaneDecoration | null, b: PlaneDecoration | null): boolean {
        if (!a || !b) return a === b;
        return a.color === b.color && a.texture === b.texture;
    }

    getDecorationIds(): RoomDecorationIds {
        return {...this.decorationIds};
    }

    /** The floor applied with a floor item, null for the default look. */
    get floorDecoration(): PlaneDecoration | null {
        return this.wrappedFloorDecoration;
    }

    /** The wallpaper applied with a wallpaper item, null for the default look. */
    get wallDecoration(): PlaneDecoration | null {
        return this.wrappedWallDecoration;
    }

    getModelMaltrix(): number[][] {
        return this.modelMatrix;
    }

    setModelMatrixElement(x: number, y: number, height: number): void {
        if (this.modelMatrix[x] && this.modelMatrix[x][y]) {
            this.modelMatrix[x][y] = height;
        }
    }

    getMapSizeX(): number {
        return this.mapSizeX;
    }

    getMapSizeY(): number {
        return this.mapSizeY;
    }

    getMapSizeZ(): number {
        return this.mapSizeZ;
    }

    getDoorPosition(): Point {
        return this.doorPosition;
    }

    getPointer(): Pointer {
        return this.pointer;
    }

    getFloorPlane(): FloorPlane {
        return this.floorPlane;
    }

    getWallPlane(): WallPlane {
        return this.wallPlane;
    }

    getZoom(): number {
        return this.zoom;
    }

    get hasFullHeightTick(): boolean {
        return this.fullHeightTick;
    }

    get visualization(): RoomVisualization {
        return this.wrappedVisualization;
    }

    get logic(): RoomLogic {
        return this.wrappedLogic;
    }

    getModelMatrix(): number[][] {
        return this.modelMatrix;
    }

    getRoom(): Room {
        return this.room;
    }
}
