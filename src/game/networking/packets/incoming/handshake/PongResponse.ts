import {Engine} from '../../../../Engine';
import {EventManager} from '../../../../core/events/EventManager';
import {LoadingProgressEventData} from '../../../../engine/events/ui/data/loader/LoadingProgress';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {MessageHandler} from '../../../handler/MessageHandler';
import {OutgoingPacket} from '../../outgoing/OutgoingPacket';

export class PongResponse extends MessageHandler {
    public handle() {
        const engine = Engine.getInstance();

        if (this.message.data && engine.sso != '') {
            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 50,
                message: 'Connected to the server',
            });

            engine.networkingManager?.packetManager.applyOut(
                OutgoingPacket.LoginMessage,
                {
                    sso: engine.sso,
                }
            );
        }
    }
}
