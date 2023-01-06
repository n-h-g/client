import { DeletableComponent } from "../../../../core/ui/DeletableComponent";
import RoomGUI from '../../../../../ui/components/room/RoomGUI.vue'
import { UIComponent } from "../UIComponent";
import UiUtils from "../../../../utils/UiUtils";
import { ShowableComponent } from "../../../../core/ui/ShowableComponent";
import { EventManager } from "../../../../core/events/EventManager";
import { RoomUIEventData } from "../../../events/ui/data/room/RoomUIEventData";
import { UIEventsType } from "../../../events/ui/UIEventsType";

export default class RoomUI extends ShowableComponent {
    public constructor() {
        super(RoomGUI, UIComponent.RoomUI)
    }

    protected getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.ROOM
    }    
}