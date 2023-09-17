import {IPartSet} from '../../gamedata/IAvatarPartSetsData';

export class Part {
    setType: string;
    flippedSetType: string;
    removeSetType: string;
    swim: string;

    constructor(partData: IPartSet) {
        this.setType = partData.setType;
        this.flippedSetType = partData.flippedSetType;
        this.removeSetType = partData.removeSetType;
        this.swim = partData.swim;
    }

    getFlippedSetType(): string {
        return this.flippedSetType;
    }
}
