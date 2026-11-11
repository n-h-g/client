import {EventManager} from '../../../../core/events/EventManager';
import {RoomBansData} from '../../../../engine/events/ui/data/room/RoomBansData';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';

/** The users banned from the current room: {data: [{userId, username, expiresAt}]}. */
export class RoomBans extends MessageHandler {
    handle(): void {
        EventManager.emit<RoomBansData>(UIEvents.ROOM_BANS, {bans: this.message?.data ?? []});
    }
}
