import Room from "./Room";
import Point from "../../utils/point/Point";
import { Engine } from "../../Engine";
import { EventManager } from "../../core/events/EventManager";
import { HotelViewData } from "../events/ui/data/static/HotelView";
import { RoomUIEventData } from "../events/ui/data/room/RoomUIEventData";
import { UIComponent } from "../ui/components/UIComponent";
import { IComponentShowableUI } from "../../core/ui/IComponentShowableUI";
import { UIEvents } from "../events/ui/UIEvents";

export default class RoomService {
    private currentRoom: Room

    public setRoom(roomName: string, roomModel: string, doorPosition: Point, roomId: number) : Room {
        this.currentRoom = new Room(roomName, roomModel, doorPosition, roomId);
        this.currentRoom.roomLayout.Visualization.render();
        this.currentRoom.roomLayout.Logic.registerEvents();
        this.toggleUI();
        return this.currentRoom;
    }

    public toggleUI() {
        Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.RoomUI).toggle()

        EventManager.emit<HotelViewData>(UIEvents.HOTEL_VIEW, {
            mode: false
        })

        EventManager.emit<RoomUIEventData>(UIEvents.ROOM_UI, {
            enabled: true
        })
    }

    public unsetRoom() : void {
        this.currentRoom.roomLayout.Visualization.container.destroy();
        this.currentRoom = null
        this.toggleUI()
    }

    public dispose(): void {
        if (!this.currentRoom) {
            return;
        }
    }

    public tick(delta: number): void {
        this.currentRoom?.roomLayout.Logic.tick(delta)
        this.currentRoom?.roomItemRepository.tick(delta);
        this.currentRoom?.roomEntityRepository.tick(delta);
    }

    public get CurrentRoom(): Room {
        return this.currentRoom;
    }
}