import {EventManager} from '../../../../core/events/EventManager';
import {BubbleAlertData} from '../../../../engine/events/ui/data/general/BubbleAlertData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {Friend, FriendsStore} from '../../../../engine/friends/FriendsStore';
import {MessageHandler} from '../../../handler/MessageHandler';

/** Someone asks the user to be its friend: a bubble alert to accept or decline. */
export class FriendRequestReceived extends MessageHandler {
    handle(): void {
        const from: Friend = this.message;
        if (!from?.id) return;

        const store = FriendsStore.getInstance();

        EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, {
            message: `${from.username} wants to be your friend`,
            action: {
                onConfirm: () => store.acceptRequest(from.id),
                onDecline: () => store.declineRequest(from.id),
            },
        });
    }
}
