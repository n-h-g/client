import { NavigatorRoomType } from '../../../../core/communication/incoming/navigator/NavigatorRoomType';
import { EventManager } from "../../../../core/events/EventManager";
import { NavigatorRoomsEventData } from "../../../../engine/ui/events/data/navigator/NavigatorRooms";
import { UIEvents } from "../../../../engine/ui/events/UIEvents";
import { MessageHandler } from "../../../handler/MessageHandler";


export default class MyRoomsList extends MessageHandler {

    public handle() {
        
        let rooms = this.message.data;

        EventManager.emit<NavigatorRoomsEventData>(UIEvents.NAVIGATOR_ROOMS_ADDED, {
            tab: NavigatorRoomType.MY,
            rooms: rooms
        })

    }

}
