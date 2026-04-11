export interface IAnimationLayer {
    loopCount?: number;
    frameRepeat?: number;
    sequences: {[index: number]: IAnimationLayerFrameSequence};
}

export interface IAnimationLayerFrameSequence {
    [index: string]: {
            id: number;
    };
}
