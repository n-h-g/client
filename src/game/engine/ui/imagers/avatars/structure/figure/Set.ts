import {Gender, IPart, ISet} from '../../gamedata/IFigureData';

export class PartSet {
    gender: Gender;
    club: number;
    colorable: boolean;
    selectable: boolean;
    preselectable: boolean;
    sellable: boolean;
    legacy: boolean;

    hidden?: string[];
    parts: IPart[] | undefined;

    constructor(setData: ISet) {
        // FigureData.json has the flags as strings ("0"/"1"): "0" is not false in JavaScript
        this.gender = setData.gender;
        this.club = Number(setData.club) || 0;
        this.colorable = PartSet.flag(setData.colorable);
        this.selectable = PartSet.flag(setData.selectable);
        this.preselectable = PartSet.flag(setData.preselectable);
        this.sellable = PartSet.flag(setData.sellable);
        this.legacy = PartSet.flag(setData.legacy);

        this.parts = [];

        this.loadParts(setData.parts);

        // e.g. a hat that covers the hair: FigureData.json calls them hiddenLayers
        const hidden = setData.hidden ?? setData.hiddenLayers;
        if (hidden) this.loadHiddenParts(hidden);
    }

    loadParts(parts: IPart[]): void {
        if (parts) {
            for (const part of parts) {
                this.parts?.push(part);
            }
        }
    }

    loadHiddenParts(hiddens: string[]) {
        this.hidden = [...(hiddens ?? [])];
    }

    /** A flag of FigureData: true, 1 or "1". */
    private static flag(value: unknown): boolean {
        return value === true || value === 1 || value === '1';
    }
}
