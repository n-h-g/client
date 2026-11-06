import {IAnimationFrame, IAnimationPart} from '../gamedata/IAvatarAnimations';

export class AnimationPart {
    setType: string;

    frames: IAnimationFrame[];

    constructor(animationPartData: IAnimationPart) {
        this.setType = animationPartData.setType;
        this.frames = animationPartData.frames.flatMap(frame =>
            Array(Math.max(1, frame.repeats ?? 1)).fill(frame)
        );
    }

    getFrames(): IAnimationFrame[] {
        return this.frames;
    }
}
