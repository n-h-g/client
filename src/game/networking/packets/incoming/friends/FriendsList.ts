import {FriendsState, FriendsStore} from '../../../../engine/friends/FriendsStore';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The friends of the user, the requests it received and sent (sent again whenever they change). */
export class FriendsList extends MessageHandler {
    handle(): void {
        const data: Partial<FriendsState> = this.message ?? {};

        FriendsStore.getInstance().update(data);
    }
}
