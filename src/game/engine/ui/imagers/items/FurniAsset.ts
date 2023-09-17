import {
    IAsset,
    IOffsets,
    ISprite,
} from '../../../../core/ui/imagers/items/IAsset';
import {SpriteData} from './data/SpriteData';

export class FurniAsset {
	readonly name: string;
	readonly source?: string;
    readonly sprite?: ISprite;

    offsets: IOffsets;

    private flipH = 0;


    constructor(assetName: string, data: IAsset) {
        this.name = assetName;

        this.flipH = data.flipH || 0;

        this.source = data.source || null;

        this.offsets = data.offsets;

        this.sprite = new SpriteData(data.sprite);
    }


    isFlipped(): boolean {
        return this.flipH == 1;
    }
}
