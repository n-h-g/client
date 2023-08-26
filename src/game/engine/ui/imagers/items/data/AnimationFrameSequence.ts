import { IAnimationLayerFrameSequence } from "../../../../../core/ui/imagers/items/IAnimationLayer";
import { AnimationFrame } from "./AnimationFrame";

export class AnimationFrameSequence {
    
    private _frames: AnimationFrame[]

    private _frameCount: number = 0;

    public constructor(framesData: IAnimationLayerFrameSequence) {

        this._frameCount = framesData.frame

        this._frames = []

        this.loadFrames(framesData);
    }

    public getFrame(frameId: number): AnimationFrame {
        if(this._frames.length == 0) return null;

        const frame = this._frames[frameId]

        return frame;
    }

    public getFrameCount() {
        return this._frameCount;
    }
    public loadFrames(framesData: IAnimationLayerFrameSequence): void {

        if(!framesData.frames) return;

       for(let frame of Object.keys(framesData.frames)) {
            this._frames.push(new AnimationFrame(Object.keys(framesData).indexOf(frame), 1))
       }
    }
}