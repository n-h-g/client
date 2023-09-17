import CreateRoomGUI from '../../../../../ui/components/navigator/CreateRoomGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class CreateRoomUI extends ShowableComponent {
    constructor() {
        super(CreateRoomGUI, UIComponent.CreateRoomUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.NAVIGATOR;
    }
}
