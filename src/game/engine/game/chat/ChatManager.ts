
import { Engine } from "../../../Engine";
import { OutgoingPacket } from "../../../networking/packets/outgoing/OutgoingPacket";
import RoomChatMessage from "./RoomChatMessage";

export default class ChatManager {

    private messages: Map<string, RoomChatMessage>;

    constructor() {
        this.messages = new Map();
    }

    public addMessage(chatMessage: RoomChatMessage) {
        this.messages.set(chatMessage.id.toString(), chatMessage);
    }
    public removeMessage(Id: string) {
        if (!this.messages.has(Id)) {
            return;
        }

        this.messages.delete(Id);
    }

    public computeMessage(message: string, shout: boolean = false, whisper: boolean = false, whisperId: number = -1) {
        if (message.startsWith(":")) {
            let commandsManager = Engine.getInstance().commandService
            let _args = message.split(" ");
            let args = [];
            for (let i = 1; i < _args.length; i++) {
                args.push(_args[i]);
            }

            let splittedMessage = _args[0].substring(1);
            if (commandsManager?.repository?.has(splittedMessage)) {
                let commandClass = commandsManager.repository?.get(splittedMessage);
                commandClass?.handle(args)
            } else {
                Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.UserSay, {
                    message: message,
                    shout: shout,
                    whisper,
                    whisperId
                })
            }
        } else {
            Engine.getInstance().networkingManager?.packetManager.applyOut(OutgoingPacket.UserSay, {
                message: message,
                shout: shout,
                whisper,
                whisperId
            })
        }
    }
}