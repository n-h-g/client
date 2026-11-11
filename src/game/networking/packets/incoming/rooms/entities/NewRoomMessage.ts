import {Engine} from '../../../../../Engine';
import {RoomMessageData} from '../../../../../core/communication/incoming/rooms/entities/RoomMessageData';
import {MessageType} from '../../../../../core/chat/MessageType';
import {RoomChatMessage} from '../../../../../engine/game/chat/RoomChatMessage';
import {MessageHandler} from '../../../../handler/MessageHandler';
import {chatGesture} from '../../../../../engine/game/chat/ChatGestures';
import type {HumanVisualization} from '../../../../../core/room/object/human/visualization/HumanVisualization';

export class NewRoomMessage extends MessageHandler {
    handle(): void {
        const data: RoomMessageData = this.message;

        if (!data.authorId) return;

        const entity =
            Engine.getInstance().roomService.currentRoom.roomEntityRepository.get(
                data.authorId
            );

        if (!entity) return;

        // the message is sent: no more typing (as Habbo)
        (entity.visualization as HumanVisualization).setTyping?.(false);

        // an emoticon in the text (the server sends its expression): the avatar smiles, laughs, is sad or angry
        const gesture = chatGesture(data.gesture);
        if (gesture) (entity.visualization as HumanVisualization).showGesture?.(gesture.action, gesture.duration);

        const chatMessage = new RoomChatMessage(
            data.text,
            entity,
            data.whisper ? MessageType.WHISPER : MessageType.DEFAULT,
            -1,
            data.whisper ? data.recipient : undefined,
            data.style ?? 0
        );

        Engine.getInstance().chatService.addMessage(chatMessage);
    }

}