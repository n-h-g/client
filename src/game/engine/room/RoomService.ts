import {Room} from './Room';
import {Point} from '../../utils/point/Point';
import {Engine} from '../../Engine';
import {EventManager} from '../../core/events/EventManager';
import {HotelViewData} from '../events/ui/data/static/HotelView';
import {RoomUIEventData} from '../events/ui/data/room/RoomUIEventData';
import {UIComponent} from '../ui/components/UIComponent';
import {IComponentShowableUI} from '../../core/ui/IComponentShowableUI';
import {UIEvents} from '../events/ui/UIEvents';
import {Service} from '../../core/Service';
import {Disposable} from '../../core/room/Disposable';
import {EnterRoomUIEventData} from '../events/ui/data/room/EnterRoomUIEventData';

export class RoomService
    extends Service<null, null>
    implements Disposable
{
    private _currentRoom: Room;

    constructor() {
        super();
    }

    setRoom(
        roomName: string,
        roomModel: string,
        doorPosition: Point,
        roomId: number,
        authorName: string
    ): Room {
        Engine.getInstance()?.application.setUpViewport();
        this._currentRoom = new Room(
            roomName,
            roomModel,
            doorPosition,
            roomId,
            authorName
        );
        this._currentRoom.roomLayout.visualization.render();
        this._currentRoom.roomLayout.logic.registerEvents();
        Engine.getInstance()?.application?.viewport.addChild(
            this._currentRoom.roomLayout.visualization.container
        );
        this.toggleUI();
        return this._currentRoom;
    }

    /**
     * Generate a square room n * n.
     * @param size the number of tiles you want to generate (n * n)
     * @returns
     */
    generateSquareRoomModel(size: number) {
        let count = 1;

        let model = '';

        const area = size * size;

        while (count <= area) {
            if (count % size == 0 && count != area) {
                model += '1/';
            } else {
                model += '1';
            }

            count++;
        }

        return model;
    }

    toggleUI() {
        if (Engine.getInstance().config.offlineMode) return;

        Engine.getInstance()
            .userInterfaceManager.componentsManager.getComponent<IComponentShowableUI>(
                UIComponent.RoomUI
            )
            .toggle();

        EventManager.emit<HotelViewData>(UIEvents.HOTEL_VIEW, {
            mode: false,
        });
        EventManager.emit<RoomUIEventData>(UIEvents.ROOM_UI, {
            enabled: true,
        });
        EventManager.emit<EnterRoomUIEventData>(UIEvents.ENTER_ROOM_INFO, {
            name: this.CurrentRoom.roomInfo.roomName,
            description: this.CurrentRoom.roomInfo.description,
            owner: this.CurrentRoom.roomInfo.authorName ?? '',
            haveRights: true,
        });
    }

    dispose(): void {
        if (!this._currentRoom) {
            return;
        }

        this.toggleUI();

        this._currentRoom.roomLayout.visualization.dispose();
        this._currentRoom = null;
    }

    tick(delta: number): void {
        this._currentRoom?.roomLayout.logic.tick(delta);
        this._currentRoom?.roomEntityRepository.tick(delta);
    }

    get CurrentRoom(): Room {
        return this._currentRoom;
    }
}
