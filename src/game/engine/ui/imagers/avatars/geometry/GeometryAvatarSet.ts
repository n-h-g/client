import {
    IAvatarSetAvatarSet,
    IGeometryAvatarSet,
} from '../gamedata/IAvatarGeometry';
import AvatarSet from './AvatarSet';

export default class GeometryAvatarSet {
    public id: string;
    private avatarSet: IGeometryAvatarSet;

    private avatarSets: Map<string, AvatarSet>;

    public constructor(avatarSet: IGeometryAvatarSet) {
        this.avatarSet = avatarSet;
        this.avatarSets = new Map();
        this.id = avatarSet.id;
        this.loadSets();
    }

    private loadSets(): void {
        if (this.avatarSet && this.avatarSet.avatarSets.length > 0) {
            for (const avatarSetData of this.avatarSet.avatarSets) {
                avatarSetData as IAvatarSetAvatarSet;
                const set = new AvatarSet(avatarSetData);
                this.avatarSets.set(set.id, set);
            }
        }
    }
}
