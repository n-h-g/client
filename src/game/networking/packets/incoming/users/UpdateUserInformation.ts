import {UserData} from '../../../../core/communication/incoming/users/UserData';
import {EventManager} from '../../../../core/events/EventManager';
import {TopbarEventData} from '../../../../engine/events/ui/data/static/Topbar';
import {MessageHandler} from '../../../handler/MessageHandler';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';

export class UpdateUserInformation extends MessageHandler {
    handle(): void {
        const userInfo: UserData = this.message;

        EventManager.emit<TopbarEventData>(UIEvents.SET_TOPBAR, {
            credits: userInfo.credits,
        });
    }
}
