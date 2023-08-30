import RoomInfoGUI from '../../../../../ui/components/room/RoomInfoGUI.vue'
import { ShowableComponent } from '../../../../core/ui/ShowableComponent'
import { UIEventsType } from '../../../events/ui/UIEventsType'
import { UIComponent } from '../UIComponent'

export class RoomInfoUI extends ShowableComponent {
    constructor() {
        super(RoomInfoGUI, UIComponent.RoomInfoUI)
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.ROOM_INFO
    } 
}