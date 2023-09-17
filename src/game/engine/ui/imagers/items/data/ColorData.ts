import {IColor} from '../../../../../core/ui/imagers/items/IColor';

export class ColorData {
    private _color;

    public constructor(colorData: IColor) {
        this._color = colorData.layers;
    }

    public get color(): number {
        return this._color;
    }
}
