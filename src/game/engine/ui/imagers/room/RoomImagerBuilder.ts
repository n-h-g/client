import {RoomObjectController} from '../../../../core/room/object/RoomObjectController';
import {RoomObjectLogic} from '../../../../core/room/object/RoomObjectLogic';
import {RoomObjectVisualization} from '../../../../core/room/object/RoomObjectVisualization';
import {Room} from '../../../room/Room';

export class RoomImagerBuilder {
    private wrappedRoom: Room;
    private objects: RoomObjectController<
        RoomObjectVisualization,
        RoomObjectLogic
    >[];

    constructor() {
        this.objects = [];
    }

    setRoom(room: Room) {
        this.wrappedRoom = new Room(
            room.name,
            room.roomInfo.roomModel,
            room.roomLayout.getDoorPosition(),
            room.id,
            ''
        );
        return this;
    }

    setObject(
        object: RoomObjectController<RoomObjectVisualization, RoomObjectLogic>
    ) {
	    this.objects.push(object);
        return this;
    }

    build() {
		for (const object of this.objects) {
            object.visualization.render();
        }
		
        return this.wrappedRoom;
    }
}
