export default class RoomInfo {
    
    public roomName: string;
    public description: string | null
    public maxUsers: number | null
    public canWalkThrough: boolean | null
    public roomModel: string;

    constructor(roomName: string, roomModel: string, description: string | null = null, 
        maxUsers: number | null = null, canWalkThrough: boolean | null = null) {

        this.roomName = roomName;
        this.roomModel = roomModel
        this.description = description
        this.maxUsers = maxUsers
        this.canWalkThrough = canWalkThrough
    }
}