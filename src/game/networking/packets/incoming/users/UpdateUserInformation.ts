import { UserData } from '../../../../core/communication/incoming/users/UserData';
import { Engine } from '../../../../Engine';
import { EventManager } from '../../../../core/events/EventManager';
import { TopbarEventData } from '../../../../engine/events/ui/data/static/Topbar';
import { User } from '../../../../engine/user/User';
import { MessageHandler } from '../../../handler/MessageHandler';
import { UIEvents } from '../../../../engine/events/ui/UIEvents';

export class UpdateUserInformation extends MessageHandler {
    public handle(): void {
        let userInfo: UserData = this.message

        let user: User = Engine.getInstance().usersService?.repository.get(userInfo.id)

        if (user) {
            user.userInfo.username = userInfo.username;
            user.userInfo.id = userInfo.id;
            user.userInfo.look = userInfo.look;
            user.userInfo.gender = userInfo.gender;
            user.userInfo.motto = userInfo.motto;
            user.userInfo.credits = userInfo.credits;
        } else {
            let newUser = new User(userInfo.id, userInfo.username, userInfo.look, userInfo.gender, userInfo.motto, userInfo.credits);
            Engine.getInstance().usersService?.repository.add(userInfo.id, newUser);
        }

        EventManager.emit<TopbarEventData>(UIEvents.SET_TOPBAR, {
            credits: userInfo.credits
        })
    }
}