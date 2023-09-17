import {IActivePart, IActivePartSets} from '../../gamedata/IAvatarPartSetsData';

export class ActivePartSet {
    id: string;

    /**
     * array of settypes
     */
    parts: string[];

    constructor(activePartSetData: IActivePartSets) {
        this.id = activePartSetData.id;

        this.parts = [];

        this.loadParts(activePartSetData.activeParts);
    }

    loadParts(activePartSetData: IActivePart[]): void {
        if (activePartSetData && activePartSetData.length > 0) {
            for (const part of activePartSetData) {
                this.parts.push(part.setType);
            }
        }
    }
}
