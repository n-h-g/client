import {
    IAnimationLayer,
    IAnimationLayerFrameSequence,
} from '../../../../../core/ui/imagers/items/IAnimationLayer';
import {ILayer} from '../../../../../core/ui/imagers/items/ILayer';
import {AnimationFrame} from './AnimationFrame';
import {AnimationFrameSequence} from './AnimationFrameSequence';

export class AnimationLayer {
    private _sequences: Map<number, AnimationFrameSequence>;

    constructor(data: IAnimationLayer) {
        this._sequences = new Map();

        this.loadSequences(data.sequences);
    }
    loadSequences(sequences: {
        [index: number]: IAnimationLayerFrameSequence;
    }) {
        for (const sequence of Object.keys(sequences)) {
            this._sequences.set(
                parseInt(sequence),
                new AnimationFrameSequence(sequences[sequence])
            );
        }
    }

    getFrame(direction: number, frameId: number) {
        const sequence = this._sequences.get(direction);

        if (!sequence) return;

        const frame = sequence.getFrame(frameId);

        return frame;
    }

    hasSequences(): boolean {
        return this._sequences.size > 0;
    }

    getSequence(direction: number): AnimationFrameSequence {
        const sequence = this._sequences.get(direction);

        if (!sequence) return null;

        return sequence;
    }
}
