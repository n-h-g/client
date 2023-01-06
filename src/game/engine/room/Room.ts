import Point from '../../utils/point/Point'
import RoomLayout from "./RoomLayout"
import RoomInfo from "./RoomInfo"
import { RoomEntityRepository } from './RoomEntityRepository';
import { RoomItemRepository } from './RoomItemRepository';

export default class Room  {
    private _roomLayout: RoomLayout;
    private roomInfo: RoomInfo;
    private roomName: string;
    private roomId: number;
    private _roomItemRepository: RoomItemRepository
    private _roomEntityRepository: RoomEntityRepository

    constructor(roomName: string, roomModel: string, doorPosition: Point, roomId: number) {
        this.roomName = roomName;
        this.roomId = roomId;
        this._roomLayout = new RoomLayout(this, roomModel, doorPosition);
        this.roomInfo = new RoomInfo(roomName);

        this._roomEntityRepository = new RoomEntityRepository();
        this._roomItemRepository = new RoomItemRepository();
    }
    
    public get roomLayout(): RoomLayout {
        return this._roomLayout;
    }

    public getRoomInfo(): RoomInfo {
        return this.roomInfo;
    }
    public getRoomId(): number {
        return this.roomId;
    }

    public get roomEntityRepository(): RoomEntityRepository {
        return this._roomEntityRepository
    }

    public get roomItemRepository(): RoomItemRepository {
        return this._roomItemRepository
    }

    public get name(): string {
        return this.roomName;
    }

    public get id(): number {
        return this.roomId;
    }
}