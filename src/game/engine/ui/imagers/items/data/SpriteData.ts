import {ISprite} from '../../../../../core/ui/imagers/items/IAsset';

export class SpriteData {
    public height = 0;
    public left = 0;
    public top = 0;
    public width = 0;

    public constructor(data: ISprite) {
        if (!data) return;

        this.height = data.height ? data.height : 0;
        this.width = data.width ? data.width : 0;
        this.top = data.top ? data.top : 0;
        this.left = data.left ? data.left : 0;
    }
}
