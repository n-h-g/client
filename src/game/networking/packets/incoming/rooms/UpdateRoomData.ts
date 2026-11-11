import {RoomData} from '../../../../core/communication/incoming/rooms/RoomData';
import {Engine} from '../../../../Engine';
import {Point} from '../../../../utils/point/Point';
import type {RoomInfo} from '../../../../engine/room/RoomInfo';
import type {RoomLayout} from '../../../../engine/room/RoomLayout';
import {MessageHandler} from '../../../handler/MessageHandler';
import {EventManager} from '../../../../core/events/EventManager';
import {DialogEventData} from '../../../../engine/events/ui/data/general/Dialog';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {UIEventsType} from '../../../../engine/events/ui/UIEventsType';

export class UpdateRoomData extends MessageHandler {
    private static applyAppearance(info: RoomInfo, layout: RoomLayout): void {
        layout.setAppearance(info.hideWalls, info.wallThickness, info.floorThickness);
    }

    handle(): void {
        const room: RoomData = this.message;

        // no room (e.g. the user walked to the door): the hotel view
        if (room.id == -1) {
            Engine.getInstance()?.roomService?.leaveRoom();
            return;
        }

        // the same room again: its settings were saved (name, description...), the room stays
        const currentRoom = Engine.getInstance()?.roomService?.currentRoom;
        if (currentRoom?.id == room.id) {
            currentRoom.roomInfo.update(room);
            UpdateRoomData.applyAppearance(currentRoom.roomInfo, currentRoom.roomLayout);
            Engine.getInstance()?.roomService?.emitRoomInfo();
            return;
        }

        Engine.getInstance()?.roomService.dispose();

        const newRoom = Engine.getInstance()?.roomService?.setRoom(
            room.name,
            room.layout,
            new Point(room.door_x, room.door_y),
            room.id,
            room.owner_name
        );

        newRoom?.roomInfo.update(room);
        if (newRoom) UpdateRoomData.applyAppearance(newRoom.roomInfo, newRoom.roomLayout);
        Engine.getInstance()?.roomService?.emitRoomInfo();

        // the room is drawn with the default look, then again with its wallpaper and floor
        newRoom?.roomLayout.setDecorations({
            wallpaper: room.wallpaper ?? null,
            floor: room.floor ?? null,
            landscape: room.landscape ?? null,
       });

        EventManager.emit<DialogEventData>(UIEvents.CLOSE, {type: UIEventsType.NAVIGATOR});
    }
}
