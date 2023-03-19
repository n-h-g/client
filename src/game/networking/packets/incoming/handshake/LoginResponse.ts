import { Engine } from '../../../../Engine'
import { EventManager } from '../../../../core/events/EventManager'
import { LoadingProgressEventData } from '../../../../engine/events/ui/data/loader/LoadingProgress'
import { MessageHandler } from '../../../handler/MessageHandler'
import { OutgoingPacket } from '../../outgoing/OutgoingPacket'
import { UIEvents } from '../../../../engine/events/ui/UIEvents'

export class LoginResponse extends MessageHandler {
    public handle(): void {
        if (this.message.data) {
            EventManager.emit<LoadingProgressEventData>(UIEvents.LOAD, {
                width: 100,
                message: 'Logged'
            })

            Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.UserProfileInformation)
        } else {
            Engine.getInstance().networkingManager?.webSocketManager.disconnect()
        }
    }
}