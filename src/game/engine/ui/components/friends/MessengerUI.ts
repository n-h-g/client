import MessengerGUI from '../../../../../ui/components/friends/MessengerGUI.vue';
import {UIComponent} from '../UIComponent';
import {ShowableComponent} from '../../../../core/ui/ShowableComponent';
import {UIEventsType} from '../../../events/ui/UIEventsType';
import {MessengerStore} from '../../../friends/MessengerStore';

/** The private chats with the friends. */
export class MessengerUI extends ShowableComponent {
    constructor() {
        super(MessengerGUI, UIComponent.PrivateChatUI);
    }

    hide(): void {
        super.hide();
        // e.g. closed by its close button: the store knows the window is closed
        if (MessengerStore.getInstance().current.open) MessengerStore.getInstance().setOpen(false);
    }

    getEventTypeFromComponent(): UIEventsType {
        return UIEventsType.MESSENGER;
    }
}
