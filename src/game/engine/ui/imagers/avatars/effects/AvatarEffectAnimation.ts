import {BodyPartLayer, BodyPartLayers} from '../animation/BodyPartLayers';
import {
    IEffectAddData,
    IEffectAnimationData,
    IEffectFramePart,
    IEffectSpriteData,
} from '../gamedata/IAvatarEffect';
import {AvatarEffectColor} from './AvatarEffectColor';

/** A layer of a frame: it moves a body part ("bodypart") or an effect sprite/add ("fx"). */
export interface AvatarEffectLayer extends BodyPartLayer {
    type: 'bodypart' | 'fx';
}

/** As Nitro's SpriteDataContainer: a sprite drawn with the avatar, with offsets by direction. */
export class AvatarEffectSprite {
    readonly id: string;
    readonly member: string;
    readonly ink: number;
    readonly hasDirections: boolean;
    readonly hasStaticY: boolean;
    private readonly dx: number[] = [];
    private readonly dy: number[] = [];
    private readonly dz: number[] = [];

    constructor(data: IEffectSpriteData) {
        this.id = data.id;
        this.member = data.member ?? '';
        this.ink = data.ink ?? 0;
        this.hasDirections = !!data.directions;
        this.hasStaticY = !!data.staticY;

        for (const direction of data.directionList ?? []) {
            if (direction.id === undefined) continue;

            this.dx[direction.id] = direction.dx ?? 0;
            this.dy[direction.id] = direction.dy ?? 0;
            this.dz[direction.id] = direction.dz ?? 0;
        }
    }

    /** The "avatar" sprite only moves the avatar (when sitting on a vehicle): it has no bitmap. */
    get isAvatar(): boolean {
        return this.id === 'avatar';
    }

    getDirectionOffsetX(direction: number): number {
        return this.dx[direction] ?? 0;
    }

    getDirectionOffsetY(direction: number): number {
        return this.dy[direction] ?? 0;
    }

    /** Over (> 0) or under (< 0) the avatar. */
    getDirectionOffsetZ(direction: number): number {
        return this.dz[direction] ?? 0;
    }
}

/** As Nitro's AddDataContainer: a part added to a body part ("align") of the avatar. */
export class AvatarEffectAdd {
    readonly id: string;
    /** The geometry body part it's drawn with: bottom, behind, top, rightitem, leftitem. */
    readonly align: string;
    readonly base: string;
    readonly ink: number;

    constructor(data: IEffectAddData) {
        this.id = data.id;
        this.align = data.align ?? '';
        this.base = data.base ?? '';
        this.ink = data.ink ?? 0;
    }
}

/**
 * The animation of an effect library (Nitro's Animation): its sprites, the parts added to the avatar,
 * the figure parts it removes, the avatar colors, the direction offset and the frames.
 */
export class AvatarEffectAnimation {
    readonly sprites: AvatarEffectSprite[];
    readonly adds: AvatarEffectAdd[];
    /** Figure part types not drawn (e.g. the shoes in a car). */
    readonly removes: string[];
    readonly color: AvatarEffectColor | null;
    /** The avatar is turned by this offset (e.g. sideways on the hoverboard). */
    readonly directionOffset: number;
    private readonly frames: AvatarEffectLayer[][] = [];

    constructor(data: IEffectAnimationData) {
        this.sprites = (data.sprites ?? []).map(sprite => new AvatarEffectSprite(sprite));
        this.adds = (data.adds ?? []).map(add => new AvatarEffectAdd(add));
        this.removes = (data.removes ?? []).map(remove => remove.id);
        this.color = data.avatars?.length ? new AvatarEffectColor(data.avatars[0]) : null;
        this.directionOffset = data.directions?.[0]?.offset ?? 0;

        for (const frame of data.frames ?? []) {
            const layers: AvatarEffectLayer[] = [
                ...(frame.bodyparts ?? []).map(part => AvatarEffectAnimation.layer(part, 'bodypart')),
                ...(frame.fxs ?? []).map(part => AvatarEffectAnimation.layer(part, 'fx')),
            ];

            const repeats = Math.max(1, frame.repeats ?? 1);
            for (let i = 0; i < repeats; i++) this.frames.push(layers);
        }
    }

    get frameCount(): number {
        return this.frames.length;
    }

    /** The layer of an effect sprite or add in the frame. */
    getFxLayer(frame: number, id: string): AvatarEffectLayer | null {
        return this.getFrame(frame).find(layer => layer.type === 'fx' && layer.id === id) ?? null;
    }

    /** The layer of a geometry body part in the frame (e.g. "rightitem"). */
    getBodyPartLayerById(frame: number, id: string): AvatarEffectLayer | null {
        return this.getFrame(frame).find(layer => layer.type === 'bodypart' && layer.id === id) ?? null;
    }

    /** The "avatar" sprite: it moves the whole avatar (e.g. up in the UFO). */
    get avatarSprite(): AvatarEffectSprite | null {
        return this.sprites.find(sprite => sprite.isAvatar) ?? null;
    }

    /** The layer that moves the figure part type in the frame (e.g. the torso for "ch"). */
    getBodyPartLayer(frame: number, partType: string): BodyPartLayer | null {
        const bodyParts = this.getFrame(frame).filter(layer => layer.type === 'bodypart');
        return BodyPartLayers.find(bodyParts, partType);
    }

    private getFrame(frame: number): AvatarEffectLayer[] {
        if (this.frames.length === 0) return [];

        return this.frames[Math.max(0, frame) % this.frames.length];
    }

    private static layer(part: IEffectFramePart, type: 'bodypart' | 'fx'): AvatarEffectLayer {
        return {
            id: part.id,
            type,
            frame: part.frame ?? 0,
            dx: part.dx ?? 0,
            dy: part.dy ?? 0,
            dd: part.dd ?? 0,
            action: part.action,
        };
    }
}
