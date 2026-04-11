import { AnimationFrame } from "./AnimationFrame";

export class AnimationFrameSequence {
    private frames: AnimationFrame[];
    private frameCount = 0;

    constructor(framesData: any[]) {
        this.frameCount = 0;
        this.frames = [];
        this.loadFrames(framesData);
    }

    loadFrames(framesData: any[]): void {
        if (!framesData || !Array.isArray(framesData)) return;

        for (const data of framesData) {
    
            const realFrameId = data.frame !== undefined ? data.frame : 0;

            const repeats = data.repeats || 1;

            this.frames.push(
                new AnimationFrame(realFrameId, repeats)
            );
            
            this.frameCount++;
        }
    }

    getFrame(index: number): AnimationFrame {
        if (this.frames.length === 0) return null;
        return this.frames[index % this.frames.length];
    }

    getFrameCount() {
        return this.frameCount;
    }
}