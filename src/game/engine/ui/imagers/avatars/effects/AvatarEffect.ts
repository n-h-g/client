import {AvatarEffectAnimation} from './AvatarEffectAnimation';
import {AvatarEffectAssets} from './AvatarEffectAssets';

/** An avatar effect ready to be drawn: its animation and the bitmaps of its library. */
export class AvatarEffect {
    constructor(
        readonly id: number,
        readonly lib: string,
        readonly animation: AvatarEffectAnimation,
        readonly assets: AvatarEffectAssets
    ) {}

    get frameCount(): number {
        return this.animation.frameCount;
    }

    /** The avatar must be drawn again at every frame. */
    get isAnimated(): boolean {
        return this.frameCount > 1;
    }
}
