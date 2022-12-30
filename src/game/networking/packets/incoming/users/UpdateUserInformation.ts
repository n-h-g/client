import { UserData } from '../../../../core/communication/incoming/users/UserData';
import { Engine } from '../../../../Engine';
import { UIComponent } from '../../../../engine/ui/components/UIComponent';
import User from '../../../../engine/user/User';
import { MessageHandler } from '../../../handler/MessageHandler';

export class UpdateUserInformation extends MessageHandler {
    public handle(): void {
        let userInfo: UserData = this.message;

        // user got online

        let user: User = Engine.getInstance().usersService.repository.get(userInfo.id) as User;

        if(user){
            user.userInfo.username = userInfo.username;
            user.userInfo.id = userInfo.id;
            user.userInfo.look = userInfo.look;
            user.userInfo.gender = userInfo.gender;
            user.userInfo.motto = userInfo.motto;
            user.userInfo.credits = userInfo.credits;
        } else {
            let newUser = new User(userInfo.id, userInfo.username, userInfo.look, userInfo.gender, userInfo.motto,userInfo.credits);
            Engine.getInstance().usersService.repository.add(userInfo.id, newUser);
        }

        // TODO EVENT USER DATA UPDATED
        /*let staticContainerUI = Engine.getInstance().userInterfaceManager?.getUIComponentManager().getComponent(UIComponent.StaticContainerUI) as StaticContainerUI;

        staticContainerUI.TopBarGUI.$data['credits'] = userInfo.credits;*/

    }
}