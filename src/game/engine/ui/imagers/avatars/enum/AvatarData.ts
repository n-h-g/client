import {Direction} from '../../../../../core/objects/Direction';
import {ActionId} from './actions/ActionId';

export class AvatarData {
    // dimensions
    static AVATAR_LEFT_OFFSET = -22;
    // with the +2 of HumanVisualization and the pivot (110) the avatar is anchored at the center of its tile,
    // the same point of the furni (as in Nitro/Habbo)
    static AVATAR_TOP_OFFSET = 108;
    /**
     * Sitting avatars are drawn lower than the Z of the seat (the sit sprites keep the standing canvas):
     * calibrated on wl_sofa (height 1.1) and chair_norja (height 1.0).
     */
    // 42 with the previous anchor (2px higher): same position (Nitro uses scale / 2 = 32)
    static AVATAR_SIT_OFFSET = 13.5;

    /**
     * Laying avatars use the "horizontal" canvas (HabboAvatarGeometry.json: 128 x 80, dx 30): as in Nitro
     * (AvatarImage + AvatarVisualization) their parts are shifted by dx compared to a standing avatar and drawn
     * half tile lower (postureOffset = scale / 2).
     * The flipped directions (4, 5, 6) are flipped by this client in another way (around a fixed axis):
     * their offset is calibrated with the client rendering on bed_budget (head on the pillow of the lane).
     */
    static AVATAR_LAY_OFFSET_X = 30;
    static AVATAR_LAY_OFFSET_Y = 16;
    static AVATAR_LAY_OFFSET_X_FLIPPED = -66;
    static AVATAR_LAY_OFFSET_Y_FLIPPED = 24;
    static AVATAR_GENERIC_WIDTH = 125;
    static AVATAR_GENERIC_HEIGHT = 210;

    // offsets
    static AVATAR_CONTAINER_OFFSET_LEFT = -4;
    static AVATAR_CONTAINER_OFFSET_TOP = -20;

    static SHADOW_OFFSET_X = -8;

    // frame
    static AVATAR_FRAME_SPEED = 100;
    static AVATAR_DANCE_FRAME_SPEED = 80;
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
