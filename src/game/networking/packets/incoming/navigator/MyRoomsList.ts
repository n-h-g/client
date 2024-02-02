import {NavigatorRoom} from '../../../../core/communication/incoming/navigator/NavigatorRoom';
import {NavigatorRoomType} from '../../../../core/communication/incoming/navigator/NavigatorRoomType';
import {EventManager} from '../../../../core/events/EventManager';
import {NavigatorRoomsEventData} from '../../../../engine/events/ui/data/navigator/NavigatorRooms';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

export class MyRoomsList extends MessageHandler {
    handle() {
        const rooms: NavigatorRoom[] = this.message.data;

        EventManager.emit<NavigatorRoomsEventData>(
            UIEvents.NAVIGATOR_ROOMS_ADDED,
            {
                tab: NavigatorRoomType.MY,
                rooms: rooms
            }
        );
    }
}
