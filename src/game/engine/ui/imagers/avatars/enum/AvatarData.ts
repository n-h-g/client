import { Direction } from "../../../../../core/objects/Direction";

export default class AvatarData {
    // dimensions
    public static AVATAR_LEFT_OFFSET = -25;
    public static AVATAR_TOP_OFFSET = 32;
    public static AVATAR_SIT_OFFSET = 18;
    public static AVATAR_GENERIC_WIDTH = 125;
    public static AVATAR_GENERIC_HEIGHT = 210;

    // offsets
    public static AVATAR_LEFT_TYPING_OFFSET = 10; // the x distance between avatar and chat
    public static AVATAR_TOP_TYPING_OFFSET = 0; // the y distance between avatar and chat

    // frame
    public static AVATAR_FRAME_SPEED = 100;
    public static AVATAR_WALK_SPEED = 2.1

    //misc
    public static DEFAULT_ACTION: string = "Default";
    public static DEFAULT_DIRECTION: number = Direction.SOUTH;

    // angles
    public static AVATAR_ANGLES: number[] = [45, 90, 135, 180, 225, 270, 315, 0]
    
    public static FLIPPED_DIRECTIONS: boolean[] = [false, false, false, false, true, true, true, false];
}