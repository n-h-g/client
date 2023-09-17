import {
    IAnimationLayer,
    IAnimationLayerFrameSequence,
} from '../../../../../core/ui/imagers/items/IAnimationLayer';
import {AnimationFrameSequence} from './AnimationFrameSequence';

export class AnimationLayer {
    private sequences: Map<number, AnimationFrameSequence>;

    constructor(data: IAnimationLayer) {
        this.sequences = new Map();

        this.loadSequences(data.sequences);
    }
    loadSequences(sequences: {
        [index: number]: IAnimationLayerFrameSequence;
    }) {
        for (const sequence of Object.keys(sequences)) {
            this.sequences.set(
                parseInt(sequence),
                new AnimationFrameSequence(sequences[sequence])
            );
        }
    }

    getFrame(direction: number, frameId: number) {
        const sequence = this.sequences.get(direction);

        if (!sequence) return;

        const frame = sequence.getFrame(frameId);

        return frame;
    }

    hasSequences(): boolean {
        return this.sequences.size > 0;
    }

    getSequence(direction: number): AnimationFrameSequence {
        const sequence = this.sequences.get(direction);

        if (!sequence) return null;

        return sequence;
    }
}
