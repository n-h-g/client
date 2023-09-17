import {IAvatarSetAvatarSet,} from '../gamedata/IAvatarGeometry'

export class AvatarSet {
    id: string;
    private avatarSets: Map<string, AvatarSet>;
    private bodyParts: string[];
    main: boolean | undefined = false;
    avatarSet: IAvatarSetAvatarSet;

    constructor(avatarSetBody: IAvatarSetAvatarSet) {
        this.avatarSet = avatarSetBody;
        this.id = avatarSetBody.id;
        this.main = avatarSetBody.main;
        this.avatarSets = new Map();
        this.bodyParts = [];

        this.loadBodyParts();
    }

    getBodyParts(): string[] {
        return this.bodyParts.concat();
    }

    findAvatarSetById(id: string): AvatarSet | null {
        return null;
    }

    loadBodyParts(): void {
        if (this.avatarSet.bodyParts && this.avatarSet.bodyParts.length > 0) {
            for (const bodyPart of this.avatarSet.bodyParts) {
                this.bodyParts.push(bodyPart.id);
            }
        }
    }
}
