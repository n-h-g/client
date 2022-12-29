import { CA, IPart, ISet } from "../../gamedata/IFigureData";
import PartSet from "./Set";

export default class SetType {

    public paletteid: number;
    public partSets: Map<string, PartSet>

    public isMandatoryM: boolean[] = [];
    public isMandatoryF: boolean[] = [];

    public constructor(setTypeData: CA) {
        this.paletteid = setTypeData.paletteid;
        this.partSets = new Map();

        this.isMandatoryM = [setTypeData.mand_m_0, setTypeData.mand_m_1]
        this.isMandatoryM = [setTypeData.mand_f_0, setTypeData.mand_f_1]

        this.loadSets(setTypeData.set);
    }

    public loadSets(sets: {[key: string]: ISet }): void {
        if(sets) {
            for(let set of Object.keys(sets)) {
                this.partSets.set(set, new PartSet(sets[set] as ISet))
            }
        }
    }

    public get PaletteId(): number {
        return this.paletteid;
    }
}