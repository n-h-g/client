import {IPaletteColor} from '../../gamedata/IFigureData';

export class PaletteColor {
    index: number;
    club: number;
    selectable: boolean;
    color: string;

    constructor(paletteData: IPaletteColor) {
        this.index = paletteData.index;
        this.club = Number(paletteData.club) || 0;
        this.selectable = (paletteData.selectable as unknown) === true || Number(paletteData.selectable) === 1;
        this.color = paletteData.color;
    }
}
