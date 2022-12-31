import { EventManager } from "../../../../engine/ui/events/EventManager";
import { NavigatorRoomsAdded } from "../../../../engine/ui/events/navigator/NavigatorRoomsAdded";
import { UIEvents } from "../../../../engine/ui/events/UIEvents";
import { MessageHandler } from "../../../handler/MessageHandler";


export default class MyRoomsList extends MessageHandler {

    public handle() {
        
        let rooms = this.message.data;

        EventManager.emit<NavigatorRoomsAdded>(UIEvents.LOAD, {
            tab: "my",
            rooms: rooms
        })

    }

}
