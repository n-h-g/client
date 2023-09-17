import {RoomData} from '../../../../core/communication/incoming/rooms/RoomData';
import {Engine} from '../../../../Engine';
import {Point} from '../../../../utils/point/Point';
import {MessageHandler} from '../../../handler/MessageHandler';

export class UpdateRoomData extends MessageHandler {
    handle(): void {
        const room: RoomData = this.message;

        if (room.id == -1) {
            Engine.getInstance()?.roomService?.dispose();
            return;
        }

        if (
            Engine.getInstance()?.roomService?.CurrentRoom?.getRoomId() !=
            room.id
        )
            Engine.getInstance()?.roomService.dispose();
        else return;

        Engine.getInstance()?.roomService?.setRoom(
            room.name,
            room.layout,
            new Point(room.door_x, room.door_y),
            room.id,
            room.owner_name
        );
    }
}
