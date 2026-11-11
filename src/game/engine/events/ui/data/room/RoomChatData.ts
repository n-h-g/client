import {Entity} from '../../../../../core/room/object/entities/Entity';

export type RoomChatData = {
    id?: number;
    text?: string;
    author?: Entity;
    x?: number;
    width?: number;
    height?: number;
    y: number;
    shout?: boolean;
    whisper?: boolean;
    /** The username a whisper is for. */
    whisperTo?: string;
    /** A notice of the game (e.g. a pet was scratched): only the text, without the name of who says it. */
    info?: boolean;
    /** The style of the bubble (chatBubbles.scss), 0 the normal one. */
    style?: number;
};
