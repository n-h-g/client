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
    /** The style of the bubble (chatBubbles.scss), 0 the normal one. */
    style?: number;
};
