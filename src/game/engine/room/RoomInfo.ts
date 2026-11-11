import {RoomData} from '../../core/communication/incoming/rooms/RoomData';

/** Who can enter the room (as the server's Room.doorMode). */
export enum RoomDoorMode {
    OPEN = 0,
    DOORBELL = 1,
}

export class RoomInfo {
    roomName: string;
    description: string;
    maxUsers: number;
    canWalkThrough: boolean;
    roomModel: string;
    authorName: string;
    ownerId: number | null = null;
    doorMode: RoomDoorMode = RoomDoorMode.OPEN;

    constructor(
        roomName: string,
        roomModel: string,
        authorName: string,
        description: string = null,
        maxUsers: number = null,
        canWalkThrough: boolean = null
    ) {
        this.roomName = roomName;
        this.roomModel = roomModel;
        this.description = description;
        this.maxUsers = maxUsers;
        this.canWalkThrough = canWalkThrough;
        this.authorName = authorName;
    }

    /** The settings of the room as the server sends them (on enter and when they are saved). */
    update(data: RoomData): void {
        this.roomName = data.name ?? this.roomName;
        this.description = data.description ?? this.description ?? '';
        this.maxUsers = data.max_users ?? this.maxUsers;
        this.doorMode = data.door_mode ?? this.doorMode;
        this.authorName = data.owner_name ?? this.authorName;
        this.ownerId = data.owner_id ?? this.ownerId;
    }
}
