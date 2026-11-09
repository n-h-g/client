/**
 * The animations of a pet library, as Nitro reads them (AnimationData, AnimationLayerData, AnimationFrameSequenceData):
 * each layer of an animation has sequences of frames; a frame is the number in the name of the asset
 * (<pet>_64_<layer>_<direction>_<frame>) and an offset, that can change with the direction.
 */

/** Nitro's AnimationData offsets: the transition from/to an animation has its own id. */
const TRANSITION_TO_OFFSET = 1_000_000;
const TRANSITION_FROM_OFFSET = 2_000_000;

export function transitionToAnimationId(animationId: number): number {
    return TRANSITION_TO_OFFSET + animationId;
}

export function transitionFromAnimationId(animationId: number): number {
    return TRANSITION_FROM_OFFSET + animationId;
}

export function isTransitionAnimation(animationId: number): boolean {
    return animationId >= TRANSITION_TO_OFFSET;
}

/** The frame of a layer at a moment of the animation. */
export type PetFrame = {
    id: number;
    x: number;
    y: number;
    /** Ticks (counter of the animation) when it ends: for the random layers, that keep their frame until then. */
    until: number;
};

type NitroOffset = {direction: number; x?: number; y?: number};
type NitroFrame = {id?: number; x?: number; y?: number; randomX?: number; randomY?: number; offsets?: NitroOffset[]};
type NitroSequence = {loopCount?: number; random?: number; frames?: Record<string, NitroFrame>};
type NitroLayer = {loopCount?: number; frameRepeat?: number; random?: number; frameSequences?: Record<string, NitroSequence>};
export type NitroAnimation = {
    layers?: Record<string, NitroLayer>;
    transitionTo?: number;
    transitionFrom?: number;
    immediateChangeFrom?: string;
    randomStart?: boolean | number;
};

class FrameData {
    readonly id: number;
    private readonly x: number;
    private readonly y: number;
    readonly randomX: number;
    readonly randomY: number;
    private readonly offsets: Map<number, {x?: number; y?: number}> | null;

    constructor(frame: NitroFrame) {
        this.id = frame.id ?? 0;
        this.x = frame.x ?? 0;
        this.y = frame.y ?? 0;
        this.randomX = frame.randomX ?? 0;
        this.randomY = frame.randomY ?? 0;
        this.offsets = frame.offsets?.length
            ? new Map(frame.offsets.map(offset => [offset.direction, {x: offset.x, y: offset.y}]))
            : null;
    }

    /** The offset of the direction replaces the one of the frame (Nitro's AnimationFrameDirectionalData). */
    getX(direction: number): number {
        return this.offsets?.get(direction)?.x ?? this.x;
    }

    getY(direction: number): number {
        return this.offsets?.get(direction)?.y ?? this.y;
    }
}

class FrameSequence {
    readonly isRandom: boolean;
    private readonly loopCount: number;
    private readonly frames: FrameData[];

    constructor(sequence: NitroSequence) {
        this.isRandom = !!sequence.random;
        this.loopCount = Math.max(1, sequence.loopCount ?? 1);
        this.frames = Object.keys(sequence.frames ?? {})
            .sort((a, b) => Number(a) - Number(b))
            .map(key => new FrameData(sequence.frames![key]));
    }

    get frameCount(): number {
        return this.frames.length * this.loopCount;
    }

    /** The frame at a position of the sequence (a random one if the sequence is random). */
    getFrame(offset: number): FrameData | null {
        if (!this.frames.length || offset < 0 || offset >= this.frameCount) return null;
        if (this.isRandom) return this.frames[Math.floor(Math.random() * this.frames.length)];

        return this.frames[offset % this.frames.length];
    }
}

export class PetAnimationLayer {
    private readonly sequences: FrameSequence[];
    private readonly loopCount: number;
    private readonly frameRepeat: number;
    private readonly random: boolean;
    readonly frameCount: number;

    constructor(layer: NitroLayer) {
        // as Nitro (AnimationData.initialize): without loopCount an animation is played once, 0 is forever
        this.loopCount = Math.max(0, layer.loopCount ?? 1);
        this.frameRepeat = Math.max(1, layer.frameRepeat ?? 1);
        this.random = !!layer.random;
        this.sequences = Object.keys(layer.frameSequences ?? {})
            .sort((a, b) => Number(a) - Number(b))
            .map(key => new FrameSequence(layer.frameSequences![key]));
        this.frameCount = this.sequences.reduce((count, sequence) => count + sequence.frameCount, 0);
    }

    /** The frame changes at random (a random layer, or a random sequence): it's kept until it ends. */
    get isRandom(): boolean {
        return this.random || this.sequences.some(sequence => sequence.isRandom);
    }

    /** The animation is over for this layer: played loopCount times, it stays on its last frame. */
    isOver(counter: number): boolean {
        if (this.isRandom || this.frameCount < 1) return true;
        if (this.loopCount <= 0) return this.frameCount === 1;

        return Math.floor(counter / this.frameRepeat) >= this.frameCount * this.loopCount;
    }

    /** Nitro's AnimationLayerData.getFrame: the frame at the counter (ticks) of the animation. */
    getFrame(direction: number, counter: number): PetFrame | null {
        if (this.frameCount < 1) return null;

        let position = Math.floor(counter / this.frameRepeat);
        let sequence: FrameSequence | undefined;
        let offset = 0;

        if (this.random) {
            sequence = this.sequences[Math.floor(Math.random() * this.sequences.length)];
        } else {
            const loops = Math.floor(position / this.frameCount);
            position %= this.frameCount;

            // played loopCount times (or a single frame forever): the last frame
            if ((this.loopCount > 0 && loops >= this.loopCount) || (this.loopCount <= 0 && this.frameCount === 1)) {
                position = this.frameCount - 1;
            }

            let start = 0;
            for (const current of this.sequences) {
                sequence = current;
                if (position < start + current.frameCount) break;
                start += current.frameCount;
            }
            offset = position - start;
        }

        const frame = sequence?.getFrame(offset);
        if (!frame) return null;

        let x = frame.getX(direction);
        let y = frame.getY(direction);
        if (frame.randomX) x = Math.trunc(x + frame.randomX * Math.random());
        if (frame.randomY) y = Math.trunc(y + frame.randomY * Math.random());

        // the counter when the next frame starts
        const until = (Math.floor(counter / this.frameRepeat) + 1) * this.frameRepeat;

        return {id: frame.id, x, y, until};
    }
}

export class PetAnimation {
    readonly id: number;
    private readonly layers = new Map<number, PetAnimationLayer>();
    private readonly randomStart: boolean;
    /** The animations from which this one starts at once, without a transition. */
    private readonly immediateChanges: number[];

    constructor(id: number, animation: NitroAnimation) {
        this.id = id;
        this.randomStart = !!animation.randomStart;
        this.immediateChanges = (animation.immediateChangeFrom ?? '')
            .split(',')
            .map(value => parseInt(value))
            .filter(value => !isNaN(value));

        for (const [layerId, layer] of Object.entries(animation.layers ?? {})) {
            this.layers.set(Number(layerId), new PetAnimationLayer(layer));
        }
    }

    /** The id of the animation in the library: the transitions have their own (see transitionToAnimationId). */
    static idOf(key: string, animation: NitroAnimation): number {
        if (animation.transitionTo !== undefined) return transitionToAnimationId(animation.transitionTo);
        if (animation.transitionFrom !== undefined) return transitionFromAnimationId(animation.transitionFrom);

        return Number(key);
    }

    getLayer(layerId: number): PetAnimationLayer | null {
        return this.layers.get(layerId) ?? null;
    }

    hasLayer(layerId: number): boolean {
        return this.layers.has(layerId);
    }

    isImmediateChangeFrom(animationId: number): boolean {
        return this.immediateChanges.includes(animationId);
    }

    /** The counter the animation starts from. */
    getStartCounter(): number {
        if (!this.randomStart) return 0;

        const longest = Math.max(0, ...[...this.layers.values()].map(layer => layer.frameCount));
        return Math.floor(Math.random() * longest);
    }

    /** Over when all its layers are over (e.g. the transition from sitting to standing). */
    isOver(counter: number): boolean {
        for (const layer of this.layers.values()) {
            if (!layer.isOver(counter)) return false;
        }
        return true;
    }
}
