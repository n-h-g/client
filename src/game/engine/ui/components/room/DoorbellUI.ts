import DoorbellGUI from '../../../../../ui/components/room/DoorbellGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class DoorbellUI extends ShowableComponent {
    constructor() {
        super(DoorbellGUI, UIComponent.DoorbellUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.DOORBELL;
    }
}
