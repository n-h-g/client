import Room from "./Room";
import Point from "../../utils/point/Point";
import { Engine } from "../../Engine";
import { EventManager } from "../ui/events/EventManager";
import { UIEvents } from "../ui/events/UIEvents";
import { HotelViewData } from "../ui/events/data/static/HotelView";
import { RoomUIEventData } from "../ui/events/data/room/RoomUIEventData";
import { UIComponent } from "../ui/components/UIComponent";
import { IComponentShowableUI } from "../../core/ui/IComponentShowableUI";

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
        Engine.getInstance().userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(UIComponent.RoomUI).toggle()

        EventManager.emit<HotelViewData>(UIEvents.HOTEL_VIEW, {
            mode: false
        })

        EventManager.emit<RoomUIEventData>(UIEvents.ROOM_UI, {
            enabled: true
        })
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