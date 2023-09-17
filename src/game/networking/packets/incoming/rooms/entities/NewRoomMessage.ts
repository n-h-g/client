import {Engine} from '../../../../../Engine';
import {RoomMessageData} from '../../../../../core/communication/incoming/rooms/entities/RoomMessageData';
import {MessageType} from '../../../../../core/chat/MessageType';
import {RoomChatMessage} from '../../../../../engine/game/chat/RoomChatMessage';
import {MessageHandler} from '../../../../handler/MessageHandler';

export class NewRoomMessage extends MessageHandler {
    handle(): void {
        const data: RoomMessageData = this.message;

        if (!data.authorId) return;

        const entity =
            Engine.getInstance().roomService.currentRoom.roomEntityRepository.get(
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