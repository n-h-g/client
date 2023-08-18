import { IChatMessageRepository } from "../../../core/game/chat/IChatMessageRepository";
import { Message } from "../../../core/game/chat/Message";
import { IDisposable } from "../../../core/room/IDisposable";
import { Service } from "../../../core/Service";
import { Engine } from "../../../Engine";
import { OutgoingPacket } from "../../../networking/packets/outgoing/OutgoingPacket";
import ChatMessageRepository from "./ChatMessageRepository";

export default class ChatMessageService implements IDisposable {
    
    public repository: ChatMessageRepository;

    constructor() {
    
        this.repository = new ChatMessageRepository();
    }
    
    /**
     * add a message inside repository
     * @param ChatMessage chatMessage 
     */
    public addMessage(chatMessage: Message) {
        this.repository?.add(chatMessage.id.toString(), chatMessage)
    }

    /**
     * Remove a message from repository
     * @param chatMessage 
     * @returns bool if message was deleted.
     */
    public removeMessage(id: string): boolean {
        if (!this.repository?.has(id)) {
            return false;
        }

        return this.repository.delete(id);
    }
    
    dispose(): void {
        throw new Error("Method not implemented.");
    }

    public checkCommand(message: string) {
        if (message.startsWith(":")) {
            let commandService = Engine.getInstance().commandService
            let _args = message.split(" ");
            let args = [];
            for (let i = 1; i < _args.length; i++) {
                args.push(_args[i]);
            }

            let splittedMessage = _args[0].substring(1);
            if (commandService?.repository?.has(splittedMessage)) {
                let commandClass = commandService.repository?.get(splittedMessage);
                commandClass?.handle(args)
            } 
            return true;
        }

        return false;
    }

    public computeMessage(message: string, shout: boolean = false, whisper: boolean = false, whisperId: number = -1) {
        if (!this.checkCommand(message)) {
          Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.UserSay,
            {
              message: message,
              shout: shout,
              whisper,
              whisperId,
            }
          );
        } else {
          Engine.getInstance().networkingManager?.packetManager.applyOut(
            OutgoingPacket.UserSay,
            {
              message: message,
              shout: shout,
              whisper,
              whisperId,
            }
          );
        }
    }
}
