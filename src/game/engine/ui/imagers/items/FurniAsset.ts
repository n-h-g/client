import { IAsset, IOffsets, ISprite } from "../../../../core/ui/imagers/items/IAsset"
import { SpriteData } from "./data/SpriteData"

export class FurniAsset {

    public _assetName: string

    public _offsets: IOffsets

    private _flipH: number = 0

    private _source?: string

    private _sprite?: ISprite
        
    public constructor(assetName: string, data: IAsset) {
        this._assetName = assetName;

        this._flipH = data.flipH || 0

        this._source = data.source || null;

        this._offsets = data.offsets

        this._sprite = new SpriteData(data.sprite)
    }

    public get name() {
        return this._assetName
    }

    public get source() {
        return this._source
    }

    public get sprite() {
        return this._sprite
    }

    public isFlipped(): boolean {
        return this._flipH == 1;
    }

}