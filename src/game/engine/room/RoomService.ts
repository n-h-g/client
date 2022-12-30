import IRoomService from "../../core/room/IRoomManager";
import Room from "./Room";
import Point from "../../utils/point/Point";
import RoomVisualization from "./visualization/RoomVisualization";

export default class RoomService   {
    private currentRoom: Room | null = null

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
        //this.roomUI.hide();
        (this.currentRoom?.getRoomLayout().Visualization as RoomVisualization).Container.destroy();
        this.currentRoom = null
        this.toggleUI()
    }

    public dispose(): void {
        if(!this.currentRoom) {
            return;
        }
    }

    public tick(delta: number) : void {
        this.currentRoom?.getRoomLayout().Logic.tick(delta)
    }

    public get CurrentRoom() : Room | null {
        return this.currentRoom;
    }
}