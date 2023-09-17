import {Engine} from '../../../../../Engine';
import {IRoomMessageData} from '../../../../../core/communication/incoming/rooms/entities/IRoomMessageData';
import {MessageType} from '../../../../../core/game/chat/MessageType';
import {RoomChatMessage} from '../../../../../engine/game/chat/RoomChatMessage';
import {MessageHandler} from '../../../../handler/MessageHandler';

export class NewRoomMessage extends MessageHandler {
    handle(): void {
        const data = this.message as IRoomMessageData;

        if (!data.authorId) return;

        const entity =
            Engine.getInstance().roomService.CurrentRoom.roomEntityRepository.get(
                data.authorId
            );

        if (!entity) return;

        const chatMessage = new RoomChatMessage(
            data.text,
            entity,
            MessageType.DEFAULT,
            -1
        );

        Engine.getInstance().chatService.addMessage(chatMessage);
    }

}