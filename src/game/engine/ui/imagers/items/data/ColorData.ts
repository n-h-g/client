import {IColor} from '../../../../../core/ui/imagers/items/IColor';

export class ColorData {
    private _color;

    constructor(colorData: IColor) {
        this._color = colorData.layers;
    }

    get color(): number {
        return this._color;
    }
}
