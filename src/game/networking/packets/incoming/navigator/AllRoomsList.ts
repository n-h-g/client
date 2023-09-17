import {NavigatorRoom} from '../../../../core/communication/incoming/navigator/NavigatorRoom';
import {NavigatorRoomType} from '../../../../core/communication/incoming/navigator/NavigatorRoomType';
import {EventManager} from '../../../../core/events/EventManager';
import {NavigatorRoomsEventData} from '../../../../engine/events/ui/data/navigator/NavigatorRooms';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

export default class AllRoomsList extends MessageHandler {
    public handle() {
        const rooms = this.message.data as NavigatorRoom[];

        EventManager.emit<NavigatorRoomsEventData>(
            UIEvents.NAVIGATOR_ROOMS_ADDED,
            {
                tab: NavigatorRoomType.ALL,
                rooms: rooms,
            }
        );
    }
}
