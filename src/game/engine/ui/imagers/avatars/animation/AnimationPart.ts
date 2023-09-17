import {IAnimationFrame, IAnimationPart} from '../gamedata/IAvatarAnimations';

export class AnimationPart {
    setType: string;

    frames: IAnimationFrame[];

    constructor(animationPartData: IAnimationPart) {
        this.setType = animationPartData.setType;

        this.frames = animationPartData.frames;
    }

    getFrames(): IAnimationFrame[] {
        return this.frames;
    }
}
