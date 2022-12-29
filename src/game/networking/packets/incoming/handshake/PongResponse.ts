import { Engine } from "../../../../Engine"
import { MessageHandler } from "../../../handler/MessageHandler"
import { OutgoingPacket } from "../../outgoing/OutgoingPacket"

export class PongResponse extends MessageHandler {
    
    public handle() {
        let engine = Engine.getInstance()

        if (this.message.data && engine.sso != "") {
            engine.networkingManager?.packetManager.applyOut(OutgoingPacket.LoginMessage,
                {
                    sso: String(engine.sso)
                }
            )
        }
    }
}
