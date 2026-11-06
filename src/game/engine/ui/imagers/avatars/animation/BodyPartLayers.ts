import {ActionId} from '../enum/actions/ActionId';

/**
 * A body part layer of an avatar animation frame (Nitro's AvatarAnimationLayerData of type "bodypart"):
 * the dances and the effects move a group of parts (head, torso, arms...) with their own action, frame and offset.
 */
export interface BodyPartLayer {
    id: string;
    frame: number;
    dx: number;
    dy: number;
    dd: number;
    /** The action drawn by the parts (e.g. "Move"): none keeps the action of the avatar. */
    action?: string;
}

/**
 * The figure part types of each body part of HabboAvatarGeometry.json: a layer targets a geometry body part,
 * so every clothing/accessory part in it must get the same action and frame.
 */
const BODY_PART_GROUPS: Record<string, string[]> = {
    head: ['hd', 'fc', 'ey', 'hr', 'hrb', 'fa', 'ea', 'ha', 'he'],
    torso: ['bd', 'bds', 'ch', 'sh', 'lg', 'ss', 'cp', 'wa', 'cc', 'ca'],
    leftarm: ['lh', 'lhs', 'ls', 'lc'],
    rightarm: ['rh', 'rhs', 'rs', 'rc'],
    leftitem: ['li'],
    rightitem: ['ri'],
};

/** The actions named by the animation layers. */
const LAYER_ACTIONS: Record<string, ActionId> = {
    Default: ActionId.STAND,
    Move: ActionId.WALK,
    Wave: ActionId.WAVE,
    Sign: ActionId.SIGN,
    Respect: ActionId.RESPECT,
    CarryItem: ActionId.CARRY_ITEM,
    UseItem: ActionId.USE_ITEM,
    Talk: ActionId.TALK,
    Sit: ActionId.SIT,
    Lay: ActionId.LAY,
};

export class BodyPartLayers {
    /**
     * The layer of the frame that moves the figure part type (e.g. "ch" is moved by the "torso" layer).
     */
    static find(layers: BodyPartLayer[] | undefined, partType: string): BodyPartLayer | null {
        const layer = layers?.find(part => BODY_PART_GROUPS[part.id]?.includes(partType));
        if (!layer) return null;

        // The room renderer draws each atlas part independently, unlike Nitro's bodypart hierarchy.
        // Carry the torso's vertical translation into the head so a bouncing torso (e.g. Dance 4)
        // does not leave the neck behind.
        if (layer.id === 'head') {
            const torso = layers!.find(part => part.id === 'torso');
            if (torso) return {...layer, dy: layer.dy + torso.dy};
        }

        return layer;
    }

    /** The action of a layer ("Move", "CarryItem"...), undefined if the client doesn't know it. */
    static actionOf(layer: BodyPartLayer): ActionId | undefined {
        return BodyPartLayers.actionByName(layer.action);
    }

    static actionByName(name?: string): ActionId | undefined {
        return name ? LAYER_ACTIONS[name] : undefined;
    }
}
