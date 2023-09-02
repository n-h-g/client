import Point from '../../utils/point/Point'
import RoomLayout from './RoomLayout'
import RoomInfo from './RoomInfo'
import { RoomEntityRepository } from './RoomEntityRepository'
import { IDisposable } from '../../core/room/IDisposable'

export default class Room implements IDisposable {
    private _roomLayout: RoomLayout
    private roomInfo: RoomInfo
    private roomName: string
    private roomId: number
    private _roomEntityRepository: RoomEntityRepository

    constructor(roomName: string, roomModel: string, doorPosition: Point, roomId: number, authorName: string) {
        this.roomName = roomName
        this.roomId = roomId
        this._roomLayout = new RoomLayout(this, roomModel, doorPosition)
        this.roomInfo = new RoomInfo(roomName, roomModel, authorName)

        this._roomEntityRepository = new RoomEntityRepository()
    }

    public dispose(): void {
        this.roomLayout.Visualization.dispose()
        this.roomLayout.Logic.dispose()
    }
    
    public get roomLayout(): RoomLayout {
        return this._roomLayout
    }

    public getRoomInfo(): RoomInfo {
        return this.roomInfo
    }
    
    public getRoomId(): number {
        return this.roomId
    }

    public get roomEntityRepository(): RoomEntityRepository {
        return this._roomEntityRepository
    }

    public get name(): string {
        return this.roomName
    }

    public get id(): number {
        return this.roomId
    }
}