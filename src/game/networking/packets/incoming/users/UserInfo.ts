import {EventManager} from '../../../../core/events/EventManager';
import {UserInfoData} from '../../../../engine/events/ui/data/users/UserInfoData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The motto and the worn badges of a user: {userId, motto, badges}. */
export class UserInfo extends MessageHandler {
    handle(): void {
        if (this.message?.userId == null) return;

        EventManager.emit<UserInfoData>(UIEvents.USER_INFO, {
            userId: this.message.userId,
            motto: this.message.motto ?? '',
            badges: Array.isArray(this.message.badges) ? this.message.badges : [],
        });
    }
}
