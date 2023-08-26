export interface IAnimationLayer {
    loopCount?: number
    frameRepeat?: number
    sequences: { [index: number] : IAnimationLayerFrameSequence }
}

export interface IAnimationLayerFrameSequence {
    frame?: number
    frames?: {
        [index: string] : {
            id: number
        }
    }
}