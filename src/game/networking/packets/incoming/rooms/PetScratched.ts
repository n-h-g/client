import {EventManager} from '../../../../core/events/EventManager';
import {Engine} from '../../../../Engine';
import {UIEvents} from '../../../../engine/events/ui/UIEvents';
import {PetEntity} from '../../../../engine/room/objects/pets/PetEntity';
import {PetRespects} from '../../../../engine/room/objects/pets/PetRespects';
import {PetEntityVisualization} from '../../../../engine/room/objects/pets/visualization/PetEntityVisualization';
import {MessageType} from '../../../../core/chat/MessageType';
import {RoomChatMessage} from '../../../../engine/game/chat/RoomChatMessage';
import {MessageHandler} from '../../../handler/MessageHandler';

/** A pet of the room was scratched: {id (its entity), respects}. It smiles. */
export class PetScratched extends MessageHandler {
    /** The style of the bubbles of the notices (Nitro's respect/pet notifications: 1). */
    private static readonly NOTICE_STYLE = 1;

    handle(): void {
        const entity = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository.get(this.message?.id);
        const visualization = entity?.visualization;

        if (!(visualization instanceof PetEntityVisualization)) return;

        visualization.showHappy();

        // as Habbo: the notice over the pet (the bubble with the "!", without a name)
        Engine.getInstance().chatService?.addMessage(new RoomChatMessage(
            `${entity!.name} has been scratched!`,
            entity!,
            MessageType.DEFAULT,
            -1,
            undefined,
            PetScratched.NOTICE_STYLE,
            true
        ));

        // its card, if it's open, shows the new count
        if (entity instanceof PetEntity && typeof this.message?.respects === 'number') {
            entity.respects = this.message.respects;
            EventManager.emit(UIEvents.PET_RESPECTS_CHANGED, {id: entity.id, respects: entity.respects});
        }
    }
}

/** The scratches the user has left today: {left}. */
export class PetRespectsLeft extends MessageHandler {
    handle(): void {
        if (typeof this.message?.left === 'number') PetRespects.left = this.message.left;
    }
}
