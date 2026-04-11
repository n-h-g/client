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
    loadSequences(sequences: { [key: string]: any }) {
        if (!sequences) return;

        for (const [key, data] of Object.entries(sequences)) {
            
            const sequenceId = parseInt(key);
        
            this.sequences.set(
                sequenceId,
                new AnimationFrameSequence(data)
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

    getAllSequences(): AnimationFrameSequence[] {
        return Array.from(this.sequences.keys())
            .sort((a, b) => a - b)
            .map(key => this.sequences.get(key)!);
    }
    
}
