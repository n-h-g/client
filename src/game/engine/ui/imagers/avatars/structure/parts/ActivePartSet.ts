import {IActivePart, IActivePartSets} from '../../gamedata/IAvatarPartSetsData';

export default class ActivePartSet {
    public id: string;

    /**
     * array of settypes
     */
    public parts: string[];

    public constructor(activePartSetData: IActivePartSets) {
        this.id = activePartSetData.id;

        this.parts = [];

        this.loadParts(activePartSetData.activeParts);
    }

    public loadParts(activePartSetData: IActivePart[]): void {
        if (activePartSetData && activePartSetData.length > 0) {
            for (const part of activePartSetData) {
                this.parts.push(part.setType);
            }
        }
    }
}
