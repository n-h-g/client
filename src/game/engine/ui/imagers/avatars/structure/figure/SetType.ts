import {CA, ISet} from '../../gamedata/IFigureData';
import {PartSet} from './Set';

export class SetType {
    paletteid: number;
    partSets: Map<string, PartSet>;

    isMandatoryM: boolean[] = [];
    isMandatoryF: boolean[] = [];

    constructor(setTypeData: CA) {
        this.paletteid = setTypeData.paletteid;
        this.partSets = new Map();

        this.isMandatoryM = [setTypeData.mand_m_0, setTypeData.mand_m_1];
        this.isMandatoryM = [setTypeData.mand_f_0, setTypeData.mand_f_1];

        this.loadSets(setTypeData.set);
    }

    loadSets(sets: {[key: string]: ISet}): void {
        if (sets) {
            for (const set of Object.keys(sets)) {
                this.partSets.set(set, new PartSet(sets[set] as ISet));
            }
        }
    }

    get PaletteId(): number {
        return this.paletteid;
    }
}
