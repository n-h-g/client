import {RoomData} from '../../../../core/communication/incoming/rooms/RoomData';
import {Engine} from '../../../../Engine';
import {Point} from '../../../../utils/point/Point';
import {MessageHandler} from '../../../handler/MessageHandler';

export class UpdateRoomData extends MessageHandler {
    handle(): void {
        const room: RoomData = this.message;

        // no room (e.g. the user walked to the door): the hotel view
        if (room.id == -1) {
            Engine.getInstance()?.roomService?.leaveRoom();
            return;
        }

        if (
            Engine.getInstance()?.roomService?.currentRoom?.id !=
            room.id
        )
            Engine.getInstance()?.roomService.dispose();
        else return;

        const newRoom = Engine.getInstance()?.roomService?.setRoom(
            room.name,
            room.layout,
            new Point(room.door_x, room.door_y),
            room.id,
            room.owner_name
        );

        // the room is drawn with the default look, then again with its wallpaper and floor
        newRoom?.roomLayout.setDecorations({
            wallpaper: room.wallpaper ?? null,
            floor: room.floor ?? null,
            landscape: room.landscape ?? null,
        });
    }
}
