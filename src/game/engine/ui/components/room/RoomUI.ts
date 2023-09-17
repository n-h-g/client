import RoomGUI from '../../../../../ui/components/room/RoomGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class RoomUI extends ShowableComponent {
    constructor() {
        super(RoomGUI, UIComponent.RoomUI);
    }

    protected getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.ROOM;
    }
}
