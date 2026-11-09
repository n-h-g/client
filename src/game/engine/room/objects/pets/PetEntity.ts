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

    constructor(id: string, name: string, figure: PetFigureData) {
        super(id, name);
        this.petFigure = figure;
        this.visualization = new PetEntityVisualization(this);
        this.logic = new PetEntityLogic(this);
    }
}
