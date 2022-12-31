import RoomData from '../../../../core/communication/incoming/rooms/RoomData';
import { Engine } from '../../../../Engine';
import Point from '../../../../utils/point/Point';
import { MessageHandler } from '../../../handler/MessageHandler';
import { OutgoingPacket } from '../../outgoing/OutgoingPacket';

export class UpdateRoomData extends MessageHandler {
    public handle(): void {
        let room: RoomData = this.message

        if (room.id == -1) {
            Engine.getInstance()?.roomService?.unsetRoom();
            return;
        }

        if (room.users_count == 0) {
            Engine.getInstance()?.networkingManager?.packetManager.applyOut(OutgoingPacket.UserEnterRoom, {
                id: room.id
            })
        }

        if (Engine.getInstance()?.roomService?.CurrentRoom != null) {
            if (Engine.getInstance()?.roomService?.CurrentRoom?.getRoomId() != room.id) {
                Engine.getInstance()?.roomService?.unsetRoom();
            } else {
                //Engine.getInstance()?.roomService?.CurrentRoom.getRoomInfo().roomName = room.name;
                return;
            }
        }

        Engine.getInstance()?.roomService?.setRoom(
            room.name,
            room.layout,
            new Point(room.door_x, room.door_y),
            room.id
        );
    }

}