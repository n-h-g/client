import {Furni} from './Furni';
import {FurniBase} from './FurniBase';

export class FurniPlaceholder extends Furni {
    constructor(
        furniBase: FurniBase,
        direction = 0,
        animation = 0,
        frame = 0,
        isIcon = false,
        isPlaceholder = false
    ) {
        super(furniBase, direction, animation, frame, isIcon, true);
    }
}
