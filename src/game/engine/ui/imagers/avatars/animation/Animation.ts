import Action from '../actions/Action';
import {ActionId} from '../enum/actions/ActionId';
import {
    IAnimation,
    IAnimationPart,
    OffsetDirection,
    OffsetFrame,
    Offsets,
} from '../gamedata/IAvatarAnimations';
import {AnimationOffset} from './AnimationOffset';
import AnimationPart from './AnimationPart';

export default class Animation {
    public id: string | ActionId;

    /**
     *  SetType    |    AnimationPart
     */
    public parts: Map<string, AnimationPart>;

    public offsets: AnimationOffset;

    public constructor(animationData: IAnimation) {
        this.id = animationData.id;

        this.parts = new Map();

        this.loadAnimationsParts(animationData.parts);
        this.loadAnimationOffsets(animationData.offsets);
    }

    public getAnimationOffset(
        action: string,
        partFrame: number,
        direction: number
    ) {
        const offsets = this.offsets;

        if (!offsets) return;

        const partDirection: OffsetDirection = offsets.getFrameDirectionParts(
            partFrame,
            direction
        );

        if (!partDirection) return;

        return partDirection.bodyParts[0];
    }

    public getAnimationPart(type: string): AnimationPart | null {
        const animationPart = this.parts.get(type);

        if (!animationPart) return null;

        return animationPart;
    }

    private loadAnimationOffsets(offsets: Offsets) {
        if (offsets) {
            const newAnimationOffset = new AnimationOffset(offsets);

            this.offsets = newAnimationOffset;
        }
    }

    private loadAnimationsParts(parts: IAnimationPart[]) {
        if (parts) {
            for (const part of parts) {
                const newAnimationPart = new AnimationPart(part);

                this.parts.set(newAnimationPart.setType, newAnimationPart);
            }
        }
    }
}
