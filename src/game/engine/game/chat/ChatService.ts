import {EventManager} from '../../../core/events/EventManager';
import {IDisposable} from '../../../core/room/IDisposable';
import {Engine} from '../../../Engine';
import {OutgoingPacket} from '../../../networking/packets/outgoing/OutgoingPacket';
import {RoomChatData} from '../../events/ui/data/room/RoomChatData';
import {UIEvents} from '../../events/ui/UIEvents';
import {RoomChatMessage} from './RoomChatMessage';
import {ChatMessageRepository} from './ChatMessageRepository';

export class ChatMessageService implements IDisposable {
    repository: ChatMessageRepository;

    private _messageCounter = 0;

    constructor() {
        this.repository = new ChatMessageRepository();
    }

    addMessage(chatMessage: RoomChatMessage): void {
        this.repository?.add(chatMessage.id.toString(), chatMessage);

        EventManager.emit<RoomChatData>(UIEvents.ROOM_NEW_MESSAGE, {
            text: chatMessage.text,
            author: chatMessage.author,
            x: chatMessage.x,
            y: chatMessage.y,
            width: 0,
            height: 0,
        });

        this._messageCounter++;
    }

    removeMessage(id: string): boolean {
        if (!this.repository?.has(id)) return false;

        return this.repository.delete(id);
    }

    dispose(): void {
        throw new Error('Method not implemented');
    }

    checkCommand(message: string): boolean {
        if (message.startsWith(':')) {
            const commandService = Engine.getInstance()?.commandService;

            if (commandService == null) return false;

            const _args = message.split(' ');
            const args = [];
            for (let i = 1; i < _args.length; i++) {
                args.push(_args[i]);
            }

            const splittedMessage = _args[0].substring(1);
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
        return this._messageCounter + 1;
    }
}
