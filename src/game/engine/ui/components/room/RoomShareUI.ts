import RoomLinkGUI from '../../../../../ui/components/room/RoomLinkGUI.vue';
import RoomPublicInfoGUI from '../../../../../ui/components/room/RoomPublicInfoGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

/** "Share your room!": the link and the id of the current room (room tools > Link to this room). */
export class RoomLinkUI extends ShowableComponent {
    constructor() {
        super(RoomLinkGUI, UIComponent.RoomLinkUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.ROOM_LINK;
    }
}

/** The info of a room of someone else (room tools > Settings, without rights). */
export class RoomPublicInfoUI extends ShowableComponent {
    constructor() {
        super(RoomPublicInfoGUI, UIComponent.RoomPublicInfoUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.ROOM_PUBLIC_INFO;
    }
}
