import PreviewBoxGUI from '../../../../../ui/components/general/PreviewBoxGUI.vue';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';
import {UIComponent} from '../UIComponent';

export class PreviewBoxUI extends ShowableComponent {
    constructor() {
        super(PreviewBoxGUI, UIComponent.PreviewBoxUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.PREVIEWBOX;
    }
}
