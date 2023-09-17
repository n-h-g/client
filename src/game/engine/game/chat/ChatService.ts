import {EventManager} from '../../../core/events/EventManager';
import {Message} from '../../../core/game/chat/Message';
import {IDisposable} from '../../../core/room/IDisposable';
import {Engine} from '../../../Engine';
import {OutgoingPacket} from '../../../networking/packets/outgoing/OutgoingPacket';
import {RoomChatData} from '../../events/ui/data/room/RoomChatData';
import {RoomUIEventData} from '../../events/ui/data/room/RoomUIEventData';
import {UIEvents} from '../../events/ui/UIEvents';
import RoomChatMessage from './RoomChatMessage';
import {ChatMessageRepository} from './ChatMessageRepository';

export default class ChatMessageService implements IDisposable {
    public repository: ChatMessageRepository;

    private _messageCounter = 0;

    constructor() {
        this.repository = new ChatMessageRepository();
    }

    public addMessage(chatMessage: RoomChatMessage): void {
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

    public removeMessage(id: string): boolean {
        if (!this.repository?.has(id)) return false;

        return this.repository.delete(id);
    }

    public dispose(): void {
        throw new Error('Method not implemented');
    }

    public checkCommand(message: string): boolean {
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

    public computeMessage(
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

    public getLastMessageId(): number {
        return this._messageCounter + 1;
    }
}
