import {ColorMatrixFilter} from 'pixi.js';
import {IEffectAvatarData} from '../gamedata/IAvatarEffect';

/** Luminance weights of the grayscale conversion. */
const GRAY_R = 0.299;
const GRAY_G = 0.587;
const GRAY_B = 0.114;

/** The ink that only tints the avatar and makes it half transparent (Nitro's AvatarDataContainer). */
const INK_TRANSPARENT = 37;

/**
 * The colors of the whole avatar of an effect (e.g. Ice), as Nitro's AvatarDataContainer:
 * the avatar is multiplied by the foreground color, then (except ink 37) turned to grayscale and its gray
 * levels mapped from the background color (black) to the foreground color (white) with a palette.
 * All the steps are linear, so here they are one color matrix.
 */
export class AvatarEffectColor {
    readonly ink: number;
    private readonly matrix: number[];

    constructor(data: IEffectAvatarData) {
        this.ink = data.ink;

        const foreground = AvatarEffectColor.rgb(data.foreground);
        const background = AvatarEffectColor.rgb(data.background);
        // the color transform: each channel multiplied by the foreground
        const [mr, mg, mb] = foreground;

        if (this.ink === INK_TRANSPARENT) {
            this.matrix = [
                mr, 0, 0, 0, 0,
                0, mg, 0, 0, 0,
                0, 0, mb, 0, 0,
                0, 0, 0, 0.5, 0,
            ];
            return;
        }

        // gray = luminance of the transformed color; channel = background + gray * (foreground - background)
        const row = (channel: number) => {
            const k = foreground[channel] - background[channel];
            return [k * GRAY_R * mr, k * GRAY_G * mg, k * GRAY_B * mb, 0, background[channel]];
        };

        this.matrix = [...row(0), ...row(1), ...row(2), 0, 0, 0, 1, 0];
    }

    /** A new filter (a filter is not shared between avatars drawn at the same time). */
    createFilter(): ColorMatrixFilter {
        const filter = new ColorMatrixFilter();
        filter.matrix = [...this.matrix] as any;
        return filter;
    }

    /** "#00FFFF" -> [0, 1, 1] */
    private static rgb(color: string): [number, number, number] {
        const value = parseInt((color ?? '').replace('#', ''), 16) || 0;
        return [((value >> 16) & 0xff) / 255, ((value >> 8) & 0xff) / 255, (value & 0xff) / 255];
    }
}
