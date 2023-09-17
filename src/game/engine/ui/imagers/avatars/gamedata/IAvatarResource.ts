export interface OffsetResource {
    type: string;
    name: string;
    spritesheet: string;
    assets: Asset;
}

export interface Spritesheet {
    [key: string]: AssetData;
}

export interface Asset {
    [key: string]: AssetData;
}
export interface AssetData {
    offset: string;
    left: string;
    top: string;
    width: string;
    height: string;
    link: string;
}

export interface Frames {
    [key: string]: FrameComponents;
}
export interface FrameComponents {
    frame: Frame;
    rotated: boolean;
    trimmed: boolean;
}

export interface Frame {
    x: number;
    y: number;
    w: number;
    h: number;
}
