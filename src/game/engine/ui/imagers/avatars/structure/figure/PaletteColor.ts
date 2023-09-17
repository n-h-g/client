import {IPaletteColor} from '../../gamedata/IFigureData';

export class PaletteColor {
    index: number;
    club: number;
    selectable: boolean;
    color: string;

    constructor(paletteData: IPaletteColor) {
        this.index = paletteData.index;
        this.club = paletteData.club;
        this.selectable = paletteData.selectable;
        this.color = paletteData.color;
    }
}
