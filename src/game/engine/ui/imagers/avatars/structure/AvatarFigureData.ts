import {FigurePart} from '../Avatar';
import IFigureData, {
    ISet,
    CA,
    IPart,
    IPaletteColor,
} from '../gamedata/IFigureData';
import {Palette} from './figure/Palette';
import PartSet from './figure/Set';
import SetType from './figure/SetType';

export default class AvatarFigureData {
    public palettes: Map<string, Palette>;
    public setTypes: Map<string, SetType>;

    public constructor(figureData: IFigureData) {
        this.palettes = new Map();
        this.setTypes = new Map();

        this.loadPalettes(figureData.palette);
        this.loadSetTypes(figureData.settype);
    }

    private loadPalettes(palettes: {
        [key: string]: {[key: string]: IPaletteColor};
    }): void {
        if (palettes) {
            for (const palette of Object.keys(palettes)) {
                const newPalette = new Palette(palettes[palette]);
                this.palettes.set(palette, newPalette);
            }
        }
    }

    private loadSetTypes(setTypes: {[key: string]: CA}): void {
        if (setTypes) {
            for (const setType of Object.keys(setTypes)) {
                this.setTypes.set(
                    setType,
                    new SetType(setTypes[setType] as CA)
                );
            }
        }
    }

    public getSetByType(type: string): SetType | null {
        const set = this.setTypes.get(type);

        if (!set) return null;

        return set;
    }

    public getSetByFigurePart(figurePart: FigurePart): PartSet | null {
        const setType = this.setTypes.get(figurePart.type);
        const set = setType?.partSets.get(figurePart.id);

        if (!set) return null;

        return set;
    }

    public getSetByPartId(type: string, id: string): PartSet | null {
        const set = this.getSetByType(type);

        if (!set) return null;

        const setType = set.partSets.get(id);

        if (!setType) return null;

        return setType;
    }

    public getFigureDataParts(figurePart: FigurePart): IPart[] {
        const parts: IPart[] = [];

        const setType = this.setTypes.get(figurePart.type);

        if (!setType) {
            return parts;
        }

        const set = setType.partSets.get(figurePart.id);

        if (!set) {
            return parts;
        }

        if (!set.parts) {
            return parts;
        }
        for (const part of set.parts) {
            parts.push(part);
        }
        return parts;
    }

    public getPalette(paletteId: string): Palette | null {
        const palette = this.palettes.get(paletteId.toString());

        if (!palette) return null;

        return palette;
    }
}
