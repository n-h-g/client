import Room from "./Room";
import Point from "../../utils/point/Point";

export default class RoomService {
    private currentRoom: Room

    public setRoom(roomName: string, roomModel: string, doorPosition: Point, roomId: number) : Room {
        this.currentRoom = new Room(roomName, roomModel, doorPosition, roomId);
        this.currentRoom.getRoomLayout().Visualization.render();
        this.currentRoom.getRoomLayout().Logic.registerEvents();
        this.toggleUI();
        return this.currentRoom;
    }

    public toggleUI() {
        
    }

    public unsetRoom() : void {
        this.currentRoom?.getRoomLayout().Visualization.container.destroy();
        this.currentRoom = null
        this.toggleUI()
    }

    public dispose(): void {
        if (!this.currentRoom) {
            return;
        }
    }

    public tick(delta: number): void {
        this.currentRoom?.getRoomLayout().Logic.tick(delta)
        this.CurrentRoom?.roomUserRepository.tick(delta)
        this.currentRoom?.roomItemRepository.tick(delta);
        this.currentRoom?.roomEntityRepository.tick(delta);
    }

    public get CurrentRoom(): Room {
        return this.currentRoom;
    }
}