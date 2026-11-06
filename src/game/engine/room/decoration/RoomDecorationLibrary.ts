import {SCALE_MODES, Texture, WRAP_MODES} from 'pixi.js';
import roomJsonUrl from '../../../../assets/room/room.json?url';
import roomPngUrl from '../../../../assets/room/room.png';
import {Logger} from '../../../utils/Logger';

/** Look of a plane (floor or walls) for a decoration id, as in the Nitro room.json. */
export interface PlaneDecoration {
    /** Color multiplied with the texture (or the plain color of the plane without a texture). */
    color: number;
    /** The pattern, already cut from the spritesheet so it can be repeated. */
    texture: Texture | null;
}

type Frame = {frame: {x: number; y: number; w: number; h: number}};
type Layer = {color?: number; materialId?: string};
type Visualization = {size: number; layers?: Layer[]};
type Material = {id: string; matrices: {columns: {cells: {textureId: string}[]}[]}[]};
type TextureData = {id: string; bitmaps: {assetName: string}[]};
type PlaneData = {materials: Material[]; textures: TextureData[]};

interface RoomJson {
    spritesheet: {frames: Record<string, Frame>};
    assets: Record<string, {source?: string}>;
    floorData: PlaneData & {floors: {id: string; visualizations: Visualization[]}[]};
    wallData: PlaneData & {walls: {id: string; visualizations: Visualization[]}[]};
}

/**
 * The wallpapers and floors of the rooms (Nitro room.json + room.png): an id ("101") is a color and a material,
 * the material a texture of the spritesheet. Same resolution of Nitro's RoomVisualization, with only the
 * 64 size and the first layer (all the floors and walls of room.json have one layer).
 */
export class RoomDecorationLibrary {
    private static instance: RoomDecorationLibrary | null = null;

    /** Size of the visualizations used (64 = the normal zoom). */
    private static readonly SIZE = 64;

    private loading: Promise<void> | null = null;
    private data: RoomJson | null = null;
    private image: HTMLImageElement | null = null;
    private textures = new Map<string, Texture>();

    /** Items that are not placed but change the room look (as in Habbo: the room effect items). */
    private static readonly DECORATION_ITEMS = new Set(['wallpaper', 'floor', 'landscape']);

    /** @returns true for a wallpaper, floor or landscape item: applying it changes the room look. */
    static isDecorationItem(name: string | null | undefined): boolean {
        return !!name && this.DECORATION_ITEMS.has(name);
    }

    static getInstance(): RoomDecorationLibrary {
        if (!this.instance) this.instance = new RoomDecorationLibrary();
        return this.instance;
    }

    /** Loads room.json and room.png (once). */
    load(): Promise<void> {
        if (!this.loading) {
            this.loading = Promise.all([
                fetch(roomJsonUrl).then(response => response.json() as Promise<RoomJson>),
                RoomDecorationLibrary.loadImage(roomPngUrl),
            ])
                .then(([data, image]) => {
                    this.data = data;
                    this.image = image;
                })
                .catch(error => {
                    // the rooms keep the default look
                    Logger.error('Room decorations not loaded', error);
                    this.loading = null;
                });
        }

        return this.loading;
    }

    /** @returns the floor for the id, null for the default look or an unknown id. */
    getFloor(id: string | null | undefined): PlaneDecoration | null {
        const data = this.data?.floorData;
        return data ? this.resolve(data, data.floors, id) : null;
    }

    /** @returns the wallpaper for the id, null for the default look or an unknown id. */
    getWall(id: string | null | undefined): PlaneDecoration | null {
        const data = this.data?.wallData;
        return data ? this.resolve(data, data.walls, id) : null;
    }

    private resolve(
        data: PlaneData,
        planes: {id: string; visualizations: Visualization[]}[],
        id: string | null | undefined
    ): PlaneDecoration | null {
        if (!id) return null;

        const plane = planes.find(p => p.id === id);
        if (!plane) return null;

        const visualization =
            plane.visualizations.find(v => v.size === RoomDecorationLibrary.SIZE) ?? plane.visualizations[0];
        const layer = visualization?.layers?.[0];
        if (!layer) return null;

        const material = data.materials.find(m => m.id === layer.materialId);
        const textureId = material?.matrices[0]?.columns[0]?.cells[0]?.textureId;
        const assetName = data.textures.find(t => t.id === textureId)?.bitmaps[0]?.assetName;

        return {
            color: layer.color ?? 0xffffff,
            texture: assetName ? this.getTexture(assetName) : null,
        };
    }

    /**
     * The texture of an asset of the spritesheet in its own canvas: the Pixi graphics repeat the whole
     * base texture, a frame of the atlas would repeat the entire room.png.
     */
    private getTexture(assetName: string): Texture | null {
        const cached = this.textures.get(assetName);
        if (cached) return cached;

        if (!this.data || !this.image) return null;

        const source = this.data.assets[assetName]?.source ?? assetName;
        const frame = this.data.spritesheet.frames[`room_${source}.png`]?.frame;
        if (!frame) return null;

        const canvas = document.createElement('canvas');
        canvas.width = frame.w;
        canvas.height = frame.h;
        canvas.getContext('2d')?.drawImage(this.image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

        const texture = Texture.from(canvas);
        texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
        texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

        this.textures.set(assetName, texture);
        return texture;
    }

    private static loadImage(url: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.onload = () => resolve(image);
            image.onerror = reject;
            image.src = url;
        });
    }
}
