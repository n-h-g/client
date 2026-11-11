import {Engine} from '../../../../Engine';
import {PetRespects} from '../../../../engine/room/objects/pets/PetRespects';
import {PetEntityVisualization} from '../../../../engine/room/objects/pets/visualization/PetEntityVisualization';
import {MessageHandler} from '../../../handler/MessageHandler';

/** A pet of the room was scratched: {id (its entity), respects}. It smiles. */
export class PetScratched extends MessageHandler {
    handle(): void {
        const entity = Engine.getInstance()?.roomService?.currentRoom?.roomEntityRepository.get(this.message?.id);
        const visualization = entity?.visualization;

        if (visualization instanceof PetEntityVisualization) visualization.showHappy();
    }
}

/** The scratches the user has left today: {left}. */
export class PetRespectsLeft extends MessageHandler {
    handle(): void {
        if (typeof this.message?.left === 'number') PetRespects.left = this.message.left;
    }
}
