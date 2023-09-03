import { ISprite } from "../../../../../core/ui/imagers/items/IAsset"

export class SpriteData {
    public height: number = 0
    public left: number = 0
    public top: number = 0
    public width: number = 0

    public constructor(data: ISprite) {
        if (!data)
            return

        this.height = data.height ? data.height : 0;
        this.width = data.width ? data.width : 0;
        this.top = data.top ? data.top : 0;
        this.left = data.left ? data.left : 0
    }
}