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
};
