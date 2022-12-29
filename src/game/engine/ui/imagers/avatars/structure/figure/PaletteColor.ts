import { IPaletteColor } from "../../gamedata/IFigureData";

export default class PaletteColor {

    public index: number;
    public club: number;
    public selectable: boolean;
    public color: string;

    public constructor(paletteData: IPaletteColor) {
        this.index = paletteData.index;
        this.club = paletteData.club;
        this.selectable = paletteData.selectable;
        this.color = paletteData.color;
    }


}