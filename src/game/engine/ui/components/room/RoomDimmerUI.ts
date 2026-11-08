import RoomDimmerGUI from '../../../../../ui/components/room/RoomDimmerGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

/** The room dimmer controller (a double click on a moodlight, see RoomDimmerStore). */
export class RoomDimmerUI extends ShowableComponent {
    constructor() {
        super(RoomDimmerGUI, UIComponent.RoomDimmerUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.ROOM_DIMMER;
    }
}
