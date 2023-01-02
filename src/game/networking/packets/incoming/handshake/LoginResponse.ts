import { Engine } from '../../../../Engine'
import { EventManager } from '../../../../engine/ui/events/EventManager'
import { LoadingProgressEventData } from '../../../../engine/ui/events/data/loader/LoadingProgress'
import { UIEvents } from '../../../../engine/ui/events/UIEvents'
import { MessageHandler } from '../../../handler/MessageHandler'
import { OutgoingPacket } from '../../outgoing/OutgoingPacket'

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