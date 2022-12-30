export default interface IAvatarPartSetsData {
    partSets: IPartSets;
}

export interface IPartSets {
    partSet: IPartSet[];
    activePartSets: IActivePartSets[];
}

export interface IPartSet {
    setType: string;
    flippedSetType: string;
    swim: string;
    removeSetType: string;
}

export interface IActivePartSets {
    id: string;
    activeParts: IActivePart[];
}

export interface IActivePart {
    setType: string;
}
