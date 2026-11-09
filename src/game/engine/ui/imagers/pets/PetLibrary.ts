import {BaseTexture, Rectangle, Texture} from 'pixi.js';
import {NitroAnimation, PetAnimation} from './PetAnimationData';

type NitroAsset = {source?: string; x?: number; y?: number; flipH?: boolean | number; usesPalette?: boolean | number};
type NitroPalette = {id: number; rgb: [number, number, number][]};
type NitroLayer = {tag?: string; z?: number; alpha?: number; ink?: string; ignoreMouse?: boolean | number};
type NitroVisualization = {
    size: number;
    layerCount: number;
    angle?: number;
    layers?: Record<string, NitroLayer>;
    directions?: Record<string, {layers?: Record<string, {z?: number}>}>;
    animations?: Record<string, NitroAnimation>;
    postures?: Record<string, {id: string; animationId: number}> | {defaultPosture?: string; postures?: {id: string; animationId: number}[]};
    gestures?: Record<string, {id: string; animationId: number}> | {id: string; animationId: number}[];
};
export type NitroPetLibrary = {
    name: string;
    type?: string;
    visualizationType?: string;
    spritesheet?: {meta?: {image?: string}; frames?: Record<string, {frame: PetFrameRect}>};
    directions?: number[];
    assets?: Record<string, NitroAsset>;
    palettes?: NitroPalette[] | Record<string, NitroPalette>;
    visualizations?: NitroVisualization[];
};

/** Where the bitmap of an asset is in the png of the library. */
export type PetFrameRect = {x: number; y: number; w: number; h: number};

/** An asset ready to be drawn: the bitmap, where it goes (the offset of the asset itself) and if it's mirrored. */
export type PetAsset = {
    texture: Texture;
    /** The point of the bitmap that goes on the origin of the pet (Nitro's asset x, y). */
    x: number;
    y: number;
    flipH: boolean;
};

/** The tags of the layers that Nitro's PetVisualization treats in their own way. */
export const PetLayerTag = {
    HEAD: 'head',
    HAIR: 'hair',
    SADDLE: 'saddle',
} as const;

/**
 * A pet library (pet/<name>/<name>.json and .png, the unpacked .nitro bundle), as Nitro's PetVisualizationData and
 * GraphicAssetCollection read it. The bitmaps of the pets are gray: with usesPalette their green channel is the index
 * of a color of the palette of the race (getAssetWithPalette), then the color of the pet tints them.
 */
export class PetLibrary {
    /** The size drawn in the room (Nitro has a 32 px one too, for the zoomed out room). */
    static readonly SIZE = 64;
    /** Nitro's LayerData letters: the layer 0 is "a". */
    private static readonly LAYER_LETTERS = 'abcdefghijklmnopqrstuvwxyz';

    readonly name: string;
    readonly layerCount: number;
    readonly size: number;

    private readonly image: HTMLImageElement;
    private readonly baseTexture: BaseTexture;
    private readonly assets: Record<string, NitroAsset>;
    /** The bitmaps in the png, by name (<pet>_<asset>.png). */
    private readonly frames: Map<string, PetFrameRect>;
    private readonly palettes = new Map<string, [number, number, number][]>();
    private readonly layers: Record<string, NitroLayer>;
    private readonly directionLayers = new Map<number, Record<string, {z?: number}>>();
    private readonly validDirections: number[];
    private readonly animations = new Map<number, PetAnimation>();
    private readonly postures = new Map<string, number>();
    private readonly gestures = new Map<string, number>();
    private defaultPosture: string | null = null;

    /** The bitmaps, by asset (and palette): made once. */
    private readonly textures = new Map<string, Texture | null>();

    /**
     * @param atlas the frames of the .atlas next to the png (see parseAtlas): the spritesheet in the json is wrong in
     *              some libraries (e.g. bear.json has the frames of pig.png), the atlas describes the png it goes with.
     */
    constructor(data: NitroPetLibrary, image: HTMLImageElement, atlas: Map<string, PetFrameRect> | null = null) {
        this.name = data.name;
        this.image = image;
        this.baseTexture = BaseTexture.from(image);
        this.assets = data.assets ?? {};
        this.frames = atlas?.size ? atlas : PetLibrary.jsonFrames(data);

        for (const palette of Object.values(data.palettes ?? {})) {
            if (palette?.rgb) this.palettes.set(String(palette.id), palette.rgb);
        }

        const visualization = data.visualizations?.find(v => v.size === PetLibrary.SIZE) ?? data.visualizations?.[0];
        this.size = visualization?.size ?? PetLibrary.SIZE;
        this.layerCount = visualization?.layerCount ?? 0;
        this.layers = visualization?.layers ?? {};

        for (const [direction, value] of Object.entries(visualization?.directions ?? {})) {
            this.directionLayers.set(Number(direction), value?.layers ?? {});
        }

        // the directions with a visualization, else the ones of the library (in degrees)
        this.validDirections = this.directionLayers.size
            ? [...this.directionLayers.keys()].sort((a, b) => a - b)
            : (data.directions ?? [0, 90, 180, 270]).map(degrees => Math.round(degrees / 45) % 8);

        for (const [key, animation] of Object.entries(visualization?.animations ?? {})) {
            const id = PetAnimation.idOf(key, animation);
            this.animations.set(id, new PetAnimation(id, animation));
        }

        this.readPostures(visualization?.postures);
        this.readGestures(visualization?.gestures);
    }

    /** The frames of the spritesheet of the json, only if they are of the png of this library. */
    private static jsonFrames(data: NitroPetLibrary): Map<string, PetFrameRect> {
        const frames = new Map<string, PetFrameRect>();
        const image = data.spritesheet?.meta?.image;
        if (image && image !== `${data.name}.png`) return frames;

        for (const [name, value] of Object.entries(data.spritesheet?.frames ?? {})) {
            if (value?.frame) frames.set(name, {...value.frame});
        }
        return frames;
    }

    /**
     * The regions of a libGDX .atlas (the format of the unpacked Nitro libraries): a line with the name, then the
     * indented "xy: x, y" and "size: w, h" of the region in the png.
     */
    static parseAtlas(text: string): Map<string, PetFrameRect> {
        const frames = new Map<string, PetFrameRect>();
        let name: string | null = null;
        let pageHeader = true;

        for (const raw of text.split(/\r?\n/)) {
            if (!raw.trim()) {
                // a blank line starts a new page (its png name and its settings)
                pageHeader = true;
                name = null;
                continue;
            }

            if (!/^\s/.test(raw)) {
                const line = raw.trim();

                // the settings of the page: "size: 2048,64", "format: ...", "filter: ...", "repeat: ..."
                if (line.includes(':')) continue;

                // the first name of a page is its png, the next ones are the regions
                if (pageHeader) {
                    pageHeader = false;
                    name = null;
                } else {
                    name = line;
                }
                continue;
            }

            if (!name) continue;

            const value = raw.trim();
            const xy = /^xy:\s*(-?\d+)\s*,\s*(-?\d+)/.exec(value);
            const size = /^size:\s*(\d+)\s*,\s*(\d+)/.exec(value);
            const frame = frames.get(name) ?? {x: 0, y: 0, w: 0, h: 0};

            if (xy) {
                frame.x = Number(xy[1]);
                frame.y = Number(xy[2]);
                frames.set(name, frame);
            } else if (size) {
                frame.w = Number(size[1]);
                frame.h = Number(size[2]);
                frames.set(name, frame);
            }
        }

        return frames;
    }

    /** The postures are an object by id in the unpacked libraries, {defaultPosture, postures: [...]} in Nitro's. */
    private readPostures(postures: NitroVisualization['postures']): void {
        if (!postures) return;

        const list = 'postures' in postures && Array.isArray(postures.postures)
            ? postures.postures
            : Object.values(postures as Record<string, {id: string; animationId: number}>);

        if ('defaultPosture' in postures && typeof postures.defaultPosture === 'string') this.defaultPosture = postures.defaultPosture;

        for (const posture of list) {
            if (!posture?.id || this.postures.has(posture.id)) continue;

            // as Nitro (PetSizeData): without a default, the first posture
            this.defaultPosture ??= posture.id;
            this.postures.set(posture.id, posture.animationId);
        }
    }

    private readGestures(gestures: NitroVisualization['gestures']): void {
        if (!gestures) return;

        for (const gesture of Array.isArray(gestures) ? gestures : Object.values(gestures)) {
            if (gesture?.id && !this.gestures.has(gesture.id)) this.gestures.set(gesture.id, gesture.animationId);
        }
    }

    // #region visualization

    /** The animation of a posture: the default posture's if the pet hasn't it (e.g. a turtle can't beg). */
    postureToAnimation(posture: string | null): number {
        if (posture && this.postures.has(posture)) return this.postures.get(posture)!;
        if (this.defaultPosture && this.postures.has(this.defaultPosture)) return this.postures.get(this.defaultPosture)!;

        return 0;
    }

    /** The animation of a gesture, -1 if the pet hasn't it. As Nitro, a dead pet has no gestures. */
    gestureToAnimation(gesture: string | null, posture: string | null): number {
        if (!gesture || posture === 'ded') return -1;

        return this.gestures.get(gesture) ?? -1;
    }

    getPostures(): string[] {
        return [...this.postures.keys()];
    }

    getGestures(): string[] {
        return [...this.gestures.keys()];
    }

    get defaultPostureName(): string | null {
        return this.defaultPosture;
    }

    getAnimation(animationId: number): PetAnimation | null {
        return this.animations.get(animationId) ?? null;
    }

    hasAnimation(animationId: number): boolean {
        return this.animations.has(animationId);
    }

    getLayerTag(layerId: number): string {
        return this.layers[String(layerId)]?.tag ?? '';
    }

    getLayerAlpha(layerId: number): number {
        const alpha = this.layers[String(layerId)]?.alpha;
        return alpha === undefined ? 1 : alpha / 255;
    }

    getLayerInk(layerId: number): string | null {
        return this.layers[String(layerId)]?.ink ?? null;
    }

    getLayerIgnoreMouse(layerId: number): boolean {
        return !!this.layers[String(layerId)]?.ignoreMouse;
    }

    /** The z of a layer: the one of the direction, else the one of the layer. A higher z is drawn over. */
    getLayerZ(direction: number, layerId: number): number {
        const z = this.directionLayers.get(direction)?.[String(layerId)]?.z ?? this.layers[String(layerId)]?.z;
        return z === undefined ? 0 : Number(z);
    }

    /** The nearest direction the library has (0..7, a step is 45°): e.g. a pet drawn only in 4 directions. */
    getValidDirection(direction: number): number {
        const wanted = ((Math.round(direction) % 8) + 8) % 8;
        if (!this.validDirections.length || this.validDirections.includes(wanted)) return wanted;

        let best = this.validDirections[0];
        let bestDistance = Infinity;
        for (const valid of this.validDirections) {
            const distance = Math.min(Math.abs(valid - wanted), 8 - Math.abs(valid - wanted));
            if (distance < bestDistance) {
                best = valid;
                bestDistance = distance;
            }
        }
        return best;
    }

    // #endregion

    // #region assets

    /** Nitro's PetVisualization.getSpriteAssetName (the 64 px size): <pet>_64_<layer letter>_<direction>_<frame>. */
    layerAssetName(layerId: number, direction: number, frame: number): string | null {
        const letter = PetLibrary.LAYER_LETTERS[layerId];
        if (!letter) return null;

        return `${this.name}_${this.size}_${letter}_${direction}_${frame}`;
    }

    shadowAssetName(direction: number): string {
        return `${this.name}_${this.size}_sd_${direction}_0`;
    }

    hasAsset(name: string): boolean {
        return !!this.assets[name];
    }

    /**
     * An asset drawn with a palette (Nitro's getAssetWithPalette): the asset of a custom part is <asset>_<part>.
     * Null if the library hasn't it (e.g. a frame missing for a direction).
     */
    getAsset(name: string, paletteName: string): PetAsset | null {
        const asset = this.assets[name];
        if (!asset) return null;

        // the bitmap is the one of the source (followed for a few steps), the offset and the flip are the asset's own
        let source = name;
        for (let depth = 0; depth < 5 && !this.findFrame(source); depth++) {
            const next = this.assets[source]?.source;
            if (!next) break;
            source = next;
        }

        const frame = this.findFrame(source);
        if (!frame || frame.w < 1 || frame.h < 1) return null;

        const texture = asset.usesPalette
            ? this.paletteTexture(source, frame, paletteName)
            : this.plainTexture(source, frame);
        if (!texture) return null;

        return {texture, x: asset.x ?? 0, y: asset.y ?? 0, flipH: !!asset.flipH};
    }

    private findFrame(name: string): PetFrameRect | undefined {
        return this.frames.get(`${this.name}_${name}.png`) ?? this.frames.get(`${name}.png`);
    }

    private plainTexture(source: string, frame: PetFrameRect): Texture {
        let texture = this.textures.get(source);
        if (!texture) {
            texture = new Texture(this.baseTexture, new Rectangle(frame.x, frame.y, frame.w, frame.h));
            this.textures.set(source, texture);
        }
        return texture;
    }

    /**
     * The bitmap with the colors of the palette (Nitro's GraphicAssetPalette.applyPalette): each pixel takes the color
     * at the index of its green channel, the alpha stays. Without that palette the bitmap is drawn as it is.
     */
    private paletteTexture(source: string, frame: PetFrameRect, paletteName: string): Texture | null {
        const palette = this.palettes.get(paletteName);
        if (!palette) return this.plainTexture(source, frame);

        const key = `${source}@${paletteName}`;
        if (this.textures.has(key)) return this.textures.get(key) ?? null;

        let texture: Texture | null = null;
        try {
            const canvas = document.createElement('canvas');
            canvas.width = frame.w;
            canvas.height = frame.h;

            const context = canvas.getContext('2d', {willReadFrequently: true});
            if (context) {
                context.drawImage(this.image, frame.x, frame.y, frame.w, frame.h, 0, 0, frame.w, frame.h);

                const image = context.getImageData(0, 0, frame.w, frame.h);
                const pixels = image.data;

                for (let i = 0; i < pixels.length; i += 4) {
                    if (pixels[i + 3] === 0) continue;

                    const color = palette[pixels[i + 1]] ?? [0, 0, 0];
                    pixels[i] = color[0];
                    pixels[i + 1] = color[1];
                    pixels[i + 2] = color[2];
                }

                context.putImageData(image, 0, 0);
                texture = Texture.from(canvas);
            }
        } catch (e) {
            // e.g. the image of another site without CORS: the canvas can't be read, the gray bitmap is drawn
            console.warn(`[Pet] palette ${paletteName} of ${this.name} not applied`, e);
            texture = this.plainTexture(source, frame);
        }

        this.textures.set(key, texture);
        return texture;
    }

    // #endregion

    destroy(): void {
        for (const [key, texture] of this.textures) {
            // the textures with a palette have their own canvas, the others share the spritesheet
            if (texture && key.includes('@')) texture.destroy(true);
        }
        this.textures.clear();
        this.baseTexture.destroy();
    }
}
