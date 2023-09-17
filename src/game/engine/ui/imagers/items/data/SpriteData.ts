import {ISprite} from '../../../../../core/ui/imagers/items/IAsset';

export class SpriteData {
    height = 0;
    left = 0;
    top = 0;
    width = 0;

    constructor(data: ISprite) {
        if (!data) return;

        this.height = data.height ? data.height : 0;
        this.width = data.width ? data.width : 0;
        this.top = data.top ? data.top : 0;
        this.left = data.left ? data.left : 0;
    }
}
