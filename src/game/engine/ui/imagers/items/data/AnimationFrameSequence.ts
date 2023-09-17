import {IAnimationLayerFrameSequence} from '../../../../../core/ui/imagers/items/IAnimationLayer';
import {AnimationFrame} from './AnimationFrame';

export class AnimationFrameSequence {
    private _frames: AnimationFrame[];

    private _frameCount = 0;

    constructor(framesData: IAnimationLayerFrameSequence) {
        this._frameCount = framesData.frame;

        this._frames = [];

        this.loadFrames(framesData);
    }

    getFrame(frameId: number): AnimationFrame {
        if (this._frames.length == 0) return null;

        const frame = this._frames[frameId];

        return frame;
    }

    getFrameCount() {
        return this._frameCount;
    }
    loadFrames(framesData: IAnimationLayerFrameSequence): void {
        if (!framesData.frames) return;

        for (const frame of Object.keys(framesData.frames)) {
            this._frames.push(
                new AnimationFrame(Object.keys(framesData).indexOf(frame), 1)
            );
        }
    }
}
