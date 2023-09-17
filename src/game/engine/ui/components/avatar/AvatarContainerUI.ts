import AvatarContainerGUI from '../../../../../ui/components/avatar/AvatarContainerGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

export class AvatarContainerUI extends ShowableComponent {
    constructor() {
        super(AvatarContainerGUI, UIComponent.AvatarContainerUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.AVATAR;
    }
}
