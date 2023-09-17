import {NavigatorRoomType} from './NavigatorRoomType';

export interface NavigatorRoom {
    id: number;
    type: NavigatorRoomType;
    name: string;
    users_count: number;
}
