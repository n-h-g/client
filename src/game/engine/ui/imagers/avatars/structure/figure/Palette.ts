import { IPaletteColor } from "../../gamedata/IFigureData";
import PaletteColor from "./PaletteColor";

export class Palette {

    /**
     *  colorId | PaletteColor
     */
    private colors: Map<string, PaletteColor>

    public constructor(data: any) {
        this.colors = new Map();

        this.loadColors(data)
    }

    public getColor(colorId: string): PaletteColor | null {
        const color = this.colors.get(colorId)

        if(!color) return null;

        return color;
    }

    private loadColors(colors: any): void {

        if(colors) {
            Object.keys(colors).map((value: string, index: number) => {
                const newColor = new PaletteColor(colors[value] as IPaletteColor)

                this.colors.set(value, newColor)
            })
        }

    }

}