import {IAsset} from '../../../../../core/ui/imagers/items/IAsset';
import {IFurnidata} from '../../../../../core/ui/imagers/items/data/IFurnidata';

type NitroFrame = {frame: {x: number; y: number; w: number; h: number}};

type NitroAsset = {
    source?: string;
    x?: number;
    y?: number;
    flipH?: boolean;
    flipV?: boolean;
};

type NitroAnimationFrame = {id: number; repeats?: number};

type NitroAnimationLayer = {
    loopCount?: number;
    frameRepeat?: number;
    random?: number;
    frameSequences?: {[id: string]: {loopCount?: number; random?: number; frames?: {[index: string]: NitroAnimationFrame}}};
};

type NitroVisualization = {
    size: number;
    layerCount: number;
    angle?: number;
    layers?: {[id: string]: any};
    directions?: {[id: string]: any};
    colors?: {[id: string]: {layers: {[layer: string]: {color: number}}}};
    animations?: {[id: string]: {layers?: {[layer: string]: NitroAnimationLayer}}};
};

export type NitroFurni = {
    type: string;
    name: string;
    visualizationType: string;
    logicType: string;
    spritesheet?: {meta?: {image?: string}; frames?: {[name: string]: NitroFrame}};
    dimensions?: {x: number; y: number; z: number};
    directions?: number[];
    assets?: {[name: string]: NitroAsset};
    visualizations?: NitroVisualization[];
};

/**
 * Converts a furni of the Nitro assets (furniture/<name>/<name>.json, the unpacked .nitro bundle)
 * to the structure used by FurniBase (IFurnidata).
 *
 * Differences handled:
 * - the asset offset is {x, y} instead of {offsets: {left, top}}, and it's always the asset's own
 *   (an asset with a source only reuses the source bitmap);
 * - the sprite coordinates are in spritesheet.frames["<furni>_<asset>.png"], and the source can be
 *   a frame that is not listed in the assets (e.g. a 32px sprite reused by the 64px asset);
 * - visualizations is a list (one per size): the 64px one is used;
 * - animations use frameSequences/frames instead of arrays of sequences;
 * - dimensions is {x, y, z} instead of [x, y, z].
 */
export class NitroFurniConverter {
    static readonly SIZE = 64;

    static isNitro(data: unknown): data is NitroFurni {
        return !!data && Array.isArray((data as NitroFurni).visualizations);
    }

    static convert(data: NitroFurni): IFurnidata {
        const visualization =
            data.visualizations?.find(v => v.size === NitroFurniConverter.SIZE) ?? data.visualizations?.[0];

        const dimensions = data.dimensions ?? {x: 1, y: 1, z: 0};

        return {
            type: data.type,
            name: data.name,
            visualizationType: data.visualizationType,
            logicType: data.logicType,
            spritesheet: data.spritesheet?.meta?.image ?? data.name + '.png',
            dimensions,
            assets: NitroFurniConverter.convertAssets(data),
            visualization: {
                type: data.visualizationType,
                layerCount: visualization?.layerCount ?? 0,
                angle: visualization?.angle ?? 45,
                layers: visualization?.layers ?? {},
                directions: visualization?.directions ?? {},
                colors: visualization?.colors ?? {},
                animations: NitroFurniConverter.convertAnimations(visualization?.animations ?? {}),
            } as any,
            logic: {
                type: data.logicType,
                dimensions: [dimensions.x, dimensions.y, dimensions.z],
                directions: data.directions ?? [0],
            },
        };
    }

    private static convertAssets(data: NitroFurni): {[key: string]: IAsset} {
        const assets = data.assets ?? {};
        const frames = data.spritesheet?.frames ?? {};
        const result: {[key: string]: IAsset} = {};

        const findFrame = (name: string) => frames[`${data.name}_${name}.png`]?.frame ?? frames[`${name}.png`]?.frame;

        // the bitmap of an asset: its own frame, or the one of its source (followed up to a few levels)
        const resolveFrame = (name: string) => {
            let current = name;

            for (let depth = 0; depth < 5 && current; depth++) {
                const frame = findFrame(current);
                if (frame) return frame;

                current = assets[current]?.source;
            }

            return undefined;
        };

        for (const [name, asset] of Object.entries(assets)) {
            const frame = resolveFrame(name);

            result[name] = {
                offsets: {left: asset.x ?? 0, top: asset.y ?? 0} as any,
                flipH: asset.flipH ? 1 : 0,
                // the bitmap is already resolved: Furni must not follow the source (and its offsets)
                source: null,
                sprite: frame ? {left: frame.x, top: frame.y, width: frame.w, height: frame.h} : undefined,
            };
        }

        return result;
    }

    private static convertAnimations(animations: NonNullable<NitroVisualization['animations']>) {
        const result: {[id: string]: any} = {};

        for (const [animationId, animation] of Object.entries(animations)) {
            const layers: {[layer: string]: any} = {};

            for (const [layerId, layer] of Object.entries(animation.layers ?? {})) {
                const sequences: {[id: string]: {frame: number; repeats: number}[]} = {};

                for (const [sequenceId, sequence] of Object.entries(layer.frameSequences ?? {})) {
                    const frames = sequence.frames ?? {};

                    sequences[sequenceId] = Object.keys(frames)
                        .sort((a, b) => Number(a) - Number(b))
                        .map(index => ({
                            frame: frames[index].id ?? 0,
                            // each frame lasts frameRepeat ticks unless it has its own repeats
                            repeats: frames[index].repeats ?? layer.frameRepeat ?? 1,
                        }));
                }

                layers[layerId] = {
                    loopCount: layer.loopCount,
                    frameRepeat: layer.frameRepeat,
                    random: layer.random,
                    sequences,
                };
            }

            result[animationId] = {layers};
        }

        return result;
    }
}
