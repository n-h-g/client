import HelpGUI from '../../../../../ui/components/help/HelpGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class HelpUI extends ShowableComponent {
    constructor() {
        super(HelpGUI, UIComponent.HelpUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.HELP;
    }
}
