import ChangeLookGUI from '../../../../../ui/components/guardrobe/ChangeLookGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class ChangeLookUI extends ShowableComponent {
    constructor() {
        super(ChangeLookGUI, UIComponent.ChangeLookUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.CHANGE_LOOK;
    }
}
