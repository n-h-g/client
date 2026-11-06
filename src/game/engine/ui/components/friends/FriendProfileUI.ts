import FriendProfileGUI from '../../../../../ui/components/friends/FriendProfileGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

/** The profile of a friend (the "info" of the friend bar). */
export class FriendProfileUI extends ShowableComponent {
    constructor() {
        super(FriendProfileGUI, UIComponent.FriendProfileUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.FRIEND_PROFILE;
    }
}
