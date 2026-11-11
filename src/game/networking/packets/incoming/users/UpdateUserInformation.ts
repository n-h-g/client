import {ChatStyleStore} from '../../../../engine/game/chat/ChatStyleStore';
import {OutgoingPacket} from '../../outgoing/OutgoingPacket';
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
        Engine.getInstance().currentUsername = userInfo.username ?? null;

        // the friends of the user, for the bottom bar (only the first time: the server sends the changes)
        FriendsStore.getInstance().requestOnce();

        EventManager.emit<TopbarEventData>(UIEvents.SET_TOPBAR, {
            credits: userInfo.credits,
        });

        if (userInfo.chatStyle != null) ChatStyleStore.set(userInfo.chatStyle);

        // logged from the link of a room: into it (once)
        const engine = Engine.getInstance();
        if (engine.pendingRoomId != null) {
            engine.networkingManager?.packetManager?.applyOut(OutgoingPacket.UserEnterRoom, {id: engine.pendingRoomId});
            engine.pendingRoomId = null;
        }

        // the look of the logged user, for the change look panel
        if (userInfo.look) {
            EventManager.emit<ChangeLookEventData>(UIEvents.CHANGE_LOOK, {
                look: userInfo.look,
                gender: userInfo.gender,
            });
        }
    }
}
