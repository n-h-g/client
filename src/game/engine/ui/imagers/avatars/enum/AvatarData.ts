import {Direction} from '../../../../../core/objects/Direction';
import {ActionId} from './actions/ActionId';

export class AvatarData {
    // dimensions
    static AVATAR_LEFT_OFFSET = -22;
    static AVATAR_TOP_OFFSET = 106;
    static AVATAR_SIT_OFFSET = 18;
    static AVATAR_GENERIC_WIDTH = 125;
    static AVATAR_GENERIC_HEIGHT = 210;

    // offsets
    static AVATAR_CONTAINER_OFFSET_LEFT = -4;
    static AVATAR_CONTAINER_OFFSET_TOP = -20;

    static SHADOW_OFFSET_X = -8;

    // frame
    static AVATAR_FRAME_SPEED = 100;
    static AVATAR_WALK_SPEED = 2.1;

    //misc
    static DEFAULT_ACTION: string = ActionId.STAND;
    static DEFAULT_DIRECTION: number = Direction.SOUTH;

    // angles
    static AVATAR_ANGLES: number[] = [
        45, 90, 135, 180, 225, 270, 315, 0,
    ];

    static FLIPPED_DIRECTIONS: boolean[] = [
        false,
        false,
        false,
        false,
        true,
        true,
        true,
        false,
    ];
}
