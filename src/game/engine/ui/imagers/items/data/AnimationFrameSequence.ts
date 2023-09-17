import {IAnimationLayerFrameSequence} from '../../../../../core/ui/imagers/items/IAnimationLayer';
import {AnimationFrame} from './AnimationFrame';

export class AnimationFrameSequence {
    private frames: AnimationFrame[];

    private frameCount = 0;

    constructor(framesData: IAnimationLayerFrameSequence) {
        this.frameCount = framesData.frame;

        this.frames = [];

        this.loadFrames(framesData);
    }

    getFrame(frameId: number): AnimationFrame {
        if (this.frames.length == 0) return null;

        const frame = this.frames[frameId];

        return frame;
    }

    getFrameCount() {
        return this.frameCount;
    }
    loadFrames(framesData: IAnimationLayerFrameSequence): void {
        if (!framesData.frames) return;

        for (const frame of Object.keys(framesData.frames)) {
            this.frames.push(
                new AnimationFrame(Object.keys(framesData).indexOf(frame), 1)
            );
        }
    }
}
