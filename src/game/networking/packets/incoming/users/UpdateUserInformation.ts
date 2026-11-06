import {UserData} from '../../../../core/communication/incoming/users/UserData';
import {EventManager} from '../../../../core/events/EventManager';
import {TopbarEventData} from '../../../../engine/events/ui/data/static/Topbar';
import {MessageHandler} from '../../../handler/MessageHandler';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {ChangeLookEventData} from '../../../../engine/events/ui/data/avatar/ChangeLookEventData';
import {Engine} from '../../../../Engine';
import {FriendsStore} from '../../../../engine/friends/FriendsStore';

export class UpdateUserInformation extends MessageHandler {
    handle(): void {
        const userInfo: UserData = this.message;
        Engine.getInstance().currentUserId = userInfo.id;

        // the friends of the user, for the bottom bar (only the first time: the server sends the changes)
        FriendsStore.getInstance().requestOnce();

        EventManager.emit<TopbarEventData>(UIEvents.SET_TOPBAR, {
            credits: userInfo.credits,
        });

        // the look of the logged user, for the change look panel
        if (userInfo.look) {
            EventManager.emit<ChangeLookEventData>(UIEvents.CHANGE_LOOK, {
                look: userInfo.look,
                gender: userInfo.gender,
            });
        }
    }
}
