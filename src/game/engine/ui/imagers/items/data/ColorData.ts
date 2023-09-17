import {IColor} from '../../../../../core/ui/imagers/items/IColor';

export class ColorData {
    readonly color;

    constructor(colorData: IColor) {
        this.color = colorData.layers;
    }
}
