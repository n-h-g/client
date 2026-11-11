import {Entity} from '../../../../core/room/object/entities/Entity';
import {PetFigureData} from '../../../ui/imagers/pets/PetFigureData';
import {PetEntityLogic} from './logic/PetEntityLogic';
import {PetEntityVisualization} from './visualization/PetEntityVisualization';

/** A pet in the room (the server's entity of type "p"): it walks as an avatar, it's drawn by the PetImager. */
export class PetEntity extends Entity {
    /** Its look: type (0 dog, 1 cat...), race (the palette) and color. */
    petFigure: PetFigureData;
    /** The id of the pet on the server (the inventory one), not the id of the entity. */
    petId: number | null = null;
    ownerId: number | null = null;
    /** How many times it was scratched (the "Carezze" of its card). */
    respects = 0;
    /** The entity of the user riding it (a horse), null if nobody rides it. */
    riderId: string | null = null;

    /** The pets that can be ridden: the horse (as Habbo). */
    static readonly HORSE_TYPE = 15;

    get canBeRidden(): boolean {
        return this.petFigure.typeId === PetEntity.HORSE_TYPE;
    }

    constructor(id: string, name: string, figure: PetFigureData) {
        super(id, name);
        this.petFigure = figure;
        this.visualization = new PetEntityVisualization(this);
        this.logic = new PetEntityLogic(this);
    }
}
