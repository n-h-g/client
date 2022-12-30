import { Gender, IPart, ISet } from "../../gamedata/IFigureData";

export default class PartSet {
    public gender: Gender;
    public club: number;
    public colorable: boolean;
    public selectable: boolean;
    public preselectable: boolean;
    public sellable: boolean;
    public legacy: boolean;
    
    public hidden?: string[];
    public parts: IPart[] | undefined;

    public constructor(setData: ISet) {
        this.gender = setData.gender;
        this.club = setData.club;
        this.colorable = setData.colorable;
        this.selectable = setData.selectable;
        this.preselectable = setData.preselectable;
        this.sellable = setData.sellable;
        this.legacy = setData.legacy;

        this.parts = []

        this.loadParts(setData.parts);
        
        if(setData.hidden)
            this.loadHiddenParts(setData.hidden);
    }

    public loadParts(parts: IPart[]): void {
        if(parts) {
            for(let part of parts) {
                this.parts?.push(part);
            }
        }
    }

    public loadHiddenParts(hiddens: string[]) {
        if(hiddens && hiddens.length > 0) {
            for(let hidden of hiddens) {
                hiddens.push(hidden)
            }
        }
    }
}