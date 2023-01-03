import CreateRoomGUI from '../../../../../ui/components/navigator/CreateRoomGUI.vue'
import { UIComponent } from '../UIComponent'
import { UIEventsType } from '../../events/UIEventsType'
import { ShowableComponent } from '../../../../core/ui/ShowableComponent'

export class CreateRoomUI extends ShowableComponent {
    constructor() {
        super(CreateRoomGUI, UIComponent.CreateRoomUI)
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.NAVIGATOR
    } 
}