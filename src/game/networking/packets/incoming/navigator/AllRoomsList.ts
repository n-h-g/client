import { NavigatorRoomType } from '../../../../core/communication/incoming/navigator/NavigatorRoomType';
import { EventManager } from "../../../../core/events/EventManager";
import { NavigatorRoomsEventData } from "../../../../engine/events/ui/data/navigator/NavigatorRooms";
import { UIEvents } from '../../../../engine/events/ui/UIEvents';
import { MessageHandler } from "../../../handler/MessageHandler";


export default class AllRoomsList extends MessageHandler {

    public handle() {
        
        let rooms = this.message.data;

        EventManager.emit<NavigatorRoomsEventData>(UIEvents.NAVIGATOR_ROOMS_ADDED, {
            tab: NavigatorRoomType.ALL,
            rooms: rooms
        })

    }

}
