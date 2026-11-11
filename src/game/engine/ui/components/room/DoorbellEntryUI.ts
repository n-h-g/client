import DoorbellEntryGUI from '../../../../../ui/components/room/DoorbellEntryGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

/** The window of the user at the door of a room with the doorbell: ring it, or wait for an answer. */
export class DoorbellEntryUI extends ShowableComponent {
    constructor() {
        super(DoorbellEntryGUI, UIComponent.DoorbellEntryUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.DOORBELL_ENTRY;
    }
}
