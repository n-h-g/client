import { Engine } from '../../../../Engine'
import { EventManager } from '../../../../engine/ui/events/EventManager'
import { LoadProgressEvent } from '../../../../engine/ui/events/LoadProgressEvent'
import { UIEvents } from '../../../../engine/ui/events/UIEvents'
import { MessageHandler } from '../../../handler/MessageHandler'
import { OutgoingPacket } from '../../outgoing/OutgoingPacket'

export class LoginResponse extends MessageHandler {
    public handle(): void {
        if (this.message.data) {
            EventManager.emit(UIEvents.LOAD, new LoadProgressEvent({
                width: 40,
                message: 'Loading'
            }))

            Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.UserProfileInformation)
        }

        Engine.getInstance().networkingManager?.webSocketManager.disconnect()
    }
}