export class RoomInfo {
    roomName: string;
    description: string;
    maxUsers: number;
    canWalkThrough: boolean;
    roomModel: string;
    authorName: string;

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
}
