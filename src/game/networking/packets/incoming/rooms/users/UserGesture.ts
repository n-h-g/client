import {Engine} from '../../../../../Engine';
import type {HumanVisualization} from '../../../../../core/room/object/human/visualization/HumanVisualization';
import {chatGesture} from '../../../../../engine/game/chat/ChatGestures';
import {MessageHandler} from '../../../../handler/MessageHandler';

/**
 * The user wrote only an emoticon (e.g. ":)"): no message in the chat, its avatar only makes the expression
 * (as Habbo). {authorId, gesture}
 */
export class UserGesture extends MessageHandler {
    handle(): void {
        const {authorId, gesture} = this.message ?? {};
        const entity = Engine.getInstance().roomService?.currentRoom?.roomEntityRepository.get(authorId);
        if (!entity) return;

        const visualization = entity.visualization as HumanVisualization;

        // it was writing: it isn't anymore
        visualization.setTyping?.(false);

        const expression = chatGesture(gesture);
        if (expression) visualization.showGesture?.(expression.action, expression.duration);
    }
}
