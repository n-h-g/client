export default class RoomInfo {
    public roomName: string;
    public description: string | null
    public maxUsers: number | null
    public canWalkThrough: boolean | null
    public roomModel: string;
    public authorName: string

    constructor(roomName: string, roomModel: string, description: string = null,
        maxUsers: number = null, canWalkThrough: boolean = null) {

        this.roomName = roomName;
        this.roomModel = roomModel
        this.description = description
        this.maxUsers = maxUsers
        this.canWalkThrough = canWalkThrough
    }
}