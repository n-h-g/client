import {BodyPart} from '../gamedata/IAvatarAnimations';
import {
    IAvatarSetAvatarSet,
    IAvatarSetBodyPart,
} from '../gamedata/IAvatarGeometry';
import GeometryBodyPart from './GeometryBodyPart';

export default class AvatarSet {
    public id: string;
    private avatarSets: Map<string, AvatarSet>;
    private bodyParts: string[];
    public main: boolean | undefined = false;
    public avatarSet: IAvatarSetAvatarSet;

    public constructor(avatarSetBody: IAvatarSetAvatarSet) {
        this.avatarSet = avatarSetBody;
        this.id = avatarSetBody.id;
        this.main = avatarSetBody.main;
        this.avatarSets = new Map();
        this.bodyParts = [];

        this.loadBodyParts();
    }

    public getBodyParts(): string[] {
        return this.bodyParts.concat();
    }

    public findAvatarSetById(id: string): AvatarSet | null {
        return null;
    }

    public loadBodyParts(): void {
        if (this.avatarSet.bodyParts && this.avatarSet.bodyParts.length > 0) {
            for (const bodyPart of this.avatarSet.bodyParts) {
                this.bodyParts.push(bodyPart.id);
            }
        }
    }
}
