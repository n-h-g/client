import {EventManager} from '../../../core/events/EventManager';
import {Disposable} from '../../../core/room/Disposable';
import {Engine} from '../../../Engine';
import {OutgoingPacket} from '../../../networking/packets/outgoing/OutgoingPacket';
import {RoomChatData} from '../../events/ui/data/room/RoomChatData';
import {UIEvents} from '../../events/ui/UIEvents';
import {RoomChatMessage} from './RoomChatMessage';
import { Repository } from '../../../core/Repository';
import { Message } from '../../../core/chat/Message';
import { Service } from '../../../core/Service';

export class ChatMessageService extends Service<string, Message> implements Disposable {
    private messageCounter = 0;

    constructor() {
		super();
        this.repository = new Repository();
    }

    addMessage(chatMessage: RoomChatMessage): void {
        this.repository.add(chatMessage.id.toString(), chatMessage);

        EventManager.emit<RoomChatData>(UIEvents.ROOM_NEW_MESSAGE, {
            text: chatMessage.text,
            author: chatMessage.author,
            x: chatMessage.x,
            y: chatMessage.y,
            width: 0,
            height: 0,
        });

        this.messageCounter++;
    }

    removeMessage(id: string): boolean {
        if (!this.repository?.has(id)) return false;

        return this.repository.delete(id);
    }

    dispose(): void {}

    checkCommand(message: string): boolean {
        if (message.startsWith(':')) {
            const commandService = Engine.getInstance()?.commandService;

            if (commandService == null) return false;

            const argsStr = message.split(' ');
            const args = [];
            for (let i = 1; i < argsStr.length; i++) {
                args.push(argsStr[i]);
            }

            const splittedMessage = argsStr[0].substring(1);
            if (commandService?.repository?.has(splittedMessage)) {
                const commandClass =
                    commandService.repository?.get(splittedMessage);
                commandClass?.handle(args);
            }
            return true;
        }

        return false;
    }

    computeMessage(
        message: string,
        shout = false,
        whisper = false,
        whisperId = -1
    ): void {
        if (!this.checkCommand(message)) {
            Engine.getInstance().networkingManager?.packetManager?.applyOut(
                OutgoingPacket.UserSay,
                {
                    text: message,
                    shout: shout,
                    whisper,
                    whisperId,
                }
            );
        }
    }

    getLastMessageId(): number {
        return this.messageCounter + 1;
    }
}
