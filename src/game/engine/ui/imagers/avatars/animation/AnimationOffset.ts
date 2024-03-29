import {
    OffsetDirection,
    OffsetFrame,
    Offsets,
} from '../gamedata/IAvatarAnimations';

export class AnimationOffset {
    frames: Map<number, OffsetDirection[]>;

    constructor(offsetData: Offsets) {
        this.frames = new Map();

        this.loadFrames(offsetData.frames);
    }

    private getFrameDirection(id: number) {
        return this.frames.get(id);
    }

    getFrameDirectionParts(id: number, directionId: number) {
        const direction = this.getFrameDirection(id);

        if (!direction) return;

        return direction[directionId];
    }

    private loadFrames(frames: OffsetFrame[]) {
        if (frames) {
            for (const frame of frames) {
                this.frames.set(frame.id, frame.directions);
            }
        }
    }
}
