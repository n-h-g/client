import Point from '../../utils/point/Point'
import RoomLayout from "./RoomLayout"
import RoomInfo from "./RoomInfo"
import IRoomEntityRepository from '../../core/room/IRoomEntityRepository';
import IRoomItemRepository from '../../core/room/IRoomItemRepository';
import IRoomUserRepository from '../../core/room/IRoomUserRepository';
import RoomEntityRepository from './RoomEntityRepository';
import RoomUserRepository from './RoomUserRepository';
import RoomItemRepository from './RoomItemRepository';

export default class Room  {

    private roomLayout: RoomLayout;
    private roomInfo: RoomInfo;
    private roomName: string;
    private roomId: number;

    private _roomItemRepository: IRoomItemRepository
    private _roomUserRepository: IRoomUserRepository
    private _roomEntityRepository: IRoomEntityRepository



    constructor(roomName: string, roomModel: string, doorPosition: Point, roomId: number) {
        this.roomName = roomName;
        this.roomId = roomId;
        this.roomLayout = new RoomLayout(this, roomModel, doorPosition);
        this.roomInfo = new RoomInfo(roomName);

        this._roomUserRepository = new RoomUserRepository();
        this._roomEntityRepository = new RoomEntityRepository();
        this._roomItemRepository = new RoomItemRepository();

    }
    

    public getRoomLayout(): RoomLayout {
        return this.roomLayout;
    }
    public getRoomInfo(): RoomInfo {
        return this.roomInfo;
    }
    public getRoomId(): number {
        return this.roomId;
    }

    public get roomUserRepository(): IRoomUserRepository {
        return this._roomUserRepository
    }

    public get roomEntityRepository(): IRoomEntityRepository {
        return this._roomEntityRepository
    }

    public get roomItemRepository(): IRoomItemRepository {
        return this._roomItemRepository
    }

    public get Name(): string {
        return this.roomName;
    }
    public get Id(): number {
        return this.roomId;
    }
}