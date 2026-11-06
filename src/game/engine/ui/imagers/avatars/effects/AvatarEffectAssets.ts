import {Texture} from 'pixi.js';
import {RenderingUtils} from '../../../../../utils/RenderingUtils';
import {IEffectLibrary} from '../gamedata/IAvatarEffect';

/** A bitmap of an effect library with its registration point (same convention of the figure parts). */
export interface AvatarEffectAsset {
    texture: Texture;
    /** The sprite pivot: the asset is drawn at (-x, -y) from the avatar registration point. */
    x: number;
    y: number;
    /** Mirrored (an alias with fliph). */
    flipH: boolean;
}

/**
 * The assets of an effect library (as Nitro's AssetCollection): the textures cut from the spritesheet,
 * resolving the aliases (link + fliph) and the assets that reuse the bitmap of another one (source).
 */
export class AvatarEffectAssets {
    private readonly cache = new Map<string, AvatarEffectAsset | null>();
    /** Spritesheet frame by asset name. Some libraries name their frames with another library's prefix. */
    private readonly frames = new Map<string, {x: number; y: number; w: number; h: number}>();

    constructor(private readonly data: IEffectLibrary, private readonly sheet: Texture) {
        for (const [key, frame] of Object.entries(data.spritesheet?.frames ?? {})) {
            const name = AvatarEffectAssets.assetNameOfFrame(key);
            if (name) this.frames.set(name, frame.frame);
        }
    }

    getAsset(name: string): AvatarEffectAsset | null {
        if (!this.cache.has(name)) this.cache.set(name, this.resolve(name));

        return this.cache.get(name)!;
    }

    private resolve(name: string): AvatarEffectAsset | null {
        const alias = this.data.aliases?.[name];
        if (alias) {
            const linked = this.getAsset(alias.link);
            if (!linked) return null;

            return {...linked, flipH: alias.fliph ? !linked.flipH : linked.flipH};
        }

        const asset = this.data.assets?.[name];
        if (!asset) return null;

        const frame = this.frames.get(asset.source ?? name);
        if (!frame) return null;

        return {
            texture: RenderingUtils.cropTexture(this.sheet, frame.x, frame.y, frame.w, frame.h),
            x: asset.x ?? 0,
            y: asset.y ?? 0,
            flipH: false,
        };
    }

    /** "Volkswagen_h_std_fx69_1_1_2_0.png" -> "h_std_fx69_1_1_2_0" (large "h_" or small "sh_" assets). */
    private static assetNameOfFrame(key: string): string | null {
        const match = /^.*?_((?:h|sh)_.+)\.png$/.exec(key);
        return match ? match[1] : null;
    }
}
