import {IPartSet} from '../../gamedata/IAvatarPartSetsData';

export default class Part {
    public setType: string;
    public flippedSetType: string;
    public removeSetType: string;
    public swim: string;

    public constructor(partData: IPartSet) {
        this.setType = partData.setType;
        this.flippedSetType = partData.flippedSetType;
        this.removeSetType = partData.removeSetType;
        this.swim = partData.swim;
    }

    public getFlippedSetType(): string {
        return this.flippedSetType;
    }
}
