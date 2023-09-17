import {IAnimationFrame, IAnimationPart} from '../gamedata/IAvatarAnimations';

export default class AnimationPart {
    public setType: string;

    public frames: IAnimationFrame[];

    public constructor(animationPartData: IAnimationPart) {
        this.setType = animationPartData.setType;

        this.frames = animationPartData.frames;
    }

    public getFrames(): IAnimationFrame[] {
        return this.frames;
    }
}
