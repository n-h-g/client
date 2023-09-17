import {Point} from '../../utils/point/Point';
import {RoomLayout} from './RoomLayout';
import {RoomInfo} from './RoomInfo';
import {RoomEntityRepository} from './RoomEntityRepository';
import {Disposable} from '../../core/room/Disposable';

export class Room implements Disposable {
    readonly id: number;
    readonly name: string;
    readonly roomInfo: RoomInfo;
    readonly roomLayout: RoomLayout;
    readonly roomEntityRepository: RoomEntityRepository;

    constructor(
        roomName: string,
        roomModel: string,
        doorPosition: Point,
        roomId: number,
        authorName: string
    ) {
        this.id = roomId;
        this.name = roomName;
        this.roomEntityRepository = new RoomEntityRepository();
        this.roomInfo = new RoomInfo(roomName, roomModel, authorName);
        this.roomLayout = new RoomLayout(this, roomModel, doorPosition);
    }

    dispose(): void {
        this.roomLayout.visualization.dispose();
        this.roomLayout.logic.dispose();
    }
}
