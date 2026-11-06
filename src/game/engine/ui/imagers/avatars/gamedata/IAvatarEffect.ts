/**
 * The avatar effects as Nitro's assets: EffectMap.json (effect id -> library) and the effect libraries
 * (effects/<lib>/<lib>.json + .png), converted from Habbo's effect SWFs.
 */

export interface IEffectMapEntry {
    /** The effect id ("12"), or the animation of a dance ("dance.1"). */
    id: string;
    lib: string;
    /** "fx" for the effects, "dance" for the dances. */
    type: string;
    revision?: number;
}

export interface IEffectMap {
    effects: IEffectMapEntry[];
}

export interface IEffectSpritesheetFrame {
    frame: {x: number; y: number; w: number; h: number};
}

export interface IEffectSpritesheet {
    meta?: {image?: string};
    frames?: Record<string, IEffectSpritesheetFrame>;
}

export interface IEffectAssetData {
    x?: number;
    y?: number;
    /** Another asset whose bitmap is used. */
    source?: string;
}

export interface IEffectAliasData {
    link: string;
    fliph?: number;
    flipv?: number;
}

export interface IEffectSpriteDirection {
    id: number;
    dx?: number;
    dy?: number;
    dz?: number;
}

/** A sprite drawn with the avatar (e.g. the sparkles of Twinkle). */
export interface IEffectSpriteData {
    id: string;
    member?: string;
    ink?: number;
    staticY?: number;
    directions?: number;
    directionList?: IEffectSpriteDirection[];
}

/** A part added to a body part of the avatar (e.g. the car of Volkswagen under it). */
export interface IEffectAddData {
    id: string;
    align?: string;
    base?: string;
    ink?: number;
    blend?: string;
}

/** The colors of the whole avatar (e.g. Ice). */
export interface IEffectAvatarData {
    ink: number;
    foreground: string;
    background: string;
}

export interface IEffectFramePart {
    id: string;
    frame?: number;
    dx?: number;
    dy?: number;
    dz?: number;
    dd?: number;
    action?: string;
    base?: string;
}

export interface IEffectFrame {
    repeats?: number;
    fxs?: IEffectFramePart[];
    bodyparts?: IEffectFramePart[];
}

export interface IEffectAnimationData {
    name: string;
    desc?: string;
    resetOnToggle?: boolean;
    directions?: {offset: number}[];
    shadows?: {id: string}[];
    adds?: IEffectAddData[];
    removes?: {id: string}[];
    sprites?: IEffectSpriteData[];
    frames?: IEffectFrame[];
    avatars?: IEffectAvatarData[];
}

export interface IEffectLibrary {
    type: string;
    name: string;
    spritesheet?: IEffectSpritesheet;
    assets?: Record<string, IEffectAssetData>;
    aliases?: Record<string, IEffectAliasData>;
    animations?: Record<string, IEffectAnimationData>;
}
