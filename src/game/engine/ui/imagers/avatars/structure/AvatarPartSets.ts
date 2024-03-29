import {Action} from '../actions/Action';
import {
	IAvatarPartSetsData,
    IActivePartSets,
    IPartSets,
} from '../gamedata/IAvatarPartSetsData';
import {ActivePartSet} from './parts/ActivePartSet';
import {Part} from './parts/Part';

export class AvatarPartSets {
    /**
     *  setType     |       Part
     */
    private parts: Map<string, Part>;
    private activeParts: Map<string, ActivePartSet>;

    constructor(partSetsData: IAvatarPartSetsData) {
        this.parts = new Map();
        this.activeParts = new Map();

        this.loadPartSets(partSetsData.partSets);
        this.loadActivePartSets(partSetsData.partSets.activePartSets);
    }

    getFlippedSetType(setType: string): string {
        const part = this.getPart(setType) as Part;

        return part.flippedSetType ? part.flippedSetType : part.setType;
    }

    getActiveParts(activePartId: string): string[] {
        const activePart = this.getActivePart(activePartId);

        if (!activePart) return [];

        return activePart.parts;
    }

    private loadPartSets(partSets: IPartSets): void {
        if (partSets.partSet && partSets.partSet.length > 0) {
            for (const part of partSets.partSet) {
                const newPart = new Part(part);
                this.parts.set(part.setType, newPart);
            }
        }
    }

    private loadActivePartSets(activePartSet: IActivePartSets[]) {
        if (activePartSet && activePartSet.length > 0) {
            for (const activePart of activePartSet) {
                const newActivePart = new ActivePartSet(activePart);

                this.activeParts.set(activePart.id, newActivePart);
            }
        }
    }

    getPart(type: string): Part | null {
        const part = this.parts.get(type) as Part;

        if (!part) return null;

        return part;
    }

    getActivePart(activePartId: string): ActivePartSet | null {
        const activePart: ActivePartSet = this.activeParts.get(
            activePartId
        ) as ActivePartSet;

        if (!activePart) return null;

        return activePart;
    }

    getActivePartForAction(action: Action): string[] {
        const parts: string[] = [];

        const activePart = this.getActivePart(action.activePartSet);

        if (!activePart) return [];

        return activePart.parts;
    }
}
