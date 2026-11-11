import FurniChooserGUI from '../../../../../ui/components/room/FurniChooserGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

/** The Chooser of :furni: the furni of the room. */
export class FurniChooserUI extends ShowableComponent {
    constructor() {
        super(FurniChooserGUI, UIComponent.FurniChooserUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.FURNI_CHOOSER;
    }
}
