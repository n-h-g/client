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
        this.gender = setData.gender;
        this.club = setData.club;
        this.colorable = setData.colorable;
        this.selectable = setData.selectable;
        this.preselectable = setData.preselectable;
        this.sellable = setData.sellable;
        this.legacy = setData.legacy;

        this.parts = [];

        this.loadParts(setData.parts);

        if (setData.hidden) this.loadHiddenParts(setData.hidden);
    }

    loadParts(parts: IPart[]): void {
        if (parts) {
            for (const part of parts) {
                this.parts?.push(part);
            }
        }
    }

    loadHiddenParts(hiddens: string[]) {
        if (hiddens && hiddens.length > 0) {
            for (const hidden of hiddens) {
                hiddens.push(hidden);
            }
        }
    }
}
