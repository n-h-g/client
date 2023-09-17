import {
    IAsset,
    IOffsets,
    ISprite,
} from '../../../../core/ui/imagers/items/IAsset';
import {SpriteData} from './data/SpriteData';

export class FurniAsset {
    _assetName: string;

    _offsets: IOffsets;

    private _flipH = 0;

    private _source?: string;

    private _sprite?: ISprite;

    constructor(assetName: string, data: IAsset) {
        this._assetName = assetName;

        this._flipH = data.flipH || 0;

        this._source = data.source || null;

        this._offsets = data.offsets;

        this._sprite = new SpriteData(data.sprite);
    }

    get name() {
        return this._assetName;
    }

    get source() {
        return this._source;
    }

    get sprite() {
        return this._sprite;
    }

    isFlipped(): boolean {
        return this._flipH == 1;
    }
}
