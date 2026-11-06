import FriendsGUI from '../../../../../ui/components/friends/FriendsGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';

/** The friends window: find a user by name, the friendship requests received, the friends. */
export class FriendsUI extends ShowableComponent {
    constructor() {
        super(FriendsGUI, UIComponent.FriendsMenuUI);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.FRIENDS;
    }
}
