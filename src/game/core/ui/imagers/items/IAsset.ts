export interface IAsset {
    offsets: IOffsets;
    flipH: number;
    source: string;
    sprite?: ISprite;
}

export interface ISprite {
    height: number;
    left: number;
    top: number;
    width: number;
}

export interface IOffsets {
    height: number;
    left: number;
    top: number;
    width: number;
}
