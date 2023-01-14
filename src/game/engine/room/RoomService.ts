import Room from "./Room";
import Point from "../../utils/point/Point";
import { Engine } from "../../Engine";
import { EventManager } from "../../core/events/EventManager";
import { HotelViewData } from "../events/ui/data/static/HotelView";
import { RoomUIEventData } from "../events/ui/data/room/RoomUIEventData";
import { UIComponent } from "../ui/components/UIComponent";
import { IComponentShowableUI } from "../../core/ui/IComponentShowableUI";
import { UIEvents } from "../events/ui/UIEvents";
import { Service } from "../../core/Service";
import { IDisposable } from "../../core/room/IDisposable";
import { EntityBuilder } from "../../core/room/object/entities/EntityBuilder";

export default class RoomService extends Service<null, null> implements IDisposable{
    
    private _currentRoom: Room

    public constructor() {
        super()
    }

    public setRoom(roomName: string, roomModel: string, doorPosition: Point, roomId: number) : Room {
        this._currentRoom = new Room(roomName, roomModel, doorPosition, roomId);
        this._currentRoom.roomLayout.Visualization.render();
        this._currentRoom.roomLayout.Logic.registerEvents();
        Engine.getInstance()?.application?.viewport.addChild(this._currentRoom.roomLayout.Visualization.container)
        this.toggleUI();
        return this._currentRoom;
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


    public dispose(): void {
        if (!this._currentRoom) {
            return;
        }

        this._currentRoom.roomLayout.Visualization.dispose()
        this._currentRoom = null
        this.toggleUI()
    }

    public tick(delta: number): void {
        this._currentRoom?.roomLayout.Logic.tick(delta)
        this._currentRoom?.roomItemRepository.tick(delta);
        this._currentRoom?.roomEntityRepository.tick(delta);
    }

    public get CurrentRoom(): Room {
        return this._currentRoom;
    }
}