import {EventManager} from '../../../../core/events/EventManager';
import {BubbleAlertData} from '../../../../engine/events/ui/data/general/BubbleAlertData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** Result of the friendship request the user sent, or why a follow/message failed: {status, username}. */
export class FriendRequestResult extends MessageHandler {
    handle(): void {
        const {status, username} = this.message ?? {};

        const messages: Record<string, string> = {
            REQUESTED: `Friend request sent to ${username}`,
            ACCEPTED: `You and ${username} are now friends`,
            ALREADY_FRIENDS: `You and ${username} are already friends`,
            ALREADY_REQUESTED: `You already sent a request to ${username}`,
            NOT_FOUND: `No user is called ${username}`,
            INVALID: 'You can\'t add yourself',
            NOT_FRIEND: `${username || 'This user'} is not your friend`,
            FOLLOW_OFFLINE: `${username} is not online`,
            FOLLOW_NOT_IN_ROOM: `${username} is not in a room`,
            FOLLOW_SAME_ROOM: `You are already in the room of ${username}`,
            MESSAGE_OFFLINE: `${username} is not online: the message was not sent`,
            UNAVAILABLE: 'Friends are not available, try again later',
        };

        EventManager.emit<BubbleAlertData>(UIEvents.BUBBLE_ALERT, {
            message: messages[status] ?? messages.UNAVAILABLE,
        });
    }
}
