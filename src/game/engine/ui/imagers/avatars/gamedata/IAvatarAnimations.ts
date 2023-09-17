/* eslint-disable */
export interface IAvatarAnimations {
    animations: IAnimation[]
  }
  
  export interface IAnimation {
    id: string
    parts: IAnimationPart[]
    offsets?: Offsets
  }

  export interface Offsets {
    frames: OffsetFrame[]
  }

  export interface OffsetFrame {
    id: number,
    directions: OffsetDirection[]
  }

  export interface OffsetDirection {
    id: number,
    bodyParts: BodyPart[]
  }
  
  export interface IAnimationPart {
    setType: string,
    frames: IAnimationFrame[]
    offsets?: Offsets
  }
  
  export interface IAnimationFrame {
    number: number,
    assetPartDefinition: string,
    repeats?: number
  }

  export interface BodyPart {
    id: string,
    dx: number,
    dy: number
  }
  