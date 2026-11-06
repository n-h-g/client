import {MessengerStore} from '../../../../engine/friends/MessengerStore';
import {MessageHandler} from '../../../handler/MessageHandler';

/** A private message between the logged user and a friend: {fromId, toId, text}. */
export class FriendMessage extends MessageHandler {
    handle(): void {
        const {fromId, toId, text} = this.message ?? {};
        if (fromId == null || toId == null || !text) return;

        MessengerStore.getInstance().receive(fromId, toId, text);
    }
}
