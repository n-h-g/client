import { NavigatorRoomType } from '../../../../core/communication/incoming/navigator/NavigatorRoomType';
import { EventManager } from "../../../../engine/ui/events/EventManager";
import { NavigatorRoomsAdded } from "../../../../engine/ui/events/navigator/NavigatorRoomsAdded";
import { UIEvents } from "../../../../engine/ui/events/UIEvents";
import { MessageHandler } from "../../../handler/MessageHandler";


export default class AllRoomsList extends MessageHandler {

    public handle() {
        
        let rooms = this.message.data;

        EventManager.emit<NavigatorRoomsAdded>(UIEvents.NAVIGATOR_ROOMS_ADDED, {
            tab: NavigatorRoomType.ALL,
            rooms: rooms
        })

    }

}
